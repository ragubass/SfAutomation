# Sf Playwright Automation

JavaScript end-to-end checks using Playwright Test, page objects, and Allure reporting.

## Requirements

- Node.js 20 or newer
- Java 17 or newer for generating Allure HTML reports

## Setup and run

```sh
npm install
npx playwright install chromium
npm test
```

Generate and open the Allure report after a test run:

```sh
npm run allure:generate
npm run allure:open
```

Set `BASE_URL` to override the marketing site URL used by the homepage page object. Authentication routes are defined in `utils/authUrls.js`.

The signup verification-step test submits to SleekFlow and may create a production signup record, so it is skipped by default. Run it only with an approved test email:

```sh
ALLOW_PRODUCTION_SIGNUP=1 SIGNUP_TEST_EMAIL=your-approved-test-address@example.com npx playwright test --grep "signup submission"
```

The login test submits invalid credentials and verifies the session stays on the unauthenticated SSO login flow.