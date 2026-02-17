import { test as base, expect } from '@playwright/test';
import { Page } from '@playwright/test';

/**
 * Custom Fixtures Example
 * 
 * Fixtures are powerful for:
 * - Common setup/teardown across tests
 * - Dependency injection
 * - Reusable test utilities
 * 
 * This file demonstrates custom fixtures for different scenarios
 */

// ============================================================================
// FIXTURE 1: GitHub Auth Fixture (for authenticated tests)
// ============================================================================

interface AuthFixtures {
  authenticatedPage: Page;
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // SETUP: Prepare authenticated session
    console.log('📝 Setting up authenticated session...');
    
    // Navigate to GitHub
    await page.goto('https://github.com/login');
    
    // In a real scenario, you would:
    // 1. Store authentication tokens in env variables
    // 2. Set cookies/storage directly to avoid UI login
    // 3. Or use page.addInitScript to inject auth tokens
    
    // Example of setting auth via storage:
    // await page.context().addCookies([
    //   {
    //     name: 'auth_token',
    //     value: process.env.GITHUB_AUTH_TOKEN,
    //     url: 'https://github.com',
    //   }
    // ]);
    
    // For demo, just navigate to homepage
  
    
    // USE: Pass the authenticated page to test
    await use(page);
    
    // TEARDOWN: Cleanup after test
    console.log('🧹 Cleaning up authenticated session...');
    // Could log out, clear cookies, etc.
  },
});

// ============================================================================
// FIXTURE 2: Page with Intercepted Requests
// ============================================================================

interface MockFixtures {
  pageWithMocks: Page;
}

export const testWithMocks = base.extend<MockFixtures>({
  pageWithMocks: async ({ page }, use) => {
    // SETUP: Setup request/response mocking
    console.log('📡 Setting up mock interceptors...');
    
    // Mock API responses
    await page.route('**/api/search', (route) => {
      route.abort(); // Block real API calls
    });
    
    // Mock specific endpoints
    await page.route('**/repos/**', (route) => {
      route.continue(); // Allow repo routes through
    });
    
    // USE: Pass mocked page to test
    await use(page);
    
    // TEARDOWN: Clear mocks
    console.log('🧹 Clearing mocks...');
    await page.unroute('**/api/search');
    await page.unroute('**/repos/**');
  },
});

// ============================================================================
// FIXTURE 3: Page with Performance Tracing
// ============================================================================

interface PerformanceFixtures {
  tracedPage: Page;
}

export const testWithTracing = base.extend<PerformanceFixtures>({
  tracedPage: async ({ page }, use) => {
    // SETUP: Start tracing
    await page.context().tracing.start({ screenshots: true, snapshots: true });
    
    // USE: Pass page to test
    await use(page);
    
    // TEARDOWN: Stop tracing and save
    await page.context().tracing.stop({ path: 'trace.zip' });
  },
});

// ============================================================================
// USAGE EXAMPLES OF FIXTURES
// ============================================================================

// Using the authenticated page fixture
test('user profile page should display username', async ({ authenticatedPage: page }) => {
  // Page is already authenticated
  await page.goto('https://github.com/settings/profile');
  
  const profileSection = page.getByRole('heading', { name: 'Profile' });
  await expect(profileSection).toBeVisible();
});

// Using custom combined fixtures
test('test with mocks and tracing', async ({ pageWithMocks: page }) => {
  // This page has mocked API responses and is being traced
  await page.goto('https://github.com');
  
  const logo = page.getByRole('link', { name: 'Homepage' });
  await expect(logo).toBeVisible();
});

// ============================================================================
// FIXTURE: Custom Page Object with Setup
// ============================================================================

class AuthenticatedGitHubUser {
  constructor(public page: Page, public username: string) {}

  async goToDashboard() {
    await this.page.goto('https://github.com/dashboard');
  }

  async goToSettings() {
    await this.page.goto('https://github.com/settings');
  }

  async logout() {
    await this.page.goto('https://github.com/logout');
  }
}

interface UserFixtures {
  githubUser: AuthenticatedGitHubUser;
}

export const testAsUser = base.extend<UserFixtures>({
  githubUser: async ({ page }, use) => {
    // Setup: Authenticate
    const user = new AuthenticatedGitHubUser(page, 'testuser');
    
    // Initialize user (in real scenario, would log in)
    await page.goto('https://github.com');
    
    // Use
    await use(user);
    
    // Teardown: Logout
    try {
      await user.logout();
    } catch {
      // Already logged out
    }
  },
});

// Usage
test('user can access dashboard', async ({ githubUser }) => {
  // User is already authenticated
  await githubUser.goToDashboard();
  
  const heading = githubUser.page.getByRole('heading');
  await expect(heading).toBeVisible();
});

// ============================================================================
// FIXTURE: Environment-based Configuration
// ============================================================================

interface ConfigFixtures {
  baseUrl: string;
  apiUrl: string;
}

export const testWithConfig = base.extend<ConfigFixtures>({
  baseUrl: ({ }, use) => {
    const url = process.env.BASE_URL || 'https://github.com';
    return use(url);
  },

  apiUrl: ({ }, use) => {
    const url = process.env.API_URL || 'https://api.github.com';
    return use(url);
  },
});

// Usage
test('navigate to configured base URL', async ({ page, baseUrl }) => {
  await page.goto(baseUrl);
  await expect(page).toHaveURL(baseUrl);
});
