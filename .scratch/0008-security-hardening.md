# Issue 8: 安全加固与监控

## What to build

实现 iframe CSP 策略，ZIP 文件类型和大小验证，OSS 文件访问控制，GitHub token 加密存储，举报内容标记。

## Acceptance criteria

- [ ] iframe 加载的资源受 CSP 限制
- [ ] 非 ZIP 文件上传被拒绝
- [ ] 超过 100MB 的文件上传被拒绝
- [ ] GitHub token 数据库中加密存储
- [ ] 举报的 App 标记为待审核

## Blocked by

- Issue #3: ZIP 上传发布作品
- Issue #4: GitHub 自动构建发布
- Issue #6: 手机外壳 iframe 播放器
