# Start Testing – Quick Guide

## 1. Start the app (required)

Tests hit the running frontend and (for some flows) the backend API.

**Terminal 1 – Backend**

Bash:
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

PowerShell (use `;` not `&&`):
```powershell
Set-Location backend; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 – Frontend**

Bash:
```bash
cd frontend
npm run dev
```

PowerShell:
```powershell
Set-Location frontend; npm run dev
```

- Frontend: http://localhost:3000 (or 3001/3002 if 3000 is in use – set `PW_BASE_URL` in step 3)  
- Backend API: http://localhost:8000  

## 2. Install Playwright browsers (once)

```bash
cd frontend
npm ci
npx playwright install chromium
```

To install all browsers (chromium, firefox, webkit):
```bash
npx playwright install
```

## 3. Run tests

**If the frontend runs on 3001 or 3002**, set the base URL so tests hit the right port:

- Bash: `export PW_BASE_URL=http://localhost:3002`
- PowerShell: `$env:PW_BASE_URL='http://localhost:3002'`

**One-shot: start servers and run tests (PowerShell)**  
From `frontend` folder: `.\run-and-test.ps1` (starts backend + frontend in jobs, waits, runs tests).

**Use case suite (chromium only – recommended for local runs)**    
```bash
cd frontend
npm run test:use-cases
```

**All tests, Chromium only**  
```bash
npm run test:chromium
```

**All tests, all browsers**  
```bash
npm run test
```

**With UI (pick and run tests)**  
```bash
npm run test:ui
```

**Specific file**  
```bash
npx playwright test tests/use-cases-full.spec.js --project=chromium
npx playwright test tests/role-flows.spec.js --project=chromium
npx playwright test tests/use-cases-hierarchy.spec.js --project=chromium
```

## 4. Credentials

**Hierarchy users (use-cases-full.spec.js, use-cases-hierarchy.spec.js)**  
- Default: `customer1@hierarchy.example.com`, `engineer_1@hierarchy.example.com`, `cityadmin_1@hierarchy.example.com`, `stateadmin_ka@hierarchy.example.com`, etc., password `HierarchyTest1!`.
- **You must create them in the same DB the backend uses:**  
  `cd backend && python scripts/seed_hierarchy.py`  
  (Run this after the backend is using its database; if the backend was already running, the seed updates the DB it connects to.)
- City admin / engineer emails use city id: `cityadmin_1@...`, `engineer_1@...` (first city id may be 1). If your first city has a different id, set `PW_CITY_ADMIN_EMAIL` and `PW_ENGINEER_EMAIL`.

**role-flows.spec.js**  
- Set `PW_USE_HIERARCHY_CREDS=1` to use the same hierarchy users as above (recommended after running seed_hierarchy.py).
- Platform admin: default `admin@erepairing.com` / `Admin@123` (from seed_all or create_platform_and_org_admin). If you only ran init_db, password is `admin123` — set `PW_PLATFORM_ADMIN_PASSWORD=admin123`.
- Without `PW_USE_HIERARCHY_CREDS`, role-flows uses its own user set (e.g. anand*@anand.com); create those users or use hierarchy creds.

## 5. View report after a run

```bash
npm run test:report
```

## 6. Backend API tests (hierarchy)

```bash
cd backend
python -m pytest tests/test_hierarchy.py -v -m api
```

No frontend needed; uses test DB (e.g. SQLite in-memory).
