import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MouseEvent, forwardRef, ReactNode } from 'react';

const NAVBAR_HEIGHT = 80;

interface SmartLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * SmartLink handles navigation intelligently:
 * - For same-page hash links (e.g., #about), scrolls smoothly with navbar offset
 * - For cross-page hash links (e.g., /#about from /contact), navigates then scrolls
 * - For regular page links, uses standard navigation
 */
export const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(
  ({ to, children, className, onClick }, ref) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      // Check if this is a hash link
      const hasHash = to.includes('#');
      
      if (hasHash) {
        const [path, hash] = to.split('#');
        const targetPath = path || '/';
        const isCurrentPage = location.pathname === targetPath;

        if (isCurrentPage) {
          // Same page - scroll directly with offset
          e.preventDefault();
          const element = document.getElementById(hash);
          
          if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - NAVBAR_HEIGHT;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
            
            // Update URL hash without navigation
            window.history.pushState(null, '', `#${hash}`);
          }
        } else {
          // Different page - navigate and let useHashScroll handle scrolling
          e.preventDefault();
          navigate(to);
        }
      }
      
      onClick?.();
    };

    return (
      <Link ref={ref} to={to} className={className} onClick={handleClick}>
        {children}
      </Link>
    );
  }
);

SmartLink.displayName = 'SmartLink';
