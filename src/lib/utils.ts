import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the display name for a user, handling both GitHub and email users.
 */
export function getUserDisplayName(user: {
  name?: string | null
  githubLogin?: string | null
}): string {
  return user.name || user.githubLogin || "用户"
}

/**
 * Get the avatar URL for a user, falling back to the default avatar.
 */
export function getUserAvatarUrl(user: {
  image?: string | null
}): string {
  return user.image || "/default-avatar.svg"
}
