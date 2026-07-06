import { z } from "zod"
import { sanitizeText, sanitizeRichText } from "./sanitize"

// ─── App CRUD ────────────────────────────────────────────────

export const createAppSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(100, "标题最长 100 字符").transform(sanitizeText),
  description: z.string().max(2000, "描述最长 2000 字符").optional().default("").transform((s) => sanitizeRichText(s)),
  sourceType: z.enum(["zip", "github"]),
  sourceUrl: z.string().url("请输入有效的 URL").optional(),
  aiToolTag: z.string().max(50).optional().default("").transform(sanitizeText),
  techStackTag: z.string().max(50).optional().default("").transform(sanitizeText),
  deviceType: z.enum(["web", "ios", "android", "harmony"]).optional().default("web"),
})

export type CreateAppInput = z.infer<typeof createAppSchema>

export const editAppSchema = z.object({
  appId: z.string().uuid("无效的 App ID"),
  title: z.string().min(1, "标题不能为空").max(100, "标题最长 100 字符").transform(sanitizeText),
  description: z.string().max(2000).optional().default("").transform((s) => sanitizeRichText(s)),
  aiToolTag: z.string().max(50).optional().default("").transform(sanitizeText),
  techStackTag: z.string().max(50).optional().default("").transform(sanitizeText),
  deviceType: z.enum(["web", "ios", "android", "harmony"]).optional().default("web"),
})

export type EditAppInput = z.infer<typeof editAppSchema>

export const deleteAppSchema = z.object({
  appId: z.string().uuid("无效的 App ID"),
})

// ─── Interactions ────────────────────────────────────────────

export const appIdSchema = z.object({
  appId: z.string().uuid("无效的 App ID"),
})

export const addCommentSchema = z.object({
  appId: z.string().uuid("无效的 App ID"),
  content: z
    .string()
    .min(1, "评论不能为空")
    .max(1000, "评论最长 1000 字符")
    .transform((s) => sanitizeRichText(s.trim())),
})

export const reportAppSchema = z.object({
  appId: z.string().uuid("无效的 App ID"),
  reason: z
    .string()
    .min(1, "举报原因不能为空")
    .max(500, "原因最长 500 字符")
    .transform((s) => sanitizeText(s.trim())),
})

// ─── Build ───────────────────────────────────────────────────

export const triggerBuildSchema = z.object({
  appId: z.string().uuid("无效的 App ID"),
})

// ─── API Query ───────────────────────────────────────────────

export const appsQuerySchema = z.object({
  q: z.string().max(200).optional(),
  aiTool: z.string().max(50).optional(),
  techStack: z.string().max(50).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
})

export type AppsQuery = z.infer<typeof appsQuerySchema>

// ─── Auth ────────────────────────────────────────────────────

export const signUpSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址").max(255),
  password: z
    .string()
    .min(8, "密码至少 8 个字符")
    .max(128, "密码最长 128 个字符")
    .regex(/[A-Z]/, "密码需包含大写字母")
    .regex(/[a-z]/, "密码需包含小写字母")
    .regex(/[0-9]/, "密码需包含数字"),
  name: z
    .string()
    .min(2, "显示名称至少 2 个字符")
    .max(50, "显示名称最长 50 个字符")
    .transform(sanitizeText),
})

export type SignUpInput = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
})

export type SignInInput = z.infer<typeof signInSchema>

export const passwordResetRequestSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
})

export const passwordResetSchema = z.object({
  token: z.string().min(1, "无效的重置链接"),
  password: z
    .string()
    .min(8, "密码至少 8 个字符")
    .max(128, "密码最长 128 个字符")
    .regex(/[A-Z]/, "密码需包含大写字母")
    .regex(/[a-z]/, "密码需包含小写字母")
    .regex(/[0-9]/, "密码需包含数字"),
})

// ─── Upload ──────────────────────────────────────────────────

export const uploadValidationSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive(),
  fileType: z.string(),
})

// ─── Tips ────────────────────────────────────────────────────

export const createTipSchema = z.object({
  appId: z.string().uuid("无效的 App ID"),
  amount: z.number().int().min(100, "最低打赏 ¥1.00").max(999999, "最高打赏 ¥9,999.99"),
  message: z.string().max(200, "留言最长 200 字符").optional(),
})

// ─── Collaborators ────────────────────────────────────────────

export const addCollaboratorSchema = z.object({
  appId: z.string().uuid("无效的 App ID"),
  userId: z.string().uuid("无效的用户 ID"),
})

export const removeCollaboratorSchema = z.object({
  appId: z.string().uuid("无效的 App ID"),
  userId: z.string().uuid("无效的用户 ID"),
})

// ─── Helper ──────────────────────────────────────────────────

/**
 * Parse and validate input, throwing a user-friendly error on failure.
 */
export function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message).join("; ")
    throw new ValidationError(messages)
  }
  return result.data
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}

export class AppError extends Error {
  public code: string
  public status: number

  constructor(code: string, message: string, status: number = 400) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.status = status
  }

  static unauthorized(message = "请先登录") {
    return new AppError("UNAUTHORIZED", message, 401)
  }

  static forbidden(message = "没有权限") {
    return new AppError("FORBIDDEN", message, 403)
  }

  static notFound(message = "资源不存在") {
    return new AppError("NOT_FOUND", message, 404)
  }

  static conflict(message: string) {
    return new AppError("CONFLICT", message, 409)
  }

  static badRequest(message: string) {
    return new AppError("BAD_REQUEST", message, 400)
  }

  static tooManyRequests(message = "请求过于频繁，请稍后再试") {
    return new AppError("TOO_MANY_REQUESTS", message, 429)
  }

  static emailNotVerified(message = "请先验证邮箱后再登录") {
    return new AppError("EMAIL_NOT_VERIFIED", message, 403)
  }
}
