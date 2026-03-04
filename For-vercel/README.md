# 123pan Vercel 鉴权服务

这是一个基于 Vercel Serverless Functions 的 123pan 鉴权解决方案，让你可以在静态网站中安全地使用 123pan 托管的资源，同时保护 UID 和鉴权密钥不被暴露。

## 特性

- 🔒 **安全** - UID 和密钥存储在 Vercel 环境变量中，不会暴露给客户端
- 🚀 **简单** - 只需引入一个 JS 文件，添加 `data-123pan-src` 属性即可
- ⚡ **懒加载** - 只在用户操作（点击播放）时才请求鉴权，节省流量
- 💾 **智能缓存** - 自动缓存签名 URL，30 分钟内重复使用无需重复请求
- 🆓 **免费** - 基于 Vercel 免费套餐

## 文件说明

```
For-vercel/
├── api/
│   └── sign.js                # Vercel Serverless Function
├── auth-123pan-client.js      # 客户端自动鉴权库（通用版）
├── vercel.json                # Vercel 配置文件
├── package.json               # 项目配置
└── .env.example               # 环境变量示例
```

## 快速开始

### 第一步：部署到 Vercel

#### 方法一：通过 Git（推荐）

1. 将代码推送到 GitHub/GitLab
2. 访问 [Vercel Dashboard](https://vercel.com/)
3. 点击 **Add New** → **Project**
4. 选择你的 Git 仓库
5. Vercel 会自动检测配置并部署

#### 方法二：通过 Vercel CLI

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 在项目目录登录并部署：
```bash
vercel
```

### 第二步：配置环境变量

在 Vercel Dashboard 中配置环境变量：

1. 进入你的项目 → **Settings** → **Environment Variables**
2. 添加以下变量：

| 变量名 | 说明 | 示例值 | 必需 |
|--------|------|--------|------|
| `UID` | 123pan 账号 ID | `123456` | ✅ |
| `PRIVATE_KEY` | 123pan 鉴权密钥 | `your-key` | ✅ |
| `VALID_DURATION` | 签名有效期（秒） | `900` | ⚠️ 可选 |

> **提示：** `VALID_DURATION` 默认 900 秒（15 分钟）

3. 保存后会自动重新部署

### 第三步：在网站中使用

#### 1. 下载客户端脚本

下载 `auth-123pan-client.js` 到你的项目

#### 2. 引入并配置

```html
<!-- 在 </body> 前引入，配置鉴权服务 URL -->
<script src="./GeneralClientScripts/auth-123pan-client.js" 
        data-auth-url="https://your-app.vercel.app/api/sign"></script>
```

> **注意：** Vercel 需要在 URL 中包含 `/api/sign` 路径

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

## 本地开发

安装依赖：
```bash
npm install
```

启动本地开发服务器：
```bash
vercel dev
```

函数会在 `http://localhost:3000/api/sign` 可用。

## API 参考

### Function 端点

- **URL**: `https://your-app.vercel.app/api/sign`
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

### Q: Vercel 会产生费用吗？

A: Vercel 免费套餐提供：
- 100GB 带宽/月
- 100 次 Serverless Function 调用/天（Hobby 计划）
- 对大多数个人网站足够使用

### Q: 签名会过期吗？

A: 会的。默认有效期是 15 分钟（900 秒）。过期后需要重新请求签名。可以通过 `VALID_DURATION` 环境变量调整。

### Q: 与其他平台版本有什么区别？

A: Vercel 版本的主要特点：
- **部署方式**：Vercel Serverless Functions
- **函数路径**：`/api/sign`（需要包含在 URL 中）
- **配置文件**：需要 `vercel.json` 配置路由
- **适用场景**：任何网站，特别适合已经使用 Vercel 部署的项目

## 相关链接

- **GitHub 仓库**: [hcllmsx/Authn123Pan](https://github.com/hcllmsx/Authn123Pan)
- **Vercel 文档**: [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- **123pan**: [官方网站](https://www.123pan.com/)

## 相关项目

- **Cloudflare Workers 版本**: [For-cloudflareWorkers](../For-cloudflareWorkers/)
- **Netlify 版本**: [For-netlify](../For-netlify/)
- **WordPress 版本**: [For-WordPress](../For-WordPress/)

---

**作者**: [hcllmsx](https://github.com/hcllmsx)
