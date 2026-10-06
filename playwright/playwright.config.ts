import { defineConfig } from '@playwright/test';

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
    workers: 1
})