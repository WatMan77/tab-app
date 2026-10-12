import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Clicks "Confirm change" on the balances page and waits until the changes are really saved:
// the PUT request has finished and the account list has been refetched afterwards. Waiting for
// the URL is not enough, because the URL is already /balances and never changes, and the page
// no longer reloads itself after a confirm.
export const confirmChanges = async (page: Page): Promise<void> => {
    await Promise.all([
        page.waitForResponse(
            (r) => r.url().includes("/api/balance") && r.request().method() === "PUT"
        ),
        page.waitForResponse(
            (r) => /\/api\/account(\?|$)/.test(r.url()) && r.request().method() === "GET"
        ),
        page.getByText("Confirm change").click(),
    ]);
};

// Navigates to /balances and waits until it has actually rendered. Clicking the navbar only
// starts the navigation: the router updates the URL before React commits the new tree, so for a
// moment the page we came from is still mounted. That matters because the front page lists the
// same usernames as /balances, so a username click fired too early opens a front-page user
// button instead of the account row. The new-account form only exists on /balances.
export const gotoBalances = async (page: Page): Promise<void> => {
    await page.getByText("Balances").click();
    await expect(page.getByLabel("Enter account name")).toBeVisible();
};

// The account rows on /balances. Scoping to them keeps a username click off the identically
// named buttons on the front page.
export const accountRow = (page: Page, username: string) =>
    page.locator('.account').filter({ hasText: username }).first();
