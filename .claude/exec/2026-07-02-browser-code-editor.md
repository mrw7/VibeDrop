# Exec #014: 浏览器内代码编辑器

## 日期: 2026-07-02

## 实际变更

### 新增依赖

`package.json` — `@monaco-editor/react@^4.6.0`

### 新建文件

`src/app/api/apps/[id]/files/route.ts` — GitHub 文件 API:
- `GET /api/apps/[id]/files` — 获取文件树 (递归 GitHub tree API)
- `GET /api/apps/[id]/files?path=src/App.tsx` — 获取文件内容 (base64 decode)
- 过滤: 排除 node_modules, .git, dist, build, .next, package-lock
- 限制: 深度 ≤8, 文件 ≤200
- 权限: 仅 App 作者

`src/app/api/apps/[id]/save/route.ts` — 保存 + 重建 API:
- `POST /api/apps/[id]/save` — 接收 `{ files: { path: content } }`
- 路径遍历防护 + 文件大小限制 (≤1MB)
- fflate zipSync 打包 → OSS 上传 → 创建 pending Build
- 更新 App.sourceUrl 指向修改后的 ZIP

`src/app/apps/[id]/editor/page.tsx` — 编辑器主页面 (Server Component):
- 认证 + 作者权限校验
- GitHub source 类型检查
- 全屏布局: Header + EditorShell

`src/app/apps/[id]/editor/EditorShell.tsx` — 布局组合 (Client Component):
- 左侧 FileTree + 右侧 EditorPanel

`src/app/apps/[id]/editor/FileTree.tsx` — 文件树组件:
- 递归目录展开/折叠
- 文件点击选中 (accent 高亮)
- ChevronRight/ChevronDown 折叠指示器
- Folder/FolderOpen 状态图标
- 骨架屏加载态 + 错误提示

`src/app/apps/[id]/editor/EditorPanel.tsx` — Monaco 编辑器面板:
- Monaco Editor (vs-dark, CDN 加载)
- 语言自动检测 (ts/tsx/js/jsx/json/css/html/md/py 等)
- 修改跟踪 (modifiedFiles map)
- "Save & Rebuild" 按钮 + 构建状态提示
- 空状态: "Select a file to edit"

### 修改文件

`src/app/apps/[id]/page.tsx`:
- 作者操作区新增 "Edit Code" 按钮 (仅 GitHub source)
- 链接到 `/apps/[id]/editor`

### 关键决策

- Phase 3 MVP 仅支持 GitHub 源 App (ZIP 编辑需要解压/重打包，Phase 3.1)
- Monaco 从 jsDelivr CDN 加载 (非 bundle，减小包体积)
- fflate zipSync 复用已有依赖
- 编辑器全屏独立页面 (非 modal，给开发者沉浸体验)
