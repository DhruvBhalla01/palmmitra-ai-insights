"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@posthog/browser-common/utils/globals");
var globals_2 = require("../utils/globals");
var logger_1 = require("@posthog/browser-common/utils/logger");
var logger = (0, logger_1.createLogger)('[ExternalScriptsLoader]');
var findScript = function (url) {
    var scripts = globals_1.document === null || globals_1.document === void 0 ? void 0 : globals_1.document.querySelectorAll('script');
    if (scripts) {
        for (var i = 0; i < scripts.length; i++) {
            // `.src` reads back as a resolved absolute URL, but `url` is relative
            // whenever `api_host` is a path such as `/ingest`, so that comparison
            // alone never matches for reverse-proxied setups. The `src` attribute
            // holds exactly what `loadScript` wrote, so compare against both.
            if (scripts[i].src === url || scripts[i].getAttribute('src') === url) {
                return scripts[i];
            }
        }
    }
    return undefined;
};
var loadScript = function (posthog, url, callback) {
    if (posthog.config.disable_external_dependency_loading) {
        logger.warn("".concat(url, " was requested but loading of external scripts is disabled."));
        return callback('Loading of external scripts is disabled');
    }
    // Share the result when the same script is requested more than once so the browser
    // only downloads and executes it once.
    var existingScript = findScript(url);
    if (existingScript) {
        if (existingScript.__posthog_loading_callback_fired) {
            return callback();
        }
        var existingError = existingScript.__posthog_loading_error;
        if (existingError) {
            return callback(existingError);
        }
        // oxlint-disable-next-line posthog-js/no-add-event-listener
        existingScript.addEventListener('load', function (event) {
            ;
            existingScript.__posthog_loading_callback_fired = true;
            callback(undefined, event);
        });
        // oxlint-disable-next-line posthog-js/no-add-event-listener
        existingScript.addEventListener('error', function (error) {
            ;
            existingScript.__posthog_loading_error = error;
            callback(error);
        });
        return;
    }
    var addScript = function () {
        var _a;
        if (!globals_1.document) {
            return callback('document not found');
        }
        if (findScript(url)) {
            return loadScript(posthog, url, callback);
        }
        var scriptTag = globals_1.document.createElement('script');
        scriptTag.type = 'text/javascript';
        scriptTag.crossOrigin = 'anonymous';
        scriptTag.src = url;
        scriptTag.onload = function (event) {
            ;
            scriptTag.__posthog_loading_callback_fired = true;
            callback(undefined, event);
        };
        scriptTag.onerror = function (error) {
            ;
            scriptTag.__posthog_loading_error = error;
            callback(error);
        };
        if (posthog.config.prepare_external_dependency_script) {
            scriptTag = posthog.config.prepare_external_dependency_script(scriptTag);
        }
        if (!scriptTag) {
            return callback('prepare_external_dependency_script returned null');
        }
        if (posthog.config.external_scripts_inject_target === 'head') {
            globals_1.document.head.appendChild(scriptTag);
        }
        else {
            var scripts = globals_1.document.querySelectorAll('body > script');
            if (scripts.length > 0) {
                (_a = scripts[0].parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(scriptTag, scripts[0]);
            }
            else {
                globals_1.document.body.appendChild(scriptTag);
            }
        }
    };
    if (globals_1.document === null || globals_1.document === void 0 ? void 0 : globals_1.document.body) {
        addScript();
    }
    else {
        // Inlining this because we don't care about `passive: true` here
        // and this saves us ~3% of the bundle size
        // oxlint-disable-next-line posthog-js/no-add-event-listener
        globals_1.document === null || globals_1.document === void 0 ? void 0 : globals_1.document.addEventListener('DOMContentLoaded', addScript);
    }
};
var fallbackScripts = {};
var legacyScriptUrl = function (posthog, kind) {
    var scriptPath = "/static/".concat(kind, ".js?v=").concat(posthog.version);
    if (kind === 'toolbar') {
        // toolbar.js has a 24-hour CDN TTL but contains a rotating token valid for
        // only 5 minutes. Bust the cache on a 5-minute boundary so the browser always
        // fetches a fresh copy with a valid token.
        var fiveMinutesInMillis = 5 * 60 * 1000;
        var timestampToNearestFiveMinutes = Math.floor(Date.now() / fiveMinutesInMillis) * fiveMinutesInMillis;
        scriptPath = "".concat(scriptPath, "&t=").concat(timestampToNearestFiveMinutes);
    }
    return posthog.requestRouter.endpointFor('assets', scriptPath);
};
globals_2.assignableWindow.__PosthogExtensions__ = globals_2.assignableWindow.__PosthogExtensions__ || {};
globals_2.assignableWindow.__PosthogExtensions__.loadExternalDependency = function (posthog, kind, callback) {
    // remote-config always loads from the token-specific path
    if (kind === 'remote-config') {
        var url = posthog.requestRouter.endpointFor('assets', "/array/".concat(posthog.config.token, "/config.js"));
        loadScript(posthog, url, callback);
        return;
    }
    var scriptVersioning = posthog.config.strict_script_versioning;
    if (scriptVersioning) {
        // posthog.version is baked into the executing array.js bundle, so this points at
        // the exact semver-qualified sibling asset without relying on alias redirects.
        var url_1 = posthog.requestRouter.endpointFor('assets', "/static/".concat(posthog.version, "/").concat(kind, ".js"));
        var existingFallback = fallbackScripts[url_1];
        if (scriptVersioning === 'fallback' && existingFallback) {
            if (findScript(existingFallback)) {
                loadScript(posthog, existingFallback, callback);
                return;
            }
            delete fallbackScripts[url_1];
        }
        loadScript(posthog, url_1, scriptVersioning === 'fallback'
            ? function (error, event) {
                var _a;
                if (!error) {
                    callback(undefined, event);
                }
                else if (typeof error === 'string') {
                    callback(error);
                }
                else {
                    var fallbackUrl = legacyScriptUrl(posthog, kind);
                    fallbackScripts[url_1] = fallbackUrl;
                    var failedScript = findScript(url_1);
                    (_a = failedScript === null || failedScript === void 0 ? void 0 : failedScript.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(failedScript);
                    loadScript(posthog, fallbackUrl, callback);
                }
            }
            : callback);
        return;
    }
    loadScript(posthog, legacyScriptUrl(posthog, kind), callback);
};
globals_2.assignableWindow.__PosthogExtensions__.loadSiteApp = function (posthog, url, callback) {
    var scriptUrl = posthog.requestRouter.endpointFor('api', url);
    loadScript(posthog, scriptUrl, callback);
};
//# sourceMappingURL=external-scripts-loader.js.map