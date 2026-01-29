/**
 * Vercel Serverless Function for 123pan Authentication
 * 作者: https://github.com/hcllmsx
 * 项目：https://github.com/hcllmsx/Authn123Pan
 */

import crypto from 'crypto';

// Sign URL function (same logic as 123pan example)
function signURL(originURL, privateKey, uid, validDurationSeconds) {
  const ts = Math.floor((Date.now() / 1000) + validDurationSeconds); // 有效时间戳，单位：秒
  const rInt = Math.floor(Math.random() * 1000000); // 随机正整数
  const objURL = new URL(originURL);

  const pathForSign = decodeURIComponent(objURL.pathname);
  const signString = `${pathForSign}-${ts}-${rInt}-${uid}-${privateKey}`;
  const hash = crypto.createHash('md5').update(signString).digest('hex');

  const authKey = `${ts}-${rInt}-${uid}-${hash}`;
  objURL.searchParams.append('auth_key', authKey);

  return objURL.toString();
}

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get environment variables
    const UID = process.env.UID;
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const VALID_DURATION = parseInt(process.env.VALID_DURATION || '900'); // Default: 900 seconds (15 minutes)

    // Check if required environment variables are set
    if (!UID || !PRIVATE_KEY) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Parse request body
    const { url } = req.body;

    if (!url) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: 'Missing URL parameter' });
    }

    // Validate that the URL is from 123pan
    if (!url.includes('123pan.cn') && !url.includes('123pan.com')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: 'Invalid URL: Only 123pan URLs are allowed' });
    }

    // Generate signed URL
    const signedURL = signURL(url, PRIVATE_KEY, UID, VALID_DURATION);

    // Return signed URL
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      signedUrl: signedURL,
      expiresIn: VALID_DURATION, // in seconds
    });

  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
