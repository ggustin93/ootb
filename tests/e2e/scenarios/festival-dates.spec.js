/**
 * E2E Test: Festival 2026 Dates Centralization
 *
 * Verifies that festival dates are correctly loaded from TinaCMS:
 * - Hero section displays correct dates
 * - Day filters show correct day/date combinations
 * - Dates are calculated correctly with timezone handling
 *
 * Best Practices Applied:
 * - Web-first assertions with auto-waiting (toBeVisible, toHaveAttribute)
 * - Locator.waitFor() instead of waitForTimeout
 * - No console.log in tests
 *
 * @see https://playwright.dev/docs/best-practices
 * Created by Claude Code quality-engineer agent
 */

import { test, expect } from '@playwright/test';

test.describe('Festival 2026 Dates Centralization', () => {

  test('Festival hero displays 2026 dates from TinaCMS', async ({ page }) => {
    await page.goto('/festival/');

    // Web-first assertions with auto-waiting - use .first() to avoid strict mode violations
    await expect(page.getByText('30 septembre').first()).toBeVisible();
    await expect(page.getByText('2026').first()).toBeVisible();
    await expect(page.getByText('La Sucrerie').first()).toBeVisible();
  });

  test('Day filters display correct dates from TinaCMS', async ({ page }) => {
    await page.goto('/festival/');

    // Wait for programme section using locator.waitFor() - best practice
    const programmeSection = page.locator('#programme');
    await programmeSection.waitFor({ state: 'visible', timeout: 10000 });
    await programmeSection.scrollIntoViewIfNeeded();

    // Web-first assertions for date format (DD/MM) - target visible button elements
    // Mercredi 30/09, Jeudi 01/10, Vendredi 02/10
    await expect(page.locator('button').getByText('30/09').first()).toBeVisible();
    await expect(page.locator('button').getByText('01/10').first()).toBeVisible();
    await expect(page.locator('button').getByText('02/10').first()).toBeVisible();

    // Verify day names are in French - target visible button elements
    await expect(page.locator('button').getByText('Mercredi').first()).toBeVisible();
    await expect(page.locator('button').getByText('Jeudi').first()).toBeVisible();
    await expect(page.locator('button').getByText('Vendredi').first()).toBeVisible();
  });

  test('Day filter buttons are functional', async ({ page }) => {
    await page.goto('/festival/');

    // Wait for programme section properly
    const programmeSection = page.locator('#programme');
    await programmeSection.waitFor({ state: 'visible', timeout: 10000 });
    await programmeSection.scrollIntoViewIfNeeded();

    // Locate and click Mercredi filter button
    const mercrediButton = page.locator('button').filter({ hasText: /Mercredi.*30\/09/ }).first();
    await mercrediButton.waitFor({ state: 'visible' });
    await mercrediButton.click();

    // Wait for filter to be applied using web-first assertion
    // Check for active/selected state
    await expect(mercrediButton).toBeVisible();

    // Verify button has some indication of being selected
    // Use soft assertion to handle different implementation patterns
    const hasActiveClass = await mercrediButton.evaluate(el =>
      el.classList.contains('active') ||
      el.getAttribute('aria-pressed') === 'true' ||
      el.getAttribute('data-active') === 'true'
    );
    expect(hasActiveClass).toBeTruthy();
  });

  test('Festival dates are timezone-safe (Europe/Brussels)', async ({ page }) => {
    // Verifies timezone calculation is correct
    // Dates stored as T12:00:00.000Z (noon UTC) should display correctly
    // in Europe/Brussels timezone

    await page.goto('/festival/');

    // Wait for programme section
    const programmeSection = page.locator('#programme');
    await programmeSection.waitFor({ state: 'visible', timeout: 10000 });
    await programmeSection.scrollIntoViewIfNeeded();

    // If timezone was wrong, it might show 29/09 instead of 30/09
    await expect(page.getByText('29/09')).not.toBeVisible();

    // Correct dates should be visible - target visible button elements
    await expect(page.locator('button').getByText('30/09').first()).toBeVisible();
    await expect(page.locator('button').getByText('01/10').first()).toBeVisible();
    await expect(page.locator('button').getByText('02/10').first()).toBeVisible();
  });

  test('Edition year 2026 is displayed correctly', async ({ page }) => {
    await page.goto('/festival/');

    // The year should appear in the hero section
    const yearText = page.getByText('2026');
    await expect(yearText.first()).toBeVisible();
  });

});
