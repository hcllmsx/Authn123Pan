# 123pan 直链鉴权工具

一个用于处理123pan直链鉴权的工具，包含Cloudflare Worker服务端脚本和客户端JavaScript处理器，支持视频、图片、音频等多种文件类型的自动鉴权。

## 功能特性

- ✅ **自动鉴权**：自动为123pan直链添加鉴权参数
- ✅ **多文件支持**：支持视频、图片、音频、下载链接等多种文件类型
- ✅ **懒加载**：按需获取鉴权链接，提升页面加载速度
- ✅ **安全防护**：支持域名白名单验证，防止Worker被滥用
- ✅ **易于集成**：提供客户端JS库，可轻松集成到任何静态网页
- ✅ **UTF-8支持**：正确处理包含中文的文件路径

## 项目结构

```
Authn123Pan/
├── For-cloudflareWorkers/
│   ├── worker.js          # Cloudflare Worker服务端脚本
│   ├── 123pan-handler.js  # 客户端JavaScript处理器
│   └── example.html       # 使用示例
└── For-WordPress/         # WordPress插件实现
```

## 更新日志

### v1.0.0

- 初始版本
- 支持视频、图片、音频、下载链接
- 实现懒加载功能
- 添加域名白名单验证
- 提供完整的客户端JS库

### v1.1.0

- 修复UTF-8编码问题
- 优化错误处理
- 提升性能

### v1.2.0

- 将 `VALID_DURATION` 单位从毫秒改为秒，配置更直观
- 设置 `ALLOWED_ORIGINS` 默认值为本地域名，方便开发测试
- 澄清 `ALLOWED_ORIGINS` 格式要求，需要包含协议前缀

### v1.3.0

- 修复 `ALLOWED_ORIGINS` 为空时的安全漏洞
- 明确区分"未设置"和"设置为空"两种情况
- 当 `ALLOWED_ORIGINS` 为空时拒绝所有请求，防止被钻空子
- 添加本地开发指南，说明如何使用本地服务器进行开发测试
- 提供多种本地开发服务器的配置方法

## 快速开始

### 1. 获取项目代码

```bash
git clone https://github.com/hcllmsx/Authn123Pan.git
cd Authn123Pan/For-cloudflareWorkers
```

### 2. 部署Cloudflare Worker

1. **安装Wrangler（如果未安装）**

   ```bash
   npm install -g wrangler
   ```

2. **配置Worker**

   编辑 `wrangler.toml` 文件（如果不存在，创建一个）：

   ```toml
   name = "123pan-auth"
   type = "javascript"
   account_id = "your-account-id"
   workers_dev = true
   route = "your-worker-route"
   zone_id = "your-zone-id"

   [env.production]
   vars = {
     UID = "your-123pan-uid",
     PRIVATE_KEY = "your-123pan-private-key",
     VALID_DURATION = "900", # 15分钟（900秒）
     ALLOWED_ORIGINS = "https://your-domain.com,http://localhost:8080"
   }
   ```

3. **部署Worker**

   ```bash
   wrangler publish --env production
   ```

### 3. 集成客户端脚本

1. **在HTML中引入脚本**

   ```html
   <script src="123pan-handler.js"></script>
   ```

2. **初始化处理器**

   ```html
   <script>
     initPan123Handler({
       workerUrl: 'https://your-worker.your-account.workers.dev',
       lazyLoad: true,
       fileTypes: ['video', 'img', 'audio', 'a']
     });
   </script>
   ```

3. **直接使用123pan直链**

   ```html
   <!-- 视频 -->
   <video controls>
     <source src="https://1649205.v.123pan.cn/1649205/OSS123/video.mp4" type="video/mp4">
   </video>

   <!-- 图片 -->
   <img src="https://1649205.v.123pan.cn/1649205/OSS123/image.jpg" alt="示例图片">

   <!-- 音频 -->
   <audio controls>
     <source src="https://1649205.v.123pan.cn/1649205/OSS123/audio.mp3" type="audio/mpeg">
   </audio>

   <!-- 下载链接 -->
   <a href="https://1649205.v.123pan.cn/1649205/OSS123/file.pdf">下载文件</a>
   ```

## 配置说明

### Cloudflare Worker 环境变量

| 环境变量名          | 类型   | 必填 | 默认值                                                       | 说明                                                       |
| ------------------- | ------ | ---- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| `UID`             | String | ✅   | -                                                            | 123pan账号ID                                               |
| `PRIVATE_KEY`     | String | ✅   | -                                                            | 123pan鉴权密钥                                             |
| `VALID_DURATION`  | String | ❌   | "900"                                                        | 链接有效期（秒），默认15分钟                               |
| `ALLOWED_ORIGINS` | String | ❌   | "http://localhost,http://127.0.0.1,http://localhost:8080,http://localhost:3000,http://localhost:5173" | 允许的域名列表，多个域名用逗号分隔，**需要包含协议前缀**（如http://或https://） |

### 客户端配置选项

| 选项          | 类型    | 必填 | 默认值                    | 说明                  |
| ------------- | ------- | ---- | ------------------------- | --------------------- |
| `workerUrl` | String  | ✅   | ""                        | Cloudflare Worker URL |
| `lazyLoad`  | Boolean | ❌   | true                      | 是否启用懒加载        |
| `fileTypes` | Array   | ❌   | ['video', 'img', 'audio'] | 支持的文件类型        |

## 安全设置

为了防止Worker被滥用，建议：

1. **配置域名白名单**

   在Cloudflare Worker环境变量中设置 `ALLOWED_ORIGINS`：

   ```
   ALLOWED_ORIGINS = https://your-domain.com,http://localhost:3000
   ```

2. **定期检查使用情况**

   在Cloudflare Dashboard中监控Worker的请求量，避免异常使用。

3. **安全修复说明**

   - 修复了 `ALLOWED_ORIGINS` 为空时的安全漏洞
   - 现在即使设置为空字符串，也会拒绝所有请求，防止被钻空子
   - 保持默认的本地开发域名列表，确保开发环境正常工作

## 本地开发指南

由于浏览器安全限制，**直接双击打开HTML文件**（使用`file://`协议）会导致鉴权失败。请使用以下方法进行本地开发：

### 方法1：使用本地开发服务器（推荐）

#### Python
```bash
# 在项目目录中运行
python -m http.server 8080

# 访问：http://localhost:8080/example.html
```

#### Node.js
```bash
# 安装serve工具（如果未安装）
npm install -g serve

# 在项目目录中运行
serve -l 8080

# 访问：http://localhost:8080/example.html
```

#### VS Code
1. 安装 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 插件
2. 右键点击 `example.html` 文件
3. 选择 "Open with Live Server"
4. 自动打开浏览器访问

### 方法2：临时禁用域名验证（仅测试用）

**注意：仅用于本地测试，生产环境必须启用验证！**

在 `worker.js` 中临时注释掉域名验证部分：

```javascript
// 临时注释以下代码进行开发测试
// if (allowedOrigins.length > 0) {
//   const isAllowed = allowedOrigins.some(allowedOrigin => 
//     origin.startsWith(allowedOrigin)
//   );
//   
//   if (!isAllowed) {
//     return new Response('Access Denied', {
//       status: 403,
//       headers: {
//         'Content-Type': 'text/plain',
//         'Access-Control-Allow-Origin': '*',
//       }
//     });
//   }
// }
```

## 使用示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>123pan直链示例</title>
</head>
<body>
    <!-- 视频 -->
    <video controls width="600">
        <source src="https://1649205.v.123pan.cn/1649205/OSS123/video.mp4" type="video/mp4">
    </video>

    <!-- 图片 -->
    <img src="https://1649205.v.123pan.cn/1649205/OSS123/image.jpg" alt="示例图片" width="400">

    <!-- 音频 -->
    <audio controls>
        <source src="https://1649205.v.123pan.cn/1649205/OSS123/audio.mp3" type="audio/mpeg">
    </audio>

    <!-- 下载链接 -->
    <a href="https://1649205.v.123pan.cn/1649205/OSS123/file.pdf">下载文件</a>

    <!-- 引入处理器 -->
    <script src="123pan-handler.js"></script>
    <script>
        // 初始化处理器
        initPan123Handler({
            workerUrl: 'https://your-worker.your-account.workers.dev',
            lazyLoad: true,
            fileTypes: ['video', 'img', 'audio', 'a']
        });
    </script>
</body>
</html>
```

## 其他实现方式

如果你使用的是WordPress网站，可以考虑使用我们的WordPress插件版本：

- **WordPress插件**: [For-WordPress](../For-WordPress/)
- **详细文档**: [For-WordPress/README.md](../For-WordPress/README.md)

## 许可证

MIT License

## 相关链接

- [项目主页](https://github.com/hcllmsx/Authn123Pan)
- [123云盘](https://www.123pan.com/)
- [123pan直链鉴权参考](https://gitee.com/pan123-git/123pan-link)
