// Central re-export for framer-motion primitives.
// Components must import `m` (not `motion`) so LazyMotion can defer feature loading.
// Feature set is dynamically imported once at the app root — see src/App.tsx.
export {
  m,
  AnimatePresence,
  LazyMotion,
  useReducedMotion,
} from 'framer-motion';
