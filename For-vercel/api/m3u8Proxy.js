import crypto from 'crypto';

// Sign URL function (same logic as 123pan example)
function signURL(originURL, privateKey, uid, validDurationSeconds) {
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
    const hash = crypto.createHash('md5').update(signString).digest('hex');

    const authKey = `${ts}-${rInt}-${uid}-${hash}`;
    objURL.searchParams.append('auth_key', authKey);

    return objURL.toString();
}

export default async function handler(req, res) {
    // Handle CORS preflight requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Max-Age', '86400');
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed. Use GET' });
    }

    try {
        const UID = process.env.UID;
        const PRIVATE_KEY = process.env.PRIVATE_KEY;
        const VALID_DURATION = parseInt(process.env.VALID_DURATION || '900');

        if (!UID || !PRIVATE_KEY) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ error: 'Missing url parameter' });
        }

        if (!url.includes('123pan.cn') && !url.includes('123pan.com') && !url.includes('123yx.com')) {
            return res.status(400).json({ error: 'Invalid URL: Only 123pan URLs are allowed' });
        }

        // 1. 获取原 M3U8 时也需要鉴权
        const signedM3u8Url = signURL(url, PRIVATE_KEY, UID, VALID_DURATION);
        const response = await fetch(signedM3u8Url);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch m3u8 from 123pan' });
        }

        const text = await response.text();
        const lines = text.split('\n');

        // 2. 遍历 M3U8 内容，替换所有的 ts 相对链接为鉴权后的绝对链接
        const signedLines = lines.map(line => {
            const trimmed = line.trim();
            // 忽略空行和注释
            if (!trimmed || trimmed.startsWith('#')) return line;

            try {
                // 将 TS 相对路径转换为绝对路径
                const segmentUrl = new URL(trimmed, url).toString();
                // 对每个 TS 切片进行鉴权提取
                return signURL(segmentUrl, PRIVATE_KEY, UID, VALID_DURATION);
            } catch (e) {
                return line;
            }
        });

        const finalM3u8 = signedLines.join('\n');

        // 3. 将处理后的 M3U8 以纯文本形式返回，并且标明正确的内容类型
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        // 在 Vercel CDN 边缘缓存 60秒，减少频繁请求
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
        return res.status(200).send(finalM3u8);

    } catch (error) {
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
