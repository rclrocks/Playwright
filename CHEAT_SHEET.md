# Playwright Automation - Quick Reference Cheat Sheet

## 🎯 Core Test Structure

```typescript
import { test, expect } from '@playwright/test';

// Define a test
test('descriptive test name', async ({ page }) => {
  // Arrange
  await page.goto('https://example.com');
  
  // Act
  await page.getByRole('button', { name: 'Click me' }).click();
  
  // Assert
  await expect(page).toHaveTitle('Expected Title');
});

// Grouped tests
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('https://example.com');
  });

  test('first test', async ({ page }) => { });
  test('second test', async ({ page }) => { });
});
```

## 🔍 Locator Strategies (in order of preference)

```typescript
// 1️⃣ BY ROLE (BEST) - Most reliable
page.getByRole('button', { name: 'Submit' })
page.getByRole('link', { name: 'Home' })
page.getByRole('heading', { name: 'Title' })

// 2️⃣ BY LABEL/PLACEHOLDER - For forms
page.getByLabel('Username')
page.getByPlaceholder('Enter email')

// 3️⃣ BY TEXT - For generic content
page.getByText('Welcome')
page.getByText('Log in', { exact: true })

// 4️⃣ BY TEST ID - For custom attributes
page.getByTestId('user-profile')
// HTML: <div data-testid="user-profile"></div>

// 5️⃣ LOCATOR - For complex cases
page.locator('css=.button-class')
page.locator('xpath=//div[@class="button"]')

// Generic selectors (avoid if possible)
page.click('button')
page.fill('input', 'text')
```

## ⌨️ Common Actions

```typescript
// Navigation
await page.goto('https://example.com')
await page.goBack()
await page.goForward()
await page.reload()

// Interactions
await page.click('button')
await page.fill('input', 'text')
await page.check('input[type="checkbox"]')
await page.select('select', 'value')
await page.press('input', 'Enter')
await page.type('input', 'text', { delay: 100 }) // Slow typing

// Advanced
await page.hover('button')
await page.focus('input')
await page.screenshot({ path: 'screenshot.png' })
await page.pause() // Opens debugger
```

## ✅ Common Assertions

```typescript
// Page assertions
await expect(page).toHaveTitle('Expected Title')
await expect(page).toHaveURL('https://example.com')

// Element visibility
await expect(page.getByText('Welcome')).toBeVisible()
await expect(page.getByRole('button')).toBeHidden()

// Element state
await expect(page.getByRole('button')).toBeEnabled()
await expect(page.getByRole('button')).toBeDisabled()
await expect(page.getByRole('button')).toBeEditable()

// Element value/content
await expect(page.getByLabel('Email'))
  .toHaveValue('user@example.com')
await expect(page.getByRole('heading'))
  .toHaveText('Welcome User')

// Count
await expect(page.getByRole('listitem')).toHaveCount(5)

// Attributes
await expect(page.getByRole('link'))
  .toHaveAttribute('href', '/home')

// Contains text
await expect(page.getByRole('status'))
  .toContainText('Error')

// Soft assertions (don't fail test)
await expect.soft(page.getByText('Text1')).toBeVisible()
await expect.soft(page.getByText('Text2')).toBeVisible()
```

## 🛠️ Test Organization

```typescript
// Skip a test
test.skip('test name', async ({ page }) => {
  // This test won't run
});

// Run only this test (don't commit!)
test.only('test name', async ({ page }) => {
  // Only this test runs
});

// Conditional skip
test.skip(process.env.SKIP_EXPENSIVE, 'expensive test', async ({ page }) => {
  // Complex test
});

// Retry specific test
test.retries(3); // Retry up to 3 times
```

## 🔗 Page Navigation Methods

```typescript
// Check current URL
console.log(page.url())
await expect(page).toHaveURL('https://example.com')

// Get page title
console.log(await page.title())

// Get text content
const text = await page.getByText('Welcome').textContent()

// Get attribute value
const href = await page.getByRole('link').getAttribute('href')

// Count elements
const count = await page.getByRole('listitem').count()

// Get all text
const allText = await page.getByRole('main').allTextContents()

// Get all visible
const visible = await page.getByRole('button').all()
```

## ⏱️ Waiting & Conditions

```typescript
// Auto-wait (recommended - built into most actions)
await page.getByRole('button').click()  // Waits for element

// Explicit waits for specific conditions
await expect(page.getByText('Loaded')).toBeVisible({ timeout: 10000 })

// Wait for specific state
await page.waitForLoadState('networkidle')
await page.waitForLoadState('domcontentloaded')

// Wait for element
await page.waitForSelector('.loaded', { timeout: 5000 })

// Wait for function
await page.waitForFunction(() => {
  return document.querySelectorAll('button').length > 5
})

// Avoid fixed waits!
// ❌ BAD: await page.waitForTimeout(5000)
```

## 📱 Fixtures (Setup/Teardown)

```typescript
import { test as base } from '@playwright/test';

export const test = base.extend({
  // Custom fixture
  browser: async ({ browser }, use) => {
    // Setup
    const context = await browser.newContext()
    
    // Use
    await use(context)
    
    // Teardown
    await context.close()
  },
});

// Use it in tests
test('using fixture', async ({ browser }) => {
  // browser is already set up
});
```

## 🎬 Command Line Flags

```bash
# Running tests
npx playwright test                    # Run all tests
npx playwright test tests/file.spec.ts # Run specific file
npx playwright test --grep "pattern"   # Run tests matching pattern
npx playwright test --project chromium # Run specific browser only

# Debugging
npx playwright test --ui               # Interactive UI mode (BEST FOR LEARNING)
npx playwright test --debug            # Step-through debugger
npx playwright test --headed           # Show browser window
npx playwright test --headed --debug   # Best for visual debugging

# Recording
npx playwright codegen https://example.com  # Record test by interacting

# Reporting
npx playwright show-report             # View HTML report
npx playwright show-trace trace.zip    # View execution trace
```

## 🗂️ File Locations

```typescript
// In tests/my.spec.ts:
// Navigate to: tests/pages/LoginPage.ts
import { LoginPage } from '../pages/LoginPage';

// Import fixtures
import { test } from '../fixtures';

// Import test utilities
import { users } from '../fixtures/test-data';
```

## 🚀 Efficiency Tips

```typescript
// ✅ DO: Group related tests
test.describe('Login Feature', () => {
  test('successful login', async ({ page }) => {})
  test('invalid password', async ({ page }) => {})
  test('missing email', async ({ page }) => {})
})

// ✅ DO: Use Page Object Model
import { LoginPage } from '../pages/LoginPage';
const login = new LoginPage(page);
await login.goto();
await login.login('user@example.com', 'password');

// ✅ DO: Share fixtures for setup
test.beforeEach(async ({ page }) => {
  await page.goto('https://example.com');
})

// ✅ DO: Use meaningful variable names
const submitButton = page.getByRole('button', { name: 'Submit' });
await submitButton.click();

// ❌ DON'T: Hardcode waits
await page.waitForTimeout(5000);

// ❌ DON'T: Use too-specific selectors
await page.locator('#btn_1_2_3_submit').click();

// ❌ DON'T: Test many things in one test
// Instead: One assertion focus per test
```

## 🐛 Debugging Toolkit

```typescript
// Visual debugging
await page.pause()                     // Open inspector
await page.screenshot()                // Take screenshot

// Log debugging
console.log(await page.title())        // Log page title
console.log(page.url())                // Log URL

// Element inspection
const element = page.getByRole('button', { name: 'Submit' })
await element.screenshot()             // Screenshot element
console.log(await element.textContent())// Log element text

// Network inspection (advanced)
await page.on('response', response => {
  console.log('Response status:', response.status(), response.url())
})
```

## 📊 Configuration Quick Reference

```typescript
// playwright.config.ts

export default defineConfig({
  testDir: './tests',                  // Where tests are
  timeout: 30 * 1000,                  // 30s per test
  retries: 2,                          // Retry failed tests
  workers: 4,                          // Parallel workers
  reporter: 'html',                    // Report type
  
  use: {
    baseURL: 'http://localhost:3000',  // Default URL
    headless: true,                    // Hide browser
    screenshot: 'only-on-failure',     // Screenshots
    video: 'retain-on-failure',        // Videos
    trace: 'on-first-retry',           // Traces
  },
  
  projects: [
    { name: 'chromium', use: { ...devices['Chrome'] } },
    { name: 'firefox', use: { ...devices['Firefox'] } },
    { name: 'webkit', use: { ...devices['Safari'] } },
  ],
});
```

## 💡 When to Use What

| Scenario | Use |
|----------|-----|
| Learning/exploring test | `--ui` mode |
| Debugging a failing test | `--debug` flag |
| Recording test interactions | `npx playwright codegen <url>` |
| Checking test output | `npx playwright show-report` |
| Understanding trace | `npx playwright show-trace` |
| Quick test run | `npx playwright test` |

---

**Pro Tip:** Keep this cheat sheet open while writing tests. Most patterns are on this page! 🚀
