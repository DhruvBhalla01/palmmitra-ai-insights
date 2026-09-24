/** Run `cb` once, on the first user interaction or after `timeout` ms — whichever comes first. */
export function onFirstInteraction(cb: () => void, timeout = 4000) {
  if (typeof window === 'undefined') return;
  let done = false;
  const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
  const run = () => {
    if (done) return;
    done = true;
    events.forEach((e) => window.removeEventListener(e, run));
    clearTimeout(t);
    cb();
  };
  events.forEach((e) => window.addEventListener(e, run, { passive: true, once: true }));
  const t = window.setTimeout(run, timeout);
}
