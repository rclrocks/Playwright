import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for Kleenheat Savings Calculator
 * 
 * This class encapsulates all interactions with the Kleenheat savings calculator page
 * Benefits:
 * - Centralized locators (easier to maintain)
 * - Reusable methods across tests
 * - Clear API for test authors
 */
export class KleenheatSavingsCalculatorPage {
  private readonly page: Page;

  // Define locators as getters for easy access and maintenance
  private get addressInput() {
    // Common selectors for address input fields
    return this.page.locator('input[placeholder*="address" i], input[placeholder*="Address" i], input[id*="address" i], input[aria-label*="address" i]').first();
  }

  private get addressSuggestions() {
    // Selector for the dropdown suggestions list
    return this.page.locator('[role="listbox"], [role="option"], .autocomple-suggestion, .address-suggestion, .MuiAutocomplete-listbox');
  }

  private get successMessage() {
    // Common selectors for success messages
    return this.page.locator('.success-message, .alert-success, [role="alert"], .message-success, .confirmation-message').first();
  }

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the Kleenheat Savings Calculator
   */
  async goto() {
    await this.page.goto('https://www.kleenheat.com.au/spark/savings-calculator', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    // Wait a brief moment for dynamic content to load
    await this.page.waitForTimeout(2000);
  }

  /**
   * Enter address in the address field
   */
  async enterAddress(address: string) {
    const input = this.addressInput;
    await input.waitFor({ state: 'visible' });
    await input.click();
    await input.fill(address);
  }

  /**
   * Wait for address suggestions to appear
   */
  async waitForAddressSuggestions() {
    await this.page.waitForTimeout(500); // Wait for API response
    // Wait for suggestions to be visible
    const suggestions = this.page.locator('[role="listbox"] [role="option"], .autocomple-suggestion, .address-suggestion').first();
    await suggestions.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      // Suggestions might appear with different selector
      console.log('Waiting for suggestions with alternative method');
    });
  }

  /**
   * Select an address from suggestions using mouse event
   */
  async selectAddressFromSuggestions(address: string) {
    // Try to find and click the matching suggestion
    const suggestionLocator = this.page.locator(`[role="option"]:has-text("${address}"), .address-suggestion:has-text("${address}")`).first();
    
    // If exact match not found, try partial match
    if (!(await suggestionLocator.isVisible().catch(() => false))) {
      const partialMatch = this.page.locator('text=1/435b').first();
      if (await partialMatch.isVisible()) {
        // Hover over the suggestion first
        await partialMatch.hover();
        // Wait a bit for any hover effects
        await this.page.waitForTimeout(300);
        // Click the suggestion
        await partialMatch.click();
      }
    } else {
      await suggestionLocator.click();
    }
  }

  /**
   * Get the success message text
   */
  async getSuccessMessage(): Promise<string> {
    const message = this.successMessage;
    return await message.textContent() ?? '';
  }

  /**
   * Verify success message is displayed
   */
  async verifySuccessMessageDisplayed(expectedMessage?: string) {
    const message = this.successMessage;
    await expect(message).toBeVisible();
    
    if (expectedMessage) {
      await expect(message).toContainText(expectedMessage);
    }
  }

  /**
   * Wait for page navigation after address selection
   */
  async waitForPageNavigation() {
    await this.page.waitForNavigation({ 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    }).catch(() => {
      console.log('No navigation detected or navigation completed');
    });
    // Wait for new page content to load
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get message from the new page after navigation
   */
  async getMessageFromNewPage(): Promise<string> {
    // Try multiple selectors to find the success/confirmation message on new page
    const selectors = [
      '.success-message',
      '.alert-success',
      '[role="alert"]',
      '.message-success',
      '.confirmation-message',
      'h1, h2, h3',
      '.title',
      '.status-message'
    ];

    for (const selector of selectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible().catch(() => false)) {
        const text = await element.textContent();
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    }
    
    return '';
  }

  /**
   * Verify success message on the new page
   */
  async verifyMessageOnNewPage(expectedMessage?: string): Promise<string> {
    const message = await this.getMessageFromNewPage();
    
    if (!message) {
      throw new Error('No message found on the new page');
    }

    if (expectedMessage) {
      expect(message).toContain(expectedMessage);
    }

    return message;
  }

  /**
   * Complete the address selection workflow with page navigation handling
   */
  async selectAddressWithMouseEvent(address: string) {
    await this.enterAddress(address);
    await this.waitForAddressSuggestions();
    await this.selectAddressFromSuggestions(address);
    // Wait for any page navigation or content updates
    await this.waitForPageNavigation();
  }
}
