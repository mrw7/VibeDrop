# Plan #011: 分享卡片定制

## 文件变更

| 文件 | 变更 | 说明 |
|------|------|------|
| `src/app/api/og/route.tsx` | 重写 | 3 模板 + stats 显示 |
| `src/app/apps/[id]/page.tsx` | 修改 | generateMetadata 传入 likes/comments/template |

## 三模板设计

### Template 1: Gradient (默认，升级现有)

```
┌──────────────────────────────────────────────────┐
│  [VibeDrop logo]  —  Made with Cursor            │
│                                                   │
│          My Awesome App Title                     │
│                                                   │
│     👤 username    ❤️ 12    💬 5                  │
│                                                   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└──────────────────────────────────────────────────┘
```

### Template 2: Dark Card

```
┌──────────────────────────────────────────────────┐
│ ████                                              │
│ ████  My Awesome App Title                        │
│ ████                                              │
│ ████  username · Cursor · ❤️ 12 · 💬 5            │
│ ████                                              │
│                                                   │
└──────────────────────────────────────────────────┘
```

### Template 3: Minimal

```
┌──────────────────────────────────────────────────┐
│                                                   │
│  My Awesome App Title                             │
│  by username · Made with Cursor                  │
│                                                   │
│  ❤️ 12 likes · 💬 5 comments                      │
│                                                   │
│                        VibeDrop                   │
└──────────────────────────────────────────────────┘
```
