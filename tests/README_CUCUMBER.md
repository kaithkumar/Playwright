Setup and run Cucumber + Playwright test

1. Install dependencies:

```bash
npm install @cucumber/cucumber playwright
npx playwright install
```

2. Run the Cucumber feature (from project root):

```bash
npx cucumber-js tests/features/login.feature --require tests/features/steps/**/*.js
```

The test will save a screenshot to `test-results/screenshots/landing-page-cucumber.png` on success.
