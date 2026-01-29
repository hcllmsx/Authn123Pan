/**
 * Netlify Function for 123pan Authentication
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

export async function handler(event, context) {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            body: '',
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        // Get environment variables
        const UID = process.env.UID;
        const PRIVATE_KEY = process.env.PRIVATE_KEY;
        const VALID_DURATION = parseInt(process.env.VALID_DURATION || '900'); // Default: 900 seconds (15 minutes)

        // Check if required environment variables are set
        if (!UID || !PRIVATE_KEY) {
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Server configuration error' }),
            };
        }

        // Parse request body
        const body = JSON.parse(event.body);
        const { url } = body;

        if (!url) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Missing URL parameter' }),
            };
        }

        // Validate that the URL is from 123pan
        if (!url.includes('123pan.cn') && !url.includes('123pan.com')) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Invalid URL: Only 123pan URLs are allowed' }),
            };
        }

        // Generate signed URL
        const signedURL = signURL(url, PRIVATE_KEY, UID, VALID_DURATION);

        // Return signed URL
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                signedUrl: signedURL,
                expiresIn: VALID_DURATION, // in seconds
            }),
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }),
        };
    }
}
