**What:**
Added unit tests for the `Footer` layout component, which was previously untested.

**Coverage:**
- Brand section rendering and messaging.
- Links and their external attributes.
- Built-with links rendering correctly.
- Developer credits link and info.
- Copyright section and current year.
- Verify component fallback behavior from `package.json` default version.
- Verify environment overriding via `VITE_APP_VERSION`.

**Result:**
Increased test coverage significantly in the `src/components/layout` path, securing one of our purely presentational but highly visible site components.
