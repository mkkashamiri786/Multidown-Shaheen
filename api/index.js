const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// ==================== AAPKI SETTINGS YAHAN BADLE ====================
const CONFIG = {
    // 👇 Apni image ka DIRECT link yahan dalein (imgbb, imgur, github raw, etc.)
    DEFAULT_IMAGE: "https://bit.ly/Shaheen-TV-Img",
    
    // 👇 Aapka WhatsApp Channel Link
    WHATSAPP_CHANNEL: "https://whatsapp.com/channel/0029VaC5Nk40VycCVuNq362Q",
    
    // 👇 Channel ka naam jo show hoga
    CHANNEL_NAME: "Join Shaheen TV WhatsApp Channel",
    
    // 👇 Developer name
    DEVELOPER: "Shaheen TV Developers"
};
// ====================================================================

// CORS Setup
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// 100+ Supported Websites List
const SUPPORTED_PLATFORMS = [
    "YouTube (Videos & Shorts)", "TikTok (No Watermark)", "Instagram (Reels, Stories, Posts)", "Facebook (Videos & Watch)", 
    "Twitter (X Videos)", "Snapchat Spotlight", "Pinterest (Video Pins)", "Reddit (With Audio)", "LinkedIn Videos", 
    "Vimeo", "Twitch (Clips & VODs)", "DailyMotion", "SoundCloud", "Bandcamp", "Spotify (Podcasts)", "Tumblr Video", 
    "Imgur Video", "Flickr Video", "Bilibili", "Douyin", "Kuaishou", "CapCut Templates", "Likee", "ShareChat", 
    "Moj Video", "Josh App", "Chingari", "Roposo", "Mitron", "MX TakaTak", "Voot", "Hotstar", "Zee5", 
    "SonyLIV", "JioCinema", "AltBalaji", "ErosNow", "Ullu", "Kumu", "Triller", "Dubsmash", "Byte", 
    "Firework", "Funimate", "Chico", "Zili", "Lasso", "BoloIndya", "Rizzle", "Glance", "Rumbler", 
    "BitChute", "Odysee", "Brighteon", "Utreon", "Gab TV", "NewTube", "Rumble", "Veoh", "Metacafe", 
    "Break", "FunnyOrDie", "LiveLeak", "WorldStarHipHop", "9GAG Video", "CollegeHumor", "Dailymotion", 
    "Crackle", "PopcornFlix", "Tubi TV", "Pluto TV", "IMDb Trailers", "TED Talks", "Khan Academy Videos", 
    "Coursera Videos", "Udemy Previews", "Twitch VODs", "Kick Clips", "Trovo Live", "Mildom", "OpenSea Media", 
    "Rarible Preview", "LooksRare Media", "Mintable Video", "SuperRare Animation", "Foundation Video", 
    "Audiomack", "Mixcloud", "Hearthis.at", "Freesound", "ReverbNation", "Spreaker", "Podbean", "Anchor.fm", 
    "Buzzsprout", "Blubrry", "Libsyn", "SoundClick", "DatPiff", "Livemixtapes", "MixTapeFactory", "MyMixtapez"
];

// Helper: Thumbnail valid hai ya nahi check karo
function getValidThumbnail(thumbnail) {
    if (!thumbnail || typeof thumbnail !== 'string' || thumbnail.trim() === '' || thumbnail === 'null') {
        return CONFIG.DEFAULT_IMAGE;
    }
    return thumbnail;
}

// Helper: Title valid hai ya nahi check karo
function getValidTitle(title) {
    if (!title || typeof title !== 'string' || title.trim() === '' || title === 'Video File' || title === 'Media File') {
        return "Media File Download";
    }
    return title;
}

// ==================== 1. SUPPORT ENDPOINT ====================
app.get('/support', (req, res) => {
    return res.status(200).json({
        status: "success",
        developer: CONFIG.DEVELOPER,
        join_channel: CONFIG.WHATSAPP_CHANNEL,
        channel_name: CONFIG.CHANNEL_NAME,
        default_image: CONFIG.DEFAULT_IMAGE,
        total_supported: SUPPORTED_PLATFORMS.length,
        supported_websites: SUPPORTED_PLATFORMS
    });
});

// ==================== 2. MAIN FETCH ENDPOINT ====================
app.get('/', async (req, res) => {
    const videoUrl = req.query.url;
    
    if (!videoUrl) {
        return res.status(400).json({ 
            status: "error",
            error: "Please provide a 'url' parameter. Example: /?url=VIDEO_URL",
            join_channel: CONFIG.WHATSAPP_CHANNEL,
            channel_name: CONFIG.CHANNEL_NAME,
            thumbnail: CONFIG.DEFAULT_IMAGE
        });
    }

    const fetchEndpoint = "https://savemedia.site/api/fetch.php";
    const headers = {
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36'
    };

    try {
        const fetchRes = await axios.post(fetchEndpoint, { url: videoUrl }, { headers, timeout: 10000 });
        const metaData = fetchRes.data;

        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const baseUrl = `${protocol}://${req.get('host')}`;

        let cleanFormats = [];
        if (metaData.formats && Array.isArray(metaData.formats)) {
            cleanFormats = metaData.formats.map(f => {
                const formatParam = f.format_id === 'best' ? 'best' : f.format_id;
                const extParam = f.ext || 'mp4';
                return {
                    quality: f.quality || "Standard",
                    type: f.type || "video",
                    extension: extParam,
                    download_url: `${baseUrl}/download-file?url=${encodeURIComponent(videoUrl)}&format=${formatParam}&ext=${extParam}`
                };
            });
        }

        // Agar koi format na mile to best default
        if (cleanFormats.length === 0) {
            cleanFormats = [{
                quality: "⭐ Best Quality (Auto)",
                type: "video",
                extension: "mp4",
                download_url: `${baseUrl}/download-file?url=${encodeURIComponent(videoUrl)}&format=best&ext=mp4`
            }];
        }

        const thumbnail = getValidThumbnail(metaData.thumbnail || metaData.cover || metaData.image);
        const title = getValidTitle(metaData.title || metaData.description);
        const isFallbackImage = thumbnail === CONFIG.DEFAULT_IMAGE;

        const customResponse = {
            status: "success",
            developer: CONFIG.DEVELOPER,
            
            // 👇 WhatsApp Channel Link (Click karne par channel khulega)
            join_channel: CONFIG.WHATSAPP_CHANNEL,
            channel_name: CONFIG.CHANNEL_NAME,
            
            video_info: {
                title: title,
                thumbnail: thumbnail,
                image_is_fallback: isFallbackImage,
                uploader: metaData.uploader || metaData.author_name || "Unknown Uploader",
                original_url: videoUrl,
                available_formats: cleanFormats
            }
        };

        return res.status(200).json(customResponse);

    } catch (error) {
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const baseUrl = `${protocol}://${req.get('host')}`;
        
        return res.status(200).json({
            status: "partial_success",
            developer: CONFIG.DEVELOPER,
            
            // 👇 WhatsApp Channel Link
            join_channel: CONFIG.WHATSAPP_CHANNEL,
            channel_name: CONFIG.CHANNEL_NAME,
            
            video_info: {
                title: "Media File Download",
                thumbnail: CONFIG.DEFAULT_IMAGE,       // 👈 Fallback image
                image_is_fallback: true,
                uploader: "Unknown Uploader",
                original_url: videoUrl,
                available_formats: [
                    {
                        quality: "⭐ Best Quality (Auto)",
                        type: "video",
                        extension: "mp4",
                        download_url: `${baseUrl}/download-file?url=${encodeURIComponent(videoUrl)}&format=best&ext=mp4`
                    }
                ]
            }
        });
    }
});

// ==================== 3. DOWNLOADER PROXY ENDPOINT ====================
app.get('/download-file', async (req, res) => {
    const targetUrl = req.query.url;
    const format = req.query.format || 'best';
    const ext = req.query.ext || 'mp4';

    if (!targetUrl) return res.status(400).send("Missing URL parameter");

    const downloadEndpoint = `https://savemedia.site/api/download.php?url=${encodeURIComponent(targetUrl)}&format=${format}&ext=${ext}`;

    try {
        const headers = {
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36'
        };

        const responseStream = await axios({
            method: 'get',
            url: downloadEndpoint,
            headers: headers,
            responseType: 'stream'
        });

        // 🎲 8 character ka random filename generate
        const randomString = crypto.randomBytes(4).toString('hex');
        const filename = `${randomString}.${ext}`;
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', responseStream.headers['content-type'] || (ext === 'mp3' ? 'audio/mpeg' : 'video/mp4'));
        
        responseStream.data.pipe(res);
    } catch (err) {
        res.status(500).send("Error streaming the file: " + err.message);
    }
});

module.exports = app;
