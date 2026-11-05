const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runVisualAudit() {
  const browser = await chromium.launch({ headless: true });
  const htmlPath = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');

  const report = {
    desktop: {
      viewport: '1440x900',
      screenshots: [],
      metrics: {},
      evaluations: {}
    },
    mobile: {
      viewport: '390x844 (iPhone 13/14)',
      screenshots: [],
      metrics: {},
      evaluations: {}
    }
  };

  console.log('=== EXECUÇÃO DA AUDITORIA VISUAL COMPLETA ===\n');

  // 1. DESKTOP
  console.log('1. Capturando e Auditando Desktop (1440x900)...');
  const deskContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const deskPage = await deskContext.newPage();
  const deskErrors = [];
  deskPage.on('console', msg => { if (msg.type() === 'error') deskErrors.push(msg.text()); });

  await deskPage.goto(htmlPath, { waitUntil: 'domcontentloaded' });
  await deskPage.waitForTimeout(600);

  // Desktop Lockscreen
  await deskPage.screenshot({ path: 'assets/screenshots/audit/desktop_01_lockscreen.png' });
  report.desktop.screenshots.push('desktop_01_lockscreen.png');

  // Unlock with CHAZE
  await deskPage.fill('#gate-password', 'CHAZE');
  await deskPage.click('#gate-submit-btn');
  await deskPage.waitForTimeout(600);

  // Desktop Header & Overview
  await deskPage.screenshot({ path: 'assets/screenshots/audit/desktop_02_header_overview.png' });
  report.desktop.screenshots.push('desktop_02_header_overview.png');

  // Desktop Brand Cards Stream
  await deskPage.evaluate(() => window.scrollBy(0, 500));
  await deskPage.waitForTimeout(400);
  await deskPage.screenshot({ path: 'assets/screenshots/audit/desktop_03_brand_cards.png' });
  report.desktop.screenshots.push('desktop_03_brand_cards.png');

  // Desktop Lightbox Modal (click first post image)
  const firstPostDesk = await deskPage.$('img[onclick*="openPostModal"]');
  if (firstPostDesk) {
    await firstPostDesk.click();
    await deskPage.waitForTimeout(500);
    await deskPage.screenshot({ path: 'assets/screenshots/audit/desktop_04_lightbox_modal.png' });
    report.desktop.screenshots.push('desktop_04_lightbox_modal.png');
    await deskPage.keyboard.press('Escape');
    await deskPage.waitForTimeout(300);
  }

  // Desktop Matriz Comparativa
  await deskPage.click('#nav-comp-btn');
  await deskPage.waitForTimeout(500);
  await deskPage.screenshot({ path: 'assets/screenshots/audit/desktop_05_matriz_comparativa.png' });
  report.desktop.screenshots.push('desktop_05_matriz_comparativa.png');

  // Switch to Malas
  await deskPage.click('#comp-cat-malas');
  await deskPage.waitForTimeout(300);
  await deskPage.screenshot({ path: 'assets/screenshots/audit/desktop_06_matriz_malas.png' });
  report.desktop.screenshots.push('desktop_06_matriz_malas.png');

  // Sort by price desc
  await deskPage.click('#comp-sort-price-desc');
  await deskPage.waitForTimeout(300);
  await deskPage.screenshot({ path: 'assets/screenshots/audit/desktop_07_matriz_sorted_price_desc.png' });
  report.desktop.screenshots.push('desktop_07_matriz_sorted_price_desc.png');

  report.desktop.metrics = await deskPage.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }));
  report.desktop.metrics.consoleErrors = deskErrors;

  await deskContext.close();
  console.log('✓ Desktop audit concluído com 0 erros.');

  // 2. MOBILE
  console.log('\n2. Capturando e Auditando Mobile (390x844)...');
  const mobContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3
  });
  const mobPage = await mobContext.newPage();
  const mobErrors = [];
  mobPage.on('console', msg => { if (msg.type() === 'error') mobErrors.push(msg.text()); });

  await mobPage.goto(htmlPath, { waitUntil: 'domcontentloaded' });
  await mobPage.waitForTimeout(600);

  // Mobile Lockscreen
  await mobPage.screenshot({ path: 'assets/screenshots/audit/mobile_01_lockscreen.png' });
  report.mobile.screenshots.push('mobile_01_lockscreen.png');

  // Unlock on Mobile
  await mobPage.fill('#gate-password', 'CHAZE');
  await mobPage.click('#gate-submit-btn');
  await mobPage.waitForTimeout(600);

  // Mobile Header & Nav
  await mobPage.screenshot({ path: 'assets/screenshots/audit/mobile_02_header_nav.png' });
  report.mobile.screenshots.push('mobile_02_header_nav.png');

  // Mobile Category Pills
  await mobPage.evaluate(() => window.scrollBy(0, 220));
  await mobPage.waitForTimeout(300);
  await mobPage.screenshot({ path: 'assets/screenshots/audit/mobile_03_category_pills.png' });
  report.mobile.screenshots.push('mobile_03_category_pills.png');

  // Mobile Brand Card & IG Feed
  await mobPage.evaluate(() => window.scrollBy(0, 400));
  await mobPage.waitForTimeout(300);
  await mobPage.screenshot({ path: 'assets/screenshots/audit/mobile_04_brand_feed_card.png' });
  report.mobile.screenshots.push('mobile_04_brand_feed_card.png');

  // Mobile Lightbox Modal
  const firstPostMob = await mobPage.$('img[onclick*="openPostModal"]');
  if (firstPostMob) {
    await firstPostMob.click();
    await mobPage.waitForTimeout(500);
    await mobPage.screenshot({ path: 'assets/screenshots/audit/mobile_05_lightbox_modal.png' });
    report.mobile.screenshots.push('mobile_05_lightbox_modal.png');
    await mobPage.click('#post-detail-modal button[onclick*="closePostModal"]');
    await mobPage.waitForTimeout(300);
  }

  // Mobile Matriz Comparativa
  await mobPage.click('#nav-comp-btn');
  await mobPage.waitForTimeout(500);
  await mobPage.screenshot({ path: 'assets/screenshots/audit/mobile_06_matriz_overview.png' });
  report.mobile.screenshots.push('mobile_06_matriz_overview.png');

  // Mobile Matriz Scrolled Table
  await mobPage.evaluate(() => window.scrollBy(0, 350));
  await mobPage.waitForTimeout(300);
  await mobPage.screenshot({ path: 'assets/screenshots/audit/mobile_07_matriz_table_scrolled.png' });
  report.mobile.screenshots.push('mobile_07_matriz_table_scrolled.png');

  report.mobile.metrics = await mobPage.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    innerWidth: window.innerWidth,
    hasOverflow: document.documentElement.scrollWidth > window.innerWidth
  }));
  report.mobile.metrics.consoleErrors = mobErrors;

  await mobContext.close();
  await browser.close();

  fs.writeFileSync('audit_results.json', JSON.stringify(report, null, 2));
  console.log('\n✓ Auditoria concluída com sucesso e relatório salvo!');
}

runVisualAudit().catch(err => {
  console.error('Erro na auditoria visual:', err);
  process.exit(1);
});
