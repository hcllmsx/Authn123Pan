# Authn123Pan-forWP

## 项目简介

Authn123Pan-forWP 是一个 WordPress 插件，用于为你的WordPress网站中嵌入的123云盘直链自动添加URL鉴权参数。通过配置用户的123云盘UID和鉴权密钥，插件会自动对符合条件的链接进行签名处理，增强直链访问的安全性。

## 功能特性

- ✅ **自动鉴权**：自动为123云盘直链添加鉴权参数
- ✅ **后台配置**：提供友好的WordPress后台配置界面
- ✅ **懒加载支持**：按需处理链接，不影响页面性能
- ✅ **易于安装**：标准WordPress插件安装方式
- ✅ **自定义菜单**：在WordPress后台左侧添加独立的设置菜单

## 安装与配置

### 1. 安装插件

#### 方法一：手动安装

1. 将 `For-WordPress` 文件夹上传至 WordPress 插件目录（`wp-content/plugins/`）
2. 在 WordPress 后台导航菜单中进入 **"插件"** → **"已安装的插件"**
3. 找到 **"Authn123Pan-forWP"** 插件，点击 **"启用"**

#### 方法二：从GitHub下载安装

1. 访问 [Authn123Pan GitHub Releases](https://github.com/hcllmsx/Authn123Pan/releases)
2. 下载最新版本的 `Authn123Pan-forWP-*.zip` 文件
3. 在 WordPress 后台导航菜单中进入 **"插件"** → **"安装插件"**
4. 点击 **"上传插件"**，选择下载的zip文件
5. 安装完成后点击 **"启用插件"**

### 2. 配置鉴权参数

1. 进入 WordPress 后台左侧菜单的 **"123云盘直链鉴权"** 选项
2. 填写以下配置项：
   - **123云盘UID**：在 123云盘个人中心获取的账号 ID
   - **鉴权密钥**：在 123云盘直链管理页面设置的密钥（需与服务端一致）
3. 点击 **"保存设置"**

### 3. 获取123云盘UID和鉴权密钥

#### 获取UID

1. 登录 [123云盘](https://www.123pan.com/)
2. 进入个人中心
3. 在账号信息中找到你的UID

#### 获取鉴权密钥

1. 登录 [123云盘](https://www.123pan.com/)
2. 进入直链管理页面
3. 创建或编辑直链时设置鉴权密钥

## 使用方法

安装并配置完成后，插件会自动处理WordPress文章和页面中的123云盘直链。你只需要在内容中插入123云盘的直链，插件会自动为其添加鉴权参数。

### 示例

在WordPress编辑器中插入以下链接：

```
https://vip.123pan.cn/your-file-path/video.mp4
```

插件会自动将其转换为：

```
https://vip.123pan.cn/your-file-path/video.mp4?auth_key=expire_time-rand_value-uid-signature
```

## 工作原理

插件通过WordPress的 `the_content` 过滤器，在内容输出前自动检测并处理123云盘直链。处理流程如下：

1. 检测内容中的123云盘直链接（`vip.123pan.cn` 域名）
2. 使用配置的UID和鉴权密钥生成签名
3. 将鉴权参数（`auth_key`）添加到URL中
4. 返回处理后的内容

签名生成算法：

```php
$expire_time = time() + 60; // 60秒有效期
$rand_value = rand(0, 100000);

$signature = md5("{$request_path}-{$expire_time}-{$rand_value}-{$uid}-{$private_key}");
$auth_key = "{$expire_time}-{$rand_value}-{$uid}-{$signature}";
```

## 技术细节

### 支持的链接格式

插件会自动处理以下格式的链接：

- `https://vip.123pan.cn/*`
- `http://vip.123pan.cn/*`

### 链接有效期

插件生成的鉴权链接有效期为 **60秒**，可以根据需要修改 [authn123pan-forwp.php](authn123pan-forwp.php#L100) 中的 `$expire_time` 值。

### 文件类型支持

插件支持所有文件类型的123云盘直链，包括但不限于：

- 视频文件（mp4, avi, mkv等）
- 音频文件（mp3, wav, flac等）
- 图片文件（jpg, png, gif等）
- 文档文件（pdf, doc, docx等）
- 压缩文件（zip, rar等）

## 常见问题

### Q: 插件处理后链接仍然无法访问？

A: 请检查以下几点：
1. 确认UID和鉴权密钥配置正确
2. 确认123云盘直链管理页面设置的密钥与插件配置一致
3. 检查链接是否为 `vip.123pan.cn` 域名
4. 确认链接未过期（60秒有效期）

### Q: 如何禁用插件？

A: 在 WordPress 后台导航菜单中进入 **"插件"** → **"已安装的插件"**，找到 **"Authn123Pan-forWP"** 插件，点击 **"停用"** 即可。

### Q: 插件会影响网站性能吗？

A: 插件使用WordPress的过滤器机制，只在内容输出时处理链接，对性能影响极小。

## 更新日志

### v1.0.6

- 优化插件结构和命名
- 添加自定义菜单图标
- 改进后台界面样式

## 许可证

MIT License

## 相关链接

- [项目主页](https://github.com/hcllmsx/Authn123Pan)
- [123云盘](https://www.123pan.com/)
- [123pan直链鉴权参考](https://gitee.com/pan123-git/123pan-link)
