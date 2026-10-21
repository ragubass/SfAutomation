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
    test.skip(
      process.env.ALLOW_PRODUCTION_SIGNUP !== '1' || !process.env.SIGNUP_TEST_EMAIL,
      'Requires explicit production-signup opt-in and a designated test email.'
    );

    const homePage = new HomePage(page);
    const signupPage = new SignupPage(page);

    await homePage.open();
    await homePage.startFreeTrial();
    await signupPage.expectLoaded();
    await signupPage.completeRequiredFields(authTestData.signupEmail);
    await signupPage.submit();
    await signupPage.expectVerificationStep();
  });

  test('login rejects an email that does not belong to an account', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.submitCredentials(
      authTestData.invalidLoginEmail,
      authTestData.invalidLoginPassword
    );

    await loginPage.expectAuthenticationRejected();
  });
});