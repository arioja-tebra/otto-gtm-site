import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/pages-browser',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4323', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'python3 -m http.server 4323 --bind 127.0.0.1 --directory .pages',
    url: 'http://127.0.0.1:4323/otto-gtm-site/',
    stdout: 'ignore',
    stderr: 'ignore',
    reuseExistingServer: !process.env.CI,
  },
});
