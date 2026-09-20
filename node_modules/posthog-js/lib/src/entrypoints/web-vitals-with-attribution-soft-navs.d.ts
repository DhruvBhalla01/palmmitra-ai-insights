/**
 * Web Vitals entrypoint (soft navigations, with attribution)
 *
 * Identical to web-vitals-with-attribution.ts, but built against pinned stable
 * web-vitals 6.x so the observers understand the `reportSoftNavs` option.
 * That option scopes each metric to the browser's Soft Navigation entries, so on a
 * single-page app the measurement window restarts on client-side route changes
 * instead of accumulating against the original hard-navigation timestamp.
 *
 * This is loaded lazily when soft navigations are enabled and at least one metric
 * uses attribution. The bundle includes unattributed observers as well, allowing
 * the SDK to keep CLS and FCP unattributed by default. The feature relies on Chrome's
 * experimental Soft Navigation Detection API.
 *
 * Note: as with the non-soft-navs attribution build, attributed onCLS can cause memory
 * issues in SPAs because it holds references to DOM elements that may be detached
 * during navigation.
 *
 * @see web-vitals-soft-navs.ts for the lighter soft-navs bundle
 * @see web-vitals-with-attribution.ts for the default attribution bundle
 */
import '@posthog/browser-common/utils/array-at-polyfill';
import '@posthog/browser-common/utils/array-find-last-polyfill';
import { type WebVitalsCallbacks } from '../utils/globals';
declare const postHogWebVitalsCallbacks: WebVitalsCallbacks;
export default postHogWebVitalsCallbacks;
