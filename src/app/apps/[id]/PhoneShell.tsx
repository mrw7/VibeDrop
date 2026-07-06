"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Maximize, Minimize, RotateCw, Loader2, AlertTriangle, Play } from "lucide-react"
import BuildButton from "./build/BuildButton"
import EmulatorViewer from "./EmulatorViewer"

interface PhoneShellProps {
  playUrl: string | null
  buildStatus: string
  appId: string
  deviceType?: string
}

type PlayMode = "web" | "native"

type Orientation = "portrait" | "landscape"

const SHELL_SIZE = {
  portrait: "w-[320px] h-[650px]",
  landscape: "w-[650px] h-[340px]",
} as const

const SHELL_RADIUS = {
  portrait: "rounded-[2.5rem]",
  landscape: "rounded-[2rem]",
} as const

export default function PhoneShell({ playUrl, buildStatus, appId, deviceType: appDeviceType }: PhoneShellProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [deviceType, setDeviceType] = useState<"ios" | "android">("ios")
  const [orientation, setOrientation] = useState<Orientation>("portrait")
  const [playMode, setPlayMode] = useState<PlayMode>("web")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const supportsNative = appDeviceType === "android" && process.env.NEXT_PUBLIC_EMULATOR_ENABLED === "true"

  // Auto-detect device orientation on mobile
  useEffect(() => {
    try {
      const handleOrientationChange = () => {
        const type = screen.orientation?.type
        if (type?.startsWith("landscape")) {
          setOrientation("landscape")
        } else if (type?.startsWith("portrait")) {
          setOrientation("portrait")
        }
      }

      screen.orientation?.addEventListener("change", handleOrientationChange)
      // Check initial orientation
      handleOrientationChange()

      return () => {
        screen.orientation?.removeEventListener("change", handleOrientationChange)
      }
    } catch {
      // screen.orientation not supported — manual toggle only
    }
  }, [])

  const toggleOrientation = useCallback(() => {
    setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"))
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!iframeRef.current) return

    if (!isFullscreen) {
      iframeRef.current.requestFullscreen?.()
    } else {
      document.fullscreenElement && document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  const isPortrait = orientation === "portrait"

  const renderContent = () => {
    // Native mode: show EmulatorViewer
    if (playMode === "native") {
      return <EmulatorViewer appId={appId} />
    }

    if (buildStatus === "success" && playUrl) {
      return (
        <iframe
          ref={iframeRef}
          src={playUrl}
          className="w-full h-full border-0"
          title="App player"
          sandbox="allow-scripts allow-same-origin allow-forms"
          allow="accelerometer; camera; microphone"
        />
      )
    }

    if (buildStatus === "building" || buildStatus === "pending") {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="w-16 h-16 mb-4 rounded-full bg-warning/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-warning-foreground animate-spin" />
          </div>
          <p className="text-foreground font-medium mb-2">
            {buildStatus === "building" ? "构建中..." : "等待构建"}
          </p>
          <p className="text-muted-foreground text-sm text-center mb-4">
            应用正在编译中，请稍候
          </p>
          <BuildButton appId={appId} buildStatus={buildStatus} />
        </div>
      )
    }

    if (buildStatus === "failed") {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="w-16 h-16 mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-foreground font-medium mb-2">构建失败</p>
          <p className="text-muted-foreground text-sm text-center mb-4">
            请检查代码后重试
          </p>
          <BuildButton appId={appId} buildStatus={buildStatus} />
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-16 h-16 mb-4 rounded-full bg-secondary flex items-center justify-center">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium mb-2">尚未部署</p>
        <p className="text-muted-foreground text-sm text-center mb-4">
          触发构建来预览你的应用
        </p>
        <BuildButton appId={appId} buildStatus={buildStatus} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center lg:sticky lg:top-24">
      {/* Toolbar: Play Mode + Device + Orientation + Fullscreen */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        {/* Play Mode Switcher (only shown for native apps) */}
        {supportsNative && (
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setPlayMode("web")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                playMode === "web"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Web
            </button>
            <button
              onClick={() => setPlayMode("native")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                playMode === "native"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Native
            </button>
          </div>
        )}

        {/* Device Type Switcher */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          <button
            onClick={() => setDeviceType("ios")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              deviceType === "ios"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            iPhone
          </button>
          <button
            onClick={() => setDeviceType("android")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              deviceType === "android"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Android
          </button>
        </div>

        {/* Rotate Button */}
        <button
          onClick={toggleOrientation}
          className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted transition-colors btn-press"
          aria-label={isPortrait ? "切换横屏" : "切换竖屏"}
          title={isPortrait ? "切换横屏" : "切换竖屏"}
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        {buildStatus === "success" && playUrl && (
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted transition-colors btn-press"
            aria-label={isFullscreen ? "退出全屏" : "全屏播放"}
            title={isFullscreen ? "退出全屏" : "全屏播放"}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Phone Frame */}
      <div
        className={`relative bg-card border-2 border-border overflow-hidden transition-all duration-400 ease-in-out ${
          isFullscreen
            ? "w-full h-full rounded-none border-0"
            : `${isPortrait ? SHELL_SIZE.portrait : SHELL_SIZE.landscape} ${isPortrait ? SHELL_RADIUS.portrait : SHELL_RADIUS.landscape} shadow-lg`
        }`}
      >
        {/* Notch / Status Bar */}
        {!isFullscreen && (
          <div className={`absolute z-10 ${
            isPortrait
              ? "top-0 left-0 right-0"
              : "top-0 left-0 bottom-0 flex flex-col justify-center w-8"
          }`}>
            {deviceType === "ios" ? (
              isPortrait ? (
                <div className="flex justify-center pt-2">
                  <div className="w-28 h-6 bg-foreground rounded-b-2xl" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full ml-1">
                  <div className="w-6 h-20 bg-foreground rounded-r-2xl" />
                </div>
              )
            ) : null}
            <div className={`flex items-center ${
              isPortrait
                ? "justify-between px-6 py-1 mt-1"
                : "flex-col justify-center gap-4 py-6"
            }`}>
              <span className="text-xs font-medium text-muted-foreground">9:41</span>
              <div className={`flex items-center ${isPortrait ? "gap-1" : "flex-col gap-2"}`}>
                <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C17.93 4.93 6.07 4.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-6-6l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 3 15z" />
                </svg>
                <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C17 21.4 17.6 22 18.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* App Content */}
        <div className={`w-full h-full ${
          isFullscreen
            ? "pt-0"
            : isPortrait
              ? "pt-12 pb-6"
              : "pl-8 pr-0 py-0"
        }`}>
          {renderContent()}
        </div>

        {/* Home Indicator */}
        {!isFullscreen && (
          <div className={`absolute bg-foreground/20 rounded-full ${
            isPortrait
              ? "bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1"
              : "right-1.5 top-1/2 -translate-y-1/2 w-1 h-28"
          }`} />
        )}
      </div>
    </div>
  )
}
