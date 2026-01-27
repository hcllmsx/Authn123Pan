/**
 * 123pan直链自动鉴权处理器
 * 支持视频、图片、音频等多种文件类型
 * 支持需要时才获取鉴权链接
 * 作者：https://github.com/hcllmsx
 */

class Pan123Handler {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {string} options.workerUrl - Cloudflare Worker URL
   * @param {boolean} options.lazyLoad - 是否启用懒加载
   * @param {Array} options.fileTypes - 支持的文件类型
   */
  constructor(options = {}) {
    this.workerUrl = options.workerUrl || '';
    this.lazyLoad = options.lazyLoad !== false; // 默认启用懒加载
    this.fileTypes = options.fileTypes || ['video', 'img', 'audio'];
    this.processedElements = new Set();
  }

  /**
   * 初始化处理器
   */
  init() {
    if (!this.workerUrl) {
      console.error('123pan Handler: Missing workerUrl configuration');
      return;
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._initializeElements());
    } else {
      this._initializeElements();
    }
  }

  /**
   * 初始化页面元素
   * @private
   */
  _initializeElements() {
    // 处理视频元素
    if (this.fileTypes.includes('video')) {
      this._handleVideos();
    }

    // 处理图片元素
    if (this.fileTypes.includes('img')) {
      this._handleImages();
    }

    // 处理音频元素
    if (this.fileTypes.includes('audio')) {
      this._handleAudios();
    }

    // 处理链接元素（可选）
    if (this.fileTypes.includes('a')) {
      this._handleLinks();
    }
  }

  /**
   * 处理视频元素
   * @private
   */
  _handleVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      const source = video.querySelector('source');
      if (source && this._is123panUrl(source.src)) {
        this._processElement(source, 'src', () => {
          video.load();
          if (video.hasAttribute('autoplay')) {
            video.play().catch(err => console.warn('Autoplay prevented:', err));
          }
        });
      }
    });
  }

  /**
   * 处理图片元素
   * @private
   */
  _handleImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (this._is123panUrl(img.src)) {
        this._processElement(img, 'src', () => {
          // 图片加载完成后的回调
        });
      }
    });
  }

  /**
   * 处理音频元素
   * @private
   */
  _handleAudios() {
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
      const source = audio.querySelector('source');
      if (source && this._is123panUrl(source.src)) {
        this._processElement(source, 'src', () => {
          audio.load();
          if (audio.hasAttribute('autoplay')) {
            audio.play().catch(err => console.warn('Autoplay prevented:', err));
          }
        });
      }
    });
  }

  /**
   * 处理链接元素
   * @private
   */
  _handleLinks() {
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      if (this._is123panUrl(link.href)) {
        this._processElement(link, 'href', () => {
          // 链接处理完成后的回调
        });
      }
    });
  }

  /**
   * 处理单个元素
   * @private
   * @param {Element} element - DOM元素
   * @param {string} attribute - 要处理的属性名
   * @param {Function} callback - 处理完成后的回调
   */
  _processElement(element, attribute, callback) {
    const elementKey = `${element.tagName}-${attribute}-${element[attribute]}`;
    if (this.processedElements.has(elementKey)) {
      return; // 避免重复处理
    }

    const originalUrl = element[attribute];

    if (this.lazyLoad) {
      // 懒加载模式：添加事件监听器
      this._addLazyLoadListeners(element, attribute, originalUrl, callback);
    } else {
      // 非懒加载模式：立即处理
      this._getSignedUrl(originalUrl)
        .then(signedUrl => {
          this._updateElement(element, attribute, signedUrl);
          this.processedElements.add(elementKey);
          callback();
        })
        .catch(error => {
          console.error(`Error processing ${element.tagName}:`, error);
        });
    }
  }

  /**
   * 添加懒加载事件监听器
   * @private
   * @param {Element} element - DOM元素
   * @param {string} attribute - 要处理的属性名
   * @param {string} originalUrl - 原始URL
   * @param {Function} callback - 处理完成后的回调
   */
  _addLazyLoadListeners(element, attribute, originalUrl, callback) {
    const elementKey = `${element.tagName}-${attribute}-${originalUrl}`;

    // 对于视频和音频元素
    if (element.tagName === 'VIDEO' || element.tagName === 'AUDIO') {
      element.addEventListener('play', async (e) => {
        if (!this.processedElements.has(elementKey)) {
          e.preventDefault();
          try {
            const signedUrl = await this._getSignedUrl(originalUrl);
            this._updateElement(element, attribute, signedUrl);
            this.processedElements.add(elementKey);
            element.load();
            element.play().catch(err => console.warn('Playback error:', err));
            callback();
          } catch (error) {
            console.error(`Error processing ${element.tagName}:`, error);
          }
        }
      });
    }

    // 对于图片元素
    else if (element.tagName === 'IMG') {
      // 监听图片加载事件（当图片进入视口时）
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.processedElements.has(elementKey)) {
            this._getSignedUrl(originalUrl)
              .then(signedUrl => {
                this._updateElement(element, attribute, signedUrl);
                this.processedElements.add(elementKey);
                observer.disconnect();
                callback();
              })
              .catch(error => {
                console.error(`Error processing image:`, error);
                observer.disconnect();
              });
          }
        });
      });

      observer.observe(element);
    }

    // 对于链接元素
    else if (element.tagName === 'A') {
      element.addEventListener('click', async (e) => {
        if (!this.processedElements.has(elementKey)) {
          e.preventDefault();
          try {
            const signedUrl = await this._getSignedUrl(originalUrl);
            this._updateElement(element, attribute, signedUrl);
            this.processedElements.add(elementKey);
            // 重新触发点击
            element.click();
            callback();
          } catch (error) {
            console.error(`Error processing link:`, error);
            // 失败时跳转到原始URL
            window.location.href = originalUrl;
          }
        }
      });
    }
  }

  /**
   * 获取签名后的URL
   * @private
   * @param {string} originalUrl - 原始123pan URL
   * @returns {Promise<string>} 签名后的URL
   */
  async _getSignedUrl(originalUrl) {
    if (!this.workerUrl || !this._is123panUrl(originalUrl)) {
      return originalUrl;
    }

    try {
      const response = await fetch(`${this.workerUrl}?url=${encodeURIComponent(originalUrl)}`);
      if (!response.ok) {
        throw new Error(`Worker returned ${response.status}`);
      }

      const signedUrl = await response.text();
      console.log(`123pan URL signed: ${signedUrl}`);
      return signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  }

  /**
   * 更新元素属性
   * @private
   * @param {Element} element - DOM元素
   * @param {string} attribute - 属性名
   * @param {string} value - 新值
   */
  _updateElement(element, attribute, value) {
    element[attribute] = value;
    // 对于source元素，需要通知父元素重新加载
    if (element.tagName === 'SOURCE' && element.parentElement) {
      element.parentElement.load();
    }
  }

  /**
   * 检查URL是否是123pan链接
   * @private
   * @param {string} url - 要检查的URL
   * @returns {boolean} 是否是123pan链接
   */
  _is123panUrl(url) {
    return url && (url.includes('123pan.cn') || url.includes('123pan.com'));
  }

  /**
   * 手动处理指定元素
   * @param {Element} element - 要处理的DOM元素
   * @param {string} attribute - 要处理的属性名
   * @returns {Promise<string>} 签名后的URL
   */
  async processElement(element, attribute = 'src') {
    if (!element || !element[attribute]) {
      return null;
    }

    const originalUrl = element[attribute];
    if (!this._is123panUrl(originalUrl)) {
      return originalUrl;
    }

    try {
      const signedUrl = await this._getSignedUrl(originalUrl);
      this._updateElement(element, attribute, signedUrl);
      return signedUrl;
    } catch (error) {
      console.error('Error processing element:', error);
      return originalUrl;
    }
  }
}

// 全局导出
if (typeof window !== 'undefined') {
  window.Pan123Handler = Pan123Handler;
  
  // 简化的初始化函数
  window.initPan123Handler = function(options) {
    const handler = new Pan123Handler(options);
    handler.init();
    return handler;
  };
}

// 模块化导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Pan123Handler;
}

if (typeof exports !== 'undefined') {
  exports.Pan123Handler = Pan123Handler;
  exports.initPan123Handler = window.initPan123Handler;
}
