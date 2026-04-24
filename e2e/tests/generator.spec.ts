import { test, expect, Page } from '@playwright/test';

test.describe('AI Test Data Generator', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('http://localhost:5555');
  });

  test('should generate the correct number of records', async ({ page }: { page: Page }) => {
    // Select the User Profile template to populate some fields
    await page.click('text="User Profile"');

    // Fill the count input with 15
    const countInput = page.locator('input[type="number"]');
    await countInput.fill('15');

    // Click the Generate button
    await page.click('button:has-text("Generate")');

    // Wait for the table rows to appear
    await page.waitForSelector('table tbody tr');

    // Assert that there are 15 rows
    const rowCount: number = await page.locator('table tbody tr').count();
    expect(rowCount).toBe(15);
  });

  test('should validate email format in generated data', async ({ page }: { page: Page }) => {
    // Load the User Profile template which includes Email
    await page.click('text="User Profile"');
    await page.click('button:has-text("Generate")');

    await page.waitForSelector('table tbody tr');

    // Get the text of the first row's email column (3rd column in User Profile template)
    const firstRowEmail: string = await page.locator('table tbody tr:first-child td:nth-child(3)').innerText();

    // Basic regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(firstRowEmail)).toBeTruthy();
  });
});
