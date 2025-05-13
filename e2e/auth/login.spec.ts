import { test, expect } from '@playwright/test';

// Create a test fixture for login page
test.describe('Login Page', () => {
  // Use a page fixture for all tests
  test.beforeEach(async ({ page }) => {
    // Go to the login page before each test
    await page.goto('/login');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  // Take screenshot after each test
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      await page.screenshot({
        path: `test-results/login-${testInfo.title.replace(/\s+/g, '-')}.png`,
        fullPage: true
      });
    }
  });

  test('should display the login form with all required elements', async ({ page }) => {
    // Check if the login form is displayed with proper heading
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

    // Check for form elements
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    const signInButton = page.getByRole('button', { name: 'Sign in' });

    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeEditable();
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toBeEditable();
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeEnabled();

    // Check for "Sign up" link
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    // Submit empty form
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Check for validation messages
    await expect(page.getByText(/required/i)).toBeVisible();

    // Fill in invalid email
    await page.getByLabel('Email').fill('invalid-email');

    // Check for email validation message
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    // Fill in the form with invalid credentials
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');

    // Submit the form
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Check if error message is displayed
    await expect(page.getByText('Login failed')).toBeVisible();
  });

  test('should redirect to dashboard with valid credentials', async ({ page }) => {
    // This test assumes there's a valid user in the test database
    // You might need to set up test data before running this test

    // Fill in the form with valid credentials
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');

    // Submit the form
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Check if redirected to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify dashboard elements are visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    // Click on the sign up link
    await page.getByRole('link', { name: 'Sign up' }).click();

    // Check if redirected to registration page
    await expect(page).toHaveURL(/.*register/);

    // Verify registration page elements
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
  });

  test('should have proper focus management', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeFocused();

    // Test form submission with keyboard
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.keyboard.press('Enter');

    // Should navigate to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
