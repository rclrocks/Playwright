import { test, expect } from '@playwright/test';

test('click on residential link', async ({ page }) => {
  // Navigate to the Kleenheat natural gas page
  await page.goto('https://www.kleenheat.com.au/natural-gas?utm_searchliftstudy_meta&gclsrc=aw.ds&gad_source=1&gad_campaignid=23516321931&gbraid=0AAAAADrp_adY3gFQ706DjP6vAGLidlxy7&gclid=CjwKCAiAncvMBhBEEiwA9GU_fk8dhje1jqbdNHXDnDkb7PHOwovgSmDpg8_nPLWaAh0rM7ZndW4zXBoCND4QAvD_BwE');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Click on the "Residential" link
  // Try multiple selector strategies to find the residential link
  const residentialLink = page.getByRole('link', { name: /residential/i });
  
  if (await residentialLink.isVisible()) {
    await residentialLink.click();
  } else {
    // Alternative: try finding by text content
    await page.locator('text=/Residential/i').click();
  }

  // Verify we successfully clicked by checking the page content or URL
  await expect(page).toHaveURL(/residential/i);
});
