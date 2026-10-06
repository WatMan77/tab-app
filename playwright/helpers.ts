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
