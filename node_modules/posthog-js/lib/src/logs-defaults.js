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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveLogsConfig = resolveLogsConfig;
var core_1 = require("@posthog/core");
var globals_1 = require("@posthog/browser-common/utils/globals");
var DEFAULT_FLUSH_INTERVAL_MS = 3000;
var DEFAULT_MAX_BUFFER_SIZE = 100;
var DEFAULT_MAX_LOGS_PER_INTERVAL = 1000;
// Console runs uncapped, so this buffer depth is its only drop protection.
var DEFAULT_CONSOLE_MAX_QUEUE_SIZE = 2048;
var DEFAULT_MAX_BATCH_RECORDS_PER_POST = 100;
/**
 * Browser resource attribute defaults. Identifies the visitor's OS so logs can
 * be filtered by platform (e.g. "only errors on Windows" in the PostHog UI).
 * User-supplied `resourceAttributes` merges last so these stay overridable.
 *
 * `detectOS` returns empty strings for a user agent it can't place, and there is
 * no `navigator` in an SSR or worker-like context — either way the key is
 * omitted rather than emitted empty, and resolution never throws.
 */
function defaultResourceAttributes() {
    var _a;
    var osName = '';
    var osVersion = '';
    try {
        var userAgent = globals_1.navigator === null || globals_1.navigator === void 0 ? void 0 : globals_1.navigator.userAgent;
        if (userAgent) {
            ;
            _a = __read((0, core_1.detectOS)(userAgent), 2), osName = _a[0], osVersion = _a[1];
        }
    }
    catch (_b) { }
    return (0, core_1.osResourceAttributes)(osName, osVersion);
}
/**
 * Resolves the public `logs` config into the shape core `PostHogLogs` consumes.
 *
 * `serviceNameDefault` is the console instance's `service.name` fallback
 * (`posthog-browser-logs`); the programmatic instance falls back to core's
 * `unknown_service`. `consoleCapture` disables the per-interval rate cap entirely
 * (even when the user set `maxLogsPerInterval`), so console capture is never
 * rate-dropped — the deep buffer is its only bound.
 */
function resolveLogsConfig(config, opts) {
    var _a, _b, _c, _d, _e, _f, _g;
    var flushIntervalMs = (_a = config === null || config === void 0 ? void 0 : config.flushIntervalMs) !== null && _a !== void 0 ? _a : DEFAULT_FLUSH_INTERVAL_MS;
    var maxBufferSize = (_b = config === null || config === void 0 ? void 0 : config.maxBufferSize) !== null && _b !== void 0 ? _b : DEFAULT_MAX_BUFFER_SIZE;
    var maxLogsPerInterval = (opts === null || opts === void 0 ? void 0 : opts.consoleCapture)
        ? undefined
        : ((_c = config === null || config === void 0 ? void 0 : config.maxLogsPerInterval) !== null && _c !== void 0 ? _c : DEFAULT_MAX_LOGS_PER_INTERVAL);
    var maxQueueSize = (0, core_1.isUndefined)(maxLogsPerInterval)
        ? Math.max(maxBufferSize, DEFAULT_CONSOLE_MAX_QUEUE_SIZE)
        : Math.max(maxBufferSize, maxLogsPerInterval);
    // OTLP keys in `resourceAttributes` take precedence over the named config fields.
    var resourceAttributes = __assign(__assign({}, defaultResourceAttributes()), config === null || config === void 0 ? void 0 : config.resourceAttributes);
    return {
        serviceName: (_e = (_d = resourceAttributes === null || resourceAttributes === void 0 ? void 0 : resourceAttributes['service.name']) !== null && _d !== void 0 ? _d : config === null || config === void 0 ? void 0 : config.serviceName) !== null && _e !== void 0 ? _e : opts === null || opts === void 0 ? void 0 : opts.serviceNameDefault,
        serviceVersion: (_f = resourceAttributes === null || resourceAttributes === void 0 ? void 0 : resourceAttributes['service.version']) !== null && _f !== void 0 ? _f : config === null || config === void 0 ? void 0 : config.serviceVersion,
        environment: (_g = resourceAttributes === null || resourceAttributes === void 0 ? void 0 : resourceAttributes['deployment.environment']) !== null && _g !== void 0 ? _g : config === null || config === void 0 ? void 0 : config.environment,
        resourceAttributes: resourceAttributes,
        beforeSend: config === null || config === void 0 ? void 0 : config.beforeSend,
        flushIntervalMs: flushIntervalMs,
        maxBufferSize: maxBufferSize,
        maxQueueSize: maxQueueSize,
        maxBatchRecordsPerPost: DEFAULT_MAX_BATCH_RECORDS_PER_POST,
        rateCapWindowMs: flushIntervalMs,
        maxLogsPerInterval: maxLogsPerInterval,
        // Mobile-only budgets; the browser drains on pagehide via sendBeacon.
        backgroundFlushBudgetMs: 0,
        terminationFlushBudgetMs: 0,
    };
}
//# sourceMappingURL=logs-defaults.js.map