import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

export default defineConfig({
  ...base,
  metadata: { release: true },
  webServer: {
    ...base.webServer,
    command: 'npm run build:release && npm run preview -- --host 127.0.0.1 --port 5186',
    env: {
      VITE_API_BASE_URL: 'https://api.sakhi.test/api',
      VITE_API_URL: '',
      VITE_FIREBASE_API_KEY: 'fixture-firebase-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'sakhi-test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'sakhi-test',
      VITE_FIREBASE_APP_ID: 'fixture-app-id',
    },
  },
});
