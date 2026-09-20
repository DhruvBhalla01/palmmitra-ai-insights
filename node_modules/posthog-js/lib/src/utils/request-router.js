"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRouter = exports.RequestRouterRegion = void 0;
var request_utils_1 = require("@posthog/browser-common/utils/request-utils");
/**
 * The request router helps simplify the logic to determine which endpoints should be called for which things
 * The basic idea is that for a given region (US or EU), we have a set of endpoints that we should call depending
 * on the type of request (events, replays, flags, etc.) and handle overrides that may come from configs or the flags endpoint
 */
exports.RequestRouterRegion = {
    US: 'us',
    EU: 'eu',
    CUSTOM: 'custom',
};
var ingestionDomain = 'i.posthog.com';
var staticAssetPath = /^\/static\//;
var ingestionPaths = ['/s/', '/e/', '/i/'];
var RequestRouter = /** @class */ (function () {
    function RequestRouter(instance) {
        this._regionCache = {};
        this.instance = instance;
    }
    Object.defineProperty(RequestRouter.prototype, "apiHost", {
        get: function () {
            var host = this.instance.config.api_host.trim().replace(/\/$/, '');
            if (host === 'https://app.posthog.com') {
                return 'https://us.i.posthog.com';
            }
            return host;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RequestRouter.prototype, "flagsApiHost", {
        get: function () {
            var customHost = this.instance.config.flags_api_host;
            if (customHost) {
                return customHost.trim().replace(/\/$/, '');
            }
            // Backwards compatibility: if no custom flags_api_host is set, fall back to the regular apiHost
            return this.apiHost;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RequestRouter.prototype, "uiHost", {
        get: function () {
            var _a;
            var host = (_a = this.instance.config.ui_host) === null || _a === void 0 ? void 0 : _a.replace(/\/$/, '');
            if (!host) {
                // No ui_host set, get it from the api_host. But api_host differs
                // from the actual UI host, so replace the ingestion subdomain with just posthog.com
                host = this.apiHost.replace(".".concat(ingestionDomain), '.posthog.com');
            }
            if (host === 'https://app.posthog.com') {
                return 'https://us.posthog.com';
            }
            return host;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RequestRouter.prototype, "region", {
        get: function () {
            // We don't need to compute this every time so we cache the result
            if (!this._regionCache[this.apiHost]) {
                if (/https:\/\/(app|us|us-assets)(\.i)?\.posthog\.com/i.test(this.apiHost)) {
                    this._regionCache[this.apiHost] = exports.RequestRouterRegion.US;
                }
                else if (/https:\/\/(eu|eu-assets)(\.i)?\.posthog\.com/i.test(this.apiHost)) {
                    this._regionCache[this.apiHost] = exports.RequestRouterRegion.EU;
                }
                else {
                    this._regionCache[this.apiHost] = exports.RequestRouterRegion.CUSTOM;
                }
            }
            return this._regionCache[this.apiHost];
        },
        enumerable: false,
        configurable: true
    });
    RequestRouter.prototype._staticAssetHostOverride = function (path) {
        if (!staticAssetPath.test(path)) {
            return undefined;
        }
        var override = this.instance.config.asset_host;
        if (typeof override !== 'string') {
            return undefined;
        }
        var normalizedOverride = override.trim().replace(/\/$/, '');
        return normalizedOverride || undefined;
    };
    RequestRouter.prototype._urlKey = function (url) {
        var parsedUrl = (0, request_utils_1.convertToURL)(url);
        return parsedUrl ? parsedUrl.protocol + '//' + parsedUrl.host + parsedUrl.pathname : undefined;
    };
    RequestRouter.prototype._prepareEndpoint = function (target, path, url) {
        var _a;
        if (target === 'ui') {
            return url;
        }
        var rewrittenUrl = url;
        var rewriteRequestPath = this.instance.config.rewriteRequestPath;
        if (rewriteRequestPath) {
            // `URL` is intentionally exposed by this opt-in hook so callers can inspect and update each component safely.
            var resolvedUrl = ((_a = (0, request_utils_1.convertToURL)(url)) === null || _a === void 0 ? void 0 : _a.href) || url;
            rewrittenUrl = rewriteRequestPath(new URL(resolvedUrl)).toString();
        }
        if (rewriteRequestPath &&
            target === 'api' &&
            ingestionPaths.some(function (ingestionPath) { return path.indexOf(ingestionPath) === 0; })) {
            var urlKey = this._urlKey(rewrittenUrl);
            if (urlKey) {
                var apiHost = this.apiHost;
                var ingestionEndpoints = this._ingestionEndpoints;
                if ((ingestionEndpoints === null || ingestionEndpoints === void 0 ? void 0 : ingestionEndpoints.apiHost) !== apiHost ||
                    ingestionEndpoints.rewriteRequestPath !== rewriteRequestPath) {
                    ingestionEndpoints = { apiHost: apiHost, rewriteRequestPath: rewriteRequestPath, urls: new Set() };
                    this._ingestionEndpoints = ingestionEndpoints;
                }
                ingestionEndpoints.urls.add(urlKey);
            }
        }
        return rewrittenUrl;
    };
    RequestRouter.prototype.isIngestionEndpoint = function (url) {
        var ingestionEndpoints = this._ingestionEndpoints;
        var urlKey = this._urlKey(url);
        return ((ingestionEndpoints === null || ingestionEndpoints === void 0 ? void 0 : ingestionEndpoints.apiHost) === this.apiHost &&
            ingestionEndpoints.rewriteRequestPath === this.instance.config.rewriteRequestPath &&
            !!urlKey &&
            ingestionEndpoints.urls.has(urlKey));
    };
    RequestRouter.prototype.endpointFor = function (target, path) {
        if (path === void 0) { path = ''; }
        if (path) {
            path = path[0] === '/' ? path : "/".concat(path);
        }
        if (target === 'ui') {
            return this._prepareEndpoint(target, path, this.uiHost + path);
        }
        if (target === 'flags') {
            return this._prepareEndpoint(target, path, this.flagsApiHost + path);
        }
        if (target === 'assets') {
            var assetHostOverride = this._staticAssetHostOverride(path);
            if (assetHostOverride) {
                return this._prepareEndpoint(target, path, "".concat(assetHostOverride).concat(path));
            }
        }
        if (this.region === exports.RequestRouterRegion.CUSTOM) {
            return this._prepareEndpoint(target, path, this.apiHost + path);
        }
        var suffix = ingestionDomain + path;
        switch (target) {
            case 'assets':
                return this._prepareEndpoint(target, path, "https://".concat(this.region, "-assets.").concat(suffix));
            case 'api':
                return this._prepareEndpoint(target, path, "https://".concat(this.region, ".").concat(suffix));
        }
    };
    return RequestRouter;
}());
exports.RequestRouter = RequestRouter;
//# sourceMappingURL=request-router.js.map