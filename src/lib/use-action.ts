"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

type ActionState<TArgs extends unknown[]> = {
  loading: boolean
  error: string | null
}

/**
 * Wraps a server action with loading/error state management and toast notifications.
 *
 * Usage:
 *   const { execute, loading, error } = useAction(addComment)
 *   await execute(appId, content)
 */
export function useAction<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<unknown>,
  opts?: {
    successMessage?: string
    onSuccess?: () => void
  }
) {
  const [state, setState] = useState<ActionState<TArgs>>({
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: TArgs) => {
      setState({ loading: true, error: null })
      try {
        await fn(...args)
        setState({ loading: false, error: null })
        if (opts?.successMessage) {
          toast.success(opts.successMessage)
        }
        opts?.onSuccess?.()
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "操作失败，请重试"
        setState({ loading: false, error: message })
        toast.error(message)
      }
    },
    [fn, opts]
  )

  return {
    execute,
    loading: state.loading,
    error: state.error,
  }
}
