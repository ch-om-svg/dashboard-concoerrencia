const { chromium } = require('playwright');
const { scrapeBrand } = require('./fetch_real_ig_brand.js');
const fs = require('fs');

const TARGETS = [
  { handle: 'wohlford1946', ids: ['daytonboots'] },
  { handle: 'williamlennonboots', ids: ['williamlennon_boots', 'williamlennon_shoes'] },
  { handle: 'quoddymaine', ids: ['quoddy'] },
  { handle: 'heschungofficial', ids: ['heschung'] },
  { handle: 'berwick1707_official', ids: ['berwick1707'] },
  { handle: 'yuketenbymegco', ids: ['yuketen'] },
  { handle: 'astorflex_official', ids: ['astorflex'] },
  { handle: 'padmorebarnes', ids: ['padmore_barnes'] },
  { handle: 'dannerboots', ids: ['danner'] },
  { handle: 'tlbmallorca.official', ids: ['tlbmallorca'] },
  { handle: 'yanko_shoes', ids: ['yanko'] },
  { handle: 'satchelandpage', ids: ['satchelpage'] },
  { handle: 'tannergoods', ids: ['tannergoods'] },
  { handle: 'chapmanbags', ids: ['chapman'] },
  { handle: 'billinghambags', ids: ['billingham'] },
  { handle: 'brady_bags', ids: ['bradybags'] },
  { handle: 'crootsengland', ids: ['croots'] },
  { handle: 'tusting', ids: ['tusting'] },
  { handle: 'jwhulmeco', ids: ['jwhulme'] },
  { handle: 'lotuffleather', ids: ['lotuff'] },
  { handle: 'swaineofficial', ids: ['swaine'] },
  { handle: 'bennett_winch', ids: ['bennettwinch'] },
  { handle: 'maxwellscottuk', ids: ['maxwellscott'] },
  { handle: 'harberlondon', ids: ['harberlondon'] },
  { handle: 'ghurka', ids: ['ghurka'] },
  { handle: 'ilbisonteofficial', ids: ['ilbisonte'] },
  { handle: 'thebridgeitaly', ids: ['thebridge'] },
  { handle: 'ettinger.london', ids: ['ettinger'] },
  { handle: 'bradleymountain', ids: ['bradleymountain'] },
  { handle: 'frostriver1910', ids: ['frostriver'] },
  { handle: 'vermilyeapelle', ids: ['vermilyeapelle'] },
  { handle: 'ironheartdenim', ids: ['ironheart'] },
  { handle: 'loyalstricklin', ids: ['loyalstricklin'] },
  { handle: 'troubadourgoods', ids: ['troubadour'] }
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

            // Copy to any secondary ids
            for (let j = 1; j < t.ids.length; j++) {
                const secId = t.ids[j];
                const secDir = `assets/instagram/${secId}`;
                fs.mkdirSync(secDir, { recursive: true });
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

    fs.writeFileSync('scraped_shoes_bags_ig.json', JSON.stringify(scrapedData, null, 2));
    console.log('Finished batch scrape for shoes and bags!');
    await browser.close();
})();
