# Authn123Pan

## 项目简介

Authn123Pan 提供多种实现方式，用于为你的网站中嵌入的123云盘直链自动添加URL鉴权参数。通过配置用户的123云盘UID和鉴权密钥，工具会自动对符合条件的链接进行签名处理，增强直链访问的安全性。

## 实现方式

本项目提供两种实现方式，你可以根据自己的需求选择：

### 1. WordPress 插件

适用于使用 WordPress 的网站，通过插件方式集成，安装配置简单。

- **目录**: `For-WordPress/`
- **适用场景**: WordPress 网站
- **详细文档**: [For-WordPress/README.md](For-WordPress/README.md)

### 2. Cloudflare Workers

适用于任何静态网站，通过 Cloudflare Workers 服务端脚本和客户端 JavaScript 处理器实现鉴权。

- **目录**: `For-cloudflareWorkers/`
- **适用场景**: 静态网站、自定义网站
- **详细文档**: [For-cloudflareWorkers/README.md](For-cloudflareWorkers/README.md)

## 工作原理

参考 [https://gitee.com/pan123-git/123pan-link](https://gitee.com/pan123-git/123pan-link)

## 快速开始

### WordPress 用户

1. 下载 [For-WordPress](For-WordPress/) 目录
2. 将其上传至 WordPress 插件目录（`wp-content/plugins/`）
3. 在 WordPress 后台启用插件
4. 配置 123云盘UID 和鉴权密钥

详细说明请查看 [For-WordPress/README.md](For-WordPress/README.md)

### 其他网站用户

1. 部署 Cloudflare Workers（参考 [For-cloudflareWorkers/README.md](For-cloudflareWorkers/README.md)）
2. 在你的网站中引入客户端 JavaScript 脚本
3. 初始化处理器并配置 Worker URL

详细说明请查看 [For-cloudflareWorkers/README.md](For-cloudflareWorkers/README.md)

## 功能对比

| 功能 | WordPress 插件 | Cloudflare Workers |
|------|---------------|-------------------|
| 适用平台 | WordPress | 任何网站 |
| 安装难度 | 简单 | 中等 |
| 配置方式 | 后台界面 | 环境变量 |
| 懒加载支持 | 是 | 是 |
| 多文件类型支持 | 是 | 是 |
| 域名白名单 | - | 支持 |

## 许可证

MIT License
