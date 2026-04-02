'use client';

import { useState, useEffect } from 'react';

/**
 * ClientOnly wrapper for Power Pages Integration
 * Prevents React from mounting until the execution thread has yielded twice 
 * via requestAnimationFrame. This guarantees that Power Pages Liquid templates
 * and native JavaScript have finished actively mutating the <body> tag before
 * React begins its hydration process, preventing silent bailout mismatch errors.
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // First frame: let the browser parse the initial static DOM
    requestAnimationFrame(() => {
      // Second frame: let Power Pages scripts run and inject their wrappers
      requestAnimationFrame(() => {
        // DOM is now stabilized. Mount React app payload.
        setHasMounted(true);
      });
    });
  }, []);

  if (!hasMounted) {
    // Return completely blank during initial static layout tree calculation.
    // This allows Power Pages to render the background and initial Liquid without interference.
    return null; // Or you could return a subtle global loading spinner
  }

  return <>{children}</>;
}
