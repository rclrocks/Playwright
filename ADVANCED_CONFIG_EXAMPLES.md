/**
 * Advanced Playwright Configuration Examples
 * 
 * This file demonstrates best practices for playwright.config.ts
 * You can copy patterns from here into your actual config file
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * EXAMPLE 1: Basic Production-Ready Config
 */
export const basicConfig = defineConfig({
  // Test discovery
  testDir: './tests',
  testMatch: '**/*.spec.ts', // Only run .spec.ts files
  testIgnore: '**/*smoke.spec.ts', // Ignore specific patterns

  // Execution
  fullyParallel: true, // Run all tests in parallel
  workers: process.env.CI ? 1 : undefined, // Limit workers in CI
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  timeout: 30 * 1000, // 30 seconds per test
  expect: { timeout: 5 * 1000 }, // 5 seconds for assertions

  // Reporting
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }],
  ],

  // Debugging
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry', // Only trace failed tests
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Projects (multiple browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Global setup/teardown (useful for DB migration, server startup)
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
});

/**
 * EXAMPLE 2: Environment-Specific Config
 */
export const envSpecificConfig = defineConfig({
  use: {
    baseURL:
      process.env.ENV === 'production'
        ? 'https://github.com'
        : 'http://localhost:3000',

    trace:
      process.env.ENV === 'production'
        ? 'on-first-retry'
        : 'on', // More verbose tracing in dev

    headless:
      process.env.HEADLESS !== 'false', // --headed flag support
  },

  timeout: process.env.ENV === 'production' ? 60 * 1000 : 30 * 1000,
});

/**
 * EXAMPLE 3: Device-Specific Testing
 */
export const deviceConfig = defineConfig({
  projects: [
    // Desktop browsers
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet browsers
    {
      name: 'iPad',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],
});

/**
 * EXAMPLE 4: Filtered Test Execution
 */
export const filteredConfig = defineConfig({
  projects: [
    {
      name: 'smoke',
      testMatch: '**/*smoke*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'regression',
      testIgnore: '**/*smoke*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

/**
 * EXAMPLE 5: Reporter Configuration
 */
export const reporterConfig = defineConfig({
  reporter: [
    // HTML report - interactive
    ['html', { outputFolder: 'playwright-report' }],

    // JSON - machine readable
    ['json', { outputFile: 'results.json' }],

    // JUnit - CI/CD integration
    ['junit', { outputFile: 'results.xml' }],

    // Console - terminal output
    ['list'],

    // GitHub Actions integration
    ...(process.env.CI ? [['github']] : []),
  ],
});

/**
 * EXAMPLE 6: With Global Setup/Teardown
 * 
 * Create global-setup.ts:
 * ```typescript
 * import { chromium, FullConfig } from '@playwright/test';
 *
 * async function globalSetup(config: FullConfig) {
 *   // Start server, create database, etc.
 *   console.log('🚀 Starting test environment...');
 *   process.env.SERVER_URL = 'http://localhost:3000';
 * }
 *
 * export default globalSetup;
 * ```
 */
export const withGlobalSetupConfig = defineConfig({
  globalSetup: './test-setup',
  globalTeardown: './test-teardown',
  use: {
    baseURL: process.env.SERVER_URL,
  },
});

/**
 * EXAMPLE 7: Parameterized Browsers
 */
export const parameterizedBrowsersConfig = defineConfig({
  projects: [
    // Standard desktop
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        // Single-run trace for debugging
        trace: 'trace',
      },
    },

    // Chrome with high DPI
    {
      name: 'chrome-hidpi',
      use: {
        ...devices['Desktop Chrome'],
        deviceScaleFactor: 2,
      },
    },

    // Chrome with slow network simulation
    {
      name: 'chrome-slow-4g',
      use: {
        ...devices['Desktop Chrome'],
        // @ts-ignore
        extraHTTPHeaders: {},
      },
    },
  ],
});

/**
 * KEY CONFIGURATION PATTERNS
 */

const keyPatterns = {
  // Pattern 1: Use environment variables
  baseURL: process.env.BASE_URL || 'http://localhost:3000',

  // Pattern 2: Conditional timeouts
  timeout: process.env.CI ? 60000 : 30000,

  // Pattern 3: Conditional retries
  retries: process.env.CI ? 2 : 0,

  // Pattern 4: Workers based on environment
  workers: process.env.CI ? 1 : undefined,

  // Pattern 5: Conditional screenshots
  screenshot: process.env.CI ? 'only-on-failure' : 'off',

  // Pattern 6: Conditional traces
  trace: process.env.DEBUG ? 'on' : 'on-first-retry',
};

/**
 * CLI FLAGS REFERENCE
 * 
 * npx playwright test               # Run all tests
 * npx playwright test --headed       # Show browser window
 * npx playwright test --debug        # Open debugger
 * npx playwright test --ui           # UI mode (interactive)
 * npx playwright test --trace on     # Enable tracing
 * npx playwright test --headed --grep "login"  # Run tests matching pattern
 * npx playwright test --project=chromium      # Run specific browser only
 * 
 * Environment Variables:
 * CI=true npx playwright test       # Runs with CI settings
 * DEBUG=pw:api npx playwright test  # Detailed logging
 * PWDEBUG=1 npx playwright test     # Pause before each action
 */
