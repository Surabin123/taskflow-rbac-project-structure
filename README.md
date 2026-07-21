# TaskFlow Enterprise - RBAC Task Management Workspace

TaskFlow Enterprise is a production-grade, secure, and modern task management monorepo application. It features strict **Role-Based Access Control (RBAC)** across three system scopes, activity log tracking, custom interactive dashboards, and collaboration components.

---

## ⚡ Tech Stack

### Frontend (Client-side)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Type-safe interfaces)
- **Styling**: Tailwind CSS v4 (Modern grid systems, transition effects, slate-dark visuals)
- **API Client**: Axios (Cookie credentials integration)

### Backend (Server-side)
- **Framework**: NestJS 11 (Progressive Node.js framework)
- **Database Client**: Prisma Client (ORM models mapping)
- **Database**: PostgreSQL (Local containerized or host database)
- **Authentication**: JWT Strategy via HttpOnly Cookies
- **Validation**: class-validator, class-transformer

---

## 🔐 Role Permissions Matrix (RBAC)

TaskFlow Enterprise enforces rigid authorization boundaries at both API (controller guards) and UI levels:

| Privilege / Action | Admin | Team Lead | Employee (Staff) |
| :--- | :---: | :---: | :---: |
| Access Admin Panel & Logs | ✓ | ✗ | ✗ |
| Suspend & Activate Users | ✓ | ✗ | ✗ |
| Manage Teams & Projects | ✓ | ✗ | ✗ |
| Assign Managers / Leads | ✓ | ✗ | ✗ |
| Create & Delete Tasks | ✓ | ✓ | ✗ |
| Update Task Status | ✓ | ✓ | ✓ |
| Check off Task Subitems | ✓ | ✓ | ✓ |
| Post Comments / Attachments | ✓ | ✓ | ✓ |
| View System Analytics | ✓ | ✗ | ✗ |
| View Team Reports / Workspace | ✓ | ✓ | ✗ |
| View Personal Workspace | ✓ | ✓ | ✓ |

---

## 📁 Repository Folder Structure

```
taskflow-rbac-project-structure/
├── apps/
│   ├── web/                     # Next.js Frontend
│   │   ├── app/                 # App Router Pages
│   │   │   ├── admin/           # Admin Dashboard Tab Pages
│   │   │   ├── dashboard/       # Core Hubs Redirection Router
│   │   │   ├── employee/        # Staff Backlog Tasks Calendar
│   │   │   ├── forgot-password/ # Account Password Retrieval
│   │   │   ├── profile/         # User Details & Security Password Settings
│   │   │   ├── register/        # Account Signup Validation Form
│   │   │   ├── reset-password/  # Password Overwrite Token Verification
│   │   │   ├── tasks/           # Global Backlog Board Table
│   │   │   ├── teamLead/        # Team Lead Workloads Panel
│   │   │   ├── layout.tsx       # Root Font Setup
│   │   │   └── globals.css      # Core Tailwind Styling
│   │   └── components/          # Reusable Client Elements
│   │       ├── UI.tsx           # Button, Input, Modal, Select, Badges
│   │       ├── DashboardLayout.ts # Sidebar & Notifications Dropdown Header
│   │       └── TaskDrawer.tsx   # Slide-over Checklist, Comments, and Attachments
│   │
│   └── backend-temp/            # NestJS Backend
│       ├── prisma/              # ORM configurations
│       │   ├── schema.prisma    # PostgreSQL Database Schema
│       │   ├── seed.ts          # Seed Admin, Lead, Developer accounts
│       │   └── enterprise-db.json # Extensible Persistent JSON Database
│       └── src/
│           ├── app.module.ts    # Main Registry imports
│           ├── main.ts          # Bootstrapping & Port 3001 binder
│           ├── auth/            # Auth Controller, JWT Guards & Recovery Tokens
│           ├── users/           # User CRUD, Profile Edits, Suspension, Manager mapping
│           ├── tasks/           # Tasks CRUD & Security modification verification
│           └── enterprise/      # Extra Persistent Store Controllers (Teams/Projects/Comments)
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL database instance running locally or on Docker on port `5432`

### Environment Variables

#### Backend (`apps/backend-temp/.env`)
```env
DATABASE_URL="postgresql://postgres:<PASSWORD>@localhost:5432/taskflow"
JWT_SECRET="taskflow_secret_2026"
PORT=3001
```

---

## 🚀 Running Locally

Follow these steps to initialize and start the workspace:

### 1. Database Migrations & Seeding
From the backend directory:
```bash
cd apps/backend-temp
npm install
npx prisma migrate dev --name init
npm run seed
```

### 2. Start the Backend API
```bash
npm run start:dev
```
The NestJS API service runs on `http://localhost:3001`.

### 3. Start the Next.js Frontend
In a new terminal window:
```bash
cd apps/web
npm install
npm run dev
```
The Next.js client app opens on `http://localhost:3000`.

---

## 🧪 Seeding Default Accounts

Upon running the seed script, the database is populated with three default testing roles:

- **Admin Account**: `admin@taskflow.com` (Password: `admin123`)
- **Team Lead Account**: `teamlead@taskflow.com` (Password: `lead123`)
- **Employee Account**: `employee@taskflow.com` (Password: `emp123`)

---

## 🔒 Security Implementations
- **HttpOnly Cookies**: JWT tokens are securely stored and verified via backend cookie policies.
- **API Guard Barriers**: In addition to frontend UI hide-outs, all API endpoints verify request roles at controller levels.
- **Suspension Checks**: Suspended accounts are immediately blocked on incoming authentication and session routes.
- **Employee Boundary**: Staff accounts are strictly validated to block any field modification aside from task completion state updates.
