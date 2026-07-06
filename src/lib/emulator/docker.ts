import Docker from "dockerode"

let _docker: Docker | null | undefined

/**
 * Get the Docker client instance.
 * Returns null if Docker is not available (emulator disabled).
 */
export function getDocker(): Docker | null {
  if (_docker !== undefined) return _docker

  const enabled = process.env.EMULATOR_ENABLED === "true"
  if (!enabled) {
    _docker = null
    return null
  }

  try {
    const socketPath = process.env.EMULATOR_DOCKER_HOST || "/var/run/docker.sock"
    _docker = new Docker({ socketPath })
  } catch {
    console.warn("Failed to connect to Docker — emulator disabled")
    _docker = null
  }

  return _docker
}

/** Default redroid image */
export const REDROID_IMAGE = "redroid/redroid:11.0.0-latest"

/** Port range for ADB connections */
export const ADB_PORT_START = 5555

/** Port range for noVNC connections */
export const NOVNC_PORT_START = 6080

/**
 * Allocate a port from a range, checking against existing sessions.
 */
export function allocatePort(
  base: number,
  usedPorts: number[],
  maxOffset = 50,
): number {
  for (let offset = 0; offset < maxOffset; offset++) {
    const port = base + offset
    if (!usedPorts.includes(port)) return port
  }
  throw new Error("No available ports in range")
}

/**
 * Create a redroid Android container via Docker.
 */
export async function createRedroidContainer(
  adbPort: number,
  novncPort: number,
): Promise<string> {
  const docker = getDocker()
  if (!docker) throw new Error("Docker not available")

  const maxSessions = parseInt(
    process.env.EMULATOR_MAX_SESSIONS || "5",
    10,
  )

  // Check active container count
  const existing = await docker.listContainers({
    filters: { ancestor: [REDROID_IMAGE], status: ["running"] },
  })
  if (existing.length >= maxSessions) {
    throw new Error(`最多同时运行 ${maxSessions} 个模拟器，请稍后再试`)
  }

  const container = await docker.createContainer({
    Image: REDROID_IMAGE,
    name: `redroid-${adbPort}`,
    ExposedPorts: {
      "5555/tcp": {},
      "6080/tcp": {},
    },
    HostConfig: {
      PortBindings: {
        "5555/tcp": [{ HostPort: String(adbPort) }],
        "6080/tcp": [{ HostPort: String(novncPort) }],
      },
      Privileged: true,
      Memory: 2 * 1024 * 1024 * 1024, // 2GB
      NanoCpus: 2 * 1e9, // 2 CPU cores
    },
    Env: [
      "androidboot.redroid_width=1080",
      "androidboot.redroid_height=1920",
      "androidboot.redroid_dpi=420",
      "androidboot.redroid_gpu_mode=auto",
    ],
  })

  await container.start()
  return container.id
}

/**
 * Stop and remove a container by ID.
 */
export async function removeContainer(containerId: string): Promise<void> {
  const docker = getDocker()
  if (!docker) return

  try {
    const container = docker.getContainer(containerId)
    await container.stop({ t: 5 })
    await container.remove({ force: true })
  } catch {
    // Container may already be removed — ignore
  }
}
