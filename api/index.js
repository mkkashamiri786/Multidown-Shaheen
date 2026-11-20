const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const app = express();

app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const DEVELOPER = 'MUHAMMAD KASHIF SULTAN';
const BRAND = 'SHAHEEN TV DEVELOPERS';
const WHATSAPP = 'https://whatsapp.com/channel/0029VbC00DNGk1FsWn1fqL1j';
// Existing Shaheen TV splash/logo is used until a personal portrait URL is supplied.
const PROFILE_IMAGE = 'https://i.postimg.cc/VLqnPCkT/2719095-splash.png';

const SUPPORTED_PLATFORMS = [
  'YouTube (Videos & Shorts)', 'TikTok (No Watermark)', 'Instagram (Reels, Stories, Posts)',
  'Facebook (Videos & Watch)', 'Twitter (X Videos)', 'Snapchat Spotlight', 'Pinterest (Video Pins)',
  'Reddit (With Audio)', 'LinkedIn Videos', 'Vimeo', 'Twitch (Clips & VODs)', 'DailyMotion',
  'SoundCloud', 'Bandcamp', 'Spotify (Podcasts)', 'Tumblr Video', 'Imgur Video', 'Flickr Video',
  'Bilibili', 'Douyin', 'Kuaishou', 'CapCut Templates', 'Likee', 'ShareChat', 'Moj Video',
  'Josh App', 'Chingari', 'Roposo', 'Mitron', 'MX TakaTak', 'Voot', 'Hotstar', 'Zee5',
  'SonyLIV', 'JioCinema', 'AltBalaji', 'ErosNow', 'Ullu', 'Kumu', 'Triller', 'Dubsmash',
  'Byte', 'Firework', 'Funimate', 'Chico', 'Zili', 'Lasso', 'BoloIndya', 'Rizzle', 'Glance',
  'Rumbler', 'BitChute', 'Odysee', 'Brighteon', 'Utreon', 'Gab TV', 'NewTube', 'Rumble',
  'Veoh', 'Metacafe', 'Break', 'FunnyOrDie', 'WorldStarHipHop', '9GAG Video', 'CollegeHumor',
  'Crackle', 'PopcornFlix', 'Tubi TV', 'Pluto TV', 'IMDb Trailers', 'TED Talks',
  'Khan Academy Videos', 'Coursera Videos', 'Udemy Previews', 'Kick Clips', 'Trovo Live',
  'Mildom', 'OpenSea Media', 'Rarible Preview', 'LooksRare Media', 'Mintable Video',
  'SuperRare Animation', 'Audiomack', 'Mixcloud', 'Hearthis.at', 'Freesound', 'ReverbNation',
  'Spreaker', 'Podbean', 'Anchor.fm', 'Buzzsprout', 'Blubrry', 'Libsyn', 'SoundClick',
  'DatPiff', 'Livemixtapes', 'MixTapeFactory', 'MyMixtapez'
];

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) { return false; }
}

function homepage() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a0e1a"><title>Shaheen Downloader | ${DEVELOPER}</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#172b49,#0a0e1a 58%);color:#f5f8ff;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:24px}
.wrap{width:100%;max-width:520px;text-align:center}.card{background:rgba(18,29,49,.96);border:1px solid #2d9cdb;border-radius:24px;padding:30px 24px;box-shadow:0 18px 55px #0008}
.avatar{width:112px;height:112px;border-radius:50%;object-fit:cover;border:3px solid #2d9cdb;background:#0a0e1a}.eyebrow{color:#2d9cdb;font-size:12px;letter-spacing:2px;font-weight:bold;margin-top:18px}h1{font-size:28px;margin:10px 0 6px}h2{font-size:14px;color:#9bcff0;letter-spacing:1.5px;margin:0 0 24px}.hint{color:#aab9ce;font-size:14px;line-height:1.6}input{width:100%;padding:16px;border-radius:12px;border:1px solid #425572;background:#0b1424;color:white;font-size:15px;outline:none;margin:16px 0 12px}input:focus{border-color:#2d9cdb}.primary,.whatsapp{display:block;width:100%;padding:15px;border:0;border-radius:12px;font-size:16px;font-weight:bold;text-decoration:none;cursor:pointer}.primary{background:#2463df;color:white}.primary:disabled{opacity:.6}.whatsapp{background:#25d366;color:#062b16;margin-top:14px}.result{display:none;text-align:left;background:#0b1424;border:1px solid #30435f;padding:14px;border-radius:12px;margin-top:16px;overflow-wrap:anywhere}.result a{display:block;color:#8dccff;padding:9px 0}.error{color:#ffb4b4}.footer{font-size:12px;color:#8292aa;margin-top:18px}
</style></head><body><main class="wrap"><section class="card">
<img class="avatar" src="${PROFILE_IMAGE}" onerror="this.onerror=null;this.src='https://i.postimg.cc/VLqnPCkT/2719095-splash.png'" alt="Shaheen TV Developers">
<div class="eyebrow">${BRAND}</div><h1>Shaheen Downloader</h1><h2>${DEVELOPER}</h2>
<p class="hint">Paste a public video link below to check available download formats.</p>
<form id="form"><input id="videoUrl" type="url" placeholder="Paste video URL here" required><button class="primary" id="submit" type="submit">Fetch Video</button></form>
<div class="result" id="result" role="status"></div>
<a class="whatsapp" href="${WHATSAPP}" target="_blank" rel="noopener">Join WhatsApp Channel</a>
<div class="footer">Powered by ${BRAND}</div></section></main>
<script>
const form=document.getElementById('form'), input=document.getElementById('videoUrl'), result=document.getElementById('result'), btn=document.getElementById('submit');
form.addEventListener('submit',async e=>{e.preventDefault();const url=input.value.trim();result.style.display='block';result.textContent='Fetching video information...';result.className='result';btn.disabled=true;btn.textContent='Please wait...';
try{const response=await fetch('/?url='+encodeURIComponent(url));const data=await response.json();if(!response.ok||data.status!=='success'&&data.status!=='partial_success')throw new Error(data.error||'Unable to fetch this link.');
const info=data.video_info||{};result.innerHTML='';const title=document.createElement('strong');title.textContent=info.title||'Video ready';result.appendChild(title);if(info.thumbnail){const image=document.createElement('img');image.src=info.thumbnail;image.alt='Video thumbnail';image.style='display:block;width:100%;max-height:220px;object-fit:cover;border-radius:9px;margin:12px 0';image.onerror=()=>image.remove();result.appendChild(image)}
(info.available_formats||[]).forEach((f,i)=>{const a=document.createElement('a');a.href=f.download_url;a.textContent='Download '+(f.quality||'Format '+(i+1))+' ('+(f.extension||'file')+')';a.rel='noopener';result.appendChild(a)});if(!info.available_formats||!info.available_formats.length){const p=document.createElement('p');p.textContent='No downloadable formats were returned by the provider.';result.appendChild(p)}
}catch(err){result.className='result error';result.textContent='Sorry, download service error: '+err.message+' Please try again later or use another public link.'}
finally{btn.disabled=false;btn.textContent='Fetch Video'}});
</script></body></html>`;
}

app.get('/support', (req, res) => res.status(200).json({
  status: 'success', developer: BRAND, owner: DEVELOPER, whatsapp_channel: WHATSAPP,
  total_supported: SUPPORTED_PLATFORMS.length, supported_websites: SUPPORTED_PLATFORMS
}));

app.get('/', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(200).type('html').send(homepage());
  if (typeof videoUrl !== 'string' || !isHttpUrl(videoUrl)) {
    return res.status(400).json({ status: 'error', error: 'Please provide a valid http or https video URL.' });
  }

  // This is the configured third-party provider in the original project.
  const fetchEndpoint = 'https://savemedia.site/api/fetch.php';
  try {
    const fetchRes = await axios.post(fetchEndpoint, { url: videoUrl }, {
      headers: { 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0' },
      timeout: 20000, validateStatus: () => true
    });
    if (fetchRes.status < 200 || fetchRes.status >= 300) {
      return res.status(502).json({ status: 'error', error: `The configured download provider returned HTTP ${fetchRes.status}. The provider endpoint may have changed or be unavailable.` });
    }
    const metaData = fetchRes.data;
    if (!metaData || typeof metaData !== 'object') {
      return res.status(502).json({ status: 'error', error: 'The download provider returned an invalid response.' });
    }
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = `${protocol}://${req.get('host')}`;
    const cleanFormats = Array.isArray(metaData.formats) ? metaData.formats.map(f => ({
      quality: f.quality || 'Standard', type: f.type || 'video', extension: f.ext || 'mp4',
      download_url: `${baseUrl}/download-file?url=${encodeURIComponent(videoUrl)}&format=${encodeURIComponent(f.format_id === 'best' ? 'best' : (f.format_id || 'best'))}&ext=${encodeURIComponent(f.ext || 'mp4')}`
    })) : [];
    if (!cleanFormats.length) return res.status(502).json({ status: 'error', error: 'The provider did not return any downloadable formats.' });
    return res.status(200).json({
      status: 'success', developer: BRAND, owner: DEVELOPER, join_group: WHATSAPP,
      video_info: { title: metaData.title || metaData.description || 'Video File', thumbnail: metaData.thumbnail || metaData.cover || metaData.image || null, uploader: metaData.uploader || metaData.author_name || 'Unknown Uploader', original_url: videoUrl, available_formats: cleanFormats }
    });
  } catch (error) {
    const status = error.response && error.response.status;
    return res.status(502).json({ status: 'error', error: status ? `Download provider error: HTTP ${status}` : 'Could not connect to the download provider. Please try again later.' });
  }
});

app.get('/download-file', async (req, res) => {
  const targetUrl = req.query.url;
  const format = typeof req.query.format === 'string' ? req.query.format : 'best';
  const ext = typeof req.query.ext === 'string' && /^[a-z0-9]{2,5}$/i.test(req.query.ext) ? req.query.ext : 'mp4';
  if (typeof targetUrl !== 'string' || !isHttpUrl(targetUrl)) return res.status(400).send('A valid video URL is required.');
  const downloadEndpoint = `https://savemedia.site/api/download.php?url=${encodeURIComponent(targetUrl)}&format=${encodeURIComponent(format)}&ext=${encodeURIComponent(ext)}`;
  try {
    const upstream = await axios({ method: 'get', url: downloadEndpoint, headers: { 'user-agent': 'Mozilla/5.0' }, responseType: 'stream', timeout: 60000, validateStatus: () => true });
    if (upstream.status < 200 || upstream.status >= 300) {
      upstream.data.destroy();
      return res.status(502).send(`Download provider returned HTTP ${upstream.status}.`);
    }
    const filename = `${crypto.randomBytes(4).toString('hex')}.${ext}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', upstream.headers['content-type'] || (ext === 'mp3' ? 'audio/mpeg' : 'video/mp4'));
    upstream.data.on('error', () => { if (!res.headersSent) res.status(502); res.end(); });
    upstream.data.pipe(res);
  } catch (err) {
    if (!res.headersSent) res.status(502).send('Unable to download from the configured provider. Please try again later.');
  }
});

module.exports = app;
