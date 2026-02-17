import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import { KleenheatSavingsCalculatorPage } from '../pages/KleenheatSavingsCalculatorPage';

test.describe('Kleenheat Savings Calculator - Address Selection', () => {
  test.setTimeout(60000); // Increase timeout to 60 seconds
  
  let calculatorPage: KleenheatSavingsCalculatorPage;

  test.beforeEach(async ({ page }) => {
    calculatorPage = new KleenheatSavingsCalculatorPage(page);
    await calculatorPage.goto();
  });

  // Load addresses: prefer env var ADDRESS (single), otherwise read data/addresses.json
  const envAddress = process.env.ADDRESS;
  let addresses: string[] = [];
  if (envAddress && envAddress.trim().length > 0) {
    addresses = [envAddress.trim()];
  } else {
    try {
      const dataPath = path.join(__dirname, '..', 'data', 'addresses.json');
      const file = fs.readFileSync(dataPath, 'utf8');
      addresses = JSON.parse(file) as string[];
    } catch (e) {
      // fallback to the single hardcoded address
      addresses = ['1/435b riverton drive east, shelley, 6148'];
    }
  }

  for (const addr of addresses) {
    test(`should select address and verify confirmation for: ${addr}`, async ({ page }) => {
      // Act - Select address with mouse event (handles navigation)
      await calculatorPage.selectAddressWithMouseEvent(addr);

      // Locator for the message: h1 containing "Great news"
      const messageLocator = page.locator('h1:has-text("Great news")');
      await messageLocator.waitFor({ state: 'visible', timeout: 15000 });

      // Normalize whitespace for robust comparison
      const actualMessage = (await messageLocator.textContent()) ?? '';
      const normalized = actualMessage.replace(/\s+/g, ' ').trim();

      console.log('Message found:', normalized);
      expect(normalized).toContain('Great news');
      expect(normalized).toContain('We provide services');
      expect(normalized).toContain('in your area');
    });
  }

    
});
