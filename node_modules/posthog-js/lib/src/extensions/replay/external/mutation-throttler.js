"use strict";
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
exports.MutationThrottler = exports.DEFAULT_MUTATION_RESYNC_INTERVAL_MS = exports.DEFAULT_MUTATION_BYTES_REFILL_RATE = void 0;
var sessionrecording_utils_1 = require("./sessionrecording-utils");
var core_1 = require("@posthog/core");
var logger_1 = require("@posthog/browser-common/utils/logger");
exports.DEFAULT_MUTATION_BYTES_REFILL_RATE = 25 * 1024;
exports.DEFAULT_MUTATION_RESYNC_INTERVAL_MS = 5 * 60 * 1000;
var MutationThrottler = /** @class */ (function () {
    function MutationThrottler(_rrweb, _options) {
        if (_options === void 0) { _options = {}; }
        var _this = this;
        var _a, _b, _c, _d;
        this._rrweb = _rrweb;
        this._options = _options;
        this._loggedTracker = {};
        this._lastByteRefill = Date.now();
        this._lastResyncAt = -Infinity;
        this._refillByteBudget = function () {
            var now = Date.now();
            var elapsedMs = now - _this._lastByteRefill;
            if (elapsedMs <= 0) {
                _this._lastByteRefill = now;
                return;
            }
            _this._byteTokens = Math.min(_this._bytesBucketSize, _this._byteTokens + (elapsedMs / 1000) * _this._bytesRefillRate);
            _this._lastByteRefill = now;
        };
        this._onNodeRateLimited = function (key) {
            var _a, _b;
            if (!_this._loggedTracker[key]) {
                _this._loggedTracker[key] = true;
                var node = _this._getNode(key);
                (_b = (_a = _this._options).onBlockedNode) === null || _b === void 0 ? void 0 : _b.call(_a, key, node);
            }
        };
        this._getNodeOrRelevantParent = function (id) {
            // For some nodes we know they are part of a larger tree such as an SVG.
            // For those we want to block the entire node, not just the specific attribute
            var node = _this._getNode(id);
            // Check if the node is an Element and then find the closest parent that is an SVG
            if ((node === null || node === void 0 ? void 0 : node.nodeName) !== 'svg' && node instanceof Element) {
                var closestSVG = node.closest('svg');
                if (closestSVG) {
                    return [_this._rrweb.mirror.getId(closestSVG), closestSVG];
                }
            }
            return [id, node];
        };
        this._getNode = function (id) { return _this._rrweb.mirror.getNode(id); };
        this._numberOfChanges = function (data) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return (((_b = (_a = data.removes) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) +
                ((_d = (_c = data.attributes) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) +
                ((_f = (_e = data.texts) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0) +
                ((_h = (_g = data.adds) === null || _g === void 0 ? void 0 : _g.length) !== null && _h !== void 0 ? _h : 0));
        };
        this.throttleMutations = function (event) {
            var _a, _b, _c, _d;
            if (event.type !== sessionrecording_utils_1.INCREMENTAL_SNAPSHOT_EVENT_TYPE || event.data.source !== sessionrecording_utils_1.MUTATION_SOURCE_TYPE) {
                return event;
            }
            var data = event.data;
            var initialMutationCount = _this._numberOfChanges(data);
            if (data.attributes) {
                var beforeCount = data.attributes.length;
                // Most problematic mutations come from attrs where the style or minor properties are changed rapidly
                data.attributes = data.attributes.filter(function (attr) {
                    var _a = __read(_this._getNodeOrRelevantParent(attr.id), 1), nodeId = _a[0];
                    var isRateLimited = _this._rateLimiter.consumeRateLimit(nodeId);
                    if (isRateLimited) {
                        return false;
                    }
                    return attr;
                });
                // A dropped attribute mutation (e.g. the class or style that hides an outgoing
                // subtree) never reaches the player, which then shows DOM that left the live page.
                // Report the drop so the recorder can count how often that happens.
                var droppedCount = beforeCount - data.attributes.length;
                if (droppedCount > 0) {
                    (_b = (_a = _this._options).onDroppedAttributeMutations) === null || _b === void 0 ? void 0 : _b.call(_a, droppedCount);
                }
            }
            // Check if every part of the mutation is empty in which case there is nothing to do
            var mutationCount = _this._numberOfChanges(data);
            if (mutationCount === 0 && initialMutationCount !== mutationCount) {
                // If we have modified the mutation count and the remaining count is 0, then we don't need the event.
                return;
            }
            if (_this._byteBudgetDisabled) {
                return event;
            }
            _this._refillByteBudget();
            var eventBytes = (0, sessionrecording_utils_1.estimateCompressedEventSize)(event);
            if (eventBytes > _this._byteTokens) {
                (_d = (_c = _this._options).onDroppedOversizedMutation) === null || _d === void 0 ? void 0 : _d.call(_c, eventBytes);
                _this._scheduleResync();
                return;
            }
            _this._byteTokens -= eventBytes;
            return event;
        };
        // A dropped mutation leaves the player's DOM stale until the next full snapshot. Ask for
        // one, at most one per resync interval: re-serializing the whole DOM more often costs more
        // than the mutations being dropped. The timer (not the next passing mutation) delivers the
        // resync even when the page goes quiet right after a drop.
        this._scheduleResync = function () {
            if (_this._resyncTimer) {
                return;
            }
            var delay = Math.max(0, _this._resyncIntervalMs - (Date.now() - _this._lastResyncAt));
            _this._resyncTimer = setTimeout(function () {
                var _a, _b;
                _this._resyncTimer = undefined;
                _this._lastResyncAt = Date.now();
                (_b = (_a = _this._options).requestFullSnapshot) === null || _b === void 0 ? void 0 : _b.call(_a);
            }, delay);
        };
        this._rateLimiter = new core_1.BucketedRateLimiter({
            bucketSize: (_a = this._options.bucketSize) !== null && _a !== void 0 ? _a : 100,
            refillRate: (_b = this._options.refillRate) !== null && _b !== void 0 ? _b : 10,
            refillInterval: 1000, // one second
            _onBucketRateLimited: this._onNodeRateLimited,
            _logger: logger_1.logger,
        });
        // 0 = disabled: the byte budget is opt-in until a remote-config rollout can ramp it
        this._bytesBucketSize = (_c = this._options.bytesBucketSize) !== null && _c !== void 0 ? _c : 0;
        this._bytesRefillRate = (_d = this._options.bytesRefillRate) !== null && _d !== void 0 ? _d : exports.DEFAULT_MUTATION_BYTES_REFILL_RATE;
        this._byteBudgetDisabled = !Number.isFinite(this._bytesBucketSize) || this._bytesBucketSize <= 0;
        this._byteTokens = this._bytesBucketSize;
        var resyncIntervalMs = this._options.resyncIntervalMs;
        // guard against 0 (the "scheduled snapshots disabled" config value) and other
        // non-positive values: a zero cooldown would take a full snapshot per dropped mutation
        this._resyncIntervalMs =
            (0, core_1.isNumber)(resyncIntervalMs) && Number.isFinite(resyncIntervalMs) && resyncIntervalMs > 0
                ? resyncIntervalMs
                : exports.DEFAULT_MUTATION_RESYNC_INTERVAL_MS;
    }
    // Called by the recorder on every full snapshot. Only clears per-node state: full snapshots
    // renumber rrweb nodes, but happen mid-session, so refilling the byte budget here would let
    // each resync hand back a fresh bucket. The budget refills only in stop().
    MutationThrottler.prototype.reset = function () {
        this._loggedTracker = {};
        if (this._resyncTimer) {
            clearTimeout(this._resyncTimer);
            this._resyncTimer = undefined;
        }
        this._lastResyncAt = Date.now();
    };
    MutationThrottler.prototype.stop = function () {
        this._rateLimiter.stop();
        this.reset();
        this._byteTokens = this._bytesBucketSize;
        this._lastByteRefill = Date.now();
        this._lastResyncAt = -Infinity;
    };
    return MutationThrottler;
}());
exports.MutationThrottler = MutationThrottler;
//# sourceMappingURL=mutation-throttler.js.map