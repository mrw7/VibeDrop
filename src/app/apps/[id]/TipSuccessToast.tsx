"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function TipSuccessToast() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("tipped") === "success") {
      toast.success("打赏成功！感谢你的支持", {
        duration: 5000,
      })
    }
  }, [searchParams])

  return null
}
