# 123pan Netlify 鉴权服务

[![GitHub](https://img.shields.io/badge/GitHub-hcllmsx%2FAuthn123Pan-blue?logo=github)](https://github.com/hcllmsx/Authn123Pan)

这是一个基于 Netlify Functions 的 123pan 鉴权解决方案，让你可以在静态网站中安全地使用 123pan 托管的资源（视频、图片等），同时保护你的 UID 和鉴权密钥不被暴露。

## ✨ 特性

- 🔒 **安全** - UID 和密钥存储在 Netlify 环境变量中，不会暴露给客户端
- 🚀 **简单** - 只需引入一个 JS 文件，添加 `data-123pan-src` 属性即可
- ⚡ **懒加载** - 只在用户操作（点击播放）时才请求鉴权，节省流量
- 💾 **智能缓存** - 自动缓存签名 URL，30 分钟内重复使用无需重复请求
- 🆓 **免费** - 基于 Netlify 免费套餐（每月 125k次函数调用）

## 📁 文件说明

```
For-netlify/
├── netlify/
│   └── functions/
│       └── sign.mjs           # Netlify Function
├── auth-123pan-client.js             # 客户端自动鉴权库
├── example.html               # 使用示例
├── package.json               # 项目配置
├── netlify.toml               # Netlify 配置
└── .env.example               # 环境变量示例
```

## 🚀 快速开始

### 第一步：部署到 Netlify

#### 方法 1：通过 Git（推荐）

1. 将代码推送到 GitHub/GitLab
2. 访问 [Netlify Dashboard](https://app.netlify.com/)
3. 点击 **Add new site** → **Import an existing project**
4. 选择你的 Git 仓库
5. Netlify 会自动检测配置并部署

#### 方法 2：通过 Netlify CLI

1. 安装 Netlify CLI：
```bash
npm install -g netlify-cli
```

2. 在项目目录登录：
```bash
netlify login
```

3. 部署项目：
```bash
netlify deploy --prod
```

#### 方法 3：拖拽部署

1. 访问 [Netlify Drop](https://app.netlify.com/drop)
2. 直接拖拽 `For-netlify` 文件夹
3. Netlify 会自动部署

### 第二步：配置环境变量

在 Netlify Dashboard 中配置环境变量：

1. 进入你的站点 → **Site configuration** → **Environment variables**
2. 添加以下变量：

| 变量名             | 说明             | 示例值       | 必需  |
| ------------------ | ---------------- | ------------ | ----- |
| `UID`            | 123pan 账号 ID   | `123456`   | ✅   |
| `PRIVATE_KEY`    | 123pan 鉴权密钥  | `your-key` | ✅   |
| `VALID_DURATION` | 签名有效期（秒） | `900`      | ⚠️ 可选 |

> **提示：** `VALID_DURATION` 默认 900 秒（15 分钟），可根据需要调整

3. 保存后会自动重新部署

### 第三步：在网站中使用

#### 1. 下载客户端脚本

下载 `auth-123pan-client.js` 到你的项目

#### 2. 引入并配置

```html
<!-- 在 </body> 前引入，配置鉴权服务 URL -->
<script src="./auth-123pan-client.js" 
        data-auth-url="https://your-site.netlify.app/.netlify/functions/sign"></script>
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

查看 `example.html` 获取完整的使用示例。

## 🔒 安全性说明

### UID 和密钥保护

✅ Netlify Function 将敏感信息（UID 和 PRIVATE_KEY）存储在环境变量中，不会暴露给客户端

### 防盗链建议

1. 登录 123pan 管理后台
2. 找到「鉴权设置」或「防盗链设置」
3. 添加你的网站域名到白名单
4. 这样即使有人获取了签名 URL，也只能在允许的域名下使用

### 额外保护措施

1. **监控使用情况** - 定期检查 123pan 和 Netlify 的流量统计
2. **定期更换密钥** - 定期更新 `PRIVATE_KEY`

## 🛠️ 本地开发

安装 Netlify CLI 后，在项目目录运行：

```bash
netlify dev
```

这会在本地启动开发服务器，模拟 Netlify 环境。函数会在 `http://localhost:8888/.netlify/functions/sign` 可用。

## 📝 API 参考

### Function 端点

- **URL**: `https://your-site.netlify.app/.netlify/functions/sign`
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

## 💡 常见问题

### Q: Netlify 会产生费用吗？

A: Netlify 免费套餐提供：
- 每月 125,000 次函数调用
- 100GB 带宽
- 对大多数个人网站足够使用

### Q: 签名会过期吗？

A: 会的。默认有效期是 15 分钟（900 秒）。过期后需要重新请求签名。可以通过 `VALID_DURATION` 环境变量调整。

### Q: 与其他平台版本有什么区别？

A: 主要区别：
1. **部署平台**：Netlify vs Cloudflare Workers vs Vercel
2. **函数路径**：`/.netlify/functions/sign` vs `/` vs `/api/sign`
3. **配置文件**：`netlify.toml` vs 无 vs `vercel.json`

功能和使用方式完全相同，客户端JS通用。

## 🔗 相关链接

- **GitHub 仓库**: [hcllmsx/Authn123Pan](https://github.com/hcllmsx/Authn123Pan)
- **Netlify 文档**: [Netlify Functions](https://docs.netlify.com/functions/overview/)
- **123pan**: [官方网站](https://www.123pan.com/)

## 📄 许可证

MIT License - 详见仓库根目录的 LICENSE 文件

## 🤝 相关项目

- **Cloudflare Workers 版本**: [For-cloudflareWorkers](../For-cloudflareWorkers/)
- **Vercel 版本**: [For-vercel](../For-vercel/)
- **WordPress 版本**: [For-WordPress](../For-WordPress/)

---

**作者**: [hcllmsx](https://github.com/hcllmsx)

如果这个项目对你有帮助，欢迎 Star ⭐
