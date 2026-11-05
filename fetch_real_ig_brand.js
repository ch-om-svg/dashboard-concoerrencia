const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const client = url.startsWith('https') ? https : http;
        client.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
            }
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to download ${url}: status ${response.statusCode}`));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(dest));
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function scrapeBrand(handle, brandId, page) {
    console.log(`\n=== Scraping real IG for ${brandId} (@${handle}) ===`);
    const dir = path.join(__dirname, 'assets', 'instagram', brandId);
    fs.mkdirSync(dir, { recursive: true });

    await page.goto(`https://www.instagram.com/${handle}/`, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(4000);

    // Extract profile info (avatar, bio, followers, posts count)
    const profileInfo = await page.evaluate(() => {
        const avatarImg = document.querySelector('header img');
        const headerText = document.querySelector('header')?.innerText || '';
        
        const metaDesc = document.querySelector('meta[name="description"]')?.content || 
                         document.querySelector('meta[property="og:description"]')?.content || '';
        
        return {
            avatar: avatarImg ? avatarImg.src : null,
            metaDesc,
            headerText
        };
    });

    console.log('Profile info:', profileInfo.metaDesc);

    // Extract post links & images
    const postsData = await page.evaluate(() => {
        const results = [];
        const links = Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]'));
        for (const a of links) {
            const img = a.querySelector('img');
            if (img && img.src && !results.some(r => r.url === a.href)) {
                results.push({
                    url: a.href,
                    src: img.src,
                    alt: img.alt || ''
                });
            }
        }
        return results;
    });

    console.log(`Found ${postsData.length} posts on profile`);

    if (profileInfo.avatar) {
        try {
            await downloadFile(profileInfo.avatar, path.join(dir, 'avatar.jpg'));
            console.log(`Saved avatar -> ${dir}/avatar.jpg`);
        } catch (e) {
            console.error('Error saving avatar:', e.message);
        }
    }

    const downloadedPosts = [];
    for (let i = 0; i < Math.min(postsData.length, 12); i++) {
        const p = postsData[i];
        const dest = path.join(dir, `post_${i + 1}.jpg`);
        try {
            await downloadFile(p.src, dest);
            console.log(`Saved post_${i + 1}.jpg from real IG`);
            const isReel = p.url.includes('/reel/') || p.alt.toLowerCase().includes('video');
            downloadedPosts.push({
                index: i + 1,
                url: p.url,
                alt: p.alt,
                isReel,
                src: `assets/instagram/${brandId}/post_${i + 1}.jpg`
            });
        } catch (e) {
            console.error(`Error downloading post ${i + 1}:`, e.message);
        }
    }

    return {
        brandId,
        handle,
        profileInfo,
        posts: downloadedPosts
    };
}

module.exports = { scrapeBrand, downloadFile };

if (require.main === module) {
    (async () => {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            viewport: { width: 1280, height: 1200 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        });
        const page = await context.newPage();
        
        try {
            const res = await scrapeBrand('nickshandmadeboots', 'nicksboots', page);
            console.log(`Successfully downloaded ${res.posts.length} real posts for nicksboots!`);
        } catch (e) {
            console.error('Fatal error:', e);
        } finally {
            await browser.close();
        }
    })();
}
