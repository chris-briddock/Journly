import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Ensure auth directory exists
const authDir = path.join(__dirname, '..', '.auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

// Setup authentication state for tests
setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill in login form with test credentials
  await page.getByLabel('Email').fill('admin@journly.com');
  await page.getByLabel('Password').fill('admin123');

  // Submit the form
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait for navigation to dashboard
  await expect(page).toHaveURL(/.*dashboard/);

  // Save authentication state
  await page.context().storageState({
    path: path.join(authDir, 'user.json')
  });
});
