import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  
});
test('click github star', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  
  // Click the GitHub star button using the exact aria-label
  await page.getByLabel('Star microsoft/playwright on GitHub').click();
});

test('click on microsoft/playwright github link', async ({ page }) => {
  await page.goto('https://github.com/microsoft/playwright');

  // Verify the microsoft/playwright link is available and click the first one
  const repoLink = page.locator('a[href="/microsoft/playwright"]').first();
  await expect(repoLink).toBeVisible();

  // Click on microsoft/playwright link
  await repoLink.click();

  // Verify we're on the correct repository page
  await expect(page).toHaveURL('https://github.com/microsoft/playwright');
});