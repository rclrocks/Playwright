import { test, expect } from '@playwright/test';

/**
 * Best Practices Example Tests
 * 
 * This file demonstrates recommended patterns for Playwright automation
 */

// ✅ BEST PRACTICE: Use descriptive test names
test.describe('GitHub Homepage', () => {
  // ✅ BEST PRACTICE: Use test.beforeEach for common setup
  test.beforeEach(async ({ page }) => {
    // Common setup for all tests in this group
    await page.goto('https://github.com');
  });

  test('should display the GitHub logo', async ({ page }) => {
    // ✅ Use getByRole (most recommended locator type)
    const logo = page.getByRole('link', { name: 'Homepage' });
    await expect(logo).toBeVisible();
  });

  test('should have search field accessible', async ({ page }) => {
    // ✅ Use getByPlaceholder for input fields
    const searchInput = page.getByPlaceholder('Search GitHub');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEditable();
  });

  test('should navigate to sign in page', async ({ page }) => {
    // ✅ Chain operations with proper awaits
    await page.getByRole('link', { name: 'Sign in' }).click();
    
    // ✅ Use smart waits - no hardcoded delays
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });
});

// ✅ BEST PRACTICE: Use test.describe for logical grouping
test.describe('Search Functionality', () => {
  test('should search and display results', async ({ page }) => {
    await page.goto('https://github.com');
    
    // ✅ Find by role vs generic selectors
    const searchField = page.getByPlaceholder('Search GitHub');
    await searchField.fill('playwright');
    await searchField.press('Enter');
    
    // ✅ Wait for results intelligently
    await expect(page.getByRole('heading', { name: /search results/i })).toBeVisible({ timeout: 10000 });
  });
});

// ✅ BEST PRACTICE: Test a complete user flow
test('Complete user journey', async ({ page }) => {
  await page.goto('https://github.com');
  
  // Step 1: Search
  await page.getByPlaceholder('Search GitHub').fill('playwright');
  await page.getByPlaceholder('Search GitHub').press('Enter');
  
  // Step 2: Verify search results loaded
  await page.waitForLoadState('networkidle');
  const results = page.getByRole('link').first();
  await expect(results).toBeVisible();
  
  // Step 3: Navigate to first result
  await results.click();
  
  // Step 4: Verify we're on a repository page
  await page.waitForLoadState('networkidle');
  const starButton = page.getByRole('button', { name: /star/i });
  await expect(starButton).toBeVisible();
});

// ✅ BEST PRACTICE: Use soft assertions to continue on error
test('soft assertions example', async ({ page }) => {
  await page.goto('https://github.com');
  
  // These will all run even if one fails
  await expect.soft(page).toHaveTitle(/GitHub/);
  await expect.soft(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  await expect.soft(page.getByPlaceholder('Search GitHub')).toBeVisible();
});

// ✅ BEST PRACTICE: Extract complex locators into variables
test('readable test with extract locators', async ({ page }) => {
  await page.goto('https://github.com');
  
  const signInLink = page.getByRole('link', { name: 'Sign in' });
  const searchField = page.getByPlaceholder('Search GitHub');
  const profileButton = page.getByRole('button', { name: /profile/i });
  
  // Now test uses meaningful variable names
  await expect(signInLink).toBeVisible();
  await expect(searchField).toBeEditable();
});
