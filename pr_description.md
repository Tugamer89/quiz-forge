**Summary:** Added missing unit tests for the `Header` component to ensure reliable rendering and interactive behavior.

**Test Cases:**
- Correct default rendering of brand title and generic buttons.
- "Install App" button appears and functions when `deferredPrompt` is provided.
- Theme toggle updates ARIA labels and calls `toggleTheme` correctly.
- "Data & Sync" menu opens and closes when clicked, and closes when clicking outside the menu.
- "Export Backup" button calls the `onExport` handler correctly.
- "Import Backup" simulates a file selection and calls the `onImport` handler with the expected file.

**Verification:**
Ran the test suite locally with `pnpm run test:run src/components/layout/Header.test.jsx`. Verified failure on intentionally broken code.
