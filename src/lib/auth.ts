import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import { encryptToken, decryptToken } from "./encryption"
import { verifyPassword } from "./password"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // 反代(nginx)后必须信任 host,否则 v5 会以 host 与 NEXTAUTH_URL 不一致为由拒绝
  trustHost: true,
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = (credentials.email as string).toLowerCase().trim()
        const password = credentials.password as string

        // Look up user by email
        const user = await prisma.user.findFirst({
          where: { email },
        })

        if (!user || !user.passwordHash) {
          // Don't reveal whether email exists or not
          return null
        }

        // Check email verification
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED:请先验证邮箱后再登录")
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash)
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.githubLogin || "用户",
          image: user.avatarUrl,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        // Encrypt and store the user's GitHub access token
        const encryptedToken = account.access_token
          ? encryptToken(account.access_token)
          : null
        await prisma.user.update({
          where: { email: user.email! },
          data: {
            githubAccessToken: encryptedToken,
            githubId: profile?.id?.toString(),
            githubLogin: profile?.login as string,
            avatarUrl: profile?.avatar_url as string,
            name: profile?.name as string || profile?.login as string,
          },
        })
      }
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Ensure email is available for credential users
        if (!session.user.email && user.email) {
          session.user.email = user.email
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})

export function getDecryptedGitHubToken(encryptedToken: string | null): string | null {
  if (!encryptedToken) return null
  try {
    return decryptToken(encryptedToken)
  } catch {
    return null
  }
}
