import { test, expect } from '@playwright/test';
import { GitHubHomePage } from '../pages/GitHubHomePage';

/**
 * Tests using Page Object Model
 * 
 * Benefits of POM:
 * - Tests are more readable and maintainable
 * - Changes to UI only need to be updated in the Page class
 * - Easier to reuse page methods across multiple tests
 * - Clear separation between test logic and page interactions
 */

test.describe('GitHub Homepage - Using Page Object Model', () => {
  let homePage: GitHubHomePage;

  test.beforeEach(async ({ page }) => {
    // Initialize the page object before each test
    homePage = new GitHubHomePage(page);
    await homePage.goto();
  });

  test('should display sign in link on homepage', async () => {
    // ✅ MUCH CLEANER: No complex selectors in tests
    // If the sign in link locator changes, update it only in GitHubHomePage.ts
    const isSignInVisible = await homePage.isSignInLinkVisible();
      await homePage.expectSignInVisible();
  });

  test('should have searchable field', async () => {
    // ✅ CLEAR INTENT: What does this test do?
    const isSearchVisible = await homePage.isSearchFieldVisible();
      await homePage.isSearchFieldVisible();
  });

  test('should navigate to sign in page when clicking sign in', async ({ page }) => {
    // ✅ REUSABLE: This action is encapsulated and can be reused
    await homePage.clickSignIn();
    
    // Verify navigation (not part of HomePage, as it's testing new page)
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should search and display results', async () => {
    // ✅ SIMPLE & READABLE: Intent is crystal clear
    await homePage.search('playwright');
    
    // Verify results loaded
    await homePage.waitForSearchResults();
    const resultCount = await homePage.getSearchResultCount();
    expect(resultCount).toBeGreaterThan(0);
  });

  test('should track page title', async () => {
    // ✅ MAINTAINABLE: All page interactions go through HomePage class
    const title = await homePage.getPageTitle();
    expect(title).toContain('GitHub');
  });

  test('multiple searches in sequence', async () => {
    // ✅ REUSABLE METHODS: Easy to test complex user flows
    
    // First search
    await homePage.search('javascript');
    let resultCount = await homePage.getSearchResultCount();
    expect(resultCount).toBeGreaterThan(0);
    
    // Second search
    await homePage.search('python');
    resultCount = await homePage.getSearchResultCount();
    expect(resultCount).toBeGreaterThan(0);
  });
});
