export class HomePage {
  constructor(page) {
    this.page = page;
    this.trialLink = page.getByRole('link', {
      name: /start free trial|free trial|免費試用/i
    }).first();
  }

  async open() {
    await this.page.goto('/');
  }

  async startFreeTrial() {
    await this.trialLink.click();
  }
}