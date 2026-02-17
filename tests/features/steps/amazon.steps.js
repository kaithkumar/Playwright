const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const assert = require('assert');
const fs = require('fs');
let browser, context, page;

Before(async function () {
  const headed = process.env.CUCUMBER_PLAYWRIGHT_HEADED === 'true';
  browser = await chromium.launch({ headless: !headed });
  context = await browser.newContext();
  page = await context.newPage();
  this.page = page;
});

After(async function () {
  if (browser) await browser.close();
});

Given('I open Amazon homepage', async function () {
  await page.goto('https://www.amazon.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
});

When('I search for {string}', async function (searchTerm) {
  const searchInput = await page.locator('input[placeholder*="Search"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill(searchTerm);
    await searchInput.press('Enter');
  }
  await page.waitForTimeout(3000);
});

Then('I should see search results', async function () {
  const url = page.url();
  assert.ok(url.includes('/s?k=') || url.includes('amazon.com/s'), 'Not on search results page');
});

Then('I should extract and display product details', async function () {
  await page.waitForTimeout(2000);
  
  const products = await page.evaluate(() => {
    const items = [];
    const productElements = document.querySelectorAll('[data-component-type="s-search-result"]');
    
    productElements.forEach((el, idx) => {
      if (idx >= 5) return;
      
      try {
        const titleEl = el.querySelector('h2 a span') || el.querySelector('h2 span');
        const model = titleEl ? titleEl.innerText.trim() : 'N/A';
        
        const priceEl = el.querySelector('[data-a-price-whole]');
        const price = priceEl ? priceEl.innerText.trim() : 'N/A';
        
        const ratingEl = el.querySelector('.a-icon-star-small span');
        const rating = ratingEl ? ratingEl.innerText.trim() : 'N/A';
        
        const linkEl = el.querySelector('h2 a');
        const link = linkEl ? linkEl.href : 'N/A';
        
        items.push({
          model: model,
          price: price,
          rating: rating,
          link: link
        });
      } catch (e) {
        console.error('Error parsing product:', e);
      }
    });
    
    return items;
  });
  
  console.log('\n========== APACS RACKETS SEARCH RESULTS ==========');
  console.log(`Found ${products.length} products:\n`);
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`Product ${i + 1}:`);
    console.log(`  Model: ${product.model}`);
    console.log(`  Price: ${product.price}`);
    console.log(`  Rating: ${product.rating}`);
    console.log(`  Link: ${product.link}`);
    console.log('---');
  }
  
  const dir = 'test-results';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const reportPath = `${dir}/amazon-products.json`;
  fs.writeFileSync(reportPath, JSON.stringify(products, null, 2));
  console.log(`\nResults saved to: ${reportPath}\n`);
  
  this.products = products;
  assert.ok(products.length > 0, 'No products found in search results');
});

Then('I should display product weight and specifications', async function () {
  const products = this.products || [];
  
  if (products.length === 0) return;
  
  console.log('\n========== DETAILED PRODUCT SPECIFICATIONS ==========\n');
  
  if (products[0].link && products[0].link !== 'N/A') {
    await page.goto(products[0].link);
    await page.waitForTimeout(3000);
    
    const specs = await page.evaluate(() => {
      const details = {
        title: '',
        weight: 'N/A',
        specifications: []
      };
      
      const titleEl = document.querySelector('h1 span');
      if (titleEl) details.title = titleEl.innerText.trim();
      
      const specTable = document.querySelector('table');
      if (specTable) {
        const rows = specTable.querySelectorAll('tr');
        rows.forEach((row) => {
          const th = row.querySelector('th');
          const td = row.querySelector('td');
          if (th && td) {
            const label = th.innerText.trim();
            const value = td.innerText.trim();
            
            if (label.toLowerCase().includes('weight')) {
              details.weight = value;
            }
            details.specifications.push({ label, value });
          }
        });
      }
      
      return details;
    });
    
    console.log(`Product: ${specs.title}`);
    console.log(`Weight: ${specs.weight}`);
    console.log(`\nAll Specifications:`);
    specs.specifications.forEach((spec) => {
      console.log(`  ${spec.label}: ${spec.value}`);
    });
  }
  
  console.log('\n=================================================\n');
});
