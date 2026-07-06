import { prisma } from "@/lib/prisma"
import {
  getDocker,
  createRedroidContainer,
  removeContainer,
  allocatePort,
  ADB_PORT_START,
  NOVNC_PORT_START,
} from "./docker"
import type { EmulatorStatus } from "@prisma/client"

const SESSION_TIMEOUT_MIN = parseInt(
  process.env.EMULATOR_SESSION_TIMEOUT || "15",
  10,
)

/**
 * Start a new emulator session for an app.
 * 1. Creates a redroid container
 * 2. Returns the session with stream URL
 * APK installation happens asynchronously via installApk().
 */
export async function startSession(
  appId: string,
  userId: string,
): Promise<{ sessionId: string; streamUrl: string }> {
  const docker = getDocker()
  if (!docker) throw new Error("模拟器功能未启用")

  // Check: user already has an active session?
  const existing = await prisma.emulatorSession.findFirst({
    where: {
      userId,
      status: { in: ["starting", "running", "installing", "ready"] },
    },
  })
  if (existing) {
    throw new Error("你已有一个正在运行的模拟器会话")
  }

  // Get used ports from active sessions
  const activeSessions = await prisma.emulatorSession.findMany({
    where: { status: { in: ["starting", "running", "installing", "ready"] } },
    select: { adbPort: true, streamUrl: true },
  })
  const usedAdbPorts = activeSessions
    .map((s) => s.adbPort)
    .filter((p): p is number => p !== null)

  const adbPort = allocatePort(ADB_PORT_START, usedAdbPorts)
  const novncPort = adbPort + 1000 // Derive noVNC port from ADB port

  // Create session record
  const session = await prisma.emulatorSession.create({
    data: {
      appId,
      userId,
      status: "starting",
      adbPort,
      streamUrl: `http://localhost:${novncPort}/vnc.html?autoconnect=true`,
    },
  })

  // Create container (non-blocking — status updated by caller)
  try {
    const containerId = await createRedroidContainer(adbPort, novncPort)

    await prisma.emulatorSession.update({
      where: { id: session.id },
      data: { containerId, status: "running" },
    })
  } catch (error) {
    await prisma.emulatorSession.update({
      where: { id: session.id },
      data: {
        status: "error",
        error: error instanceof Error ? error.message : "模拟器启动失败",
      },
    })
    throw error
  }

  return {
    sessionId: session.id,
    streamUrl: session.streamUrl!,
  }
}

/**
 * Install an APK on a running emulator session via ADB.
 */
export async function installApk(
  sessionId: string,
  apkUrl: string,
): Promise<void> {
  const session = await prisma.emulatorSession.findUnique({
    where: { id: sessionId },
  })

  if (!session || !session.adbPort) {
    throw new Error("模拟器会话不存在")
  }

  await prisma.emulatorSession.update({
    where: { id: sessionId },
    data: { status: "installing" },
  })

  try {
    // Download APK and install via ADB
    const { execSync } = await import("node:child_process")

    // Wait for ADB to be ready
    execSync(`adb connect localhost:${session.adbPort}`, {
      timeout: 15000,
      stdio: "pipe",
    })

    // Download APK to temp
    const tempPath = `/tmp/apk-${sessionId}.apk`
    const res = await fetch(apkUrl)
    if (!res.ok) throw new Error("APK 下载失败")
    const buffer = Buffer.from(await res.arrayBuffer())
    const { writeFileSync } = await import("node:fs")
    writeFileSync(tempPath, buffer)

    // Install via ADB
    execSync(`adb -s localhost:${session.adbPort} install -r "${tempPath}"`, {
      timeout: 60000,
      stdio: "pipe",
    })

    // Launch the app (package name from APK manifest — use monkey as fallback)
    execSync(
      `adb -s localhost:${session.adbPort} shell monkey -p com.example.app -c android.intent.category.LAUNCHER 1`,
      { timeout: 10000, stdio: "pipe" },
    )

    await prisma.emulatorSession.update({
      where: { id: sessionId },
      data: { status: "ready" },
    })
  } catch (error) {
    await prisma.emulatorSession.update({
      where: { id: sessionId },
      data: {
        status: "error",
        error:
          error instanceof Error ? error.message : "APK 安装失败",
      },
    })
    throw error
  }
}

/**
 * Get the current status of an emulator session.
 */
export async function getSession(sessionId: string) {
  return prisma.emulatorSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
      streamUrl: true,
      error: true,
      startedAt: true,
    },
  })
}

/**
 * Stop and clean up an emulator session.
 */
export async function stopSession(sessionId: string): Promise<void> {
  const session = await prisma.emulatorSession.findUnique({
    where: { id: sessionId },
  })

  if (!session) return

  // Update status first
  await prisma.emulatorSession.update({
    where: { id: sessionId },
    data: { status: "stopping" },
  })

  // Remove Docker container
  if (session.containerId) {
    await removeContainer(session.containerId)
  }

  // Mark as stopped
  await prisma.emulatorSession.update({
    where: { id: sessionId },
    data: { status: "stopped", endedAt: new Date() },
  })
}

/**
 * Clean up all stale sessions (older than timeout).
 * Should be called periodically (e.g., every 5 minutes via cron or setInterval).
 */
export async function cleanupStaleSessions(): Promise<number> {
  const cutoff = new Date(
    Date.now() - SESSION_TIMEOUT_MIN * 60 * 1000,
  )

  const stale = await prisma.emulatorSession.findMany({
    where: {
      status: { in: ["running", "installing", "ready"] },
      startedAt: { lt: cutoff },
    },
  })

  for (const session of stale) {
    try {
      await stopSession(session.id)
    } catch {
      // Force-stop: mark as stopped
      await prisma.emulatorSession.update({
        where: { id: session.id },
        data: { status: "stopped", endedAt: new Date() },
      })
    }
  }

  return stale.length
}
