/**
 * Cloudflare Worker for 123pan Authentication
 * 作者：https://github.com/hcllmsx
 * 项目：https://github.com/hcllmsx/Authn123Pan
 */

// MD5 implementation for Cloudflare Workers
async function md5(text) {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('MD5', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Sign URL function (same logic as 123pan example)
async function signURL(originURL, privateKey, uid, validDurationSeconds) {
  const ts = Math.floor((Date.now() / 1000) + validDurationSeconds); // 有效时间戳，单位：秒
  const rInt = Math.floor(Math.random() * 1000000); // 随机正整数
  let objURL;
  try {
    objURL = new URL(originURL);
  } catch (e) {
    return originURL;
  }

  const pathForSign = decodeURIComponent(objURL.pathname);
  const signString = `${pathForSign}-${ts}-${rInt}-${uid}-${privateKey}`;
  const hash = await md5(signString);

  const authKey = `${ts}-${rInt}-${uid}-${hash}`;
  objURL.searchParams.append('auth_key', authKey);

  return objURL.toString();
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // We support POST for /api/sign and GET for /api/m3u8Proxy
    if (request.method !== 'POST' && request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const { pathname, searchParams } = new URL(request.url);

    try {
      // Get environment variables
      const UID = env.UID;
      const PRIVATE_KEY = env.PRIVATE_KEY;
      const VALID_DURATION = parseInt(env.VALID_DURATION || '900'); // Default: 900 seconds (15 minutes)

      // Check if required environment variables are set
      if (!UID || !PRIVATE_KEY) {
        return new Response(JSON.stringify({ error: 'Server configuration error' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Get URL from body (POST) or query string (GET)
      let url;
      if (request.method === 'POST') {
        const body = await request.json();
        url = body.url;
      } else {
        url = searchParams.get('url');
      }

      if (!url) {
        return new Response(JSON.stringify({ error: 'Missing URL parameter' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Validate that the URL is from 123pan
      if (!url.includes('123pan.cn') && !url.includes('123pan.com') && !url.includes('123yx.com')) {
        return new Response(JSON.stringify({ error: 'Invalid URL: Only 123pan URLs are allowed' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (pathname.includes('/api/m3u8Proxy')) {
        // 1. 获取原 M3U8 时也需要鉴权
        const signedM3u8Url = await signURL(url, PRIVATE_KEY, UID, VALID_DURATION);

        // Use incoming referer if available, or fallback to the site domain
        const referer = request.headers.get('Referer') || 'https://jixu.oooq.cc/';

        const response = await fetch(signedM3u8Url, {
          headers: {
            'Referer': referer,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
        });

        if (!response.ok) {
          return new Response(JSON.stringify({ error: 'Failed to fetch m3u8 from 123pan' }), {
            status: response.status,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          });
        }

        const text = await response.text();
        const lines = text.split('\n');

        // 2. 遍历 M3U8 内容，替换所有的 ts 相对链接为鉴权后的绝对链接
        const signedLines = await Promise.all(lines.map(async (line) => {
          const trimmed = line.trim();
          // 忽略空行和注释
          if (!trimmed || trimmed.startsWith('#')) return line;

          try {
            // 将 TS 相对路径转换为绝对路径
            const segmentUrl = new URL(trimmed, url).toString();
            // 对每个 TS 切片进行鉴权提取
            return await signURL(segmentUrl, PRIVATE_KEY, UID, VALID_DURATION);
          } catch (e) {
            return line;
          }
        }));

        const finalM3u8 = signedLines.join('\n');

        const proxyHeaders = new Headers();
        proxyHeaders.set('Content-Type', 'application/vnd.apple.mpegurl');
        proxyHeaders.set('Access-Control-Allow-Origin', '*');
        proxyHeaders.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

        return new Response(finalM3u8, {
          status: 200,
          headers: proxyHeaders
        });
      } else {
        // Generate signed URL
        const signedURL = await signURL(url, PRIVATE_KEY, UID, VALID_DURATION);

        // Return signed URL
        return new Response(JSON.stringify({
          signedUrl: signedURL,
          expiresIn: VALID_DURATION, // in seconds
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal server error', message: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
