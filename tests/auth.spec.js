import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { SignupPage } from '../pages/SignupPage.js';
import { authTestData } from '../test-data/authData.js';

test.describe('SleekFlow authentication flow checks', () => {
  test('signup form accepts required details without submitting', async ({ page }) => {
    const homePage = new HomePage(page);
    const signupPage = new SignupPage(page);

    await homePage.open();
    await homePage.startFreeTrial();
    await signupPage.expectLoaded();
    await signupPage.completeRequiredFields(authTestData.signupEmail);

    await expect(signupPage.emailInput).toHaveValue(authTestData.signupEmail);
    await expect(signupPage.termsCheckbox).toBeChecked();
    await expect(signupPage.submitButton).toBeEnabled();
  });

  test('sign in link on signup page opens the login page', async ({ page }) => {
    const homePage = new HomePage(page);
    const signupPage = new SignupPage(page);
    const loginPage = new LoginPage(page);

    await homePage.open();
    await homePage.startFreeTrial();
    await signupPage.expectLoaded();
    await signupPage.goToLogin();
    await loginPage.expectLoaded();
  });

  test('signup submission reaches the verification step', async ({ page }) => {
    const homePage = new HomePage(page);
    const signupPage = new SignupPage(page);

    await homePage.open();
    await homePage.startFreeTrial();
    await signupPage.expectLoaded();

    await page.route('https://sso.sleekflow.io/**', async route => {
      const request = route.request();
      const requestUrl = new URL(request.url());

      if (request.method() === 'POST') {
        if (requestUrl.pathname.endsWith('/u/signup/identifier')) {
          await route.fulfill({
            status: 200,
            contentType: 'text/html',
            body: '<!doctype html><html><body><main><h1>Check your email</h1></main></body></html>'
          });
          return;
        }

        await route.abort();
        return;
      }

      await route.continue();
    });

    await signupPage.completeRequiredFields(authTestData.signupEmail);
    await signupPage.submit();
    await signupPage.expectVerificationStep();
  });

  test('login rejects an email that does not belong to an account', async ({ page }) => {
    const loginPage = new LoginPage(page);
    let loginStep = 0;

    await page.route(url => {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname === 'sso.sleekflow.io' && parsedUrl.pathname === '/u/login/identifier';
    }, async route => {
      const requestUrl = new URL(route.request().url());
      const action = `${requestUrl.pathname}${requestUrl.search}`;
      const responseBody = loginStep === 0
        ? `<!doctype html><html><body><main><h1>Welcome back</h1><form method="post" action="${action}"><label for="email">Email or username</label><input id="email" name="username" type="text"><button type="submit">Continue</button></form></main></body></html>`
        : loginStep === 1
          ? `<!doctype html><html><body><main><h1>Sign in to continue</h1><form method="post" action="${action}"><label for="password">Password</label><input id="password" name="password" type="password"><button type="submit">Sign in</button></form></main></body></html>`
          : '<!doctype html><html><body><main><h1>Sign in to continue</h1><p role="alert">Invalid username or password.</p></main></body></html>';
      loginStep += 1;

      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: responseBody
      });
    });

    await loginPage.open('https://sso.sleekflow.io/u/login/identifier?state=mock');
    await loginPage.expectLoaded();
    expect(loginStep).toBe(1);
    await loginPage.submitCredentials(
      authTestData.invalidLoginEmail,
      authTestData.invalidLoginPassword
    );

    await loginPage.expectAuthenticationRejected();
  });
});