/**
 * Web Vitals entrypoint (soft navigations, without attribution)
 *
 * Identical to web-vitals.ts, but built against pinned stable web-vitals 6.x.
 * That build understands the `reportSoftNavs` option, which
 * scopes each metric to the browser's Soft Navigation entries. On a single-page
 * app this restarts the measurement window on client-side route changes instead
 * of accumulating against the original hard-navigation timestamp (which otherwise
 * inflates LCP and friends).
 *
 * This is loaded lazily only when `capture_performance: { __preview_web_vitals_soft_navs: true }`
 * is set, so the standard bundle and its consumers are unaffected. The feature relies
 * on Chrome's experimental Soft Navigation Detection API.
 *
 * @see web-vitals.ts for the default bundle
 * @see web-vitals-with-attribution-soft-navs.ts for the attribution variant
 */
import '@posthog/browser-common/utils/array-at-polyfill';
import { type WebVitalsCallbacks } from '../utils/globals';
declare const postHogWebVitalsCallbacks: WebVitalsCallbacks;
export default postHogWebVitalsCallbacks;
