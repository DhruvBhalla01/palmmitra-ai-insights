"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
var constants_1 = require("./constants");
var logger_1 = require("@posthog/browser-common/utils/logger");
var globals_1 = require("@posthog/browser-common/utils/globals");
var core_1 = require("@posthog/core");
var logger = (0, logger_1.createLogger)('[RateLimiter]');
var ONE_MINUTE_IN_MILLISECONDS = 60 * 1000;
var RATE_LIMIT_EVENT = '$$client_ingestion_warning';
var DEFAULT_EVENTS_PER_SECOND = 10;
var BURST_LIMIT_MULTIPLIER = 10;
var RateLimiter = /** @class */ (function () {
    function RateLimiter(instance) {
        var _this = this;
        this.serverLimits = {};
        this.lastEventRateLimited = false;
        this.checkForLimiting = function (httpResponse) {
            var text = httpResponse.text;
            if (!text || !text.length) {
                return;
            }
            try {
                var response = JSON.parse(text);
                var quotaLimitedProducts = response.quota_limited || [];
                quotaLimitedProducts.forEach(function (batchKey) {
                    logger.info("".concat(batchKey || 'events', " is quota limited."));
                    _this.serverLimits[batchKey] = new Date().getTime() + ONE_MINUTE_IN_MILLISECONDS;
                });
            }
            catch (e) {
                logger.warn("could not rate limit - continuing. Error: \"".concat(e === null || e === void 0 ? void 0 : e.message, "\""), { text: text });
                return;
            }
        };
        this.instance = instance;
        this.lastEventRateLimited = this.clientRateLimitContext(true).isRateLimited;
    }
    Object.defineProperty(RateLimiter.prototype, "captureEventsPerSecond", {
        get: function () {
            var _a;
            return ((_a = this.instance.config.rate_limiting) === null || _a === void 0 ? void 0 : _a.events_per_second) || DEFAULT_EVENTS_PER_SECOND;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RateLimiter.prototype, "captureEventsBurstLimit", {
        get: function () {
            var _a;
            return Math.max(((_a = this.instance.config.rate_limiting) === null || _a === void 0 ? void 0 : _a.events_burst_limit) ||
                this.captureEventsPerSecond * BURST_LIMIT_MULTIPLIER, this.captureEventsPerSecond);
        },
        enumerable: false,
        configurable: true
    });
    RateLimiter.prototype.clientRateLimitContext = function (checkOnly) {
        var _a, _b, _c;
        if (checkOnly === void 0) { checkOnly = false; }
        // This is primarily to prevent runaway loops from flooding capture with millions of events for a single user.
        // It's as much for our protection as theirs.
        var _d = this, captureEventsBurstLimit = _d.captureEventsBurstLimit, captureEventsPerSecond = _d.captureEventsPerSecond;
        var now = new Date().getTime();
        var bucket = (_b = (_a = this.instance.persistence) === null || _a === void 0 ? void 0 : _a.get_property(constants_1.CAPTURE_RATE_LIMIT)) !== null && _b !== void 0 ? _b : {
            tokens: captureEventsBurstLimit,
            last: now,
        };
        bucket.tokens += ((now - bucket.last) / 1000) * captureEventsPerSecond;
        bucket.last = now;
        if (bucket.tokens > captureEventsBurstLimit) {
            bucket.tokens = captureEventsBurstLimit;
        }
        var isRateLimited = bucket.tokens < 1;
        if (!isRateLimited && !checkOnly) {
            bucket.tokens = Math.max(0, bucket.tokens - 1);
        }
        if (isRateLimited && !checkOnly) {
            // Count every drop, not just the ones in this page's lifetime: a runaway loop that reloads
            // the page loses the in-memory state, so the tally lives on the persisted bucket and is
            // reported (then reset) by the next warning - "dropped since the last warning".
            var droppedSinceLastWarning = ((0, core_1.isNumber)(bucket.dropped) ? bucket.dropped : 0) + 1;
            bucket.dropped = droppedSinceLastWarning;
            if (!this.lastEventRateLimited && this._captureWarning(droppedSinceLastWarning)) {
                // `capture` returns the accepted event after the full local pipeline has run. Keep
                // the tally when (for example) `before_send` rejects the warning so the next
                // accepted warning still accounts for every dropped event.
                bucket.dropped = 0;
            }
        }
        this.lastEventRateLimited = isRateLimited;
        (_c = this.instance.persistence) === null || _c === void 0 ? void 0 : _c.set_property(constants_1.CAPTURE_RATE_LIMIT, bucket);
        return {
            isRateLimited: isRateLimited,
            remainingTokens: bucket.tokens,
        };
    };
    RateLimiter.prototype._isPropertyAllowed = function (property) {
        var denylist = this.instance.config.property_denylist;
        return !(0, core_1.isArray)(denylist) || !denylist.includes(property);
    };
    /**
     * The page the limiter tripped on, without the query string or hash - enough to spot a
     * self-reloading 404 without putting whatever a customer keeps in their query params into
     * an ingestion warning. Because this value recombines `$current_url` and `$pathname`, omit it
     * if either standard property has been denylisted rather than reintroducing denied context.
     */
    RateLimiter.prototype._triggeringPage = function () {
        var _a;
        if (!this._isPropertyAllowed('$current_url') || !this._isPropertyAllowed('$pathname') || !(globals_1.location === null || globals_1.location === void 0 ? void 0 : globals_1.location.pathname)) {
            return undefined;
        }
        return "".concat((_a = globals_1.location.origin) !== null && _a !== void 0 ? _a : '').concat(globals_1.location.pathname);
    };
    RateLimiter.prototype._captureWarning = function (droppedSinceLastWarning) {
        var _a, _b;
        var _c = this, captureEventsBurstLimit = _c.captureEventsBurstLimit, captureEventsPerSecond = _c.captureEventsPerSecond;
        var page = this._triggeringPage();
        var sessionId = this._isPropertyAllowed('$session_id') ? (_b = (_a = this.instance).get_session_id) === null || _b === void 0 ? void 0 : _b.call(_a) : undefined;
        // Ingestion currently retains only this message for client ingestion warnings. Keep the
        // diagnostics here instead of adding structured properties that the backend discards.
        var context = [
            "".concat(droppedSinceLastWarning, " event(s) dropped since the last warning"),
            page ? "triggered on ".concat(page) : undefined,
            sessionId ? "session ".concat(sessionId) : undefined,
        ]
            .filter(Boolean)
            .join(', ');
        return !!this.instance.capture(RATE_LIMIT_EVENT, {
            $$client_ingestion_warning_message: "posthog-js client rate limited: ".concat(context, ". Config is set to ").concat(captureEventsPerSecond, " events per second and ").concat(captureEventsBurstLimit, " events burst limit."),
        }, {
            skip_client_rate_limiting: true,
        });
    };
    RateLimiter.prototype.isServerRateLimited = function (batchKey) {
        var retryAfter = this.serverLimits[batchKey || 'events'] || false;
        if (retryAfter === false) {
            return false;
        }
        return new Date().getTime() < retryAfter;
    };
    return RateLimiter;
}());
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=rate-limiter.js.map