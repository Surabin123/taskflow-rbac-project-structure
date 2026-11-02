# TaskFlow RBAC

TaskFlow is a work-in-progress task-management application with a Next.js frontend and a NestJS API. The backend includes cookie-based JWT authentication, task and user operations, role/permission guards, and team/project functionality. The current repository contains a working application scaffold and tests, but setup and deployment still need consolidation before it can be described as production-ready.

## Current capabilities in the source

- Register, log in, log out, inspect the current session, and request/reset a password.
- Store users and tasks in PostgreSQL through Prisma.
- Apply JWT guards and permission checks to protected routes.
- Create and update tasks with restrictions on which fields employees may change.
- Manage users, teams, projects, user profiles, and additional enterprise records.
- Provide a Next.js App Router interface for login, registration, dashboards, tasks, employee/team-lead views, and administration.

**Known limitations:** The frontend currently calls the API at `http://localhost:3001` directly. The backend CORS allowlist and cookie settings are local-development oriented. The seed script creates accounts using fixed development passwords; use it only with a disposable local database and replace/remove those credentials before any shared deployment. No production deployment configuration was found during this review.

## Architecture

```mermaid
flowchart LR
  Browser[Next.js 16 + React 19] -->|HTTP with credentials| API[NestJS 11 on port 3001]
  API --> Auth[JWT auth and permission guards]
  API --> Prisma[Prisma Client]
  Prisma --> DB[(PostgreSQL)]
  API --> Extra[Enterprise service records]
```

The browser application is in `apps/web`. The backend currently used by the source is `apps/backend-temp`; `apps/backend` contains a separate, incomplete/placeholder tree, and the root `package.json` is empty. Install and run each app independently. The enterprise service also stores some extension data in a JSON file rather than Prisma, so not all records share the same persistence mechanism.

## Repository structure

```text
apps/
  web/                    Next.js App Router UI, components, API helpers
  backend-temp/           NestJS API, Prisma schema/seed, auth, tasks, users, tests
  backend/                Incomplete/placeholder backend tree; not the runnable API
```

## Requirements

- Node.js 20 or later and npm.
- PostgreSQL reachable by the backend.
- Two terminals for the development servers.

## Local setup (PowerShell)

Clone and prepare the API:

```powershell
git clone https://github.com/Surabin123/taskflow-rbac-project-structure.git
Set-Location taskflow-rbac-project-structure\apps\backend-temp
npm ci
```

Create `apps/backend-temp/.env` with a local database URL and a fresh JWT secret:

```env
DATABASE_URL="postgresql://postgres:YOUR_LOCAL_PASSWORD@localhost:5432/taskflow?schema=public"
JWT_SECRET="replace-with-a-long-random-local-secret"
```

The Prisma schema is `apps/backend-temp/prisma/schema.prisma`. Create the local database first, then generate the client and apply an initial migration:

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

To add local demo records, run `npm run seed`. The source uses fixed demo passwords, so never seed a shared or production database. Do not commit `.env`.

Start the API:

```powershell
npm run start:dev
```

In a second PowerShell terminal, start the frontend:

```powershell
Set-Location path\to\taskflow-rbac-project-structure\apps\web
npm ci
npm run dev
```

Open `http://localhost:3000`. The backend listens on `http://localhost:3001`; the browser source currently expects these local ports.

## API surface

The following routes are declared by the controllers. Authentication is via an HttpOnly cookie set by the login route; protected routes require a valid JWT. Request DTOs and role/permission checks are implemented in the corresponding controller/service files.

| Method | Path | Purpose | Access |
|---|---|---|---|
| `POST` | `/auth/register` | Register a user | Public |
| `POST` | `/auth/login` | Authenticate and set the session cookie | Public |
| `POST` | `/auth/logout` | Clear the session cookie | Public |
| `GET` | `/auth/me` | Read the current user | Authenticated |
| `POST` | `/auth/forgot-password` | Request a reset token | Public |
| `POST` | `/auth/reset-password` | Reset a password with a token | Public |
| `GET` | `/tasks` | List tasks visible to the current user | Authenticated |
| `POST` | `/tasks` | Create a task | Permission guarded |
| `PATCH` | `/tasks/:id` | Update a task; employee edits are restricted to status | Authenticated |
| `DELETE` | `/tasks/:id` | Delete a task | Permission guarded |
| `GET`, `POST`, `PATCH`, `DELETE` | `/users` and `/users/:id/...` | User listing, creation, role/profile changes, suspension, manager assignment, deletion | Mixed authenticated/permission guarded routes |
| `GET`, `POST`, `PATCH`, `DELETE` | `/enterprise/...` | Team, project, comment, attachment and related operations | Authenticated; selected mutations permission guarded |

This is a route index, not a complete OpenAPI contract. The repository does not currently provide a generated API specification.

## Tests and scripts

Backend scripts are defined in `apps/backend-temp/package.json`:

```powershell
# From apps/backend-temp
npm test
npm run test:e2e
npm run test:cov
npm run build
npm run lint
```

The backend contains Jest unit and end-to-end test files. The frontend package currently defines `dev`, `build`, `start`, and `lint`; no frontend test script was found. These commands have not been executed in this documentation workspace.

## Deployment and security

No deployment configuration was found in the inspected tree. The hard-coded API origin, local CORS allowlist, cookie `secure: false`, and fixed seed passwords all require changes before a hosted environment. Reset tokens are stored in process memory in the current auth service, so they are not durable across restarts. Do not expose this configuration as a production-ready service without addressing these limitations.

## License

No repository-level `LICENSE` file was found. The backend package is marked private and `UNLICENSED`; do not assume this project has an open-source license.
