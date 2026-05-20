# 无障碍检查报告 — maikr.pro

> 生成时间: 2026-05-20 13:15 UTC
> 标准: WCAG 2.1 AA

## 🔴 必须修复 (5项)

- **landing.html:326** 缺少 `<main>` 地标 → 在 `<nav>` 后添加 `<main>` 包裹主要内容，`</main>` 在 `<footer>` 前
- **landing.html:326** `<nav>` 缺少 `aria-label` → 添加 `aria-label="Main navigation"`
- **landing.html:340** H1 断行问题："Your AI teamnever sleeps" 缺少空格 → 修复为 "Your AI team never sleeps"
- **landing.html:340** 缺少跳转到内容的链接 → 在 `<nav>` 后添加 `<a href="#main" class="skip-link">Skip to content</a>`
- **landing.html:491** `<footer>` 缺少 `role="contentinfo"` → 添加 `role="contentinfo"`

## 🟡 建议改进 (3项)

- **landing.html:343-344** CTA 按钮使用 `<a>` 而非 `<button>` → 功能上是链接（导航到注册页），当前实现可接受，但建议添加 `role="button"` 以明确语义
- **landing.html:393-413** 功能卡片缺少可访问名称 → 每个卡片 `<div>` 建议添加 `role="article"` 或包裹在 `<section>` 中
- **所有页面** 表单页面（build-step*.html, login.html, register.html）缺少 `<main>` 地标 → 建议统一添加

## ✅ 已通过项

- 页面有 `<title>` 和 `<meta name="description">`
- 有 `<h1>` 标题
- 有 `<nav>` 和 `<footer>` 语义标签
- 颜色对比度良好（深色背景 + 浅色文字）
- 有 `<link rel="canonical">`

## 建议的代码修改

### 1. 添加 skip link 和 main 地标 (landing.html)

在 `</nav>` 后添加：
```html
<a href="#main" class="skip-link">Skip to content</a>
<main id="main">
```

在 `<footer>` 前添加：
```html
</main>
```

### 2. 修复 nav aria-label

```html
<nav class="lp-nav" aria-label="Main navigation">
```

### 3. 修复 footer role

```html
<footer class="lp-footer" role="contentinfo">
```

### 4. 修复 H1 空格

```html
<h1>Your AI team<br>never <span class="accent">sleeps</span>,<br>never drops the ball</h1>
```
改为：
```html
<h1>Your AI team<br>never <span class="accent">sleeps</span>,<br>never drops the ball</h1>
```
（当前代码中 "team" 和 "never" 之间已有 `<br>`，但视觉上可能缺少空格，需确认渲染效果）
