import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/src/**/__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/apps/desktop/dist/**',
      '**/apps/desktop/out/**',
    ],
  },
});
