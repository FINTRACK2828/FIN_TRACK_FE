# FinTrack frontend

Next.js frontend for the sibling Express/PostgreSQL project at
`C:\FinTrack\Fin_Track_Backend\fintrack-backend`.

## Run locally

1. Initialize and start PostgreSQL using the backend README. The backend checks
   database connectivity before opening its HTTP port.
2. Start the backend in a separate PowerShell terminal:

   ```powershell
   cd C:\FinTrack\Fin_Track_Backend\fintrack-backend
   $env:PORT='5001'
   npm start
   ```

3. Start the frontend:

   ```powershell
   cd C:\FinTrack\Fin_Track_Frontend\fintrack-frontend
   npm ci
   Copy-Item .env.example .env.local
   npm run dev -- --port 3001
   ```

4. Open http://localhost:3001 and register an account. Old browser demo accounts
   are not backend accounts; they must be registered separately. Existing browser
   finance data is not automatically imported.

Port 5001 avoids the unrelated application currently occupying port 5000.
`BACKEND_URL` in `.env.local` points to the API server without the `/api` suffix.
Restart Next.js after changing it. The frontend sends requests through
`/api/backend/*`; Next.js proxies these to `${BACKEND_URL}/api/*`, so the browser
does not need a separate CORS connection. For deployment set `BACKEND_URL` to the
backend address reachable from the Next.js server. Run this as a Next.js server,
not a static export.

## Connected features

- Registration, login, JWT authentication, logout and expired-session handling.
- Remember-me stores the session across browser restarts; unchecked uses session
  storage. Passwords are never saved in browser storage.
- All transaction pages, create/edit/delete, and backend category selections.
- Current-month budgets, savings goals, contributions, recurring bills and
  current-year monthly chart data.
- Name/email profile updates and server data refresh.
- Password recovery emails and `/reset-password?token=...`. Configure SMTP and
  `PASSWORD_RESET_URL=http://localhost:3001/reset-password` in the backend.

Writes update the display after the server confirms them. Backend errors appear
in the forms or dashboard. Recurring controls pause/resume the backend reminder;
the API does not support marking a billing cycle paid. Unsupported demo inputs
for payment methods, bill providers, auto-pay and profile preferences were removed.

## Checks

```powershell
npm test
npm run lint
npm run build
```

The API tests verify authentication, expiry, failures, pagination and request/response
mapping using a mocked HTTP transport. Live data requires a working PostgreSQL
database and the running FinTrack API. To diagnose startup, check
`http://localhost:5001/health`; FinTrack returns `success: true` and database health.
