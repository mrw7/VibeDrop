# Spec #007: 构建日志查看

## 状态: done

## 创建日期: 2026-07-02

---

## 用户故事

As an **app publisher**,
I want **to see my build logs in the app detail page**,
so that **I can debug when the build fails**.

---

## 问题描述

Spec #001 实现了真正的构建 Worker，`Build.buildLog` 已有数据，但前端没有任何地方展示。构建失败时用户看到的只是一个"构建失败"状态，无法知道原因。

---

## 功能范围

### In Scope
- App 详情页 / PhoneShell 区域显示构建日志面板
- 构建中实时展示最新日志（BuildButton 已每 5s 轮询，可顺便带日志）
- 构建失败时自动展开日志
- 日志支持等宽字体 + 滚动

### Out of Scope
- WebSocket 实时日志推送（轮询够用）
- 日志搜索/过滤
- 日志下载

---

## 验收标准

- [x] 构建中：可展开日志面板，实时看到最新日志行
- [x] 构建成功：日志面板默认折叠
- [x] 构建失败：日志面板自动展开，显示错误信息
- [x] 日志使用等宽字体（JetBrains Mono）

---

## 非功能需求

- **性能**: 日志轮询复用已有的 build-status 接口，不新增额外请求

---

## 依赖

- Spec #001 (构建 Worker) ← **已完成**
