import { expect } from '@playwright/test';
import { appUrls } from '../utils/authUrls.js';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: /email or username/i });
    this.continueButton = page.getByRole('button', { name: /^continue$/i });
    this.passwordInput = page.getByRole('textbox', { name: /^password$/i });
    this.signInButton = page.getByRole('button', { name: /^sign in$/i });
  }

  async open() {
    await this.page.goto(appUrls.login);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/sso\.sleekflow\.io\/u\/login/i);
    await expect(this.page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(this.emailInput).toBeVisible();
  }

  async submitCredentials(email, password) {
    await this.emailInput.fill(email);
    await this.continueButton.click();
    await expect(this.passwordInput).toBeVisible();
    await this.passwordInput.fill(password);
    await expect(this.signInButton).toBeEnabled();
    await this.signInButton.click();
  }

  async expectAuthenticationRejected() {
    await expect(this.page).toHaveURL(/sso\.sleekflow\.io\/u\/login/i);
    await expect(this.page.getByRole('heading', { name: /sign in to continue/i })).toBeVisible();
  }
}