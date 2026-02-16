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

Given('I am on the login page', async function () {
  await page.goto('https://practicetestautomation.com/practice-test-login/');
});

When('I login with username {string} and password {string}', async function (username, password) {
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Submit' }).click();
});

Then('I should see the logged in page and save a screenshot', async function () {
  await page.waitForSelector('text=Logged In Successfully', { timeout: 5000 });
  const dir = 'test-results/screenshots';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/landing-page-cucumber.png`, fullPage: true });
  const heading = await page.textContent('h1');
  assert.ok(heading && heading.includes('Logged In Successfully'));
});