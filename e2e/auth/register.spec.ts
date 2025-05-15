import { test, expect } from '@playwright/test';

/**
 * Test fixture for the registration page
 * 
 * This test suite follows best practices for Playwright testing:
 * - Uses page fixtures for setup and teardown
 * - Takes screenshots on failure
 * - Uses data-testid attributes for reliable element selection
 * - Tests accessibility concerns like focus management
 * - Validates form inputs and error states
 * - Tests the complete registration flow
 */
test.describe('Registration Page', () => {
  // Use a page fixture for all tests
  test.beforeEach(async ({ page }) => {
    // Go to the registration page before each test
    await page.goto('/register');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  // Take screenshot after each test if it fails
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      await page.screenshot({
        path: `test-results/register-${testInfo.title.replace(/\s+/g, '-')}.png`,
        fullPage: true
      });
    }
  });

  test('should display the registration form with all required elements', async ({ page }) => {
    // Check if the registration form is displayed with proper heading
    await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();

    // Check for form elements
    const nameInput = page.getByLabel('Name');
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    const confirmPasswordInput = page.getByLabel('Confirm Password');
    const signUpButton = page.getByRole('button', { name: 'Sign up' });

    // Verify all form elements are visible and enabled
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toBeEditable();
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeEditable();
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toBeEditable();
    await expect(confirmPasswordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeEditable();
    await expect(signUpButton).toBeVisible();
    await expect(signUpButton).toBeEnabled();

    // Check for "Sign in" link
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    // Submit empty form
    await page.getByRole('button', { name: 'Sign up' }).click();

    // Check for validation messages
    await expect(page.getByText(/name is required/i)).toBeVisible();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();

    // Fill in invalid email
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');
    await page.getByRole('button', { name: 'Sign up' }).click();

    // Check for email validation message
    await expect(page.getByText(/valid email/i)).toBeVisible();

    // Fill in short password
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('short');
    await page.getByLabel('Confirm Password').fill('short');
    await page.getByRole('button', { name: 'Sign up' }).click();

    // Check for password validation message
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();

    // Fill in mismatched passwords
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('differentpassword');
    await page.getByRole('button', { name: 'Sign up' }).click();

    // Check for password match validation message
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('should show error message with existing email', async ({ page }) => {
    // Fill in the form with an email that already exists
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('existing@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');

    // Submit the form
    await page.getByRole('button', { name: 'Sign up' }).click();

    // Check if error message is displayed
    await expect(page.getByText(/email already in use/i)).toBeVisible();
  });

  test('should register a new user and redirect to dashboard', async ({ page }) => {
    // Generate a unique email to avoid conflicts
    const uniqueEmail = `test-${Date.now()}@example.com`;

    // Fill in the form with valid data
    await page.getByLabel('Name').fill('New Test User');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');

    // Submit the form
    await page.getByRole('button', { name: 'Sign up' }).click();

    // Check if redirected to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify dashboard elements are visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    // Click on the sign in link
    await page.getByRole('link', { name: 'Sign in' }).click();

    // Check if redirected to login page
    await expect(page).toHaveURL(/.*login/);

    // Verify login page elements
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should have proper focus management', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Name')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Confirm Password')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign up' })).toBeFocused();

    // Test form submission with keyboard
    await page.getByLabel('Name').fill('Keyboard User');
    await page.getByLabel('Email').fill(`keyboard-${Date.now()}@example.com`);
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');
    await page.keyboard.press('Enter');

    // Should navigate to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
