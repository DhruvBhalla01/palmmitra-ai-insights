"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserAutocapture = void 0;
var core_1 = require("@posthog/core");
var autocapture_1 = require("./autocapture");
var BrowserAutocaptureConfigSource = /** @class */ (function () {
    function BrowserAutocaptureConfigSource(_instance) {
        this._instance = _instance;
    }
    BrowserAutocaptureConfigSource.prototype.refresh = function (target) {
        var config = this._instance.config;
        var autocapture = (0, core_1.isObject)(config.autocapture) ? config.autocapture : undefined;
        target.enabled = !!config.autocapture;
        target.rageclick = config.rageclick;
        target.maskAllElementAttributes = config.mask_all_element_attributes;
        target.maskAllText = config.mask_all_text;
        target.disableCaptureUrlHashes = config.disable_capture_url_hashes;
        target.getCurrentUrl = config.get_current_url;
        target.remoteRequestsDisabled = this._instance._shouldDisableFlags();
        target.url_allowlist = autocapture === null || autocapture === void 0 ? void 0 : autocapture.url_allowlist;
        target.url_ignorelist = autocapture === null || autocapture === void 0 ? void 0 : autocapture.url_ignorelist;
        target.dom_event_allowlist = autocapture === null || autocapture === void 0 ? void 0 : autocapture.dom_event_allowlist;
        target.element_allowlist = autocapture === null || autocapture === void 0 ? void 0 : autocapture.element_allowlist;
        target.css_selector_allowlist = autocapture === null || autocapture === void 0 ? void 0 : autocapture.css_selector_allowlist;
        target.css_selector_ignorelist = autocapture === null || autocapture === void 0 ? void 0 : autocapture.css_selector_ignorelist;
        target.element_attribute_ignorelist = autocapture === null || autocapture === void 0 ? void 0 : autocapture.element_attribute_ignorelist;
        target.capture_copied_text = autocapture === null || autocapture === void 0 ? void 0 : autocapture.capture_copied_text;
    };
    return BrowserAutocaptureConfigSource;
}());
/** Browser-v1 compatibility wrapper for the SDK-neutral autocapture extension. */
var BrowserAutocapture = /** @class */ (function (_super) {
    __extends(BrowserAutocapture, _super);
    function BrowserAutocapture(instance) {
        var _this = _super.call(this, new BrowserAutocaptureConfigSource(instance)) || this;
        _this.instance = instance;
        return _this;
    }
    return BrowserAutocapture;
}(autocapture_1.Autocapture));
exports.BrowserAutocapture = BrowserAutocapture;
//# sourceMappingURL=browser-autocapture.js.map