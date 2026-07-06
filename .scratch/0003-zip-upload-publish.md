# Issue 3: ZIP 上传发布作品

## What to build

实现 ZIP 文件上传（直传阿里云 OSS），解压 ZIP 到 OSS，创建 App 记录，填写标题/描述/封面图/标签，保存 playUrl 指向 OSS 解压后的 index.html。

## Acceptance criteria

- [ ] 用户可以选择并上传 ZIP 文件
- [ ] ZIP 上传后自动解压到 OSS 目录
- [ ] 填写表单后创建 App 记录
- [ ] 上传的 ZIP 能在 iframe 中正常加载

## Blocked by

- Issue #2: GitHub OAuth 认证系统
