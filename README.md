# Authn123Pan - 123云盘直链鉴权工具

一个多平台的 123pan 直链鉴权解决方案，帮助你在网站中安全地使用 123pan 托管的资源（视频、图片等），同时保护 UID 和鉴权密钥不被泄露。

## 💡 项目简介

当你想在网站中使用 123pan 的直链资源时，如果直接暴露原始直链，可能会被他人盗用。123pan 提供了鉴权机制，但需要使用 UID 和密钥对链接进行签名。如果在客户端进行签名，密钥就会暴露。

本项目提供了 4 种不同的部署方式，将签名处理放在服务端，确保密钥安全。

## 🎯 支持的平台

本项目提供了 4 种不同的实现方式，适用于不同的使用场景：

| 平台 | 适用场景 | 部署难度 |
|------|---------|---------|
| [WordPress](./For-WordPress/) | WordPress 网站 | ⭐ 简单 |
| [Cloudflare Workers](./For-cloudflareWorkers/) | 任何网站，追求性能 | ⭐⭐ 中等 |
| [Vercel](./For-vercel/) | 任何网站，已使用 Vercel | ⭐⭐ 中等 |
| [Netlify](./For-netlify/) | 任何网站，已使用 Netlify | ⭐⭐ 中等 |

## 📊 四种方式对比

### 1. WordPress 插件版 (For-WordPress)

**特点：**
- ✅ 直接在 WordPress 后台安装和配置
- ✅ **服务端自动处理**，无需客户端 JavaScript
- ✅ 自动识别文章内容中的 123pan 链接并签名
- ✅ 配置简单，适合非技术用户

**工作方式：**
- 鉴权在 PHP 服务端完成
- 使用 WordPress 的 `the_content` 过滤器自动处理内容
- 签名在页面加载时生成（60秒有效期）

**适用场景：**
- WordPress 网站
- 需要在文章/页面中嵌入 123pan 资源
- 不想写或引入额外的 JavaScript 代码

### 2. Cloudflare Workers 版 (For-cloudflareWorkers)

**特点：**
- ✅ 基于 Cloudflare 全球边缘网络，**低延迟高性能**
- ✅ 需要客户端 JavaScript 配合
- ✅ 懒加载：只在用户点击播放时才请求签名
- ✅ 免费额度：每天 100,000 次请求

**工作方式：**
- 部署 Worker 脚本到 Cloudflare
- 客户端引入 `auth-123pan-client.js`
- 用户操作时通过 Worker 获取签名链接（默认15分钟有效期）

**适用场景：**
- 静态网站（HTML/JS）
- 追求全球低延迟的项目
- 已经在使用 Cloudflare 服务

**API 路径：** `https://your-worker.workers.dev`

### 3. Vercel 版 (For-vercel)

**特点：**
- ✅ 基于 Vercel Serverless Functions
- ✅ 需要客户端 JavaScript 配合
- ✅ 懒加载机制
- ✅ 与 Vercel 部署的前端项目集成方便

**工作方式：**
- 部署 Serverless Function 到 Vercel
- 客户端引入 `auth-123pan-client.js`
- 用户操作时通过 API 获取签名链接（默认15分钟有效期）

**适用场景：**
- 已经使用 Vercel 部署的项目
- Next.js / React / Vue 等前端项目
- 需要与现有 Vercel 项目集成

**API 路径：** `https://your-app.vercel.app/api/sign`

### 4. Netlify 版 (For-netlify)

**特点：**
- ✅ 基于 Netlify Functions
- ✅ 需要客户端 JavaScript 配合
- ✅ 懒加载机制
- ✅ 免费额度：每月 125,000 次函数调用

**工作方式：**
- 部署 Netlify Function
- 客户端引入 `auth-123pan-client.js`
- 用户操作时通过 Function 获取签名链接（默认15分钟有效期）

**适用场景：**
- 已经使用 Netlify 部署的静态网站
- Gatsby / Hugo / Next.js 等静态站点生成器
- 需要与现有 Netlify 项目集成

**API 路径：** `https://your-site.netlify.app/.netlify/functions/sign`

## 🔑 主要区别总结

### 部署方式
- **WordPress**: WordPress 插件，通过后台安装
- **Cloudflare Workers**: 部署 Worker 脚本到 Cloudflare
- **Vercel**: 部署 Serverless Function 到 Vercel
- **Netlify**: 部署 Netlify Function

### 鉴权位置
- **WordPress**: **服务端 (PHP)**，页面加载时处理
- **其他三种**: **客户端触发**，用户操作时请求签名

### 客户端集成
- **WordPress**: **无需 JavaScript**，全自动处理
- **其他三种**: 需要引入 `auth-123pan-client.js`（**通用版本**，代码完全相同）

### API 路径
- **WordPress**: 无需 API（服务端处理）
- **Cloudflare Workers**: `https://your-worker.workers.dev`
- **Vercel**: `https://your-app.vercel.app/api/sign`
- **Netlify**: `https://your-site.netlify.app/.netlify/functions/sign`

### 签名有效期
- **WordPress**: 默认 900秒（15分钟），可在后台设置中自定义
- **其他三种**: 默认 900秒（15分钟），可通过环境变量 `VALID_DURATION` 调整

### 使用场景对比

| 需求 | 推荐方案 |
|------|---------|
| WordPress 网站 | WordPress 插件版 |
| 追求全球性能和低延迟 | Cloudflare Workers |
| 已使用 Vercel 部署 | Vercel 版 |
| 已使用 Netlify 部署 | Netlify 版 |
| 不想写/引入 JavaScript | WordPress 插件版 |
| 静态网站 | Cloudflare Workers / Vercel / Netlify 任选 |

## 🚀 快速开始

根据你的需求选择对应的方案，进入相应文件夹查看详细文档：

1. **WordPress 网站** → [For-WordPress](./For-WordPress/README.md)
2. **追求性能/静态网站** → [For-cloudflareWorkers](./For-cloudflareWorkers/README.md)
3. **Vercel 用户** → [For-vercel](./For-vercel/README.md)
4. **Netlify 用户** → [For-netlify](./For-netlify/README.md)

## 📝 客户端使用方式（非 WordPress）

对于 Cloudflare Workers、Vercel 和 Netlify 三种方式，客户端使用方法完全相同：

### 1. 引入脚本并配置

```html
<!-- Cloudflare Workers -->
<script src="./auth-123pan-client.js" 
        data-auth-url="https://your-worker.workers.dev"></script>

<!-- Vercel -->
<script src="./auth-123pan-client.js" 
        data-auth-url="https://your-app.vercel.app/api/sign"></script>

<!-- Netlify -->
<script src="./auth-123pan-client.js" 
        data-auth-url="https://your-site.netlify.app/.netlify/functions/sign"></script>
```

### 2. 使用 123pan 资源

```html
<!-- 视频 -->
<video controls data-123pan-src="https://xxx.v.123pan.cn/xxx/video.mp4"></video>

<!-- 图片 -->
<img data-123pan-src="https://xxx.v.123pan.cn/xxx/image.jpg">

<!-- 自定义播放按钮 -->
<button data-123pan-action="play" 
        data-123pan-src="https://xxx.v.123pan.cn/xxx/video.mp4">
    播放视频
</button>
```

**就这么简单！** 无需编写额外的 JavaScript 代码。

## 🔒 安全性

所有方案都将 UID 和密钥存储在服务端（环境变量或数据库），不会暴露给客户端，确保密钥安全。

建议同时在 123pan 后台设置防盗链白名单，添加你的网站域名，进一步提升安全性。

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**作者**: [hcllmsx](https://github.com/hcllmsx)

如果这个项目对你有帮助，欢迎 Star ⭐
