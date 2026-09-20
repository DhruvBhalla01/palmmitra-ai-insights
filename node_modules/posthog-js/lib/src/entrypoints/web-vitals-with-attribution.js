"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
// Must be first: installs the Array.prototype.at and Array.prototype.findLast polyfills before
// web-vitals (which uses both internally) is evaluated, so the bundle doesn't throw on browsers
// that predate them.
require("@posthog/browser-common/utils/array-at-polyfill");
require("@posthog/browser-common/utils/array-find-last-polyfill");
var globals_1 = require("../utils/globals");
var attribution_1 = require("web-vitals/attribution");
var web_vitals_1 = require("web-vitals");
var postHogWebVitalsCallbacks = {
    onLCP: attribution_1.onLCP,
    onCLS: attribution_1.onCLS,
    onFCP: attribution_1.onFCP,
    onINP: attribution_1.onINP,
    withoutAttribution: { onLCP: web_vitals_1.onLCP, onCLS: web_vitals_1.onCLS, onFCP: web_vitals_1.onFCP, onINP: web_vitals_1.onINP },
};
globals_1.assignableWindow.__PosthogExtensions__ = globals_1.assignableWindow.__PosthogExtensions__ || {};
globals_1.assignableWindow.__PosthogExtensions__.postHogWebVitalsCallbacksByFlavor =
    globals_1.assignableWindow.__PosthogExtensions__.postHogWebVitalsCallbacksByFlavor || {};
globals_1.assignableWindow.__PosthogExtensions__.postHogWebVitalsCallbacksByFlavor['web-vitals-with-attribution'] =
    postHogWebVitalsCallbacks;
globals_1.assignableWindow.__PosthogExtensions__.postHogWebVitalsCallbacks = postHogWebVitalsCallbacks;
// we used to put posthogWebVitalsCallbacks on window, and now we put it on __PosthogExtensions__
// but that means that old clients which lazily load this extension are looking in the wrong place
// yuck,
// so we also put it directly on the window
// when 1.161.1 is the oldest version seen in production we can remove this
globals_1.assignableWindow.postHogWebVitalsCallbacks = postHogWebVitalsCallbacks;
exports.default = postHogWebVitalsCallbacks;
//# sourceMappingURL=web-vitals-with-attribution.js.map