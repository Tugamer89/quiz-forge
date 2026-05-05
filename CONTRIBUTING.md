# Contributing to Quiz Forge

First off, thank you for considering contributing to Quiz Forge! It's people like you that make open source such a great community.

## Local Development Setup

Quiz Forge is a client-side React application built with Vite.

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 18+ recommended)
- `npm` (comes with Node.js)

### Installation

1. Fork the repository and clone your fork:

   ```bash
   git clone [https://github.com/Tugamer89/quiz-forge.git](https://github.com/Tugamer89/quiz-forge.git)
   cd quiz-forge
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

### Useful Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the app for production.
- `npm run test` - Runs the test suite using Vitest.
- `npm run lint` - Runs ESLint to check for code issues.
- `npm run format` - Uses Prettier to format the codebase (managed automatically by lint-staged).

## Commit Convention

This project uses `semantic-release` to automate versioning and package publishing. Therefore, all commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

Examples:

- `feat: add new dark mode toggle`
- `fix: resolve issue with markdown parsing`
- `docs: update readme with new API details`
- `chore: update dependencies`

_Note: The project uses `husky` and `commitlint` (if configured) to enforce this. Code formatting via `prettier` and `eslint` will run automatically before you commit._

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, if applicable.
3. Make sure all tests pass (npm run test) and no linting errors are introduced (npm run lint).
4. Follow the PR template provided when you open your Pull Request.
5. You may merge the Pull Request in once you have the sign-off of at least one other developer, or if you do not have permission to do that, you may request the reviewer to merge it for you.
