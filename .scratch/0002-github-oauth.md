# Issue 2: GitHub OAuth 认证系统

## What to build

集成 NextAuth.js 配置 GitHub OAuth Provider，请求 `repo` scope，实现登录/登出流程，创建 User 表记录，显示用户头像和用户名。

## Acceptance criteria

- [ ] 点击"Login with GitHub"跳转授权
- [ ] 授权成功后创建用户记录并显示头像
- [ ] 登出后清除会话
- [ ] 未登录用户访问发布页面重定向到登录

## Blocked by

- Issue #1: 项目初始化与数据库架构
