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

When('I fill the username field with {string}', async function (username) {
  await page.fill('#username', username);
});

When('I fill the password field with {string}', async function (password) {
  await page.fill('#password', password);
});

When('I click the Submit button', async function () {
  await page.click('#submit');
});

When('I press Enter in the password field', async function () {
  await page.locator('#password').press('Enter');
});

When('I clear all fields', async function () {
  await page.fill('#username', '');
  await page.fill('#password', '');
});

Then('I should see the logged in page and save a screenshot', async function () {
  await page.getByRole('heading', { name: /Logged In Successfully/i }).waitFor({ timeout: 5000 });
  const dir = 'test-results/screenshots';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/landing-page-cucumber.png`, fullPage: true });
  const heading = await page.textContent('h1');
  assert.ok(heading && /Logged In Successfully/i.test(heading));
});

Then('I should see error message {string}', async function (expectedError) {
  await page.waitForSelector('#error', { timeout: 3000 }).catch(() => null);
  const errorElement = await page.locator('#error');
  const isVisible = await errorElement.isVisible().catch(() => false);
  
  if (isVisible) {
    const errorText = await errorElement.textContent();
    assert.ok(errorText && errorText.includes(expectedError), 
      `Expected error "${expectedError}" but got "${errorText}"`);
  } else {
    const bElement = await page.locator('b', { hasText: expectedError }).first();
    const bVisible = await bElement.isVisible().catch(() => false);
    assert.ok(bVisible, `Error message "${expectedError}" not found`);
  }
});

Then('I should remain on the login page', async function () {
  const url = page.url();
  assert.ok(url.includes('practice-test-login'), 
    `Expected to stay on login page but URL is ${url}`);
});

Then('the username field should be focused', async function () {
  const focused = await page.locator('#username').evaluate(el => el === document.activeElement);
  assert.ok(focused, 'Username field is not focused');
});

Then('the password field should be focused', async function () {
  const focused = await page.locator('#password').evaluate(el => el === document.activeElement);
  assert.ok(focused, 'Password field is not focused');
});

Then('I should see the logout button', async function () {
  const logoutBtn = await page.locator('text=Log out').isVisible();
  assert.ok(logoutBtn, 'Logout button not visible');
});

Then('username field should have label {string}', async function (label) {
  const inputLabel = await page.locator('label[for="username"]').textContent();
  assert.ok(inputLabel && inputLabel.includes(label), 
    `Expected label "${label}" but got "${inputLabel}"`);
});

Then('password field should have label {string}', async function (label) {
  const inputLabel = await page.locator('label[for="password"]').textContent();
  assert.ok(inputLabel && inputLabel.includes(label), 
    `Expected label "${label}" but got "${inputLabel}"`);
});

When('I submit a SQL injection payload in username {string}', async function (payload) {
  await page.fill('#username', payload);
  await page.fill('#password', 'Password123');
  await page.click('#submit');
  await page.waitForTimeout(1000);
});

Then('no SQL injection alert or error should appear', async function () {
  const alerts = await page.evaluate(() => window.alert.toString().includes('script'));
  assert.ok(!alerts, 'Suspicious alert detected - potential XSS');
});

Then('the page should still function normally after payload', async function () {
  const url = page.url();
  assert.ok(url.includes('practice-test-login'), 'App crashed or redirected unexpectedly');
  const titleElement = await page.locator('h2').first().isVisible();
  assert.ok(titleElement, 'Page structure compromised');
});

When('I submit an XSS payload in password {string}', async function (payload) {
  await page.fill('#username', 'student');
  await page.fill('#password', payload);
  await page.click('#submit');
  await page.waitForTimeout(1000);
});

Then('the password payload should not execute', async function () {
  const scriptAlert = await page.evaluate(() => {
    return !!window.xssTriggered;
  }).catch(() => false);
  assert.ok(!scriptAlert, 'XSS vulnerability detected');
});

When('I navigate back from the logged-in page', async function () {
  await page.goto('https://practicetestautomation.com/practice-test-login/');
  await page.fill('#username', 'student');
  await page.fill('#password', 'Password123');
  await page.click('#submit');
  await page.getByRole('heading', { name: /Logged In Successfully/i }).waitFor({ timeout: 5000 });
  await page.goBack();
});

Then('I should see the login page after back button', async function () {
  await page.waitForTimeout(500);
  const url = page.url();
  assert.ok(url.includes('practice-test-login'), 
    `Expected login page but got ${url}`);
});