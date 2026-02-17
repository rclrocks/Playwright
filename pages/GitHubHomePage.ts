import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for GitHub
 * 
 * This class encapsulates all interactions with the GitHub homepage
 * Benefits:
 * - Centralized locators (easier to maintain)
 * - Reusable methods across tests
 * - Clear API for test authors
 */
export class GitHubHomePage {
  private readonly page: Page;

  // Define locators as getters for easy access and maintenance
  private get signInLink() {
    return this.page.getByRole('link', { name: 'Sign in' });
  }

  private get searchField() {
    return this.page.getByRole('button', { name: 'Search or jump to…' })
     // await page.goto('await page.('button', { name: 'Search or jump to…' }).click();
   // await page.getByRole('combobox', { name: 'Search' }).fill('playwright');
    //await page.getByRole('combobox', { name: 'Search' }).press('Enter');');
  }

  private get signUpLink() {
    return this.page.getByRole('link', { name: 'Sign up' });
  }

  private get logo() {
    return this.page.getByRole('link', { name: 'Homepage' });
  }

  private get notificationsBell() {
    return this.page.getByRole('button', { name: /notifications/i });
  }

  private get createMenu() {
    return this.page.getByRole('button', { name: /create/i });
  }

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to GitHub homepage
   */
  async goto() {
    await this.page.goto('https://github.com');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click the sign in link
   */
  async clickSignIn() {
    await this.signInLink.click();
  }

  /**
   * Click the sign up link
   */
  async clickSignUp() {
    await this.signUpLink.click();
  }

  /**
   * Search for a keyword on GitHub
   */
  async search(keyword: string) {
    await this.searchField.click();
    await this.searchField.fill(keyword);
    await this.searchField.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify sign in link is visible
   */
  async isSignInLinkVisible() {
    return await this.signInLink.isVisible();
  }

  /**
   * Verify search field is editable
   */
  async isSearchFieldEditable() {
    return await this.searchField.isEditable();
  }
  /**
   * Expectation helper: assert search field is editable
   */
  async expectSearchFieldEditable() {
    await expect(this.searchField).toBeEditable();
  }
  /**
   * Expectation helper: assert sign in link is visible
   */
  async expectSignInVisible() {
    await expect(this.signInLink).toBeVisible();
  }
  /**
   * Verify search field is editable
   */
  async isSearchFieldVisible() {
    return await this.searchField.isVisible();
  }
  /**
   * Get the current URL
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getPageTitle() {
    return await this.page.title();
  }

  /**
   * Wait for search results to load
   */
  async waitForSearchResults() {
    await this.page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 }).catch(() => {
      // If no test ID, just wait for network idle
      return this.page.waitForLoadState('networkidle');
    });
  }

  /**
   * Get count of search results displayed
   */
  async getSearchResultCount() {
    const results = this.page.locator('[data-testid="repository-list-item"]');
    return await results.count();
  }
}
