// spec: login and screenshot
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import fs from 'fs';

// Ensure the screenshot directory exists
const screenshotDir = 'test-results/screenshots';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

test.describe('Practice Test Automation Login', () => {
  test('Login and take landing page screenshot', async ({ page }) => {
    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await page.goto('https://practicetestautomation.com/practice-test-login/');

    // 2. Enter Username: student
    await page.getByRole('textbox', { name: 'Username' }).fill('student');

    // 3. Enter Password: Password123
    await page.getByRole('textbox', { name: 'Password' }).fill('Password123');

    // 4. Click the login button
    await page.getByRole('button', { name: 'Submit' }).click();

    // 5. Wait for the landing page to load (assert heading is visible)
    await expect(page.getByRole('heading', { name: 'Logged In Successfully' })).toBeVisible();

    // 6. Take a screenshot of the landing page and save it in test-results/screenshots
    await page.screenshot({ path: 'test-results/screenshots/landing-page.png', fullPage: true });
  });
});
