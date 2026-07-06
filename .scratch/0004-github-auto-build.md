# Issue 4: GitHub 自动构建发布

## What to build

用户粘贴 GitHub 仓库 URL，后端使用 Docker 容器克隆仓库（private repo 使用加密的 OAuth token），执行 npm install + npm run build，构建产物上传到 OSS，更新 App 的 buildStatus 和 playUrl。

## Acceptance criteria

- [ ] 输入 GitHub URL 后触发构建
- [ ] Public repo 构建成功
- [ ] Private repo 使用用户 token 构建成功
- [ ] 构建失败时显示日志
- [ ] 构建成功后可正常播放

## Blocked by

- Issue #2: GitHub OAuth 认证系统
