import { prisma } from "./prisma"
import { execSync, exec } from "child_process"
import { promises as fs } from "fs"
import path from "path"
import os from "os"
import { uploadToOSS, getOSSUrl } from "./oss"
import { decryptToken } from "./encryption"

const BUILD_TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes

interface BuildContext {
  buildId: string
  appId: string
  sourceUrl: string
  sourceType: "zip" | "github"
  githubToken?: string | null
  workDir: string
}

function log(buildId: string, message: string) {
  const ts = new Date().toISOString()
  console.log(`[${ts}] [${buildId}] ${message}`)
}

async function appendBuildLog(buildId: string, line: string) {
  const build = await prisma.build.findUnique({ where: { id: buildId } })
  const currentLog = build?.buildLog || ""
  await prisma.build.update({
    where: { id: buildId },
    data: { buildLog: currentLog + line + "\n" },
  })
}

/**
 * Clone a GitHub repository into a temp directory.
 * Uses OAuth token for private repos if available.
 */
async function cloneRepo(ctx: BuildContext): Promise<void> {
  const { buildId, sourceUrl, githubToken, workDir } = ctx

  log(buildId, `Cloning ${sourceUrl} → ${workDir}`)
  await appendBuildLog(buildId, `$ git clone ${sourceUrl}`)

  let cloneUrl = sourceUrl
  if (githubToken && sourceUrl.includes("github.com")) {
    // Inject token for private repos: https://token@github.com/user/repo
    cloneUrl = sourceUrl.replace(
      "https://github.com",
      `https://${githubToken}@github.com`
    )
  }

  return new Promise((resolve, reject) => {
    exec(
      `git clone --depth 1 "${cloneUrl}" "${workDir}"`,
      { timeout: 120_000 },
      (error, stdout, stderr) => {
        if (error) {
          const msg = stderr || error.message
          appendBuildLog(buildId, `Clone failed: ${msg}`)
          reject(new Error(`Git clone failed: ${msg}`))
        } else {
          appendBuildLog(buildId, stdout)
          resolve()
        }
      }
    )
  })
}

/**
 * Detect the build command by inspecting the project structure.
 */
async function detectBuildCommand(workDir: string): Promise<{
  installCmd: string
  buildCmd: string
  outputDir: string
}> {
  const files = await fs.readdir(workDir)

  // ── Node.js / Expo: package.json ─────────────────────────
  if (files.includes("package.json")) {
    const pkgRaw = await fs.readFile(path.join(workDir, "package.json"), "utf-8")
    const pkg = JSON.parse(pkgRaw)
    const scripts = pkg.scripts || {}
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }

    // ── Expo / React Native Web ──
    if (deps.expo || deps["react-native"]) {
      // Android: build APK via expo
      if (files.includes("android") || deps["expo-dev-client"]) {
        return {
          installCmd: "npm install --prefer-offline",
          buildCmd: "npx expo run:android --variant=release",
          outputDir: "android/app/build/outputs/apk/release",
        }
      }
      const buildCmd = scripts["export:web"]
        ? "npm run export:web"
        : "npx expo export:web"
      return {
        installCmd: "npm install --prefer-offline",
        buildCmd,
        outputDir: "dist",
      }
    }

    // ── Standard Node.js ──
    let buildCmd = "npm run build"
    if (scripts.build) {
      buildCmd = "npm run build"
    } else if (scripts.bundle) {
      buildCmd = "npm run bundle"
    }

    let outputDir = "dist"
    if (deps.vite || scripts.dev?.includes("vite")) outputDir = "dist"
    else if (deps["next"]) outputDir = "out"
    else if (deps["react-scripts"] || deps["react-app-rewired"]) outputDir = "build"
    else if (deps["@angular/cli"]) outputDir = "dist"
    else if (deps.vue) outputDir = "dist"
    else if (deps.nuxt) outputDir = ".output/public"

    return {
      installCmd: "npm install --prefer-offline",
      buildCmd,
      outputDir,
    }
  }

  // ── Native Android: build.gradle ─────────────────────────
  if (files.includes("build.gradle") || files.includes("build.gradle.kts")) {
    return {
      installCmd: "",
      buildCmd: "./gradlew assembleRelease",
      outputDir: "app/build/outputs/apk/release",
    }
  }

  // ── Flutter: pubspec.yaml ──────────────────────────────────
  if (files.includes("pubspec.yaml")) {
    return {
      installCmd: "flutter pub get",
      buildCmd: "flutter build web",
      outputDir: "build/web",
    }
  }

  // ── Plain HTML — no build needed ───────────────────────────
  const hasHtml =
    files.some((f) => f.endsWith(".html")) ||
    (await fs.readdir(workDir).then((f) => f.some((x) => x.endsWith(".html"))))
  if (hasHtml) {
    return {
      installCmd: "",
      buildCmd: "",
      outputDir: workDir,
    }
  }

  // ── Fallback ─────────────────────────────────────────────
  return {
    installCmd: "npm install --prefer-offline",
    buildCmd: "npm run build",
    outputDir: "dist",
  }
}

/**
 * Run install and build commands.
 */
async function runBuild(
  ctx: BuildContext,
  installCmd: string,
  buildCmd: string
): Promise<void> {
  const { buildId, workDir } = ctx

  // Install dependencies
  if (installCmd) {
    log(buildId, `Running: ${installCmd}`)
    await appendBuildLog(buildId, `$ ${installCmd}`)
    await runCommand(installCmd, workDir, buildId)
  }

  // Build
  if (buildCmd) {
    log(buildId, `Running: ${buildCmd}`)
    await appendBuildLog(buildId, `$ ${buildCmd}`)
    await runCommand(buildCmd, workDir, buildId)
  }
}

function runCommand(
  cmd: string,
  cwd: string,
  buildId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = exec(cmd, { cwd, timeout: BUILD_TIMEOUT_MS }, (error, stdout, stderr) => {
      if (stdout) appendBuildLog(buildId, stdout)
      if (stderr) appendBuildLog(buildId, stderr)
      if (error) {
        reject(new Error(`Command failed: ${cmd}\n${stderr || error.message}`))
      } else {
        resolve()
      }
    })

    // Stream stdout in real-time
    proc.stdout?.on("data", (data: string) => {
      appendBuildLog(buildId, data).catch(() => {})
    })
    proc.stderr?.on("data", (data: string) => {
      appendBuildLog(buildId, data).catch(() => {})
    })
  })
}

/**
 * Upload build output to OSS.
 */
async function uploadArtifacts(
  ctx: BuildContext,
  outputDir: string
): Promise<string> {
  const { buildId, appId, workDir } = ctx
  const resolvedOutputDir = path.isAbsolute(outputDir)
    ? outputDir
    : path.join(workDir, outputDir)

  log(buildId, `Uploading artifacts from ${resolvedOutputDir}`)
  await appendBuildLog(buildId, `Uploading to OSS: apps/${appId}/`)

  // Find and upload all files recursively
  const files = await walkDir(resolvedOutputDir)
  let indexHtmlUrl = ""

  for (const file of files) {
    const relativePath = path.relative(resolvedOutputDir, file)
    const ossKey = `apps/${appId}/${relativePath}`

    try {
      const buffer = await fs.readFile(file)
      const contentType = getContentType(file)
      await uploadToOSS(buffer, ossKey, contentType)

      if (relativePath === "index.html" || relativePath.endsWith("/index.html")) {
        indexHtmlUrl = getOSSUrl(ossKey)
      }

      await appendBuildLog(buildId, `  ✓ ${ossKey}`)
    } catch (err: any) {
      await appendBuildLog(buildId, `  ✗ ${ossKey}: ${err.message}`)
    }
  }

  if (!indexHtmlUrl) {
    // Try to find any index.html
    const indexFile = files.find(
      (f) => path.basename(f) === "index.html"
    )
    if (indexFile) {
      const relativePath = path.relative(resolvedOutputDir, indexFile)
      indexHtmlUrl = getOSSUrl(`apps/${appId}/${relativePath}`)
    }
  }

  return indexHtmlUrl
}

async function walkDir(dir: string): Promise<string[]> {
  const results: string[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    // Skip node_modules and .git
    if (entry.name === "node_modules" || entry.name === ".git") continue
    if (entry.isDirectory()) {
      results.push(...(await walkDir(fullPath)))
    } else {
      results.push(fullPath)
    }
  }

  return results
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const types: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".wasm": "application/wasm",
    ".map": "application/json",
  }
  return types[ext] || "application/octet-stream"
}

/**
 * Main build execution entry point.
 * Called by the worker to process a single build.
 */
export async function executeBuild(buildId: string): Promise<void> {
  log(buildId, "Starting build execution")

  // Load build and app data
  const build = await prisma.build.findUnique({
    where: { id: buildId },
    include: { app: { include: { author: true } } },
  })

  if (!build) {
    console.error(`Build ${buildId} not found`)
    return
  }

  if (build.sourceType !== "github") {
    await completeBuild(buildId, "failed", null, "Only GitHub builds are supported")
    return
  }

  if (!build.sourceUrl) {
    await completeBuild(buildId, "failed", null, "No source URL provided")
    return
  }

  const ctx: BuildContext = {
    buildId: build.id,
    appId: build.appId,
    sourceUrl: build.sourceUrl,
    sourceType: build.sourceType,
    githubToken: build.app.author.githubAccessToken
      ? decryptToken(build.app.author.githubAccessToken)
      : null,
    workDir: path.join(os.tmpdir(), `vibedrop-build-${build.id}`),
  }

  try {
    // Mark as building
    await prisma.build.update({
      where: { id: buildId },
      data: { status: "building", startedAt: new Date() },
    })

    await prisma.app.update({
      where: { id: ctx.appId },
      data: { buildStatus: "building" },
    })

    // Step 1: Clone repo
    await cloneRepo(ctx)

    // Step 2: Detect build command
    const { installCmd, buildCmd, outputDir } = await detectBuildCommand(ctx.workDir)
    log(buildId, `Detected: install="${installCmd}", build="${buildCmd}", output="${outputDir}"`)

    // Step 3: Install & build
    await runBuild(ctx, installCmd, buildCmd)

    // Step 4: Upload artifacts
    const playUrl = await uploadArtifacts(ctx, outputDir)

    if (!playUrl) {
      await completeBuild(buildId, "failed", null, "No index.html found in build output")
      return
    }

    // Step 5: Success!
    await completeBuild(buildId, "success", playUrl, null)
    log(buildId, `Build complete! playUrl=${playUrl}`)

  } catch (error: any) {
    log(buildId, `Build failed: ${error.message}`)
    await appendBuildLog(buildId, `\n--- BUILD FAILED ---\n${error.message}`)
    await completeBuild(buildId, "failed", null, error.message)
  } finally {
    // Clean up temp directory
    try {
      await fs.rm(ctx.workDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  }
}

async function completeBuild(
  buildId: string,
  status: "success" | "failed",
  playUrl: string | null,
  errorMessage: string | null
) {
  const build = await prisma.build.findUnique({ where: { id: buildId } })
  if (!build) return

  const buildData: {
    status: "success" | "failed"
    completedAt: Date
    artifactUrl?: string
  } = {
    status,
    completedAt: new Date(),
  }
  if (playUrl) buildData.artifactUrl = playUrl

  await prisma.build.update({ where: { id: buildId }, data: buildData })

  const appData: {
    buildStatus: "success" | "failed"
    playUrl?: string
  } = { buildStatus: status }
  if (playUrl) appData.playUrl = playUrl

  await prisma.app.update({
    where: { id: build.appId },
    data: appData,
  })

  if (errorMessage) {
    await appendBuildLog(buildId, `\nError: ${errorMessage}`)
  }
}
