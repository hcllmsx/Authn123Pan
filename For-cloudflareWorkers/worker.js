/**
 * 123pan直链鉴权Cloudflare Worker
 * 用于生成带鉴权的123pan直链URL
 * 支持视频、图片、音频等多种文件类型
 * 作者：https://github.com/hcllmsx
 */

/**
 * 纯JavaScript MD5实现（支持UTF-8）
 * @param {string} message - 要计算哈希的字符串
 * @returns {string} MD5哈希值（十六进制字符串）
 */
function md5(message) {
  function rotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }

  function addUnsigned(lX, lY) {
    const lX4 = (lX & 0x40000000);
    const lY4 = (lY & 0x40000000);
    const lX8 = (lX & 0x80000000);
    const lY8 = (lY & 0x80000000);
    let lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        lResult ^= 0xC0000000;
      } else {
        lResult ^= 0x40000000;
      }
      return (lResult ^ lX8 ^ lY8);
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }

  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return (y ^ (x | (~z))); }

  function FF(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function GG(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function HH(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function II(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function uTF8Encode(string) {
    string = string.replace(/\r\n/g, '\n');
    let utftext = '';

    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  }

  function convertToWordArray(message) {
    const lMessageLength = message.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = new Array(lNumberOfWords);
    let lByteCount = 0;

    for (let i = 0; i < lNumberOfWords; i++) {
      lWordArray[i] = 0;
    }

    while (lByteCount < lMessageLength) {
      lWordArray[lByteCount >> 2] |= (message.charCodeAt(lByteCount) & 0xFF) << ((lByteCount % 4) * 8);
      lByteCount++;
    }

    lWordArray[lByteCount >> 2] |= 0x80 << ((lByteCount % 4) * 8);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;

    return lWordArray;
  }

  function wordToHex(lValue) {
    let WordToHexValue = '', WordToHexValue_temp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = '0' + lByte.toString(16);
      WordToHexValue += WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  let x = convertToWordArray(uTF8Encode(message));
  let a = 0x67452301;
  let b = 0xEFCDAB89;
  let c = 0x98BADCFE;
  let d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a;
    const BB = b;
    const CC = c;
    const DD = d;

    a = FF(a, b, c, d, x[k + 0], 7, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], 12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], 22, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], 7, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], 12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], 17, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], 22, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], 12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], 17, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], 22, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], 7, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], 12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], 17, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], 22, 0x49B40821);

    a = GG(a, b, c, d, x[k + 1], 5, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], 9, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], 14, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], 20, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], 5, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], 9, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], 14, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], 20, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], 5, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], 9, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], 14, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], 20, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], 5, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], 9, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], 14, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], 20, 0x8D2A4C8A);

    a = HH(a, b, c, d, x[k + 5], 4, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], 11, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], 16, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], 23, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], 4, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], 11, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], 16, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], 23, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], 4, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], 11, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], 16, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], 23, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], 4, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], 11, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], 16, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], 23, 0xC4AC5665);

    a = II(a, b, c, d, x[k + 0], 6, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], 10, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], 15, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], 21, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], 6, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], 10, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], 15, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], 21, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], 6, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], 10, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], 15, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], 21, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], 6, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], 10, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], 15, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], 21, 0xEB86D391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

/**
 * 生成123pan签名URL
 * @param {string} originURL - 原始123pan URL
 * @param {string} privateKey - 鉴权密钥
 * @param {string|number} uid - 账号ID
 * @param {number} validDuration - 链接有效期（毫秒）
 * @returns {string} 签名后的URL
 */
function signURL(originURL, privateKey, uid, validDuration) {
  const ts = Math.floor((Date.now() + validDuration) / 1000); // 有效时间戳，单位：秒
  const rInt = Math.floor(Math.random() * 1000000); // 随机正整数
  const objURL = new URL(originURL);
  
  // 构建签名字符串
  const signString = `${decodeURIComponent(objURL.pathname)}-${ts}-${rInt}-${uid}-${privateKey}`;
  
  // 计算MD5签名
  const authKey = `${ts}-${rInt}-${uid}-${md5(signString)}`;
  
  // 添加auth_key参数
  objURL.searchParams.append('auth_key', authKey);
  
  return objURL.toString();
}

/**
 * Cloudflare Worker主处理函数
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @param {Object} ctx - 执行上下文
 * @returns {Response} 响应对象
 */
export default {
  async fetch(request, env, ctx) {
    try {
      // 处理CORS预检请求
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        });
      }

      // 获取请求来源
      const origin = request.headers.get('Origin') || request.headers.get('Referer') || '';
      
      // 从环境变量中获取允许的域名列表
      // 区分"未设置"和"设置为空"两种情况
      const allowedOriginsStr = env.ALLOWED_ORIGINS;
      let allowedOrigins = [];
      
      if (allowedOriginsStr !== undefined && allowedOriginsStr !== null) {
        // 用户明确设置了该环境变量（即使为空字符串，也使用用户设置的值）
        const defaultOrigins = 'http://localhost,http://127.0.0.1,http://localhost:8080,http://localhost:3000,http://localhost:5173';
        const originsToUse = allowedOriginsStr === '' ? defaultOrigins : allowedOriginsStr;
        allowedOrigins = originsToUse.split(',').map(o => o.trim()).filter(Boolean);
      } else {
        // 用户未设置该环境变量，使用默认值
        const defaultOrigins = 'http://localhost,http://127.0.0.1,http://localhost:8080,http://localhost:3000,http://localhost:5173';
        allowedOrigins = defaultOrigins.split(',').map(o => o.trim()).filter(Boolean);
      }
      
      // 验证请求来源（如果allowedOrigins为空数组，则默认拒绝所有请求）
      if (allowedOrigins.length > 0) {
        const isAllowed = allowedOrigins.some(allowedOrigin => 
          origin.startsWith(allowedOrigin)
        );
        
        if (!isAllowed) {
          return new Response('Access Denied', {
            status: 403,
            headers: {
              'Content-Type': 'text/plain',
              'Access-Control-Allow-Origin': '*',
            }
          });
        }
      } else {
        // 如果allowedOrigins为空数组（用户主动设置为空），则拒绝所有请求以防止安全漏洞
        return new Response('Access Denied - No allowed origins configured', {
          status: 403,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }

      // 从请求URL中获取原始123pan URL参数
      const url = new URL(request.url);
      const originURL = url.searchParams.get('url');

      if (!originURL) {
        return new Response('Missing URL parameter', {
          status: 400,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }

      // 从环境变量中获取配置
      const uid = env.UID;
      const privateKey = env.PRIVATE_KEY;
      const validDurationSec = env.VALID_DURATION || '900'; // 默认15分钟（900秒）

      if (!uid || !privateKey) {
        return new Response('Missing environment variables: UID or PRIVATE_KEY', {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }

      // 生成签名URL（将秒转换为毫秒）
      const signedURL = signURL(originURL, privateKey, uid, parseInt(validDurationSec) * 1000);

      return new Response(signedURL, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
        }
      });
    } catch (error) {
      console.error('Error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};
