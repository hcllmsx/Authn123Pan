/**
 * 123pan 自动鉴权客户端 (Universal Version)
 * 同时支持 Cloudflare Workers 和 Vercel Serverless Functions
 * 
 * 作者: https://github.com/hcllmsx
 * 
 * 使用方法：
 * 1. 在HTML中引入此脚本
 * 2. 配置服务URL（使用 data-auth-url 属性）
 * 3. 在视频/图片元素上添加 data-123pan-src 属性
 * 4. 脚本会自动处理鉴权，只在用户操作时才请求签名
 * 
 * 示例：
 * <!-- Cloudflare Workers -->
 * <script src="auth-123pan-client.js" data-auth-url="https://your-worker.workers.dev"></script>
 * 
 * <!-- Vercel -->
 * <script src="auth-123pan-client.js" data-auth-url="https://your-app.vercel.app/api/sign"></script>
 * 
 * <!-- Netlify -->
 * <script src="auth-123pan-client.js" data-auth-url="https://your-app.netlify.app/.netlify/functions/sign"></script>
 */

(function (window, document) {
    'use strict';

    // 核心鉴权客户端
    const Pan123Auth = {
        config: {
            authUrl: '', // 统一的鉴权服务URL
            cacheEnabled: true,
            cacheDuration: 30 * 60 * 1000, // 30分钟
            autoInit: true,
        },
        cache: new Map(),

        configure: function (options) {
            Object.assign(this.config, options);
        },

        async getSignedUrl(originalUrl) {
            if (!this.config.authUrl) {
                throw new Error('Auth URL not configured');
            }

            // 检查缓存
            if (this.config.cacheEnabled) {
                const cached = this.cache.get(originalUrl);
                if (cached && Date.now() < cached.expiresAt) {
                    console.log('[Pan123Auth] Using cached URL');
                    return cached.signedUrl;
                }
            }

            try {
                console.log('[Pan123Auth] Requesting signed URL...');
                const response = await fetch(this.config.authUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: originalUrl }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to get signed URL');
                }

                const data = await response.json();

                // 缓存结果
                if (this.config.cacheEnabled) {
                    this.cache.set(originalUrl, {
                        signedUrl: data.signedUrl,
                        expiresAt: Date.now() + this.config.cacheDuration,
                    });
                }

                console.log('[Pan123Auth] Successfully got signed URL');
                return data.signedUrl;
            } catch (error) {
                console.error('[Pan123Auth] Error:', error);
                throw error;
            }
        },
    };

    // 自动处理模块
    const AutoHandler = {
        // 处理视频元素
        async handleVideo(videoElement) {
            const originalUrl = videoElement.dataset['123panSrc'];
            if (!originalUrl) return;

            try {
                const signedUrl = await Pan123Auth.getSignedUrl(originalUrl);
                videoElement.src = signedUrl;
                console.log('[AutoHandler] Video source set');
            } catch (error) {
                console.error('[AutoHandler] Failed to set video source:', error);
            }
        },

        // 处理图片元素
        async handleImage(imgElement) {
            const originalUrl = imgElement.dataset['123panSrc'];
            if (!originalUrl) return;

            try {
                const signedUrl = await Pan123Auth.getSignedUrl(originalUrl);
                imgElement.src = signedUrl;
                console.log('[AutoHandler] Image source set');
            } catch (error) {
                console.error('[AutoHandler] Failed to set image source:', error);
            }
        },

        // 处理自定义播放按钮
        async handlePlayButton(button) {
            const originalUrl = button.dataset['123panSrc'];
            const targetSelector = button.dataset['123panTarget'];

            if (!originalUrl) {
                console.warn('[AutoHandler] Play button missing data-123pan-src');
                return;
            }

            try {
                const signedUrl = await Pan123Auth.getSignedUrl(originalUrl);

                // 如果指定了目标元素
                if (targetSelector) {
                    const target = document.querySelector(targetSelector);
                    if (target) {
                        if (target.tagName === 'VIDEO' || target.tagName === 'AUDIO') {
                            target.src = signedUrl;
                            target.play();
                        } else if (target.tagName === 'IMG') {
                            target.src = signedUrl;
                        }
                    }
                } else {
                    // 创建新的视频元素
                    const video = document.createElement('video');
                    video.src = signedUrl;
                    video.controls = true;
                    video.autoplay = true;
                    video.style.width = '100%';

                    // 替换按钮或插入到按钮后面
                    const container = button.closest('[data-123pan-container]') || button.parentElement;
                    if (container.dataset['123panReplace'] === 'true') {
                        container.innerHTML = '';
                        container.appendChild(video);
                    } else {
                        button.style.display = 'none';
                        button.parentElement.insertBefore(video, button.nextSibling);
                    }
                }

                console.log('[AutoHandler] Play button handled');
            } catch (error) {
                console.error('[AutoHandler] Failed to handle play button:', error);
                alert('加载失败：' + error.message);
            }
        },

        // 初始化所有元素
        init() {
            console.log('[AutoHandler] Initializing...');

            // 1x1 透明像素占位符，防止浏览器在 JS 设置真实 src 之前请求 null
            const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

            // 自动处理所有图片（立即加载）
            const images = document.querySelectorAll('img[data-123pan-src]:not([data-123pan-lazy="true"])');
            images.forEach(img => {
                // 如果图片没有 src 或 src 无效，先设置占位符
                if (!img.src || img.src === window.location.href || img.src.endsWith('/null')) {
                    img.src = PLACEHOLDER;
                }
                this.handleImage(img);
            });

            // 懒加载图片（滚动到视口时加载）
            const lazyImages = document.querySelectorAll('img[data-123pan-src][data-123pan-lazy="true"]');
            if (lazyImages.length > 0 && 'IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.handleImage(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                });
                lazyImages.forEach(img => observer.observe(img));
            }

            // 自动处理视频（当用户点击播放时）
            const videos = document.querySelectorAll('video[data-123pan-src]');
            videos.forEach(video => {
                // 监听播放事件
                const playHandler = (e) => {
                    if (!video.src || video.src === window.location.href) {
                        e.preventDefault();
                        this.handleVideo(video).then(() => {
                            video.play();
                        });
                        video.removeEventListener('play', playHandler);
                    }
                };
                video.addEventListener('play', playHandler);
            });

            // 处理自定义播放按钮
            const playButtons = document.querySelectorAll('[data-123pan-action="play"]');
            playButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handlePlayButton(button);
                });
            });

            console.log('[AutoHandler] Initialized:', {
                images: images.length,
                lazyImages: lazyImages.length,
                videos: videos.length,
                playButtons: playButtons.length,
            });
        },
    };

    // 自动配置和初始化
    function autoConfig() {
        // 从脚本标签获取配置
        const scriptTag = document.currentScript;
        if (scriptTag) {
            const authUrl = scriptTag.dataset.authUrl || scriptTag.getAttribute('data-auth-url');
            const cacheEnabled = scriptTag.dataset.cache !== 'false';
            const autoInit = scriptTag.dataset.autoInit !== 'false';

            if (authUrl) {
                Pan123Auth.configure({
                    authUrl: authUrl,
                    cacheEnabled: cacheEnabled,
                    autoInit: autoInit,
                });
            }
        }

        // 如果启用了自动初始化
        if (Pan123Auth.config.autoInit && Pan123Auth.config.authUrl) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    AutoHandler.init();
                });
            } else {
                AutoHandler.init();
            }
        }
    }

    // 导出到全局
    window.Pan123Auth = Pan123Auth;
    window.Pan123AuthAuto = {
        init: () => AutoHandler.init(),
        handleVideo: (el) => AutoHandler.handleVideo(el),
        handleImage: (el) => AutoHandler.handleImage(el),
        handlePlayButton: (el) => AutoHandler.handlePlayButton(el),
    };

    // 执行自动配置
    autoConfig();

})(window, document);
