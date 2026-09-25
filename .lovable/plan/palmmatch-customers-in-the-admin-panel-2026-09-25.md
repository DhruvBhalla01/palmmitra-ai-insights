# PalmMatch customers in the admin panel

Right now the admin panel only counts PalmMatch readings. The Customers list shows single palm readings only. This plan adds a dedicated **PalmMatch** tab.

## What you'll see
- A new **PalmMatch** tab, newest first, which refreshes every 15 seconds like the other tabs
- Each row shows: both names and ages, relationship type, email, language, compatibility score, date, and whether they paid (with plan and amount)
- Search by name or email, filter by paid or unpaid, and use the same time filter (Today / 7d / 30d / All)
- Click a row to open the full details: both palm photos (when stored), the score and verdict, a link to open their report, and all their payment attempts (paid, pending, failed)
- Export to CSV

## Technical details
- `admin-dashboard` edge function: new `palmmatch` action. It reads `palmmatch_reports` with the service role, uses the same pagination, search and export rules as `customers`, and joins `payments` on `palmmatch_report_id`. Paid status comes from `is_unlocked` or a successful payment. The verdict and palm photo URLs come from the `reading` JSON when present.
- `src/pages/Admin.tsx`: new `PalmMatchTab` with a table, a detail dialog and CSV export, built on the existing Customers tab pattern
- Admin-only access stays as it is (role check on the server). Nothing changes for public visitors.
- Checks: deploy the function, confirm a non-admin gets 403, compare row counts with the database, and do a quick mobile layout check
