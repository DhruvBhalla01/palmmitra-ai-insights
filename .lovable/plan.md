
# Fix Console Warnings and Polish

## Overview

This plan addresses the remaining console warnings to make PalmMitra completely clean and production-ready.

---

## Issues to Fix

### Issue 1: React Router v7 Deprecation Warning

The console shows a deprecation warning about React Router v7 future flags. We need to add the `future` prop to `BrowserRouter` to opt-in to v7 behavior and silence the warning.

### Issue 2: MobileCTABar Potential Ref Warning

While `AnimatePresence` with `motion.div` typically handles refs correctly, we should ensure the component follows best practices for Framer Motion animations.

---

## Technical Changes

### File 1: `src/App.tsx`

Add React Router v7 future flags to `BrowserRouter`:

```tsx
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

This silences the deprecation warning and prepares the app for React Router v7.

### File 2: `src/components/MobileCTABar.tsx`

The component looks correct, but we'll ensure it follows Framer Motion best practices by:
- Adding `mode="wait"` to AnimatePresence for cleaner exit animations (already present implicitly)
- The `motion.div` component handles refs internally, so no forwardRef needed here

---

## Summary

| File | Change |
|------|--------|
| `src/App.tsx` | Add React Router v7 future flags |
| `src/components/MobileCTABar.tsx` | Verify no changes needed (already correct) |

---

## Expected Outcome

After these changes:
- No React Router deprecation warnings in console
- Clean console with no warnings
- App prepared for future React Router v7 upgrade
