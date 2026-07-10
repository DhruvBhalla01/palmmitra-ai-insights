// Central re-export for framer-motion primitives.
// Use `m` (not `motion`) so LazyMotion can tree-shake features.
// Features are loaded once at the app root via <LazyMotion features={domAnimation}>.
export {
  m,
  AnimatePresence,
  LazyMotion,
  domAnimation,
  useReducedMotion,
} from 'framer-motion';
