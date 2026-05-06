# Quiz Forge

_A fast, entirely client-side web application that transforms your text notes into interactive quizzes._

[![CI/CD](https://img.shields.io/github/actions/workflow/status/Tugamer89/quiz-forge/main.yml?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/Tugamer89/quiz-forge/actions)
[![Version](https://img.shields.io/github/v/release/Tugamer89/quiz-forge?style=for-the-badge&color=blue)](https://github.com/Tugamer89/quiz-forge/releases)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://github.com/tugamer89/quiz-forge/pkgs/container/quiz-forge)
[![Sentry](https://img.shields.io/badge/Sentry-362D59?style=for-the-badge&logo=sentry&logoColor=white)](https://sentry.io/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![wakatime](https://wakatime.com/badge/user/423e1479-325a-4958-8d21-2d5f97c11efb/project/a0284ea7-89bc-4752-8923-126475c2c56c.svg?style=for-the-badge)](https://wakatime.com/badge/user/423e1479-325a-4958-8d21-2d5f97c11efb/project/a0284ea7-89bc-4752-8923-126475c2c56c)

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-FCC72B?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

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
- **Real-time Error Tracking:** Integrated with **Sentry** for proactive error monitoring, complete with source map uploads for precise debugging in production environments.

---

## Tech Stack

This project is built with the latest modern web technologies:

- **Core:** [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/) for a lightning-fast development experience and optimized builds.
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) combined with the `@tailwindcss/typography` plugin.
- **Icons:** [Lucide React](https://lucide.dev/) for clean and modern interfaces.
- **Markdown & Math:** `react-markdown`, `rehype-katex`, and `react-syntax-highlighter`.
- **Testing:** UI unit tests managed via [Vitest](https://vitest.dev/).
- **CI/CD:** Automated semantic releases via `semantic-release`, deployment to GitHub Pages via GitHub Actions, and automated Docker image publishing to GHCR.

---

## Running with Docker (Recommended for Production)

Quiz Forge provides a production-ready, highly optimized multi-stage Docker image served via Nginx.

### Prerequisites

- Docker installed on your machine.
- Your own API keys (Google Client ID, Sentry DSN).

### Pre-built Images

If you don't want to build the image yourself, you can pull the latest pre-built image directly from the GitHub Container Registry (GHCR):

```bash
docker pull ghcr.io/Tugamer89/quiz-forge:latest
docker run -d -p 8080:8080 ghcr.io/Tugamer89/quiz-forge:latest
```

_(Make sure you have configured the environment variables correctly for the pre-built image if you plan to use Cloud Sync and Error Tracking)._

### Build it Yourself

To build and run the container locally while securely passing the Sentry Auth Token via Docker BuildKit secrets:

1. Create a temporary file for your Sentry token to ensure it doesn't get saved in your shell history:

```bash
echo "your_sentry_auth_token" > sentry_secret.txt
```

2. Build the image:

```bash
docker build \
  --build-arg VITE_APP_VERSION=v-local \
  --build-arg VITE_GOOGLE_CLIENT_ID=your_google_client_id \
  --build-arg VITE_SENTRY_DSN=your_sentry_dsn \
  --secret id=SENTRY_AUTH_TOKEN,src=./sentry_secret.txt \
  -t quiz-forge-app .
```

3. Run the container:

```bash
docker run -d -p 8080:8080 --name quiz-forge quiz-forge-app
```

The application will be available at [`http://localhost:8080/quiz-forge/`](http://localhost:8080/quiz-forge/).

> [!NOTE]
> The final Docker image is completely stripped of Node.js and source code. The Sentry Auth Token is strictly used during the build stage and is never exposed in the image layers.

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
   npm ci
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
