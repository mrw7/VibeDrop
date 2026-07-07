import Link from "next/link"
import Logo from "./Logo"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 品牌区 */}
          <div className="space-y-3">
            <Logo href="/" size="md" />
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              面向 Vibe Coding 社区的应用分享与试玩平台。上传 AI 生成应用,即刻体验。
            </p>
          </div>

          {/* 产品 */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">产品</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/apps" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  发现作品
                </Link>
              </li>
              <li>
                <Link href="/publish" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  发布作品
                </Link>
              </li>
              <li>
                <Link href="/auth/signin" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  登录 / 注册
                </Link>
              </li>
            </ul>
          </div>

          {/* 资源 */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">资源</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/mrw7/VibeDrop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  GitHub 仓库
                </a>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  仅供学习交流使用
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t-2 border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground font-pixel">
            © {new Date().getFullYear()} VIBEDROP
          </p>
          <p className="text-xs flex items-center gap-1.5 font-pixel">
            <span className="text-muted-foreground">MADE WITH</span>
            <span className="neon-text-pink">VIBE CODING</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
