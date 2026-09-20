"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteConfigLoader = void 0;
var logger_1 = require("@posthog/browser-common/utils/logger");
var globals_1 = require("./utils/globals");
var logger = (0, logger_1.createLogger)('[RemoteConfig]');
var RemoteConfigLoader = /** @class */ (function () {
    function RemoteConfigLoader(_instance) {
        this._instance = _instance;
    }
    Object.defineProperty(RemoteConfigLoader.prototype, "remoteConfig", {
        get: function () {
            var _a, _b;
            return (_b = (_a = globals_1.assignableWindow._POSTHOG_REMOTE_CONFIG) === null || _a === void 0 ? void 0 : _a[this._instance.config.token]) === null || _b === void 0 ? void 0 : _b.config;
        },
        enumerable: false,
        configurable: true
    });
    RemoteConfigLoader.prototype._loadRemoteConfigJs = function (cb) {
        var _this = this;
        var _a, _b, _c;
        if ((_a = globals_1.assignableWindow.__PosthogExtensions__) === null || _a === void 0 ? void 0 : _a.loadExternalDependency) {
            (_c = (_b = globals_1.assignableWindow.__PosthogExtensions__) === null || _b === void 0 ? void 0 : _b.loadExternalDependency) === null || _c === void 0 ? void 0 : _c.call(_b, this._instance, 'remote-config', function () {
                return cb(_this.remoteConfig);
            });
        }
        else {
            cb();
        }
    };
    RemoteConfigLoader.prototype._loadRemoteConfigJSON = function (cb) {
        this._instance._send_request({
            method: 'GET',
            url: this._instance.requestRouter.endpointFor('assets', "/array/".concat(this._instance.config.token, "/config")),
            callback: cb,
        });
    };
    RemoteConfigLoader.prototype.load = function () {
        var _this = this;
        try {
            // Attempt 1 - use the pre-loaded config if it came as part of the token-specific array.js
            if (this.remoteConfig) {
                logger.info('Using preloaded remote config', this.remoteConfig);
                this._onRemoteConfig(this.remoteConfig);
                return;
            }
            if (this._instance._shouldDisableFlags()) {
                // This setting is essentially saying "dont call external APIs" hence we respect it here
                logger.warn('Remote config is disabled. Falling back to local config.');
                return;
            }
            // Attempt 2 - if we have the external deps loader then lets load the script version of the config that includes site apps
            this._loadRemoteConfigJs(function (config) {
                if (!config) {
                    logger.info('No config found after loading remote JS config. Falling back to JSON.');
                    // Attempt 3 Load the config json instead of the script - we won't get site apps etc. but we will get the config
                    _this._loadRemoteConfigJSON(function (response) {
                        _this._onRemoteConfig(response.json, response);
                    });
                    return;
                }
                _this._onRemoteConfig(config);
            });
        }
        catch (error) {
            logger.error('Error loading remote config', error);
            this._onRemoteConfig();
        }
    };
    RemoteConfigLoader.prototype._onRemoteConfig = function (config, response) {
        var _a;
        if (!config && response) {
            if (response.statusCode === 0) {
                if (!response.error) {
                    logger.warn('Failed to fetch remote config from PostHog.');
                }
            }
            else {
                logger.error('Failed to fetch remote config from PostHog.');
            }
        }
        // Config and flags are loaded separately: config from /array/{token}/config,
        // flags from /flags/?v=2. Features like surveys, session recording, and product
        // tours reference flags in their config (e.g. survey.linked_flag_key), but this
        // is safe because those flag checks happen lazily at runtime (e.g. when deciding
        // whether to show a survey), not during config processing. By the time a linked
        // flag is evaluated, flags have already loaded.
        //
        // Even when config fails, we notify extensions so they initialize with their
        // defaults — as an explicit failure, so settings that must not fail open
        // (e.g. autocapture's opt-out) can keep their last known value.
        try {
            this._instance._onRemoteConfig(config ? { ok: true, config: config } : { ok: false });
        }
        catch (error) {
            logger.error('Error applying remote config', error);
        }
        if ((config === null || config === void 0 ? void 0 : config.hasFeatureFlags) !== false && !this._instance.config.advanced_disable_feature_flags_on_first_load) {
            try {
                (_a = this._instance.featureFlags) === null || _a === void 0 ? void 0 : _a.ensureFlagsLoaded();
            }
            catch (error) {
                logger.error('Error loading feature flags', error);
            }
        }
    };
    return RemoteConfigLoader;
}());
exports.RemoteConfigLoader = RemoteConfigLoader;
//# sourceMappingURL=remote-config.js.map