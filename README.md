# Quiz Forge

<div align="center">
  
  *A fast, entirely client-side web application that transforms your text notes into interactive quizzes.*
  
  <br/>

  <!-- GitHub CI/CD & Version -->

[![Deploy Status](https://github.com/Tugamer89/quiz-forge/actions/workflows/main.yml/badge.svg)](https://github.com/Tugamer89/quiz-forge/actions)
[![Version](https://img.shields.io/github/v/release/Tugamer89/quiz-forge?color=blue)](https://github.com/Tugamer89/quiz-forge/releases)

  <!-- License -->

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

  <!-- WakaTime Time Tracking -->

[![wakatime](https://wakatime.com/badge/user/423e1479-325a-4958-8d21-2d5f97c11efb/project/a0284ea7-89bc-4752-8923-126475c2c56c.svg)](https://wakatime.com/badge/user/423e1479-325a-4958-8d21-2d5f97c11efb/project/a0284ea7-89bc-4752-8923-126475c2c56c)

  <!-- Tech Stack Badges -->

[![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat&logo=pwa&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-FCC72B?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)

</div>

<br/>

## Overview

**Quiz Forge** allows you to optimize your study sessions by instantly transforming your notes into interactive flashcards. Designed with privacy and performance in mind, it doesn't use any remote database: **everything happens and is saved locally in your browser**.

[**TRY THE LIVE DEMO HERE**](https://Tugamer89.github.io/quiz-forge)

---

## Key Features

- **Instant Parsing:** Convert raw text (formatted as `1. Question \n Answer`) into convenient flashcards in real-time.
- **Local Storage:** Your questions, answers, and study progress are saved automatically and persistently in your browser.
- **Data Import/Export & Cloud Sync:** Easily back up and restore your study data manually via file export, or enable cloud synchronization through seamless Google Drive integration.
- **Progress Tracking:** Evaluate your knowledge by marking questions as _Correct_, _Incorrect_, _Partially Correct_, or _Unanswered_.
- **Smart Quiz Generation:** Create custom study sessions (e.g., choose to review only questions marked as "Incorrect" or "Unanswered").
- **Rich Text Support (Markdown & Math):** Write freely! Built-in support for Markdown, code blocks with syntax highlighting, and complex math formula rendering via KaTeX.
- **Progressive Web App (PWA):** Install Quiz Forge on your mobile or desktop device to use it completely offline.
- **Privacy First & Zero Backend:** The core app runs entirely client-side without a proprietary backend. Your data stays in your browser's local storage unless you explicitly opt-in to Google Drive synchronization.

---

## Tech Stack

This project is built with the latest modern web technologies:

- **Core:** [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/) for a lightning-fast development experience and optimized builds.
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) combined with the `@tailwindcss/typography` plugin.
- **Icons:** [Lucide React](https://lucide.dev/) for clean and modern interfaces.
- **Markdown & Math:** `react-markdown`, `rehype-katex`, and `react-syntax-highlighter`.
- **Testing:** UI unit tests managed via [Vitest](https://vitest.dev/).
- **CI/CD:** Automated semantic releases via `semantic-release` and deployment to GitHub Pages via GitHub Actions.

---

## Local Development

Want to contribute or test the app locally? Follow these steps:

### Requirements

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Tugamer89/quiz-forge.git
   cd quiz-forge
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the local development server:**

   ```bash
   npm run dev
   ```

   The application will be available at [`http://localhost:5173`](http://localhost:5173).

### Useful Scripts

Here is a list of the main commands available in the project:

- `npm run dev` - Starts the local development server via Vite.
- `npm run build` - Generates the production build.
- `npm run preview` - Starts a local server to preview the production build.
- `npm run test` - Runs the test suite with Vitest.
- `npm run test:ui` - Starts the Vitest graphic user interface in the browser.
- `npm run lint` - Analyzes the code with ESLint.

---

## How to Contribute

Contributions are welcome! If you have an idea to improve Quiz Forge, feel free to open an _Issue_ or submit a _Pull Request_.
In this project, we use `husky` and `lint-staged` to ensure all code is properly formatted before each commit.

## License

This project is licensed under the **MIT** License. See the [LICENSE](LICENSE) file for more details.
