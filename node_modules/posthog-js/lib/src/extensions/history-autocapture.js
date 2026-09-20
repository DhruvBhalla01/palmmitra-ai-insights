"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryAutocapture = void 0;
var constants_1 = require("../constants");
var globals_1 = require("@posthog/browser-common/utils/globals");
var general_utils_1 = require("@posthog/browser-common/utils/general-utils");
var logger_1 = require("@posthog/browser-common/utils/logger");
var patch_1 = require("./replay/rrweb-plugins/patch");
var core_1 = require("@posthog/core");
/**
 * Captures pageviews when selected URL components change through the history API, browser back/forward navigation,
 * or hash navigation.
 */
var HistoryAutocapture = /** @class */ (function () {
    function HistoryAutocapture(instance) {
        this._instance = instance;
        this._lastLocation = this._getCurrentLocation();
    }
    HistoryAutocapture.prototype.initialize = function () {
        this.startIfEnabled();
    };
    Object.defineProperty(HistoryAutocapture.prototype, "isEnabled", {
        get: function () {
            var options = this._getCaptureOptions();
            return !!(options.path || options.search || this._shouldCaptureHashChanges(options));
        },
        enumerable: false,
        configurable: true
    });
    HistoryAutocapture.prototype.startIfEnabled = function () {
        if (this.isEnabled) {
            logger_1.logger.info('History API monitoring enabled, starting...');
            this.monitorHistoryChanges();
        }
    };
    HistoryAutocapture.prototype.startIfEnabledOrStop = function () {
        this.stop();
        this._lastLocation = this._getCurrentLocation();
        this.startIfEnabled();
    };
    HistoryAutocapture.prototype.stop = function () {
        if (this._popstateListener) {
            this._popstateListener();
        }
        this._popstateListener = undefined;
        if (this._hashchangeListener) {
            this._hashchangeListener();
        }
        this._hashchangeListener = undefined;
        logger_1.logger.info('History API monitoring stopped');
    };
    HistoryAutocapture.prototype.monitorHistoryChanges = function () {
        if (!globals_1.window || !globals_1.window.history) {
            return;
        }
        this._patchHistoryMethod('pushState');
        this._patchHistoryMethod('replaceState');
        this._setupPopstateListener();
        if (this._shouldCaptureHashChanges()) {
            this._setupHashchangeListener();
        }
    };
    HistoryAutocapture.prototype._patchHistoryMethod = function (method) {
        var _a;
        if (!globals_1.window || ((_a = globals_1.window.history[method]) === null || _a === void 0 ? void 0 : _a.__posthog_wrapped__)) {
            return;
        }
        // Old fashioned, we could also use arrow functions but I think the closure for a patch is more reliable
        var self = this;
        (0, patch_1.patch)(globals_1.window.history, method, function (originalMethod) {
            return function patchedHistoryMethod(state, title, url) {
                ;
                originalMethod.call(this, state, title, url);
                self._capturePageview(method);
            };
        });
    };
    HistoryAutocapture.prototype._getCurrentLocation = function () {
        var location = globals_1.window === null || globals_1.window === void 0 ? void 0 : globals_1.window.location;
        if (!(location === null || location === void 0 ? void 0 : location.pathname)) {
            return;
        }
        return {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
        };
    };
    HistoryAutocapture.prototype._getCaptureOptions = function () {
        var capturePageview = this._instance.config.capture_pageview;
        if (capturePageview === 'history_change') {
            return { path: true };
        }
        return (0, core_1.isObject)(capturePageview) ? capturePageview : {};
    };
    HistoryAutocapture.prototype._shouldCaptureHashChanges = function (options) {
        if (options === void 0) { options = this._getCaptureOptions(); }
        return !!options.hash && !this._instance.config.disable_capture_url_hashes;
    };
    HistoryAutocapture.prototype._hasLocationChanged = function (currentLocation) {
        var options = this._getCaptureOptions();
        var lastLocation = this._lastLocation;
        return !!(lastLocation &&
            ((options.path && currentLocation.pathname !== lastLocation.pathname) ||
                (options.search && currentLocation.search !== lastLocation.search) ||
                (this._shouldCaptureHashChanges(options) && currentLocation.hash !== lastLocation.hash)));
    };
    HistoryAutocapture.prototype._capturePageview = function (navigationType) {
        try {
            var currentLocation = this._getCurrentLocation();
            if (!currentLocation) {
                return;
            }
            if (this._hasLocationChanged(currentLocation)) {
                this._instance.capture(constants_1.EVENT_PAGEVIEW, { navigation_type: navigationType });
            }
            this._lastLocation = currentLocation;
        }
        catch (error) {
            logger_1.logger.error("Error capturing ".concat(navigationType, " pageview"), error);
        }
    };
    HistoryAutocapture.prototype._setupPopstateListener = function () {
        var _this = this;
        if (this._popstateListener) {
            return;
        }
        var handler = function () {
            _this._capturePageview('popstate');
        };
        (0, general_utils_1.addEventListener)(globals_1.window, 'popstate', handler);
        this._popstateListener = function () {
            if (globals_1.window) {
                globals_1.window.removeEventListener('popstate', handler);
            }
        };
    };
    HistoryAutocapture.prototype._setupHashchangeListener = function () {
        var _this = this;
        if (this._hashchangeListener) {
            return;
        }
        var handler = function () {
            _this._capturePageview('hashchange');
        };
        (0, general_utils_1.addEventListener)(globals_1.window, 'hashchange', handler);
        this._hashchangeListener = function () {
            if (globals_1.window) {
                globals_1.window.removeEventListener('hashchange', handler);
            }
        };
    };
    return HistoryAutocapture;
}());
exports.HistoryAutocapture = HistoryAutocapture;
//# sourceMappingURL=history-autocapture.js.map