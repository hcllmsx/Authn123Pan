# 123pan WordPress 插件鉴权

这是一个 WordPress 插件，可以自动为网站内容中的 123pan 直链添加 URL 鉴权，保护你的 UID 和密钥不被泄露。

## 特性

- 🔌 **WordPress 插件** - 直接在 WordPress 后台安装和配置
- 🔒 **服务端鉴权** - UID 和密钥存储在 WordPress 数据库中，不会暴露给客户端
- 🎯 **自动处理** - 自动识别并签名文章内容中的 123pan 直链
- ⚙️ **灵活配置** - 支持自定义域名列表，适配不同的 123pan CDN 域名
- ⚡ **即时生效** - 签名在页面加载时生成，默认15分钟有效期

## 安装步骤

### 方法一：通过 WordPress 后台上传

1. 下载本仓库 Release 中的 `authn123pan-wordpress-版本号.zip` 压缩文件
2. 在 WordPress 后台进入 **插件 → 安装插件 → 上传插件**
3. 选择 ZIP 文件并安装
4. 点击"启用"激活插件

### 方法二：手动安装

1. 下载并解压 `authn123pan-wordpress-版本号.zip`
2. 上传 `authn123pan-wordpress` 文件夹到 WordPress 的 `wp-content/plugins/` 目录
3. 在后台 **插件** 页面找到并启用

## 🔄 从旧版本升级（重要）

### 如果你之前使用的是 1.x 版本（旧插件名：Authn123Pan-forWP）

**版本 2.0.0 是重大更新，插件名称已更改。请按以下步骤操作：**

1. ⚠️ **不要删除旧插件的数据！** 你的设置（UID、密钥等）会自动保留
2. 在后台 **停用** 旧版插件（Authn123Pan-forWP）
3. **删除** 旧版插件
4. 按上述方法安装新版插件（Authn123Pan-WordPress）
5. **启用** 新插件
6. 进入设置页面，确认你的配置已自动恢复

✅ **数据安全保证：** 所有设置（UID、密钥、域名、有效期）都存储在数据库中，不会因为插件重装而丢失。

### 2.0.0 版本更新内容

- ✨ 插件后台可手动设置需要处理的123云盘直链域名
- ✨ 签名有效期默认改为 15 分钟（原 60 秒）
- ✨ 新增后台可配置签名有效期
- 🔧 统一插件命名规范为 `authn123pan-wordpress`

## 配置说明

1. 在 WordPress 后台左侧菜单找到 **123云盘直链鉴权**
2. 配置以下参数：

| 参数名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| 123云盘UID | 你的 123pan 账号 ID | - | ✅ |
| 鉴权密钥 | 123pan 提供的鉴权密钥 | - | ✅ |
| 123云盘直链域名 | 需要处理的域名列表，每行一个 | `vip.123pan.cn`<br>`v.123pan.cn` | ⚠️ 可选 |
| 签名有效期 | 签名链接的有效期（秒） | 900秒（15分钟） | ⚠️ 可选 |

> **建议范围：** 60-3600 秒（1分钟到1小时）

3. 保存设置后，插件会自动生效

## 使用方法

配置完成后，**无需任何额外操作**。插件会自动处理：

- 文章正文中的 123pan 直链
- 页面中的 123pan 直链
- 任何通过 WordPress 编辑器添加的 123pan 资源

只需要在文章中正常插入 123pan 直链即可：

```html
<video src="https://vip.123pan.cn/xxx/video.mp4" controls></video>
<img src="https://vip.123pan.cn/xxx/image.jpg">
```

插件会在页面输出时自动添加鉴权参数。

## 工作原理

1. 用户访问包含 123pan 直链的页面
2. WordPress 在输出内容前，使用 `the_content` 过滤器处理内容
3. 插件识别所有配置的域名下的链接
4. 使用 UID 和密钥为每个链接生成签名（默认有效期15分钟）
5. 将签名附加到原始URL上并输出

## 相关链接

- **GitHub 仓库**: [hcllmsx/Authn123Pan](https://github.com/hcllmsx/Authn123Pan)
- **123pan**: [官方网站](https://www.123pan.com/)

## 相关项目

- **Cloudflare Workers 版本**: [For-cloudflareWorkers](../For-cloudflareWorkers/)
- **Vercel 版本**: [For-vercel](../For-vercel/)
- **Netlify 版本**: [For-netlify](../For-netlify/)

---

**作者**: [hcllmsx](https://github.com/hcllmsx)
