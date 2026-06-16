<div align="center">
  
# ⚡ Testpilot

**Your AI QA Engineer — Always On, Never Tired.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Billing-indigo?style=flat&logo=stripe)](https://stripe.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6c47ff?style=flat&logo=clerk)](https://clerk.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

</div>

<br />

Testpilot is an autonomous, agentic web application designed to generate, execute, and self-heal end-to-end tests for your codebase. It acts as an AI QA Engineer that connects directly to your GitHub repository.

By leveraging Google Gemini, Browserbase, and Playwright, Testpilot automatically writes test scripts, runs them in isolated cloud browsers, captures full session video replays, and performs intelligent Root Cause Analysis (RCA) on failures. When a test breaks due to UI changes or brittle selectors, Testpilot autonomously regenerates and heals the script.

---

## ✨ Key Features

### 🔐 Auth & User Management
- **Clerk Authentication**: Secure sign-up, sign-in, and sign-out flows.
- **Webhook Syncing**: Automatic user creation in the database via Clerk webhooks.
- **User Profiles**: Dashboard topbar profile dropdown synced with Clerk avatars.

### 🐙 GitHub Integration
- **OAuth Connect**: One-click GitHub connect/disconnect with full repo access management.
- **Repository Import**: Fetch all user repositories directly from the GitHub API.
- **Status Badges**: Real-time connection status visible in the dashboard.

### 🤖 AI Test Generation
- **Codebase Context**: Gemini AI reads your repo's file tree and source files to understand the app structure.
- **Auto-Generation**: Automatically generates 5–10 Playwright test cases per repository.
- **Custom Instructions**: Supports `globalInstruction`, `targetDomain`, and `knownIssues` context per repo.
- **Natural Language Creation**: Type a plain English description, and Gemini instantly writes the structured test.
- **Comprehensive Coverage**: Generates UI, Authentication, Form, Navigation, and API tests.

### ☁️ Cloud Execution
- **Browserbase Integration**: Tests run in highly scalable, isolated cloud browser sessions.
- **Playwright Engine**: Full, robust browser automation.
- **Real-Time Logs**: Step-by-step log streaming during execution.
- **Video Replays**: Every test run automatically captures a full session video recording.

### 🎬 Interactive Logs Modal
- **5-Tab Deep Dive**: View Logs, the Generated Script, Agent Instructions, the Video Replay, and AI Analysis all in one unified modal.

### 🔍 AI Root Cause Analysis & Self-Healing
- **Failure Classification**: AI categorizes failures into Real Bug, Test Fragility, Environment Issue, or Auth Failure.
- **Plain English RCA**: Provides a clear explanation of the root cause and a suggested actionable fix.
- **Self-Healing Tests**: Automatically detects "Test Fragility" failures (e.g., changed selectors) and regenerates/re-runs the script to heal itself.
- **Healing Metrics**: Tracks `wasHealed`, `healedAt`, and `healCount` in the database.

### 📊 Test Run History & Public Reports
- **Execution Grouping**: `testRuns` table logically groups test cases per execution batch.
- **Pass/Fail Trends**: Detailed history of every test run with metrics.
- **Public Shareable Reports**: Share read-only run reports (with video and AI analysis) with clients or in PRs via secure `shareToken` URLs.

### 📅 Scheduled Tests
- **Vercel Cron Integration**: Set up recurring test runs automatically.
- **Granular Scheduling**: Per-repo cron schedules (hourly / daily / weekly / custom).

### 🔗 CI/CD Webhooks
- **Pipeline Integration**: Trigger test runs from GitHub Actions, GitLab CI, or any CI/CD pipeline using a unique webhook URL and secret per repo.
- **JSON Responses**: Returns structured JSON results for pipeline consumption and gating.

### 🔔 Notifications
- **Multi-Channel Alerts**: Get notified via Email (powered by Resend) or Slack webhooks when runs complete.
- **Configurable Triggers**: Choose to be notified on all runs, failures only, or scheduled runs only.

### 💳 Billing & Subscriptions
- **Stripe Integration**: Tiered plans (Free / Pro / Team).
- **Credit System**: Credit-based usage system dynamically tracks execution costs.
- **Customer Portal**: Integrated Stripe Customer Portal for seamless invoice and subscription management.

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 15 (App Router) |
| **Auth** | Clerk (OAuth, session management, webhooks) |
| **AI** | Google Gemini AI (1.5 Flash/Pro for generation, RCA, healing) |
| **Execution** | Playwright + Browserbase (cloud browser execution) |
| **Database** | Neon (serverless Postgres) + Drizzle ORM |
| **Payments** | Stripe (subscriptions, webhooks, customer portal) |
| **Notifications** | Resend (Email) + Slack Webhooks |
| **Styling** | Tailwind CSS v4 + Radix UI + Lucide Icons |
| **Deployment** | Vercel (with Vercel Cron for scheduled tests) |

---

## 📸 Screenshots

*(Add screenshots here)*
- **Dashboard Overview**: Showcasing imported repositories and run statistics.
- **Test Generation**: The AI generating Playwright scripts from natural language.
- **Logs Modal & Video Replay**: The 5-tab modal showing a Browserbase session replay.
- **Root Cause Analysis**: The AI explaining a test failure and offering a fix.
- **Public Report**: A shareable report URL.

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Clone the repository
```bash
git clone https://github.com/your-org/testpilot.git
cd testpilot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file and fill in your keys:
```bash
cp .env.example .env
```
*(See the [Environment Variables](#%EF%B8%8F-environment-variables) section below for details)*

### 4. Push the Database Schema
Ensure your Neon Postgres URL is set, then push the schema using Drizzle:
```bash
npx drizzle-kit push
```

### 5. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the app.

---

## ⚙️ Environment Variables

| Variable | Required | Description |
| --- | :---: | --- |
| `DATABASE_URL` | ✅ | Neon Postgres connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk public key |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | ✅ | Clerk webhook signing secret |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe public key |
| `STRIPE_PRO_PRICE_ID` | ✅ | Stripe Price ID for Pro plan |
| `STRIPE_TEAM_PRICE_ID` | ✅ | Stripe Price ID for Team plan |
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App client secret |
| `GITHUB_REDIRECT_URI` | ✅ | GitHub OAuth callback URL |
| `GOOGLE_GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `BROWSERBASE_API_KEY` | ✅ | Browserbase API key |
| `BROWSERBASE_PROJECT_ID` | ✅ | Browserbase project ID |
| `RESEND_API_KEY` | ✅ | Resend email API key |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public app URL (for webhooks, share links) |

---

## 📁 Project Structure

```
├── app/                  # Next.js App Router pages and layouts
│   ├── api/              # API routes (webhooks, github, runs, etc.)
│   ├── dashboard/        # Authenticated user dashboard
│   ├── pricing/          # Public pricing page
│   └── report/           # Public shareable run reports
├── components/           # Reusable UI components and modals
├── db/                   # Drizzle ORM schema and database configuration
├── lib/                  # Helper utilities (GitHub, Notifications, Stripe)
└── public/               # Static assets
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/user` | Clerk | Get current user profile, credits, plan |
| `GET` | `/api/github/repos` | Clerk | List user's GitHub repos |
| `GET` | `/api/github/connect` | Clerk | Start GitHub OAuth flow |
| `DELETE` | `/api/github/disconnect` | Clerk | Disconnect GitHub account |
| `GET` | `/api/repositories` | Clerk | List user's tracked repos |
| `POST` | `/api/repositories` | Clerk | Add a new repository |
| `PATCH` | `/api/repositories/[repoId]` | Clerk | Update repo settings |
| `DELETE` | `/api/repositories/[repoId]` | Clerk | Remove a repository |
| `POST` | `/api/repositories/[repoId]/generate` | Clerk | Generate test cases via Gemini |
| `POST` | `/api/repositories/[repoId]/create-test` | Clerk | Create test from natural language |
| `GET` | `/api/repositories/[repoId]/report` | Clerk | Get AI run report |
| `POST` | `/api/test-cases/run` | Clerk | Execute selected test cases |
| `PATCH` | `/api/test-cases/[testId]` | Clerk | Edit a test case |
| `DELETE` | `/api/test-cases/[testId]` | Clerk | Delete a test case |
| `GET` | `/api/runs` | Clerk | List test runs |
| `GET` | `/api/runs/[runId]` | Clerk | Get run details |
| `POST` | `/api/checkout/stripe` | Clerk | Create Stripe Checkout session |
| `POST` | `/api/billing/portal` | Clerk | Open Stripe Customer Portal |
| `GET` | `/api/billing/history` | Clerk | Get billing history |
| `POST` | `/api/webhooks/stripe` | Stripe sig | Stripe payment webhook |
| `POST` | `/api/webhooks/clerk` | Svix sig | Clerk user lifecycle webhook |
| `POST` | `/api/webhooks/trigger/[secret]` | Token | CI/CD trigger endpoint |
| `POST` | `/api/webhooks/generate` | Clerk | Webhook-triggered test generation |

---

## 💳 Pricing & Credits

Testpilot uses a credit-based system for test execution. Each test execution (and self-healing attempt) deducts credits from your balance.

| Plan | Price | Included Credits | Best For |
| --- | --- | --- | --- |
| **Free** | $0/mo | 100 Credits | Trying out the platform, hobby projects |
| **Pro** | $29/mo | 2,000 Credits | Solo developers, indie hackers |
| **Team** | $99/mo | 10,000 Credits | Teams and agencies running CI/CD |

---

## 🚢 Deployment

Testpilot is fully optimized for deployment on [Vercel](https://vercel.com).

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Configure all [Environment Variables](#%EF%B8%8F-environment-variables) in the Vercel dashboard.
4. Deploy!

### Cron Jobs
To enable Scheduled Tests, Vercel Cron must be configured. The project includes a `vercel.json` file at the root:
```json
{
  "crons": [
    {
      "path": "/api/cron/run-scheduled",
      "schedule": "0 * * * *"
    }
  ]
}
```
*Note: Ensure `CRON_SECRET` is set in your Vercel Environment Variables to secure the cron endpoint.*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/your-org/testpilot/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

<div align="center">
  <sub>Built with ❤️ by the Testpilot Team</sub>
</div>
