# Authn123Pan-forWP

## 项目简介

Authn123Pan-forWP 是一个 WordPress 插件，用于为你的WordPress网站中嵌入的 123云盘直链自动添加 URL 鉴权参数。通过配置用户的 123云盘 UID 和鉴权密钥，插件会自动对符合条件的链接进行签名处理，增强直链访问的安全性。

## 安装与配置

### 1. 安装插件

1. 将插件文件夹 `Authn123Pan-forWP` 上传至 WordPress 插件目录（`wp-content/plugins/`）。
2. 在 WordPress 后台导航菜单中启用插件。

### 2. 配置鉴权参数（以WordPress为例）

1. 进入 WordPress 后台左侧菜单的 **"123云盘直链鉴权"** 选项。
2. 填写以下配置项：
   - **123云盘UID**：在 123云盘个人中心获取的账号 ID。
   - **鉴权密钥**：在 123云盘直链管理页面设置的密钥（需与服务端一致）。
3. 保存设置。

## 工作原理

参考 [https://gitee.com/pan123-git/123pan-link](https://gitee.com/pan123-git/123pan-link)
