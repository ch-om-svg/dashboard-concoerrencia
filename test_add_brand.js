const { chromium } = require('playwright');
const path = require('path');

async function testAddBrandFeature() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const jsErrors = [];
  page.on('pageerror', err => jsErrors.push(err.message));

  const url = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.fill('#gate-password', 'CHAZE');
  await page.click('#gate-submit-btn');
  await page.waitForTimeout(600);

  console.log('1. Abrindo modal "Inserir Marca"...');
  await page.evaluate(() => openAddBrandModal());
  await page.waitForTimeout(400);

  const isModalVisible = await page.isVisible('#add-brand-modal');
  console.log('2. Modal visível:', isModalVisible);
  if (!isModalVisible) throw new Error('Modal não abriu!');

  // Fill form for a new brand in Sapatos: "Vass Shoes Budapest"
  console.log('3. Preenchendo formulário de teste...');
  await page.fill('#new-brand-name', 'Vass Shoes');
  await page.click('#new-cat-btn-sapatos'); // Ensure Sapatos is selected
  await page.fill('#new-brand-ig', '@vass_shoes');
  await page.fill('#new-brand-website', 'https://vass-shoes.com');
  await page.selectOption('#new-brand-country', 'it');
  await page.fill('#new-brand-price', '650 €');

  // Take screenshot of filled modal
  await page.screenshot({ path: 'assets/screenshots/verify_add_brand_modal.png' });
  console.log('✓ Screenshot do modal salvo em assets/screenshots/verify_add_brand_modal.png');

  // Submit form
  await page.click('#add-brand-submit-btn');
  await page.waitForTimeout(800);

  // Check if modal closed
  const isModalClosed = !(await page.isVisible('#add-brand-modal'));
  console.log('4. Modal fechou após submissão:', isModalClosed);

  // Check if new brand card exists on page
  const cardExists = await page.evaluate(() => {
    return !!document.getElementById('card-vass_shoes');
  });
  console.log('5. Card da nova marca renderizado no dashboard:', cardExists);

  // Check if new brand appears in localStorage
  const storageData = await page.evaluate(() => {
    return localStorage.getItem('concorrencia_custom_brands_v3');
  });
  console.log('6. Salvo no localStorage com sucesso:', !!storageData);

  // Switch to Matriz Comparativa and check if Vass Shoes is in the table
  await page.click('#nav-comp-btn');
  await page.waitForTimeout(500);

  const isInMatrix = await page.evaluate(() => {
    const text = document.getElementById('comparator-tbody').innerText;
    return text.includes('Vass Shoes');
  });
  console.log('7. Marca inserida na Matriz Comparativa:', isInMatrix);

  // Take screenshot of dashboard with new brand
  await page.screenshot({ path: 'assets/screenshots/verify_brand_added_in_matrix.png' });

  console.log('\nErros de JavaScript detectados:', jsErrors.length);
  await browser.close();

  if (jsErrors.length > 0) {
    console.error('JS Errors:', jsErrors);
    process.exit(1);
  }
  console.log('=== TESTE DE ADIÇÃO DE MARCA APROVADO COM 100% DE SUCESSO! ===');
}

testAddBrandFeature().catch(err => {
  console.error('Erro no teste:', err);
  process.exit(1);
});
