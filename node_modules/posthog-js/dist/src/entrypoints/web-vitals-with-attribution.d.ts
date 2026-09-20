/**
 * Web Vitals entrypoint (with attribution)
 *
 * This bundle includes both attributed and unattributed observers so the SDK can
 * select attribution per metric. INP and LCP use attribution by default; CLS and
 * FCP use the unattributed observers unless explicitly configured otherwise.
 *
 * This bundle is ~18KB (vs ~6KB for the non-attribution version).
 *
 * Note: Attribution can cause memory issues in SPAs because the attributed onCLS
 * callback holds references to DOM elements that may be detached during navigation.
 *
 * Set capture_performance.web_vitals_attribution to true to attribute every metric,
 * false to load the lighter bundle, or an array to select individual metrics.
 *
 * @see web-vitals.ts for the lighter bundle
 */
import '@posthog/browser-common/utils/array-at-polyfill';
import '@posthog/browser-common/utils/array-find-last-polyfill';
import { type WebVitalsCallbacks } from '../utils/globals';
declare const postHogWebVitalsCallbacks: WebVitalsCallbacks;
export default postHogWebVitalsCallbacks;
