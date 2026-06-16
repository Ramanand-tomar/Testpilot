# Test Run History Implementation Plan

This plan outlines the steps to introduce a `testRuns` table, update the test execution logic to group tests by run, and build a UI to browse historical runs (similar to TestSprite).

## Proposed Changes

### 1. Database Schema
#### [MODIFY] [db/schema.ts](file:///c:/Users/raman/OneDrive/Desktop/interesting-projects/Ai-Testing-Automation-Agent/Ai-Testing-Automation-Agent/db/schema.ts)
- Create new `testRuns` table with columns: `id`, `repoId`, `userId`, `status`, `totalTests`, `passed`, `failed`, `durationMs`, `triggeredBy`, `shareToken`, `createdAt`.
- Add `runId` column to `testCases` table linking to `testRuns`.
- Add Drizzle relations between `testRuns`, `repositories`, and `testCases`.

### 2. API Routes
#### [MODIFY] [app/api/test-cases/run/route.ts](file:///c:/Users/raman/OneDrive/Desktop/interesting-projects/Ai-Testing-Automation-Agent/Ai-Testing-Automation-Agent/app/api/test-cases/run/route.ts)
- Generate a `shareToken` using `crypto.randomUUID()`.
- Insert a new `testRun` record (status: `running`, `triggeredBy`: `manual`) before the test loop begins.
- Update each `testCase` to associate with the new `runId`.
- Track execution time, passed, and failed counts.
- Upon completion, update the `testRun` record with final stats and `status='complete'`.

#### [NEW] [app/api/runs/route.ts](file:///c:/Users/raman/OneDrive/Desktop/interesting-projects/Ai-Testing-Automation-Agent/Ai-Testing-Automation-Agent/app/api/runs/route.ts)
- `GET` endpoint. Extracts `repoId` from search params.
- Returns all `testRuns` for that repo, ordered by `createdAt` descending.

#### [NEW] [app/api/runs/[runId]/route.ts](file:///c:/Users/raman/OneDrive/Desktop/interesting-projects/Ai-Testing-Automation-Agent/Ai-Testing-Automation-Agent/app/api/runs/[runId]/route.ts)
- `GET` endpoint. 
- Returns the specific `testRun` along with a nested array of its associated `testCases` (including logs, scripts, and session details).

### 3. UI Components
#### [NEW] [components/run-history.tsx](file:///c:/Users/raman/OneDrive/Desktop/interesting-projects/Ai-Testing-Automation-Agent/Ai-Testing-Automation-Agent/components/run-history.tsx)
- A component to fetch and display the list of `testRuns` for a given repository.
- Will be embedded inside `RepositoryCard` as a collapsible section (e.g., a "View Run History" toggle).
- Displays run number, status badge, pass/fail counts, duration, and a "View Details" button.

#### [NEW] [components/modals/run-detail-modal.tsx](file:///c:/Users/raman/OneDrive/Desktop/interesting-projects/Ai-Testing-Automation-Agent/Ai-Testing-Automation-Agent/components/modals/run-detail-modal.tsx)
- A Radix UI Dialog triggered from the Run History list.
- Fetches detailed `testCases` for the selected run from `/api/runs/[runId]`.
- Displays the status, logs, generated scripts, and session URLs for every test in that run.

#### [MODIFY] [components/repository-card.tsx](file:///c:/Users/raman/OneDrive/Desktop/interesting-projects/Ai-Testing-Automation-Agent/Ai-Testing-Automation-Agent/components/repository-card.tsx)
- Embed the new `<RunHistory />` component below the list of individual test cases.

## User Review Required

> [!WARNING]  
> Drizzle schema changes require a database push (`npx drizzle-kit push`). Running this may temporarily lock or alter tables.

> [!NOTE]
> Currently, test execution happens synchronously in the API route. The new `testRun` will remain in a `running` state if the server process is killed mid-execution. A stale-run cleanup mechanism or background job engine might be needed in the future for production resilience.

Please review the plan above and let me know if you approve to proceed with the execution.
