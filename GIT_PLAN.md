# Git Workflow & Strategy

This document outlines the version control standards and workflows for the Amber Brand Fashion monorepo.

## 1. Branching Model: Trunk-Based Development

We use **Trunk-Based Development** to ensure high velocity and integration frequency.

- **Main Branch:** `master` is the source of truth and must always be in a deployable state.
- **Short-Lived Branches:** Work is performed on short-lived branches merged back to `master` frequently.
  - `feat/feature-name`: New features.
  - `fix/bug-name`: Bug fixes.
  - `refactor/area-name`: Code improvements without functional changes.
  - `docs/topic-name`: Documentation updates.
- **PR Requirement:** All changes to `master` must go through a Pull Request (PR).

## 2. Commit Message Convention: Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Format:** `<type>(<scope>): <description>`

### Types:
- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation only changes.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `build`: Changes that affect the build system or external dependencies.
- `ci`: Changes to CI configuration files and scripts.
- `chore`: Other changes that don't modify src or test files.

### Scopes:
- `admin`: Admin Management Portal.
- `backend`: NestJS Backend.
- `frontend`: Next.js Storefront.
- `shared`: `@amber/shared` package.
- `logistics`, `auth`, `products`, `orders`, `inventory`: Functional modules.
- `root`: Root-level configurations.

**Example:** `feat(shared): add ProductViewSchema for frontend consumption`

## 3. Monorepo Best Practices

- **Atomic Commits:** If a change in `shared` impacts other apps, include the updates to those apps in the same commit or PR to ensure the repository remains functional at every commit.
- **Workspace Awareness:** Always verify changes by building the entire project from the root: `npm run build`.
- **Dependency Management:** Use `npm install` from the root to manage workspace dependencies correctly via the `package-lock.json`.

## 4. Pull Request Guidelines

- **Context:** Clearly state the purpose of the PR and the technical rationale.
- **Verification:** Include details on how the changes were tested.
- **Scope Check:** Ensure the PR is focused and doesn't include unrelated changes.
- **Review:** At least one approval is required for merging to `master`.

## 5. Local Development Workflow

1. **Sync:** Frequently pull from `origin master` and rebase your feature branch.
2. **Atomic Staging:** Stage files logically. Avoid massive "catch-all" commits.
3. **Lint & Build:** Run `npm run lint` and `npm run build` before pushing to minimize CI failures.

---

*Last Updated: May 9, 2026*
