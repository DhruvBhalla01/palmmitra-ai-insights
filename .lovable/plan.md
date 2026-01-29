
# Fix PaymentModal Centering Bug

## Problem
The PaymentModal is not perfectly centered on all screen sizes. The current class uses `w-[calc(100%-2rem)]` which can cause positioning issues, and there's no scroll lock when the modal is open.

## Solution

### 1. Update Modal Container Classes (line 46)

**Current:**
```tsx
className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] md:max-w-lg md:w-full z-50 overflow-y-auto max-h-[90vh]"
```

**Replace with:**
```tsx
className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-lg z-50 overflow-y-auto max-h-[90vh]"
```

This ensures:
- Consistent centering on ALL breakpoints (mobile + desktop)
- `w-[92%]` gives consistent edge padding
- `max-w-lg` caps width on larger screens
- Removed redundant `md:` prefixes for cleaner responsive behavior

### 2. Add Scroll Lock Effect

Add a `useEffect` hook to prevent background scrolling when the modal is open:

```tsx
import { useState, useEffect } from "react";

// Inside the component:
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
  
  // Cleanup on unmount
  return () => {
    document.body.style.overflow = "";
  };
}, [isOpen]);
```

## File to Modify

- `src/components/payment/PaymentModal.tsx`

## Technical Details

- The fix uses transform-based centering (`left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`) which works consistently across all viewport sizes
- The `w-[92%]` provides 4% margin on each side (8% total), ensuring the modal never touches screen edges on mobile
- The scroll lock prevents the page from scrolling behind the modal, improving UX especially on mobile
- Cleanup function ensures scroll is restored if component unmounts unexpectedly
