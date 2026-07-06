/**
 * VibeDrop Build Worker
 *
 * A standalone process that polls the database for pending builds
 * and executes them. Run via:
 *
 *   npm run build-worker
 *   npm run build-worker -- --once --concurrency 4
 *   npx tsx scripts/build-worker.ts --interval 5000
 *
 * Options:
 *   --once          Process one batch then exit
 *   --concurrency N Max concurrent builds (default: 2)
 *   --interval MS   Poll interval in ms (default: 3000)
 */

import { prisma } from "../src/lib/prisma"
import { executeBuild } from "../src/lib/build-executor"

// Parse CLI flags
const args = process.argv.slice(2)
const ONCE = args.includes("--once")
const MAX_CONCURRENT_BUILDS = parseInt(
  args.find((a, i) => a === "--concurrency" && i < args.length - 1
    ? args[i + 1] : "") || "2",
  10
)
const POLL_INTERVAL_MS = parseInt(
  args.find((a, i) => a === "--interval" && i < args.length - 1
    ? args[i + 1] : "") || "3000",
  10
)

let activeBuilds = 0
let running = true

async function poll() {
  try {
    // Find pending builds, oldest first
    const pendingBuilds = await prisma.build.findMany({
      where: { status: "pending" },
      orderBy: { startedAt: "asc" },
      take: MAX_CONCURRENT_BUILDS - activeBuilds,
    })

    for (const build of pendingBuilds) {
      if (activeBuilds >= MAX_CONCURRENT_BUILDS) break

      activeBuilds++
      console.log(
        `[Worker] Picked up build ${build.id} (app: ${build.appId}) [${activeBuilds}/${MAX_CONCURRENT_BUILDS}]`
      )

      // Fire and forget — don't await, so we can process multiple builds concurrently
      // Wrap in try/catch to prevent synchronous throws from permanently leaking activeBuilds
      try {
        executeBuild(build.id)
          .catch((err) => {
            console.error(`[Worker] Build ${build.id} errored:`, err.message)
          })
          .finally(() => {
            activeBuilds--
            console.log(
              `[Worker] Build ${build.id} finished [${activeBuilds}/${MAX_CONCURRENT_BUILDS}]`
            )
          })
      } catch (err: any) {
        activeBuilds--
        console.error(`[Worker] Build ${build.id} failed synchronously:`, err.message)
      }
    }
  } catch (error: any) {
    // Database might not be ready yet during startup
    if (error.code !== "P1001" && error.code !== "P1002") {
      console.error("[Worker] Poll error:", error.message)
    }
  }
}

async function main() {
  console.log("[Worker] VibeDrop Build Worker starting...")
  console.log(`[Worker] Poll interval: ${POLL_INTERVAL_MS}ms`)
  console.log(`[Worker] Max concurrent builds: ${MAX_CONCURRENT_BUILDS}`)
  console.log(`[Worker] Mode: ${ONCE ? "once" : "continuous"}`)

  if (ONCE) {
    await poll()
    // Wait for active builds to finish
    while (activeBuilds > 0) {
      await new Promise((r) => setTimeout(r, 1000))
    }
    console.log("[Worker] --once mode: exiting after batch")
    process.exit(0)
  }

  // Poll immediately, then on interval
  await poll()
  const interval = setInterval(poll, POLL_INTERVAL_MS)

  // Graceful shutdown
  const shutdown = () => {
    console.log("\n[Worker] Shutting down...")
    running = false
    clearInterval(interval)
    // Wait briefly for active builds to drain
    const drain = setInterval(() => {
      if (activeBuilds === 0) {
        clearInterval(drain)
        process.exit(0)
      }
    }, 500)
  }
  process.on("SIGTERM", shutdown)
  process.on("SIGINT", shutdown)
}

main()
