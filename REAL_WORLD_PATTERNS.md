# 🎯 Playwright Real-World Tips & Tricks

## 1. Testing Authentication Patterns

### Session Storage (Fastest)
```typescript
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page, context }, use) => {
    // Login once and save session
    await page.goto('https://app.example.com/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for navigation to complete
    await page.waitForURL('**/dashboard');
    
    // Save storage state
    await context.storageState({ path: 'auth.json' });
    
    await use(page);
  },
});

// Then in config: use the saved auth for all tests
export default defineConfig({
  use: {
    storageState: 'auth.json',  // Reuse auth across tests
  },
});
```

### API Authentication (Most Reliable for Multiple Tests)
```typescript
import { test as base } from '@playwright/test';

export const test = base.extend({
  apiHeaders: async ({ }, use) => {
    // Get token from login API
    const response = await fetch('https://api.example.com/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password'
      })
    });
    const { token } = await response.json();
    
    // Use token in tests
    await use({
      'Authorization': `Bearer ${token}`
    });
  },
  
  page: async ({ page, apiHeaders }, use) => {
    // Add headers to all requests
    await page.setExtraHTTPHeaders(apiHeaders);
    await use(page);
  },
});
```

---

## 2. Handling Dynamic Content

### Wait for Element Visibility
```typescript
// ✅ GOOD: Built-in auto-wait
await page.getByRole('button', { name: 'Submit' }).click()

// ✅ Also good: Explicit wait
await page.getByText('Loading complete').waitFor({ state: 'visible' })

// For modal dialogs
await page.getByRole('dialog').waitFor()

// For specific count of elements
await page.getByRole('listitem').first().waitFor()
```

### Handle Spinners/Loaders
```typescript
// Wait for loader to appear AND disappear
await page.waitForLoadState('networkidle')

// Or manually:
await page.waitForSelector('.spinner')
await page.waitForSelector('.spinner', { state: 'hidden' })

// Modern apps with network activity
await page.waitForLoadState('domcontentloaded')
```

### Infinite Scroll Pages
```typescript
async function scrollToLoadMore(page, itemsToLoad = 20) {
  let previousCount = 0;
  let currentCount = 0;
  
  while (currentCount < itemsToLoad) {
    previousCount = currentCount;
    
    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Wait for new items to load
    await page.waitForTimeout(500);
    
    currentCount = await page.getByRole('listitem').count();
    
    if (currentCount === previousCount) break; // No more items
  }
}
```

---

## 3. Form Handling

### Fill Complex Forms
```typescript
const formData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  country: 'USA',
  newsletter: true
};

// Fill form with dynamic fields
for (const [name, value] of Object.entries(formData)) {
  if (typeof value === 'boolean') {
    // Handle checkbox
    if (value) {
      await page.getByLabel(name).check();
    }
  } else {
    // Handle text input
    await page.getByLabel(name).fill(String(value));
  }
}

await page.getByRole('button', { name: 'Submit' }).click();
```

### File Upload
```typescript
// Upload single file
await page.locator('input[type="file"]').setInputFiles('path/to/file.pdf');

// Upload multiple files
await page.locator('input[type="file"]').setInputFiles([
  'path/to/file1.pdf',
  'path/to/file2.pdf'
]);

// Wait for upload to complete
await page.waitForLoadState('networkidle');
```

### Date Picker
```typescript
// Method 1: Direct input (if available)
await page.getByLabel('Date').fill('12/25/2024');

// Method 2: Using date picker UI
await page.getByLabel('Date').click();
await page.locator(`[data-date="2024-12-25"]`).click();

// Method 3: Set input value programmatically
await page.locator('input[type="date"]').fill('2024-12-25');
```

---

## 4. Handling Popup/Dialog Scenarios

### Alert Dialogs
```typescript
// Listen for alert and accept it
page.on('dialog', dialog => dialog.accept());
await page.getByRole('button', { name: 'Delete' }).click();

// Or with specific text
page.once('dialog', dialog => {
  console.log('Dialog message:', dialog.message());
  dialog.accept();
});
```

### Modal Dialogs
```typescript
// Wait for modal to appear
await page.getByRole('dialog').waitFor();

// Interact with modal
await page.getByRole('button', { name: 'Close' }).click();

// Wait for modal to disappear
await expect(page.getByRole('dialog')).not.toBeVisible();
```

### Handling New Tabs/Windows
```typescript
// Listen for new page (tab or window)
const [popup] = await Promise.all([
  page.context().waitForEvent('page'), // Wait for new page
  page.getByRole('link', { name: 'Open in new tab' }).click()
]);

// Interact with popup
await popup.getByRole('heading').click();

// Close popup
await popup.close();
```

---

## 5. Testing with Different Data

### Parameterized Tests
```typescript
const testData = [
  { email: 'user1@example.com', name: 'User One' },
  { email: 'user2@example.com', name: 'User Two' },
  { email: 'user3@example.com', name: 'User Three' },
];

testData.forEach(({ email, name }) => {
  test(`register ${name}`, async ({ page }) => {
    await page.goto('https://example.com/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Name').fill(name);
    await page.getByRole('button', { name: 'Register' }).click();
    
    await expect(page).toHaveURL('**/dashboard');
  });
});
```

### Table/List Data Testing
```typescript
test('verify table data', async ({ page }) => {
  await page.goto('https://example.com/users');
  
  const rows = await page.locator('tbody tr').all();
  
  for (const row of rows) {
    const name = await row.locator('td:first-child').textContent();
    const email = await row.locator('td:nth-child(2)').textContent();
    const status = await row.locator('td:nth-child(3)').textContent();
    
    console.log(`${name} (${email}): ${status}`);
    expect(email).toBeTruthy();
  }
});
```

---

## 6. Performance & Network Testing

### Network Throttling
```typescript
// Simulate slow network
const context = await browser.newContext({
  offline: true, // No network at all
  extraHTTPHeaders: {
    'X-Test': 'true'
  }
});

const page = await context.newPage();
await page.goto('https://example.com').catch(() => {
  // Expected to fail - no network
});
```

### Mocking API Responses
```typescript
// Mock all API calls
await page.route('**/api/**', async (route) => {
  if (route.request().url().includes('/users')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ])
    });
  } else {
    await route.continue(); // Default behavior
  }
});
```

### Measuring Performance
```typescript
test('page load performance', async ({ page }) => {
  // Measure page load time
  const startTime = Date.now();
  await page.goto('https://example.com');
  const loadTime = Date.now() - startTime;
  
  console.log(`Page loaded in ${loadTime}ms`);
  expect(loadTime).toBeLessThan(3000); // Less than 3 seconds
});

// Get performance metrics
const metrics = await page.evaluate(() => {
  const perfData = window.performance.timing;
  return {
    pageLoadTime: perfData.loadEventEnd - perfData.navigationStart,
    responseTime: perfData.responseEnd - perfData.requestStart,
    renderTime: perfData.domComplete - perfData.domLoading
  };
});
```

---

## 7. Advanced Locator Patterns

### Relative Locators
```typescript
// Find button NEXT TO specific text
await page.locator('button:has-text("Submit")').click();

// Find element by text inside another element
await page.locator('div:has-text("Login")').getByRole('button').click();

// Find element with specific class combination
await page.locator('.card:has(.badge-premium)').first().click();

// Find element that has child
await page.locator('form:has(input[name="email"])').submit();
```

### Complex Selectors
```typescript
// All clickable elements
const buttons = await page.locator('role=button').all();

// Visible elements only
const visible = await page.locator('.item:visible').all();

// Last element in list
await page.locator('.item >> nth=-1').click();

// Nth child
await page.locator('.item >> nth=2').click();
```

---

## 8. Testing with Screenshots & Videos

### Smart Screenshots
```typescript
// Screenshot only on failure
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
  },
});

// Manual screenshots
await page.screenshot({ path: 'screenshot.png' });

// Screenshot specific area
await page.locator('.modal').screenshot({ path: 'modal.png' });

// Full page screenshot
await page.screenshot({ path: 'full.png', fullPage: true });
```

### Video Recording
```typescript
// Config for videos on failure
use: {
  video: 'retain-on-failure',
},

// Or always record
use: {
  video: 'on',
},
```

---

## 9. Common Gotchas & Solutions

### Issue: "Element is not stable"
```typescript
// ❌ DON'T wait a fixed time
await page.waitForTimeout(1000);

// ✅ DO wait for the element state
await expect(page.getByRole('button')).toBeStable();
```

### Issue: "Timeout while clicking"
```typescript
// ❌ Button might be covered by overlay
// ✅ Force click or scroll into view
await page.getByRole('button').click({ force: true });

// Better: Check what's covering it
const box = await page.getByRole('button').boundingBox();
console.log('Button location:', box);
```

### Issue: Text not found after search
```typescript
// ❌ Text might have changed
console.log(await page.content()); // See full HTML

// ✅ Use partial match
await expect(page.getByText('Welcome')).toBeVisible(); // Partial match

// ✅ Case insensitive
await page.getByText('WELCOME', { exact: false }).click();
```

---

## 10. Useful Utilities

### Helper Function: Wait for Text Change
```typescript
async function waitForTextChange(locator, originalText, timeout = 5000) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    const currentText = await locator.textContent();
    if (currentText !== originalText) {
      return currentText;
    }
    await page.waitForTimeout(100);
  }
  
  throw new Error('Text did not change');
}
```

### Helper Function: Get All Table Data
```typescript
async function getTableData(page) {
  const rows = await page.locator('tbody tr').all();
  const data = [];
  
  for (const row of rows) {
    const cells = await row.locator('td').allTextContents();
    data.push(cells);
  }
  
  return data;
}
```

### Helper Function: Safe Click
```typescript
async function safeClick(locator, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await locator.click();
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await page.waitForTimeout(500);
    }
  }
}
```

---

**Remember:** The Playwright community has solutions for almost everything. Check their [GitHub discussions](https://github.com/microsoft/playwright/discussions) and [docs](https://playwright.dev) for more patterns! 🚀
