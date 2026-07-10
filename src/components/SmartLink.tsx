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
      const hasHash = to.includes('#');

      if (hasHash) {
        const [path, hash] = to.split('#');
        const targetPath = path || '/';
        const isCurrentPage = location.pathname === targetPath;

        if (isCurrentPage) {
          // Same page: close menu first, then scroll (retry for lazy sections)
          e.preventDefault();
          onClick?.();

          const scrollToHash = (attempt = 0) => {
            const element = document.getElementById(hash);
            if (element) {
              const top = element.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
              window.scrollTo({ top, behavior: 'smooth' });
              window.history.pushState(null, '', `#${hash}`);
            } else if (attempt < 10) {
              setTimeout(() => scrollToHash(attempt + 1), 100);
            }
          };
          // Defer past the menu-close render so layout is stable
          requestAnimationFrame(() => scrollToHash());
          return;
        }

        // Different page: let useHashScroll handle scrolling after nav
        e.preventDefault();
        onClick?.();
        navigate(to);
        return;
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
