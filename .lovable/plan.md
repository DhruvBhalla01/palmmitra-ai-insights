# Admin Dashboard (live tracking)

A private page at `/admin`. Only thepalmmitra@gmail.com can open it, signed in with the site's existing email-link login. Everyone else sees "Not authorized". The page is hidden from Google.

## What you'll see

1. **Live counters**, which refresh on their own every 15 seconds
   - Visitors, uploads, PalmMatch readings, checkouts started, and paid orders
   - Revenue split by currency (INR, USD, GBP and others)
   - Filter by time: Today, 7 days, 30 days, or All time
2. **Conversion funnel**: Visit → Upload → Report viewed → Checkout started → Paid, with the drop-off percentage between each step
3. **Customer list**, newest first
   - Name, email, age, country, language, reading type, palm photo thumbnail, date, and whether they paid (with plan and amount)
   - Search by name or email, filter by paid or unpaid
   - Clicking a row opens the full details: palm photo, a link to the report, and all their payments
   - Export to CSV
4. **Payments feed**
   - Every order with time, email, plan, amount, currency, status (paid, pending or failed), and payment ID
   - Filter by status and plan
   - Export to CSV

Clean dark-and-gold look, matching the brand, and usable on your phone.

## Security

- Admin rights live in a separate admin list in the database, never in the browser.
- All data is fetched on the server after checking that the signed-in person is an admin. Customer tables stay locked to the public as they are now.

## Technical details

- **Database migration**
  - `app_role` enum, `user_roles` table (with grants and RLS), and a `has_role()` security-definer function
  - A trigger that grants the admin role when thepalmmitra@gmail.com signs up. If that account already exists, the role is inserted directly.
- **Edge function `admin-dashboard`**
  - Validates the JWT, then checks `has_role(uid, 'admin')` and returns 403 if the check fails
  - Uses the service role to read `palm_reports`, `palmmatch_reports`, `payments`, `report_unlocks` and `analytics_events`
  - Actions: `summary`, `funnel`, `customers` (paginated and searchable), `payments` (paginated and filterable)
  - Palm photos come from the public `palm-uploads` URLs
- **Frontend**
  - `src/pages/Admin.tsx` with lazy-loaded tab components under `src/components/admin/`
  - Uses react-query with a 15-second refetch interval
  - Sign-in screen reuses the existing magic-link login
  - Route added in `App.tsx`, marked `noindex`, and left out of the sitemap and navbar
- **Checks**
  - A non-admin gets 403
  - As admin, counts match direct database queries
  - Mobile layout checked with Playwright
