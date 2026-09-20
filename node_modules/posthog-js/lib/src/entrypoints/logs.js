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
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("../utils/globals");
var patch_1 = require("../extensions/replay/rrweb-plugins/patch");
var console_original_1 = require("../utils/console-original");
var extension_tokens_1 = require("../extension-tokens");
var core_1 = require("@posthog/core");
var LOG_BODY_SIZE_LIMIT = 10000;
var LOG_ATTRIBUTES_LIMIT = 50;
var appendWithLimit = function (parts, text, budget) {
    if (budget.remaining <= 0) {
        budget.truncated = true;
        return false;
    }
    if (text.length <= budget.remaining) {
        parts.push(text);
        budget.remaining -= text.length;
        return true;
    }
    parts.push(text.slice(0, budget.remaining));
    budget.remaining = 0;
    budget.truncated = true;
    return false;
};
var stringifyStringWithLimit = function (value, parts, budget) {
    var serialized = JSON.stringify(value);
    if (serialized.length <= budget.remaining) {
        return appendWithLimit(parts, serialized, budget);
    }
    budget.truncated = true;
    if (budget.remaining < 2) {
        return false;
    }
    var low = 0;
    var high = Math.min(value.length, budget.remaining - 2);
    while (low < high) {
        var mid = Math.ceil((low + high) / 2);
        if (JSON.stringify(value.slice(0, mid)).length <= budget.remaining) {
            low = mid;
        }
        else {
            high = mid - 1;
        }
    }
    return appendWithLimit(parts, JSON.stringify(value.slice(0, low)), budget);
};
var isJSONSerializablePrimitive = function (value) {
    return typeof value !== 'undefined' &&
        typeof value !== 'function' &&
        typeof value !== 'symbol' &&
        typeof value !== 'bigint';
};
var isNumberOrBoolean = function (value) {
    try {
        return (0, core_1.isNumber)(value) || (0, core_1.isBoolean)(value);
    }
    catch (_a) {
        return false;
    }
};
var collectAttributeValue = function (key, value, collector) {
    if (collector.truncated) {
        return;
    }
    collector.keysRemaining -= 1;
    collector.sizeRemaining -= String(value).length + key.length;
    if (collector.keysRemaining <= 0 || collector.sizeRemaining <= 0) {
        collector.truncated = true;
        collector.result['attributes_truncated'] = true;
        return;
    }
    collector.result[key] = value;
};
var collectFlattenedAttributes = function (value, key, collector) {
    if (collector.truncated) {
        return;
    }
    if ((0, core_1.isObject)(value)) {
        if (collector.seen.has(value)) {
            collectAttributeValue(key || 'circular', '[Circular]', collector);
            return;
        }
        collector.seen.add(value);
        try {
            for (var childKey in value) {
                try {
                    if (!Object.prototype.hasOwnProperty.call(value, childKey)) {
                        continue;
                    }
                    var childValue = value[childKey];
                    collectFlattenedAttributes(childValue, key ? "".concat(key, ".").concat(childKey) : childKey, collector);
                    if (collector.truncated) {
                        return;
                    }
                }
                catch (_a) {
                    continue;
                }
            }
        }
        catch (_b) {
            // we'll omit this object's properties considering we can't enumerate them
        }
        return;
    }
    collectAttributeValue(key, value, collector);
};
var stringifyValueWithLimit = function (value, parts, budget, seen, inArray, attributeCollector) {
    if (inArray === void 0) { inArray = false; }
    if (!isJSONSerializablePrimitive(value)) {
        return inArray ? appendWithLimit(parts, 'null', budget) : true;
    }
    if ((0, core_1.isNull)(value) || isNumberOrBoolean(value)) {
        return appendWithLimit(parts, JSON.stringify(value), budget);
    }
    if (typeof value === 'string') {
        return stringifyStringWithLimit(value, parts, budget);
    }
    if (!(0, core_1.isObject)(value) && !(0, core_1.isArray)(value)) {
        return appendWithLimit(parts, JSON.stringify(value), budget);
    }
    if (seen.has(value)) {
        return stringifyStringWithLimit('[Circular]', parts, budget);
    }
    seen.add(value);
    try {
        var toJSON = value.toJSON;
        if ((0, core_1.isFunction)(toJSON)) {
            return stringifyValueWithLimit(toJSON.call(value), parts, budget, seen, inArray);
        }
    }
    catch (_a) {
        // If toJSON can't be read or throws, fall through to safe property enumeration.
    }
    try {
        var objectTag = Object.prototype.toString.call(value);
        if (objectTag === '[object String]') {
            return stringifyStringWithLimit(String(value.valueOf()), parts, budget);
        }
        if (objectTag === '[object Number]' || objectTag === '[object Boolean]') {
            return appendWithLimit(parts, JSON.stringify(value.valueOf()), budget);
        }
    }
    catch (_b) {
        // If Object.prototype.toString or valueOf throws, fall through to safe property enumeration.
    }
    if (value instanceof Error) {
        var errorObject = {};
        try {
            for (var key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    errorObject[key] = value[key];
                }
            }
        }
        catch (_c) { }
        try {
            errorObject.name = value.name;
        }
        catch (_d) { }
        try {
            errorObject.message = value.message;
        }
        catch (_e) { }
        try {
            errorObject.stack = value.stack;
        }
        catch (_f) { }
        return stringifyValueWithLimit(errorObject, parts, budget, seen, inArray, attributeCollector);
    }
    if ((0, core_1.isArray)(value)) {
        if (!appendWithLimit(parts, '[', budget)) {
            return false;
        }
        for (var i = 0; i < value.length; i++) {
            if (i > 0 && !appendWithLimit(parts, ',', budget)) {
                return false;
            }
            var item = void 0;
            try {
                item = value[i];
            }
            catch (_g) {
                item = undefined;
            }
            if (!stringifyValueWithLimit(item, parts, budget, seen, true)) {
                return false;
            }
        }
        return appendWithLimit(parts, ']', budget);
    }
    if (!appendWithLimit(parts, '{', budget)) {
        return false;
    }
    var isFirst = true;
    try {
        for (var key in value) {
            if (!Object.prototype.hasOwnProperty.call(value, key)) {
                continue;
            }
            if (budget.remaining <= 0) {
                budget.truncated = true;
                return false;
            }
            var propertyValue = void 0;
            try {
                propertyValue = value[key];
            }
            catch (_h) {
                continue;
            }
            if (attributeCollector) {
                try {
                    collectFlattenedAttributes(propertyValue, key, attributeCollector);
                }
                catch (_j) {
                    // we'll omit this object's attributes considering we can't read them safely
                }
            }
            if (!isJSONSerializablePrimitive(propertyValue)) {
                continue;
            }
            var propertyPrefix = "".concat(isFirst ? '' : ',').concat(JSON.stringify(key), ":");
            if (propertyPrefix.length >= budget.remaining) {
                budget.truncated = true;
                return false;
            }
            var partsBeforeProperty = parts.length;
            var remainingBeforeProperty = budget.remaining;
            var truncatedBeforeProperty = budget.truncated;
            if (!appendWithLimit(parts, propertyPrefix, budget)) {
                return false;
            }
            var partsBeforeValue = parts.length;
            var serialized = stringifyValueWithLimit(propertyValue, parts, budget, seen, false);
            var truncatedAfterValue = budget.truncated;
            if (parts.length === partsBeforeValue) {
                parts.length = partsBeforeProperty;
                budget.remaining = remainingBeforeProperty;
                budget.truncated = serialized ? truncatedBeforeProperty : truncatedAfterValue;
                if (!serialized) {
                    return false;
                }
                continue;
            }
            isFirst = false;
            if (!serialized) {
                return false;
            }
        }
    }
    catch (_k) {
        // we'll omit this object's properties considering we can't enumerate them
    }
    return appendWithLimit(parts, '}', budget);
};
var stringifyArgsSafely = function (args, sizeLimit) {
    var parts = [];
    var budget = { remaining: sizeLimit, truncated: false };
    var attributeCollector = (0, core_1.isObject)(args[0])
        ? {
            result: {},
            keysRemaining: LOG_ATTRIBUTES_LIMIT,
            sizeRemaining: LOG_BODY_SIZE_LIMIT,
            truncated: false,
            seen: new WeakSet([args[0]]),
        }
        : undefined;
    for (var i = 0; i < args.length; i++) {
        if (i > 0 && !appendWithLimit(parts, ' ', budget)) {
            break;
        }
        if (!stringifyValueWithLimit(args[i], parts, budget, new WeakSet(), false, i === 0 ? attributeCollector : undefined)) {
            break;
        }
    }
    return {
        body: parts.join('') + (budget.truncated ? '...' : ''),
        truncated: budget.truncated,
        attributes: (attributeCollector === null || attributeCollector === void 0 ? void 0 : attributeCollector.result) || {},
    };
};
// Console method → OTLP severity level. `log` and `info` both map to `info`;
// the originating method is preserved separately via the `log.source` attribute.
var LEVEL_MAP = {
    debug: 'debug',
    log: 'info',
    warn: 'warn',
    error: 'error',
    info: 'info',
};
var isClient = function (host) { return 'canCapture' in host; };
var getCapturingLogs = function (host) {
    if (isClient(host)) {
        return host.canCapture ? host.getExtension(extension_tokens_1.LogsExtension) : undefined;
    }
    return host.is_capturing() ? host.logs : undefined;
};
// Compatibility for a bug where `_captureConsoleLog` was inadvertently used across
// independently built bundles and received different mangled names. Pre-stable-ABI
// cores used `le` through 1.410.4, `de` through 1.410.10, `he` through 1.418.3, `ui`
// through 1.418.10, `ci` through 1.418.14, and `vi` through 1.419.2.
var historicalCaptureConsoleLogName = function (version) {
    var match = /^1\.(\d+)\.(\d+)$/.exec(version);
    if (!match) {
        return undefined;
    }
    var minor = Number(match[1]);
    var patch = Number(match[2]);
    if (minor < 392 || minor > 419) {
        return undefined;
    }
    if (minor === 410) {
        return patch <= 4 ? 'le' : patch <= 10 ? 'de' : undefined;
    }
    if (minor === 418) {
        return patch <= 3 ? 'he' : patch <= 10 ? 'ui' : patch <= 14 ? 'ci' : patch <= 17 ? 'vi' : undefined;
    }
    if (minor === 419) {
        return patch <= 2 ? 'vi' : undefined;
    }
    return minor < 410 ? 'le' : 'he';
};
var captureConsoleLogForHost = function (host, logs, options) {
    if (isClient(host)) {
        logs.captureConsoleLog(options);
        return;
    }
    // `_captureConsoleLog` had six generated names across core-backed releases.
    // Select by the stable SDK version instead of probing generated names,
    // because the same name can identify a different method in another release.
    // Keep this historical ABI isolated here. A `captureLog` fallback would change the
    // service name, scope, queue, and rate limits.
    var name = historicalCaptureConsoleLogName(host.version);
    var historicalCaptureConsoleLog = name ? logs[name] : undefined;
    if ((0, core_1.isFunction)(historicalCaptureConsoleLog)) {
        historicalCaptureConsoleLog.call(logs, options);
    }
};
var initializeLogs = function (host) {
    var e_1, _a;
    var currentHost = host;
    var restoreConsoleMethods = [];
    // `host` is carried here because the core SDK context has no equivalent. Session
    // attributes (window.id, sessionStartTimestamp, lastActivityTimestamp) are added
    // downstream by the core pipeline from the SDK context, alongside sessionId.
    var attributes = { host: globals_1.assignableWindow.location.host };
    // Re-entrancy guard: the capture path itself logs — `captureConsoleLog` calls into
    // session management, which emits internal debug lines through PostHog's own logger,
    // which in turn writes to the (now wrapped) console. Without this flag that would
    // re-enter capture and recurse until the stack overflows.
    var isCapturingLog = false;
    var _loop_1 = function (level) {
        var logWrapper = function (next) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                // Tracks whether *this* invocation acquired the re-entrancy guard, so that a
                // nested console call which skips capture doesn't release the guard early and
                // reopen the capture path while the outer invocation is still running.
                var acquiredGuard = false;
                try {
                    var activeHost = currentHost;
                    if (args.length > 0 && !isCapturingLog && activeHost) {
                        var logs = getCapturingLogs(activeHost);
                        if (logs) {
                            isCapturingLog = true;
                            acquiredGuard = true;
                            var _a = stringifyArgsSafely(args, LOG_BODY_SIZE_LIMIT), body = _a.body, truncated = _a.truncated, flattenedAttributes = _a.attributes;
                            var logAttributes = __assign(__assign({}, attributes), (truncated ? { body_truncated: 'true' } : {}));
                            var options = {
                                level: LEVEL_MAP[level],
                                body: body,
                                attributes: __assign(__assign({ 'log.source': "console.".concat(level) }, logAttributes), flattenedAttributes),
                            };
                            // The core pipeline adds posthogDistinctId and url.full from the SDK context.
                            captureConsoleLogForHost(activeHost, logs, options);
                        }
                    }
                }
                catch (_b) {
                    // Capture must never break the page's own console output, so the
                    // real console call below always runs even if capture throws.
                }
                finally {
                    if (acquiredGuard) {
                        isCapturingLog = false;
                    }
                    next.apply(globals_1.assignableWindow.console, args);
                }
            };
        };
        // Install as a `patch` layer rather than a bare assignment: session replay's
        // console plugin wraps these same methods and can arrive after this one, and a
        // top-of-stack-only restore leaks whichever wrapper ends up underneath — and
        // resurrects a lower one that has since been removed.
        var consoleBeforePatch = globals_1.assignableWindow.console[level];
        restoreConsoleMethods.push((0, patch_1.patch)(globals_1.assignableWindow.console, level, function (next) {
            var wrapped = logWrapper(next);
            wrapped.__rrweb_original__ = (0, console_original_1.originalConsoleMethod)(consoleBeforePatch);
            return wrapped;
        }));
    };
    try {
        for (var _b = __values(Object.keys(LEVEL_MAP)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var level = _c.value;
            _loop_1(level);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return function () {
        currentHost = undefined;
        restoreConsoleMethods.forEach(function (restore) { return restore(); });
    };
};
/** Replays console calls the main bundle recorded before this script loaded. */
var replayConsoleBuffer = function (host, entries) {
    var e_2, _a;
    var _b;
    var logs = getCapturingLogs(host);
    if (!logs) {
        return;
    }
    try {
        for (var entries_1 = __values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
            var entry = entries_1_1.value;
            try {
                var _c = stringifyArgsSafely(entry.args, LOG_BODY_SIZE_LIMIT), body = _c.body, truncated = _c.truncated, flattenedAttributes = _c.attributes;
                (_b = logs.captureBufferedConsoleLog) === null || _b === void 0 ? void 0 : _b.call(logs, {
                    level: LEVEL_MAP[entry.level],
                    body: body,
                    attributes: __assign(__assign({ 'log.source': "console.".concat(entry.level), host: globals_1.assignableWindow.location.host }, (truncated ? { body_truncated: 'true' } : {})), flattenedAttributes),
                }, entry.context, entry.occurredAtMs);
            }
            catch (_d) {
                // One entry that cannot be captured must not drop the rest of the buffer.
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
};
globals_1.assignableWindow.__PosthogExtensions__ = globals_1.assignableWindow.__PosthogExtensions__ || {};
globals_1.assignableWindow.__PosthogExtensions__.logs = { initializeLogs: initializeLogs, replayConsoleBuffer: replayConsoleBuffer };
//# sourceMappingURL=logs.js.map