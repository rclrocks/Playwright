import { test, expect } from '@playwright/test';
import { KleenheatSavingsCalculatorPage } from '../pages/KleenheatSavingsCalculatorPage';

test.describe('Kleenheat Savings Calculator - Address Selection', () => {
  test.setTimeout(60000); // Increase timeout to 60 seconds
  
  let calculatorPage: KleenheatSavingsCalculatorPage;

  test.beforeEach(async ({ page }) => {
    calculatorPage = new KleenheatSavingsCalculatorPage(page);
    await calculatorPage.goto();
  });

  test('should select address and display confirmation message on new page', async ({ page }) => {
    // Arrange
    const testAddress = '1/435b riverton drive east, shelley, 6148';

    // Act - Select address with mouse event (this will handle page navigation)
    await calculatorPage.selectAddressWithMouseEvent(testAddress);

    // Assert - Verify success message is displayed on the new page
    try {
      // Locator for the message: h1 with the specific text
      const messageLocator = page.locator('h1:has-text("Great news")');
      
      // Wait for the message to be visible
      await messageLocator.waitFor({ state: 'visible', timeout: 10000 });
      
      // Get the message text and normalize whitespace (remove extra newlines/spaces)
      const actualMessage = await messageLocator.textContent();
      const normalizedMessage = actualMessage?.replace(/\s+/g, ' ').trim() ?? '';
      
      console.log('✓ Message found:', normalizedMessage);
      
      // Verify the message contains the expected parts
      expect(normalizedMessage).toContain('Great news!');
      expect(normalizedMessage).toContain('We provide services');
      expect(normalizedMessage).toContain('in your area');
      
      console.log('✓ Address successfully selected and correct confirmation message displayed');
      
    } catch (error) {
      // If the message doesn't appear, check page content
      console.log('Page content after selection:');
      console.log('Current URL:', page.url());
      const bodyText = await page.locator('body').textContent();
      console.log(bodyText?.substring(0, 500));
      throw error;
    }
  });

    
});
