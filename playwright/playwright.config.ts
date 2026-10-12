import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    use: {
        // BASE_URL points the tests at another server, e.g. the production build on :4173
        baseURL: process.env["BASE_URL"] ?? "http://localhost:5173",
        trace: 'retry-with-trace'
    },
    // Retry once on CI. A retried failure records a trace (see `trace` above), and a test that
    // passes on the retry is reported as flaky instead of failing the run.
    retries: process.env["CI"] ? 1 : 0,
    fullyParallel: false,
    testDir: 'tests',
    workers: 1,
    // WebKit's prebuilt binary wants Ubuntu sonames (icu 74, libxml2.so.2) that Arch cannot
    // supply, and `playwright install-deps` is apt-only. Chromium needs nothing extra.
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
})