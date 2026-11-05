const { chromium } = require('playwright');
const { scrapeBrand } = require('./fetch_real_ig_brand.js');
const fs = require('fs');

const TARGETS = [
    { handle: 'nickshandmadeboots', ids: ['nicksboots', 'nicks_leather'] },
    { handle: 'trumanbootcompany', ids: ['truman'] },
    { handle: 'whitesboots', ids: ['whitesboots'] },
    { handle: 'wescoboots', ids: ['wescoboots'] },
    { handle: 'franksbootcompany', ids: ['franksboots'] },
    { handle: 'jkboots', ids: ['jkboots'] },
    { handle: 'drewsboots', ids: ['drewsboots'] },
    { handle: 'grantstone', ids: ['grantstone_boots', 'grantstone_shoes'] },
    { handle: 'wearparkhurst', ids: ['parkhurst'] },
    { handle: 'oakstreetbootmakers', ids: ['oakstreet_boots', 'oakstreet_shoes'] },
    { handle: 'rancourtco', ids: ['rancourt_boots', 'rancourt_shoes'] },
    { handle: 'russellmoccasin', ids: ['russell_boots', 'russell_shoes'] },
    { handle: 'wolverineboots', ids: ['wolverine1000'] },
    { handle: 'thorogood_usa', ids: ['thorogood_boots', 'thorogood_shoes'] },
    { handle: 'chippewaboots', ids: ['chippewa'] },
    { handle: 'canadawestboots', ids: ['canadawest'] },
    { handle: 'josephcheaney', ids: ['cheaney_boots', 'cheaney_shoes'] },
    { handle: 'grensonshoes', ids: ['grenson_boots', 'grenson_shoes'] },
    { handle: 'crockettandjones_official', ids: ['crockett_boots', 'crockett_shoes'] },
    { handle: 'sandersshoes', ids: ['sanders_boots', 'sanders_shoes'] },
    { handle: 'loakeshoemakers', ids: ['loake_boots', 'loake_shoes'] },
    { handle: 'rmwilliams', ids: ['rmwilliams_boots', 'rmwilliams_shoes'] },
    { handle: 'johnlofgrenbootmaker', ids: ['johnlofgren'] }
];

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 1200 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    const scrapedData = {};

    for (const t of TARGETS) {
        try {
            console.log(`\nStarting ${t.handle}...`);
            const res = await scrapeBrand(t.handle, t.ids[0], page);
            scrapedData[t.handle] = res;

            // Copy to any secondary ids (e.g. nicks_leather, shoes variants)
            for (let j = 1; j < t.ids.length; j++) {
                const secId = t.ids[j];
                const secDir = `assets/instagram/${secId}`;
                fs.mkdirSync(secDir, { recursive: true });
                // copy avatar and posts
                const srcDir = `assets/instagram/${t.ids[0]}`;
                if (fs.existsSync(`${srcDir}/avatar.jpg`)) {
                    fs.copyFileSync(`${srcDir}/avatar.jpg`, `${secDir}/avatar.jpg`);
                }
                for (let k = 1; k <= 12; k++) {
                    if (fs.existsSync(`${srcDir}/post_${k}.jpg`)) {
                        fs.copyFileSync(`${srcDir}/post_${k}.jpg`, `${secDir}/post_${k}.jpg`);
                    }
                }
                console.log(`Copied assets to secondary ID ${secId}`);
            }

            await page.waitForTimeout(2000);
        } catch (err) {
            console.error(`Failed ${t.handle}:`, err.message);
        }
    }

    fs.writeFileSync('scraped_boots_ig.json', JSON.stringify(scrapedData, null, 2));
    console.log('Finished batch scrape!');
    await browser.close();
})();
