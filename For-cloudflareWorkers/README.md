# 123pan Cloudflare Workers 鉴权服务

这是一个基于 Cloudflare Workers 的 123pan 鉴权解决方案，让你可以在静态网站中安全地使用 123pan 托管的资源，同时保护 UID 和鉴权密钥不被暴露。

## 特性

- 🔒 **安全** - UID 和密钥存储在 Cloudflare 环境变量中，不会暴露给客户端
- 🚀 **快速** - 基于 Cloudflare 全球边缘网络，低延迟高性能
- ⚡ **懒加载** - 只在用户操作（点击播放）时才请求鉴权，节省流量
- 💾 **智能缓存** - 自动缓存签名 URL，30 分钟内重复使用无需重复请求
- 🆓 **免费** - Cloudflare Workers 免费套餐每天 100,000 次请求

## 文件说明

```
For-cloudflareWorkers/
├── worker.js                  # Cloudflare Worker 脚本
└── auth-123pan-client.js      # 客户端自动鉴权库（通用版）
```

## 快速开始

### 第一步：部署到 Cloudflare Workers

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** 页面
3. 点击 **Create Application** → **Create Worker**
4. 将 `worker.js` 的内容复制到编辑器中
5. 点击 **Deploy** 部署

### 第二步：配置环境变量

1. 在 Worker 页面点击 **Settings** → **Variables**
2. 添加以下环境变量：

| 变量名 | 说明 | 示例值 | 必需 |
|--------|------|--------|------|
| `UID` | 123pan 账号 ID | `123456` | ✅ |
| `PRIVATE_KEY` | 123pan 鉴权密钥 | `your-key` | ✅ |
| `VALID_DURATION` | 签名有效期（秒） | `900` | ⚠️ 可选 |

> **提示：** `VALID_DURATION` 默认 900 秒（15 分钟）

3. 点击 **Save and Deploy**

### 第三步：在网站中使用

#### 1. 下载客户端脚本

下载 `auth-123pan-client.js` 到你的项目

#### 2. 引入并配置

```html
<!-- 在 </body> 前引入，配置 Worker URL -->
<script src="./auth-123pan-client.js" 
        data-auth-url="https://your-worker.workers.dev"></script>
```

#### 3. 使用 123pan 资源

**方式一：自定义播放按钮（推荐）**

```html
<div data-123pan-container data-123pan-replace="true">
    <button data-123pan-action="play"
            data-123pan-src="https://xxx.v.123pan.cn/xxx/video.mp4">
        播放视频
    </button>
</div>
```

**方式二：原生视频标签**

```html
<video controls 
       data-123pan-src="https://xxx.v.123pan.cn/xxx/video.mp4">
</video>
```

**方式三：图片资源**

```html
<!-- 立即加载 -->
<img data-123pan-src="https://xxx.v.123pan.cn/xxx/image.jpg">

<!-- 懒加载（滚动到视口时加载） -->
<img data-123pan-src="https://xxx.v.123pan.cn/xxx/image.jpg" 
     data-123pan-lazy="true">
```

## API 参考

### Worker 端点

- **URL**: `https://your-worker.workers.dev`
- **方法**: POST
- **请求体**: 
  ```json
  {
    "url": "https://xxx.v.123pan.cn/xxx/video.mp4"
  }
  ```
- **响应**:
  ```json
  {
    "signedUrl": "https://xxx.v.123pan.cn/xxx/video.mp4?auth_key=...",
    "expiresIn": 900
  }
  ```

## 常见问题

### Q: Cloudflare Workers 会产生费用吗？

A: 免费套餐提供每天 100,000 次请求，对大多数个人网站足够使用。超出后按量付费。

### Q: 签名会过期吗？

A: 会的。默认有效期是 15 分钟（900 秒）。过期后需要重新请求签名。可以通过 `VALID_DURATION` 环境变量调整。

### Q: 与其他平台版本有什么区别？

A: Cloudflare Workers 版本的主要特点：
- **部署方式**：Cloudflare Workers（边缘计算）
- **函数路径**：直接访问 Worker 域名根路径
- **适用场景**：任何静态或动态网站，需要客户端 JavaScript 配合

## 相关链接

- **GitHub 仓库**: [hcllmsx/Authn123Pan](https://github.com/hcllmsx/Authn123Pan)
- **Cloudflare Workers 文档**: [Workers Documentation](https://developers.cloudflare.com/workers/)
- **123pan**: [官方网站](https://www.123pan.com/)

## 相关项目

- **Vercel 版本**: [For-vercel](../For-vercel/)
- **Netlify 版本**: [For-netlify](../For-netlify/)
- **WordPress 版本**: [For-WordPress](../For-WordPress/)

---

**作者**: [hcllmsx](https://github.com/hcllmsx)
