import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    globals: true,
    coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
            'node_modules/',
            'test-setup.ts',
        ],
        thresholds: {
            lines: 80,
            functions: 80,
            branches: 70,
            statements: 80
        }
    },
  },
})