# Playwright Automation - Complete Learning Guide

## 📋 Project Overview

Your current Playwright setup includes:
- **Configuration**: `playwright.config.ts` - Defines test settings and browser configurations
- **Tests**: `tests/example.spec.ts` - Contains test cases
- **Dependencies**: `@playwright/test` - Playwright testing framework

## 🏗️ Understanding Your Project Structure

### Configuration File (playwright.config.ts)

```typescript
// Key settings:
testDir: './tests'              // Where tests are located
fullyParallel: true             // Run tests in parallel
reporter: 'html'                // Generate HTML reports
trace: 'on-first-retry'        // Record traces for debugging failed tests
```

Your config tests 3 browsers by default:
- **Chromium**: Chrome/Edge-based browser
- **Firefox**: Mozilla Firefox
- **WebKit**: Safari-based browser

This means each test runs on 3 browsers automatically (6 tests total from 2 test cases).

## ✅ Basic Test Structure

### Anatomy of a Test

```typescript
import { test, expect } from '@playwright/test';

test('test name', async ({ page }) => {
  // Setup - navigate to URL
  await page.goto('https://example.com');
  
  // Action - interact with page
  await page.click('button');
  
  // Assertion - verify behavior
  await expect(page).toHaveTitle('Expected Title');
});
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `test()` | Defines a test case |
| `page` | Main API object to interact with browser |
| `await` | Wait for async operations to complete |
| `expect()` | Assertions to verify test results |

## 🎯 Best Practices for Playwright Automation

### 1. **Use Locators (Best Practice)**

❌ **Avoid - XPath/CSS that's brittle:**
```typescript
await page.click("xpath=//button[contains(text(), 'Submit')]");
```

✅ **Use Locators - More maintainable:**
```typescript
// By role (most recommended)
await page.getByRole('button', { name: 'Submit' }).click();

// By placeholder
await page.getByPlaceholder('Email').fill('user@example.com');

// By label
await page.getByLabel('Username').fill('john');

// By test ID
await page.getByTestId('login-button').click();
```

### 2. **Use Proper Waits**

❌ **Avoid - Hard waits (slow and unreliable):**
```typescript
await page.waitForTimeout(5000); // Bad - always waits 5 seconds
```

✅ **Use Smart Waits (auto-wait, fast):**
```typescript
// Auto-waits for element to be visible and enabled
await page.getByRole('button', { name: 'Submit' }).click();

// Explicit wait for condition
await expect(page.getByText('Success')).toBeVisible();
```

### 3. **Organize Tests with Fixtures**

Create reusable fixtures for setup/teardown:

```typescript
// conftest or setup file
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Setup - login before test
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Use the fixture
    await use(page);
    
    // Teardown - cleanup after test
    await page.close();
  },
});
```

### 4. **Page Object Model (POM) - For Maintainability**

Create page classes for reusable UI interactions:

```typescript
// pages/LoginPage.ts
import { Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('http://localhost:3000/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async isErrorDisplayed() {
    return await this.page.getByText('Invalid credentials').isVisible();
  }
}

// tests/login.spec.ts
import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('should show error with invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'wrong-password');
  await expect(loginPage.isErrorDisplayed()).toBeTruthy();
});
```

### 5. **Data-Driven Testing (Parameterized Tests)**

```typescript
import { test } from '@playwright/test';

const credentials = [
  { email: 'user1@example.com', password: 'pass1' },
  { email: 'user2@example.com', password: 'pass2' },
  { email: 'user3@example.com', password: 'pass3' },
];

credentials.forEach(({ email, password }) => {
  test(`login with ${email}`, async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### 6. **Running Tests Effectively**

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/login.spec.ts

# Run tests matching a name pattern
npx playwright test --grep "login"

# Run in UI mode (interactive debugging)
npx playwright test --ui

# Run on specific browser
npx playwright test --project=chromium

# Debug with inspector
npx playwright test --debug

# View HTML report
npx playwright show-report
```

## 🔍 Common Assertions

```typescript
// Text assertions
await expect(page).toHaveTitle('My App');
await expect(page).toHaveURL('http://localhost:3000/dashboard');

// Element visibility
await expect(page.getByText('Welcome')).toBeVisible();
await expect(page.getByRole('button')).toBeEnabled();

// Input values
await expect(page.getByLabel('Email')).toHaveValue('user@example.com');

// Element count
await expect(page.getByRole('listitem')).toHaveCount(3);

// Attribute values
await expect(page.getByRole('link')).toHaveAttribute('href', '/home');
```

## 🛠️ Debugging Tips

1. **Use pause()** - Stop execution and inspect:
   ```typescript
   await page.pause(); // Opens interactive debugger
   ```

2. **Take screenshots**:
   ```typescript
   await page.screenshot({ path: 'screenshot.png' });
   ```

3. **View traces** - Recorded in `trace` folder, open with:
   ```bash
   npx playwright show-trace trace.zip
   ```

4. **Use --ui flag** - Visual test debugging:
   ```bash
   npx playwright test --ui
   ```

## 📊 Configuration Tips

### Set Base URL in Config

Edit `playwright.config.ts`:
```typescript
export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

Then use relative URLs in tests:
```typescript
await page.goto('/login'); // Goes to http://localhost:3000/login
```

### Add Test Timeouts

```typescript
export default defineConfig({
  timeout: 30 * 1000,        // 30 seconds per test
  expect: { timeout: 5000 }, // 5 seconds for assertions
});
```

## 🚀 Next Steps

1. **Create your first test** - Pick a website and write tests for key user flows
2. **Use Page Object Model** - For better code organization
3. **Set up CI/CD** - Run tests in GitHub Actions or other CI tools
4. **Add API testing** - Use `request` fixture for API automation
5. **Enable Test Reports** - Track test trends over time

## 📚 Useful Resources

- [Playwright Official Docs](https://playwright.dev)
- [Test Configuration Guide](https://playwright.dev/docs/test-configuration)
- [Locator Best Practices](https://playwright.dev/docs/locators)
- [Community Forum](https://github.com/microsoft/playwright/discussions)
