# 123pan Cloudflare Workers 鉴权服务

[![GitHub](https://img.shields.io/badge/GitHub-hcllmsx%2FAuthn123Pan-blue?logo=github)](https://github.com/hcllmsx/Authn123Pan)

这是一个基于 Cloudflare Workers 的 123pan 鉴权解决方案，让你可以在静态网站中安全地使用 123pan 托管的资源（视频、图片等），同时保护你的 UID 和鉴权密钥不被暴露。

## ✨ 特性

- 🔒 **安全** - UID 和密钥存储在 Cloudflare Workers 环境变量中，不会暴露给客户端
- 🚀 **简单** - 只需引入一个 JS 文件，添加 `data-123pan-src` 属性即可
- ⚡ **懒加载** - 只在用户操作（点击播放）时才请求鉴权，节省流量
- 💾 **智能缓存** - 自动缓存签名 URL，30 分钟内重复使用无需重复请求
- 🆓 **免费** - 基于 Cloudflare Workers 免费套餐（每天 10 万次请求）

## 📁 文件说明

```
For-cloudflareWorkers/
├── worker.js              # Cloudflare Workers 脚本
├── auth-123pan-client.js    # 客户端自动鉴权库
├── example.html      # 使用示例
└── README.md              # 本文档
```

## 🚀 快速开始

### 第一步：部署 Cloudflare Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** > **Create Application** > **Create Worker**
3. 将 [`worker.js`](https://github.com/hcllmsx/Authn123Pan/blob/main/For-cloudflareWorkers/worker.js) 的内容复制粘贴到编辑器
4. 点击 **Deploy**
5. 在 **Settings** > **Variables** 中添加环境变量：

| 变量名             | 说明             | 示例值       | 是否加密  |
| ------------------ | ---------------- | ------------ | --------- |
| `UID`            | 123pan 账号 ID   | `123456`   | ✅ 必须   |
| `PRIVATE_KEY`    | 123pan 鉴权密钥  | `your-key` | ✅ 必须   |
| `VALID_DURATION` | 签名有效期（秒） | `900`      | ⚠️ 可选 |

> **提示：** `VALID_DURATION` 默认 900 秒（15 分钟），可根据需要调整

6. 记下你的 Worker URL，例如：`https://your-worker.workers.dev`

### 第二步：在网站中使用

#### 1. 下载客户端脚本

下载 [`auth-client-auto.js`](https://github.com/hcllmsx/Authn123Pan/blob/main/For-cloudflareWorkers/auth-client-auto.js) 到你的项目

#### 2. 引入并配置

```html
<!-- 在 </body> 前引入，配置 Worker URL -->
<script src="./auth-client-auto.js" 
        data-worker-url="https://your-worker.workers.dev">
</script>
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

查看 [`example.html`](https://github.com/hcllmsx/Authn123Pan/blob/main/For-cloudflareWorkers/example.html) 获取完整的使用示例。

## 🔒 安全性说明

### UID 和密钥保护

✅ Worker 将敏感信息（UID 和 PRIVATE_KEY）存储在环境变量中，不会暴露给客户端

### 防盗链建议

虽然 Worker 本身不检查请求来源，但你可以在 **123pan 后台**配置域名白名单：

1. 登录 123pan 管理后台
2. 找到「鉴权设置」或「防盗链设置」
3. 添加你的网站域名到白名单
4. 这样即使有人获取了签名 URL，也只能在允许的域名下使用

### 额外保护措施

1. **监控使用情况** - 定期检查 123pan 的流量统计
3. **定期更换密钥** - 定期更新 `PRIVATE_KEY`

## 🛠️ 高级配置

### 自定义缓存时长

```html
<script src="./auth-123pan-client.js" 
        data-worker-url="https://your-worker.workers.dev"
        data-cache="true">
</script>

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
        data-worker-url="https://your-worker.workers.dev"
        data-auto-init="false">
</script>

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

## 💡 常见问题

### Q: Worker 会产生费用吗？

A: Cloudflare Workers 免费套餐每天提供 100,000 次请求，对大多数个人网站足够使用。

### Q: 签名会过期吗？

A: 会的。默认有效期是 15 分钟（900 秒）。过期后需要重新请求签名。可以通过 `VALID_DURATION` 环境变量调整。

### Q: 支持其他云存储吗？

A: 这个方案专门为 123pan 设计。其他云存储需要修改 Worker 中的签名算法。

### Q: 本地开发如何测试？

A: 可以直接使用，Worker 会正常处理所有请求。建议使用本地服务器（如 `python -m http.server`）而不是直接打开 HTML 文件。

### Q: 如何调试？

A: 打开浏览器控制台，脚本会输出详细日志：

```
[Pan123Auth] Requesting signed URL...
[Pan123Auth] Successfully got signed URL
[AutoHandler] Play button handled
```

## 🔗 相关链接

- **GitHub 仓库**: [hcllmsx/Authn123Pan](https://github.com/hcllmsx/Authn123Pan)
- **Cloudflare Workers**: [官方文档](https://developers.cloudflare.com/workers/)
- **123pan**: [官方网站](https://www.123pan.com/)

## 📄 许可证

MIT License - 详见仓库根目录的 LICENSE 文件

