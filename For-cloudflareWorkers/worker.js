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
  const objURL = new URL(originURL);

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

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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

      // Parse request body
      const body = await request.json();
      const { url } = body;

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
      if (!url.includes('123pan.cn') && !url.includes('123pan.com')) {
        return new Response(JSON.stringify({ error: 'Invalid URL: Only 123pan URLs are allowed' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

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
