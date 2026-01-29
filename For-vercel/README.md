# 123pan Vercel 鉴权服务

[![GitHub](https://img.shields.io/badge/GitHub-hcllmsx%2FAuthn123Pan-blue?logo=github)](https://github.com/hcllmsx/Authn123Pan)

这是一个基于 Vercel Serverless Functions 的 123pan 鉴权解决方案，让你可以在静态网站中安全地使用 123pan 托管的资源（视频、图片等），同时保护你的 UID 和鉴权密钥不被暴露。

## ✨ 特性

- 🔒 **安全** - UID 和密钥存储在 Vercel 环境变量中，不会暴露给客户端
- 🚀 **简单** - 只需引入一个 JS 文件，添加 `data-123pan-src` 属性即可
- ⚡ **懒加载** - 只在用户操作（点击播放）时才请求鉴权，节省流量
- 💾 **智能缓存** - 自动缓存签名 URL，30 分钟内重复使用无需重复请求
- 🆓 **免费** - 基于 Vercel 免费套餐（每月 100GB 带宽，100GB/小时执行时间）

## 📁 文件说明

```
For-vercel/
├── api/
│   └── sign.js                # Vercel Serverless Function
├── auth-123pan-client.js      # 客户端自动鉴权库
├── example.html               # 使用示例
├── package.json               # 项目配置
├── vercel.json                # Vercel 配置
├── .env.example               # 环境变量示例
└── README.md                  # 本文档
```

## 🚀 快速开始

### 第一步：部署到 Vercel

#### 方法 1：通过 Vercel CLI（推荐）

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 在项目根目录登录：
```bash
vercel login
```

3. 部署项目：
```bash
vercel
```

4. 按照提示完成部署，Vercel 会自动检测配置

#### 方法 2：通过 Vercel Dashboard

1. 访问 [Vercel Dashboard](https://vercel.com/new)
2. 点击 **Import Project**
3. 选择你的 Git 仓库或上传 `For-vercel` 文件夹
4. Vercel 会自动检测配置并部署

### 第二步：配置环境变量

在 Vercel Dashboard 中配置环境变量：

1. 进入你的项目 → **Settings** → **Environment Variables**
2. 添加以下变量：

| 变量名             | 说明             | 示例值       | 必需  |
| ------------------ | ---------------- | ------------ | ----- |
| `UID`            | 123pan 账号 ID   | `123456`   | ✅   |
| `PRIVATE_KEY`    | 123pan 鉴权密钥  | `your-key` | ✅   |
| `VALID_DURATION` | 签名有效期（秒） | `900`      | ⚠️ 可选 |

> **提示：** `VALID_DURATION` 默认 900 秒（15 分钟），可根据需要调整

3. 保存后重新部署项目使环境变量生效

### 第三步：在网站中使用

#### 1. 下载客户端脚本

下载 [`auth-123pan-client.js`](https://github.com/hcllmsx/Authn123Pan/blob/main/For-vercel/auth-123pan-client.js) 到你的项目

#### 2. 引入并配置

```html
<!-- 在 </body> 前引入，配置 API URL -->
<script src="./auth-123pan-client.js" 
        data-api-url="https://your-app.vercel.app"></script>
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

就这么简单！**无需编写任何 JavaScript 代码**。

## 📖 完整示例

查看 [`example.html`](https://github.com/hcllmsx/Authn123Pan/blob/main/For-vercel/example.html) 获取完整的使用示例。

## 🔒 安全性说明

### UID 和密钥保护

✅ Serverless Function 将敏感信息（UID 和 PRIVATE_KEY）存储在环境变量中，不会暴露给客户端

### 防盗链建议

虽然 Serverless Function 本身不检查请求来源，但你可以在 **123pan 后台**配置域名白名单：

1. 登录 123pan 管理后台
2. 找到「鉴权设置」或「防盗链设置」
3. 添加你的网站域名到白名单
4. 这样即使有人获取了签名 URL，也只能在允许的域名下使用

### 额外保护措施

1. **监控使用情况** - 定期检查 123pan 和 Vercel 的流量统计
2. **定期更换密钥** - 定期更新 `PRIVATE_KEY`
3. **限制请求来源** - 可以在 `api/sign.js` 中添加 Referer 检查

## 🛠️ 高级配置

### 自定义缓存时长

```html
<script src="./auth-123pan-client.js" 
        data-api-url="https://your-app.vercel.app"
        data-cache="true"></script>

<script>
  // 自定义缓存时长为 10 分钟
  Pan123Auth.configure({
    cacheDuration: 10 * 60 * 1000
  });
</script>
```

### 禁用自动初始化

```html
<script src="./auth-123pan-client.js" 
        data-api-url="https://your-app.vercel.app"
        data-auto-init="false"></script>

<script>
  // 手动初始化
  Pan123AuthAuto.init();
</script>
```

### 指定目标元素播放

```html
<video id="myVideo" controls></video>

<button data-123pan-action="play"
        data-123pan-src="https://xxx.v.123pan.cn/xxx/video.mp4"
        data-123pan-target="#myVideo">
    播放
</button>
```

### 添加请求来源验证

编辑 `api/sign.js`，在处理请求前添加：

```javascript
// 检查 Referer
const referer = req.headers.referer || req.headers.origin;
const allowedDomains = ['https://your-domain.com', 'https://www.your-domain.com'];

if (!referer || !allowedDomains.some(domain => referer.startsWith(domain))) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  return res.status(403).json({ error: 'Forbidden' });
}
```

## 📝 API 参考

### 全局对象

#### `Pan123Auth`

核心鉴权对象

**方法：**

- `Pan123Auth.configure(options)` - 配置鉴权客户端
- `Pan123Auth.getSignedUrl(originalUrl)` - 获取签名 URL

#### `Pan123AuthAuto`

自动处理工具

**方法：**

- `Pan123AuthAuto.init()` - 手动初始化
- `Pan123AuthAuto.handleVideo(videoElement)` - 处理视频元素
- `Pan123AuthAuto.handleImage(imgElement)` - 处理图片元素
- `Pan123AuthAuto.handlePlayButton(buttonElement)` - 处理播放按钮

### HTML 属性

| 属性                      | 说明                    | 示例                                     |
| ------------------------- | ----------------------- | ---------------------------------------- |
| `data-123pan-src`       | 123pan 原始 URL（必需） | `https://xxx.v.123pan.cn/xxx/file.mp4` |
| `data-123pan-action`    | 动作类型                | `play`                                 |
| `data-123pan-container` | 容器标记                | -                                        |
| `data-123pan-replace`   | 是否替换容器内容        | `true` / `false`                     |
| `data-123pan-target`    | 目标元素选择器          | `#myVideo`                             |
| `data-123pan-lazy`      | 是否懒加载（仅图片）    | `true` / `false`                     |


## 📊 性能优化

### 启用边缘函数

如果你是 Vercel Pro 用户，可以启用边缘函数以获得更快的响应速度：

在 `vercel.json` 中添加：

```json
{
  "functions": {
    "api/sign.js": {
      "runtime": "edge"
    }
  }
}
```

然后将 `api/sign.js` 改为使用 Edge Runtime（参考 Cloudflare Workers 版本的实现）。

### 调整缓存策略

客户端默认缓存签名 URL 30 分钟。如果你的链接有效期更长，可以相应增加缓存时间：

```javascript
Pan123Auth.configure({
  cacheDuration: 60 * 60 * 1000 // 1 小时
});
```

## 🔗 相关链接

- **GitHub 仓库**: [hcllmsx/Authn123Pan](https://github.com/hcllmsx/Authn123Pan)
- **Vercel 文档**: [Serverless Functions](https://vercel.com/docs/functions)
- **123pan**: [官方网站](https://www.123pan.com/)

## 📄 许可证

MIT License - 详见仓库根目录的 LICENSE 文件

## 🤝 相关项目

- **Cloudflare Workers 版本**: [For-cloudflareWorkers](../For-cloudflareWorkers/)
- **WordPress 版本**: [For-WordPress](../For-WordPress/)

---

**作者**: [hcllmsx](https://github.com/hcllmsx)

如果这个项目对你有帮助，欢迎 Star ⭐
