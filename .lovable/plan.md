# Full test of the last 24 hours on palmmitra.in

## Already checked
- www.palmmitra.in and /admin load, and palmmitra.in redirects to www.
- The live admin page already includes Google sign-in, Last 50, Reminders, Health and Reviews.
- /admin is hidden from Google.
- Two reminder emails were tried and held back because the email domain isn't confirmed yet. They will retry automatically.

## What I will test (on the live site and preview, phone size 390px)
1. **Admin page**: sign-in screen, Google button, and that non-admins are blocked. I will also check that every tab (Overview, Last 50, Customers, Payments, Reminders, Health, Reviews) loads data and that the downloads work.
2. **Upload flow**: normal photo, iPhone HEIC photo (clear message), non-palm photo (retake message). I will also check that each failure reason shows in Health.
3. **Payment retry**: open checkout, close it, and check the "Try again" button appears and reopens payment. I will not complete any real payment.
4. **Reminder email link**: open a report with the reminder link on a fresh browser. The owner should see their own reading and the unlock button, not the shared preview.
5. **Reviews**: submit a test review. It should appear in Admin → Reviews and show on the home page only after approval. I will delete it afterwards.
6. **Reminders**: run "Send due reminders now" and check that it retries once the domain is confirmed and never sends twice.
7. **Regressions**: home page, pricing currency, PalmMatch (English/Hinglish), shared report link, dark theme, no sideways scrolling, and the automated tests.

## Output
A short report with three parts:
- **Working**
- **Broken**, with fixes proposed or made
- **Pending from you**: confirming the email domain, one sign-in to admin as thepalmmitra@gmail.com, publishing, and Search Console resubmission

Plus new suggestions, for example PalmMatch reminders, branded sign-in emails, and a daily summary email.

## Technical details
- Playwright scripts under /tmp/browser, with screenshots for every step.
- A test report and payment rows are created under qa-test@palmmitra.in and cleaned up afterwards through a migration.
- Admin data checks go through the edge function with a minted session if one is available. Otherwise they are read-only database queries compared against the dashboard's logic.
