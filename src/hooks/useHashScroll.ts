import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NAVBAR_HEIGHT = 80; // Height of sticky navbar in pixels

/**
 * Custom hook that handles hash-based navigation with smooth scrolling
 * and proper offset for the sticky navbar.
 * 
 * Usage: Call this hook in any component that needs hash scroll support.
 * It will automatically scroll to the element matching the URL hash on mount
 * and when the hash changes.
 */
export function useHashScroll() {
  const location = useLocation();

  useEffect(() => {
    // Small delay to ensure DOM is ready after route transitions
    const timeoutId = setTimeout(() => {
      if (location.hash) {
        const elementId = location.hash.slice(1); // Remove the # symbol
        const element = document.getElementById(elementId);
        
        if (element) {
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - NAVBAR_HEIGHT;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      } else {
        // No hash, scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.hash, location.pathname]);
}

/**
 * Utility function to scroll to a specific element with navbar offset.
 * Can be called programmatically for internal navigation.
 */
export function scrollToElement(elementId: string) {
  const element = document.getElementById(elementId);
  
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - NAVBAR_HEIGHT;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}
