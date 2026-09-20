"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebVitalsAutocapture = exports.FIFTEEN_MINUTES_IN_MILLIS = exports.DEFAULT_FLUSH_TO_CAPTURE_TIMEOUT_MILLISECONDS = void 0;
var logger_1 = require("@posthog/browser-common/utils/logger");
var core_1 = require("@posthog/core");
var constants_1 = require("../../constants");
var globals_1 = require("@posthog/browser-common/utils/globals");
var globals_2 = require("../../utils/globals");
var request_utils_1 = require("@posthog/browser-common/utils/request-utils");
var event_utils_1 = require("@posthog/browser-common/utils/event-utils");
var logger = (0, logger_1.createLogger)('[Web Vitals]');
exports.DEFAULT_FLUSH_TO_CAPTURE_TIMEOUT_MILLISECONDS = 5000;
var ONE_MINUTE_IN_MILLIS = 60 * 1000;
exports.FIFTEEN_MINUTES_IN_MILLIS = 15 * ONE_MINUTE_IN_MILLIS;
// Attribute INP and LCP by default. Their attribution names the slow interaction target
// and the load-phase breakdown, which is what makes a slow number diagnosable.
// CLS is excluded because onCLS with attribution holds detached DOM nodes and leaks in
// single-page apps (see the web-vitals-with-attribution entrypoint).
var ALL_WEB_VITALS_METRICS = ['CLS', 'FCP', 'INP', 'LCP'];
var DEFAULT_WEB_VITALS_ATTRIBUTION_METRICS = ['INP', 'LCP'];
// web-vitals attribution objects can carry DOM nodes and large PerformanceEntry arrays.
// We keep only these small scalar fields so the captured payload stays bounded.
var WEB_VITALS_ATTRIBUTION_ALLOWLIST = [
    // INP: which element was interacted with, plus the phase breakdown
    'interactionTarget',
    'interactionType',
    'inputDelay',
    'processingDuration',
    'presentationDelay',
    'loadState',
    // LCP: which element rendered, plus the load-phase breakdown
    'target',
    'url',
    'timeToFirstByte',
    'resourceLoadDelay',
    'resourceLoadDuration',
    'elementRenderDelay',
    // CLS: the single largest shift
    'largestShiftTarget',
    'largestShiftTime',
    'largestShiftValue',
    // FCP
    'firstByteToFCP',
];
var WebVitalsAutocapture = /** @class */ (function () {
    function WebVitalsAutocapture(_instance) {
        var _this = this;
        var _a;
        this._instance = _instance;
        this._enabledServerSide = false;
        this._initialized = false;
        this._buffer = {
            navigationKey: undefined,
            url: undefined,
            metrics: [],
            firstMetricTimestamp: undefined,
        };
        this._flushToCapture = function () {
            clearTimeout(_this._delayedFlushTimer);
            _this._delayedFlushTimer = undefined;
            if (_this._buffer.metrics.length === 0) {
                return;
            }
            _this._instance.capture('$web_vitals', __assign({ $current_url: _this._buffer.url }, _this._buffer.metrics.reduce(function (acc, metric) {
                var _a;
                return (__assign(__assign({}, acc), (_a = {}, _a["$web_vitals_".concat(metric.name, "_event")] = __assign({}, metric), _a["$web_vitals_".concat(metric.name, "_value")] = metric.value, _a)));
            }, {})));
            _this._buffer = { navigationKey: undefined, url: undefined, metrics: [], firstMetricTimestamp: undefined };
        };
        this._addToBuffer = function (metric) {
            var e_1, _a;
            var _b;
            _this._buffer = _this._buffer || {
                navigationKey: undefined,
                url: undefined,
                metrics: [],
                firstMetricTimestamp: undefined,
            };
            if ((0, core_1.isNullish)(metric === null || metric === void 0 ? void 0 : metric.name) || (0, core_1.isNullish)(metric === null || metric === void 0 ? void 0 : metric.value)) {
                logger.error('Invalid metric received', metric);
                return;
            }
            var navigationURL = typeof metric.navigationURL === 'string' ? metric.navigationURL : undefined;
            var $currentUrl = _this._maskedURL(navigationURL);
            if ((0, core_1.isUndefined)($currentUrl)) {
                return;
            }
            var hasNavigationId = (0, core_1.isNumber)(metric.navigationId) || typeof metric.navigationId === 'string';
            var navigationKey = hasNavigationId ? "navigation:".concat(metric.navigationId) : "url:".concat($currentUrl);
            // we observe some very large values sometimes, we'll ignore them
            // since the likelihood of LCP > 1 hour being correct is very low
            if (_this._maxAllowedValue && metric.value >= _this._maxAllowedValue) {
                logger.error('Ignoring metric with value >= ' + _this._maxAllowedValue, metric);
                return;
            }
            var navigationHasChanged = _this._buffer.navigationKey !== navigationKey;
            if (navigationHasChanged) {
                // we need to send what we have
                _this._flushToCapture();
                // poor performance is >4s, we wait twice that time to send
                // this is in case we haven't received all metrics
                // we'll at least gather some
                _this._delayedFlushTimer = setTimeout(_this._flushToCapture, _this.flushToCaptureTimeoutMs);
            }
            if ((0, core_1.isUndefined)(_this._buffer.navigationKey)) {
                _this._buffer.navigationKey = navigationKey;
                _this._buffer.url = $currentUrl;
            }
            _this._buffer.firstMetricTimestamp = (0, core_1.isUndefined)(_this._buffer.firstMetricTimestamp)
                ? Date.now()
                : _this._buffer.firstMetricTimestamp;
            var sessionIds = (_b = _this._instance.sessionManager) === null || _b === void 0 ? void 0 : _b.checkAndGetSessionAndWindowId(true);
            var bufferedMetric = __assign(__assign(__assign({}, metric), (navigationURL ? { navigationURL: $currentUrl } : {})), { $current_url: $currentUrl, timestamp: Date.now() });
            // `entries` is an array of raw PerformanceEntry objects that serialises to `[{}]`.
            // It adds payload weight with no diagnostic value, so we always drop it.
            delete bufferedMetric.entries;
            // Keep attribution only for the metrics we attribute, and bound it to small fields.
            if ((0, core_1.isObject)(metric.attribution) && _this.attributionMetrics.indexOf(metric.name) > -1) {
                var attribution = {};
                try {
                    for (var WEB_VITALS_ATTRIBUTION_ALLOWLIST_1 = __values(WEB_VITALS_ATTRIBUTION_ALLOWLIST), WEB_VITALS_ATTRIBUTION_ALLOWLIST_1_1 = WEB_VITALS_ATTRIBUTION_ALLOWLIST_1.next(); !WEB_VITALS_ATTRIBUTION_ALLOWLIST_1_1.done; WEB_VITALS_ATTRIBUTION_ALLOWLIST_1_1 = WEB_VITALS_ATTRIBUTION_ALLOWLIST_1.next()) {
                        var key = WEB_VITALS_ATTRIBUTION_ALLOWLIST_1_1.value;
                        var value = key === 'url' && typeof metric.attribution[key] === 'string'
                            ? _this._maskedURL(metric.attribution[key])
                            : metric.attribution[key];
                        if (!(0, core_1.isUndefined)(value)) {
                            attribution[key] = value;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (WEB_VITALS_ATTRIBUTION_ALLOWLIST_1_1 && !WEB_VITALS_ATTRIBUTION_ALLOWLIST_1_1.done && (_a = WEB_VITALS_ATTRIBUTION_ALLOWLIST_1.return)) _a.call(WEB_VITALS_ATTRIBUTION_ALLOWLIST_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                bufferedMetric.attribution = attribution;
            }
            else {
                delete bufferedMetric.attribution;
            }
            if (!(0, core_1.isUndefined)(sessionIds)) {
                bufferedMetric.$session_id = sessionIds.sessionId;
                bufferedMetric.$window_id = sessionIds.windowId;
            }
            _this._buffer.metrics.push(bufferedMetric);
            if (_this._buffer.metrics.length === _this.allowedMetrics.length) {
                // we have all allowed metrics
                _this._flushToCapture();
            }
        };
        this._startCapturing = function () {
            // IMPORTANT: web-vitals does not provide cleanup functions and warns against
            // calling functions more than once per page load. Each call creates new
            // PerformanceObservers that persist for the page lifetime.
            // See: https://github.com/GoogleChrome/web-vitals/issues/629
            if (_this._initialized) {
                return;
            }
            var onLCP;
            var onCLS;
            var onFCP;
            var onINP;
            // only the attribution bundle exposes unattributed observers alongside the attributed
            // ones, so its presence tells us the attribution-only opts are understood
            var isAttributionBundle = false;
            var posthogExtensions = globals_2.assignableWindow.__PosthogExtensions__;
            var callbacksByFlavor = posthogExtensions === null || posthogExtensions === void 0 ? void 0 : posthogExtensions.postHogWebVitalsCallbacksByFlavor;
            var callbacks = (callbacksByFlavor === null || callbacksByFlavor === void 0 ? void 0 : callbacksByFlavor[_this._callbackFlavor]) ||
                (_this._callbackFlavor === 'web-vitals' && (0, core_1.isUndefined)(callbacksByFlavor)
                    ? posthogExtensions === null || posthogExtensions === void 0 ? void 0 : posthogExtensions.postHogWebVitalsCallbacks
                    : undefined);
            if (!(0, core_1.isUndefined)(callbacks)) {
                var withoutAttribution = callbacks.withoutAttribution;
                var attributionMetrics = _this.attributionMetrics;
                isAttributionBundle = !(0, core_1.isUndefined)(withoutAttribution);
                onLCP =
                    attributionMetrics.indexOf('LCP') > -1 ? callbacks.onLCP : (withoutAttribution === null || withoutAttribution === void 0 ? void 0 : withoutAttribution.onLCP) || callbacks.onLCP;
                onCLS =
                    attributionMetrics.indexOf('CLS') > -1 ? callbacks.onCLS : (withoutAttribution === null || withoutAttribution === void 0 ? void 0 : withoutAttribution.onCLS) || callbacks.onCLS;
                onFCP =
                    attributionMetrics.indexOf('FCP') > -1 ? callbacks.onFCP : (withoutAttribution === null || withoutAttribution === void 0 ? void 0 : withoutAttribution.onFCP) || callbacks.onFCP;
                onINP =
                    attributionMetrics.indexOf('INP') > -1 ? callbacks.onINP : (withoutAttribution === null || withoutAttribution === void 0 ? void 0 : withoutAttribution.onINP) || callbacks.onINP;
            }
            if (!onLCP || !onCLS || !onFCP || !onINP) {
                logger.error('web vitals callbacks not loaded - not starting');
                return;
            }
            // Scope metrics to the browser's Soft Navigation entries when opted in, so SPA
            // route changes don't keep inflating the metric against the original hard navigation.
            var reportOpts = { reportSoftNavs: _this.useSoftNavs };
            // `processedEventEntries` is an array of raw event-timing entries the attributed onINP
            // retains but we never read, so we opt out of populating it. The option only exists in
            // the attribution build, so keep it off the default bundle's observers.
            var inpReportOpts = isAttributionBundle && _this.attributionMetrics.indexOf('INP') > -1
                ? __assign(__assign({}, reportOpts), { includeProcessedEventEntries: false }) : reportOpts;
            // register performance observers
            if (_this.allowedMetrics.indexOf('LCP') > -1) {
                onLCP(_this._addToBuffer.bind(_this), reportOpts);
            }
            if (_this.allowedMetrics.indexOf('CLS') > -1) {
                onCLS(_this._addToBuffer.bind(_this), reportOpts);
            }
            if (_this.allowedMetrics.indexOf('FCP') > -1) {
                onFCP(_this._addToBuffer.bind(_this), reportOpts);
            }
            if (_this.allowedMetrics.indexOf('INP') > -1) {
                onINP(_this._addToBuffer.bind(_this), inpReportOpts);
            }
            _this._initialized = true;
        };
        this._enabledServerSide = !!((_a = this._instance.persistence) === null || _a === void 0 ? void 0 : _a.props[constants_1.WEB_VITALS_ENABLED_SERVER_SIDE]);
        this.startIfEnabled();
    }
    Object.defineProperty(WebVitalsAutocapture.prototype, "_perfConfig", {
        get: function () {
            return this._instance.config.capture_performance;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebVitalsAutocapture.prototype, "allowedMetrics", {
        get: function () {
            var _a, _b;
            var clientConfigMetricAllowList = (0, core_1.isObject)(this._perfConfig)
                ? (_a = this._perfConfig) === null || _a === void 0 ? void 0 : _a.web_vitals_allowed_metrics
                : undefined;
            return !(0, core_1.isNullish)(clientConfigMetricAllowList)
                ? clientConfigMetricAllowList
                : ((_b = this._instance.persistence) === null || _b === void 0 ? void 0 : _b.props[constants_1.WEB_VITALS_ALLOWED_METRICS]) || ALL_WEB_VITALS_METRICS;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebVitalsAutocapture.prototype, "flushToCaptureTimeoutMs", {
        get: function () {
            var clientConfig = (0, core_1.isObject)(this._perfConfig)
                ? this._perfConfig.web_vitals_delayed_flush_ms
                : undefined;
            return clientConfig || exports.DEFAULT_FLUSH_TO_CAPTURE_TIMEOUT_MILLISECONDS;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebVitalsAutocapture.prototype, "attributionMetrics", {
        // The metrics we capture attribution for. `true` attributes all metrics, `false` none,
        // an array names them explicitly, and the default attributes INP and LCP only.
        get: function () {
            var clientConfig = (0, core_1.isObject)(this._perfConfig) ? this._perfConfig.web_vitals_attribution : undefined;
            if ((0, core_1.isBoolean)(clientConfig)) {
                return clientConfig ? ALL_WEB_VITALS_METRICS : [];
            }
            if ((0, core_1.isArray)(clientConfig)) {
                return clientConfig;
            }
            return DEFAULT_WEB_VITALS_ATTRIBUTION_METRICS;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebVitalsAutocapture.prototype, "useAttribution", {
        get: function () {
            return this.attributionMetrics.length > 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebVitalsAutocapture.prototype, "useSoftNavs", {
        get: function () {
            var clientConfig = (0, core_1.isObject)(this._perfConfig)
                ? this._perfConfig.__preview_web_vitals_soft_navs
                : undefined;
            return clientConfig !== null && clientConfig !== void 0 ? clientConfig : false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebVitalsAutocapture.prototype, "_maxAllowedValue", {
        get: function () {
            var configured = (0, core_1.isObject)(this._perfConfig) && (0, core_1.isNumber)(this._perfConfig.__web_vitals_max_value)
                ? this._perfConfig.__web_vitals_max_value
                : exports.FIFTEEN_MINUTES_IN_MILLIS;
            // you can set to 0 to disable the check or any value over ten seconds
            // 1 milli to 1 minute will be set to 15 minutes, cos that would be a silly low maximum
            return 0 < configured && configured <= ONE_MINUTE_IN_MILLIS ? exports.FIFTEEN_MINUTES_IN_MILLIS : configured;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebVitalsAutocapture.prototype, "isEnabled", {
        get: function () {
            // Always disable web vitals if we're not on http or https
            var protocol = globals_1.location === null || globals_1.location === void 0 ? void 0 : globals_1.location.protocol;
            if (protocol !== 'http:' && protocol !== 'https:') {
                logger.info('Web Vitals are disabled on non-http/https protocols');
                return false;
            }
            // Otherwise, check config
            var clientConfig = (0, core_1.isObject)(this._perfConfig)
                ? this._perfConfig.web_vitals
                : (0, core_1.isBoolean)(this._perfConfig)
                    ? this._perfConfig
                    : undefined;
            return (0, core_1.isBoolean)(clientConfig) ? clientConfig : this._enabledServerSide;
        },
        enumerable: false,
        configurable: true
    });
    WebVitalsAutocapture.prototype.startIfEnabled = function () {
        if (this.isEnabled && !this._initialized) {
            logger.info('enabled, starting...');
            this._loadScript(this._startCapturing);
        }
    };
    WebVitalsAutocapture.prototype.onRemoteConfig = function (result) {
        var _a, _b;
        if (!result.ok) {
            // Failure behaves like a response without a capturePerformance key.
            return;
        }
        var response = result.config;
        if (!('capturePerformance' in response)) {
            return;
        }
        var webVitalsOptIn = (0, core_1.isObject)(response.capturePerformance) && !!response.capturePerformance.web_vitals;
        var allowedMetrics = (0, core_1.isObject)(response.capturePerformance)
            ? response.capturePerformance.web_vitals_allowed_metrics
            : undefined;
        if (this._instance.persistence) {
            this._instance.persistence.register((_a = {},
                _a[constants_1.WEB_VITALS_ENABLED_SERVER_SIDE] = webVitalsOptIn,
                _a));
            this._instance.persistence.register((_b = {},
                _b[constants_1.WEB_VITALS_ALLOWED_METRICS] = allowedMetrics,
                _b));
        }
        // store this in-memory in case persistence is disabled
        this._enabledServerSide = webVitalsOptIn;
        this.startIfEnabled();
    };
    Object.defineProperty(WebVitalsAutocapture.prototype, "_callbackFlavor", {
        get: function () {
            return this.useSoftNavs
                ? this.useAttribution
                    ? 'web-vitals-with-attribution-soft-navs'
                    : 'web-vitals-soft-navs'
                : this.useAttribution
                    ? 'web-vitals-with-attribution'
                    : 'web-vitals';
        },
        enumerable: false,
        configurable: true
    });
    WebVitalsAutocapture.prototype._loadScript = function (cb) {
        var _a;
        var posthogExtensions = globals_2.assignableWindow.__PosthogExtensions__;
        var flavor = this._callbackFlavor;
        var callbacksByFlavor = posthogExtensions === null || posthogExtensions === void 0 ? void 0 : posthogExtensions.postHogWebVitalsCallbacksByFlavor;
        if ((callbacksByFlavor === null || callbacksByFlavor === void 0 ? void 0 : callbacksByFlavor[flavor]) ||
            (flavor === 'web-vitals' && (0, core_1.isUndefined)(callbacksByFlavor) && (posthogExtensions === null || posthogExtensions === void 0 ? void 0 : posthogExtensions.postHogWebVitalsCallbacks))) {
            cb();
            return;
        }
        (_a = posthogExtensions === null || posthogExtensions === void 0 ? void 0 : posthogExtensions.loadExternalDependency) === null || _a === void 0 ? void 0 : _a.call(posthogExtensions, this._instance, flavor, function (err) {
            if (err) {
                logger.error('failed to load script', err);
                return;
            }
            cb();
        });
    };
    WebVitalsAutocapture.prototype._maskedURL = function (url) {
        var href = url || (globals_1.window === null || globals_1.window === void 0 ? void 0 : globals_1.window.location.href);
        if (!href) {
            logger.error('Could not determine current URL');
            return undefined;
        }
        var urlWithoutHash = this._instance.config.disable_capture_url_hashes ? (0, core_1.stripUrlHash)(href) : href;
        // mask url query params
        var maskPersonalDataProperties = this._instance.config.mask_personal_data_properties;
        var customPersonalDataProperties = this._instance.config.custom_personal_data_properties;
        var paramsToMask = maskPersonalDataProperties
            ? __spreadArray(__spreadArray([], __read(event_utils_1.PERSONAL_DATA_CAMPAIGN_PARAMS), false), __read((customPersonalDataProperties || [])), false) : [];
        return (0, request_utils_1.maskQueryParams)(urlWithoutHash, paramsToMask, event_utils_1.MASKED);
    };
    return WebVitalsAutocapture;
}());
exports.WebVitalsAutocapture = WebVitalsAutocapture;
//# sourceMappingURL=index.js.map