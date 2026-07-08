import nodemailer from "nodemailer"

// Lazy-initialized transport
let _transport: nodemailer.Transporter | null = null

function getTransport(): nodemailer.Transporter {
  if (_transport) return _transport

  // In non-production, log to console instead of sending real emails
  if (process.env.NODE_ENV !== "production") {
    _transport = nodemailer.createTransport({
      jsonTransport: true,
    })
    return _transport
  }

  _transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  return _transport
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const transport = getTransport()

  try {
    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@vibedrop.com",
      to,
      subject,
      html,
    })

    // In dev mode with jsonTransport, log the email content to console
    if (process.env.NODE_ENV !== "production") {
      console.log("--- EMAIL (dev mode) ---")
      console.log("To:", to)
      console.log("Subject:", subject)
      console.log("Message ID:", info.messageId)
      const urlMatch = html.match(/https?:\/\/[^\s"'<>]+/)
      if (urlMatch) {
        console.log("Link:", urlMatch[0])
      }
      console.log("--- END EMAIL ---")
    }
  } catch (error) {
    console.error("Failed to send email:", error)
    throw new Error("邮件发送失败，请稍后重试")
  }
}

/**
 * Send an email verification code to a new user.
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  displayName: string,
): Promise<void> {
  const html = `<div style="max-width:480px;margin:0 auto;font-family:sans-serif">
  <h2 style="color:#e04f2e">VibeDrop</h2>
  <p>Hi ${displayName},</p>
  <p>感谢注册 VibeDrop！请输入以下验证码完成注册：</p>
  <div style="text-align:center;padding:20px 0">
    <span style="display:inline-block;padding:16px 32px;background:#e04f2e;color:#fff;font-size:32px;font-weight:bold;letter-spacing:8px;border-radius:8px;font-family:monospace">${code}</span>
  </div>
  <p style="color:#666;font-size:14px;margin-top:24px">此验证码 10 分钟内有效。</p>
  <p style="color:#999;font-size:13px">如果你没有注册 VibeDrop，请忽略此邮件。</p>
</div>`

  await sendEmail(email, "VibeDrop 邮箱验证码: ${code}", html)

  // In dev mode: also dump code to console so devs can test without SMTP
  if (process.env.NODE_ENV !== "production") {
    console.log("--- VERIFICATION CODE (dev) ---")
    console.log("Email:", email)
    console.log("Code:", code)
    console.log("--- END ---")
  }
}

/**
 * Send a password reset link to a user.
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  displayName: string,
): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const resetUrl = `${baseUrl}/auth/reset-password/${encodeURIComponent(token)}`

  const html = `<div style="max-width:480px;margin:0 auto;font-family:sans-serif">
  <h2 style="color:#e04f2e">VibeDrop</h2>
  <p>Hi ${displayName}，</p>
  <p>我们收到重置密码的请求。请点击下方按钮设置新密码：</p>
  <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#e04f2e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">重置密码</a>
  <p style="color:#666;font-size:14px;margin-top:24px">或复制此链接：<br><code>${resetUrl}</code></p>
  <p style="color:#999;font-size:13px">此链接 1 小时内有效。如果你没有请求重置密码，请忽略此邮件。</p>
</div>`

  await sendEmail(email, "重置你的 VibeDrop 密码", html)
}
