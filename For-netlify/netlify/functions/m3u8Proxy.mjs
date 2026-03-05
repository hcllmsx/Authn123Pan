import crypto from 'crypto';

function signURL(originURL, privateKey, uid, validDurationSeconds) {
    const ts = Math.floor((Date.now() / 1000) + validDurationSeconds);
    const rInt = Math.floor(Math.random() * 1000000);
    let objURL;
    try {
        objURL = new URL(originURL);
    } catch (e) {
        return originURL;
    }

    const pathForSign = decodeURIComponent(objURL.pathname);
    const signString = `${pathForSign}-${ts}-${rInt}-${uid}-${privateKey}`;
    const hash = crypto.createHash('md5').update(signString).digest('hex');

    const authKey = `${ts}-${rInt}-${uid}-${hash}`;
    objURL.searchParams.append('auth_key', authKey);

    return objURL.toString();
}

export async function handler(event, context) {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            body: '',
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Method not allowed. Use GET' }),
        };
    }

    try {
        const UID = process.env.UID;
        const PRIVATE_KEY = process.env.PRIVATE_KEY;
        const VALID_DURATION = parseInt(process.env.VALID_DURATION || '900');

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

        const url = event.queryStringParameters.url;

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

        if (!url.includes('123pan.cn') && !url.includes('123pan.com') && !url.includes('123yx.com')) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Invalid URL: Only 123pan URLs are allowed' }),
            };
        }

        const signedM3u8Url = signURL(url, PRIVATE_KEY, UID, VALID_DURATION);

        // Dynamically import node-fetch if global fetch is not available (Node < 18)
        const fetchFunc = globalThis.fetch || (await import('node-fetch')).default;

        // Use incoming referer if available, or fallback to the site domain
        const referer = event.headers.referer || 'https://jixu.oooq.cc/';

        const response = await fetchFunc(signedM3u8Url, {
            headers: {
                'Referer': referer,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            return {
                statusCode: response.status,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Failed to fetch m3u8 from 123pan' })
            };
        }

        const text = await response.text();
        const lines = text.split('\n');

        const signedLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return line;

            try {
                const segmentUrl = new URL(trimmed, url).toString();
                return signURL(segmentUrl, PRIVATE_KEY, UID, VALID_DURATION);
            } catch (e) {
                return line;
            }
        });

        const finalM3u8 = signedLines.join('\n');

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/vnd.apple.mpegurl',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
            },
            body: finalM3u8
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
