import { Toaster } from "sonner"
import { metadata } from "./metadata"
import "@/lib/env"
import "./globals.css"

export { metadata }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  // Cyberpunk 像素风默认深色:仅当用户明确存了 'light' 才用浅色
                  if (theme !== 'light') {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased font-sans">
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "var(--color-card)",
              color: "var(--color-foreground)",
              border: "1px solid var(--color-border)",
            },
          }}
        />
      </body>
    </html>
  )
}
