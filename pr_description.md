Summary: The ActivityHeatmap component lacked testing coverage, leaving its calculations for streaks, totals, and UI cell colors unverified. This test file introduces comprehensive unit tests for `ActivityHeatmap.jsx`, improving robustness and making future refactors safer. A minor React key prop issue inside the component was also fixed to eliminate console warnings.

Test Cases:
- Rendering verification with an empty deck log.
- Streak, total cards, and month label logic when inputs exist over consecutive days.
- Gap handling where streaks correctly reset when previous dates are missing but maintain values when previous days are active.
- Accurate assignment of color classes based on the number of daily reviews.

Verification:
- `pnpm run test:run src/components/features/ActivityHeatmap.test.jsx` (verified successful execution and UI matches expectations).
- `pnpm run lint` and `pnpm run format` (verified no linting errors).
