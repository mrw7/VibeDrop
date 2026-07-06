# Plan #014: 浏览器内代码编辑器

## 文件变更

| 文件 | 变更 | 说明 |
|------|------|------|
| `package.json` | 修改 | + `@monaco-editor/react` |
| `src/app/api/apps/[id]/files/route.ts` | **新建** | GitHub 文件树 + 文件内容 API |
| `src/app/api/apps/[id]/save/route.ts` | **新建** | 保存修改 + 创建 Build |
| `src/app/apps/[id]/editor/page.tsx` | **新建** | 编辑器主页面 |
| `src/app/apps/[id]/editor/FileTree.tsx` | **新建** | 文件树组件 |
| `src/app/apps/[id]/editor/EditorPanel.tsx` | **新建** | Monaco 编辑器面板 |
| `src/app/apps/[id]/page.tsx` | 修改 | + "Edit in Editor" 按钮 (作者可见) |

## API 设计

### GET /api/apps/[id]/files

```
?path=src/App.tsx  → 返回文件内容 (text/plain)
(无 path)          → 返回文件树 JSON
```

```json
[
  { "name": "src", "type": "dir", "children": [
    { "name": "App.tsx", "type": "file", "size": 1234 },
    { "name": "index.tsx", "type": "file", "size": 567 }
  ]},
  { "name": "package.json", "type": "file", "size": 890 }
]
```

### POST /api/apps/[id]/save

```json
// Request
{ "files": { "src/App.tsx": "modified content...", "src/index.tsx": "..." } }

// Response
{ "buildId": "uuid", "status": "pending" }
```

## 编辑器页面布局

```
┌──────────────────────────────────────────────────┐
│  ← Back to App  │  My App Title  │  Save & Rebuild │
├────────────┬─────────────────────────────────────┤
│  File Tree │  Tab: App.tsx  Tab: index.tsx       │
│            ├─────────────────────────────────────┤
│  src/      │                                     │
│    App.tsx │     Monaco Editor                   │
│    index.tsx│                                     │
│  package   │                                     │
│  .json     │                                     │
│            │                                     │
└────────────┴─────────────────────────────────────┘
```
