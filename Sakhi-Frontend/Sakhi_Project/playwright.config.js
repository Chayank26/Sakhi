import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 2,
  timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:5186', trace: 'retain-on-failure', screenshot: 'only-on-failure', channel: 'chrome' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5186',
    url: 'http://127.0.0.1:5186',
    reuseExistingServer: false,
    env: { VITE_API_BASE_URL: 'http://127.0.0.1:5001/api' },
  },
});
