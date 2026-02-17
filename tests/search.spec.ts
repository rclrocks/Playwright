

import { test, expect } from '@playwright/test';
import { title } from 'process';

test('Click Search', async ({ page }) => {
  await page.goto('https://github.com/');

  // Expect a title "to contain" a substring.
await page.getByRole('button', { name: 'Search or jump to…' }).click();
await page.getByRole('combobox', { name: 'Search' }).fill('ed');
await page.getByRole('combobox', { name: 'Search' }).press('Enter');
const link = page.getByRole('link', { name: /microsoft\/playwright/i });

  await expect(link).toBeVisible();
  await expect(link).toBeEnabled();
  await expect(link).toHaveAttribute('href', '/microsoft/playwright');

  await link.click();
});