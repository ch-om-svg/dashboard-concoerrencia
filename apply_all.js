const { applyScrapedData } = require('./apply_scraped_ig.js');

console.log('--- Applying boots ---');
applyScrapedData('scraped_boots_ig.json');

console.log('--- Applying shoes and bags ---');
applyScrapedData('scraped_shoes_bags_ig.json');

console.log('All scraped real IG data applied successfully!');
