(function () {var __assign = (this && this.__assign) || function () {
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
(function (global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("react"), require("posthog-js")) : typeof define === "function" && define.amd ? define([
        "exports",
        "react",
        "posthog-js"
    ], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.PosthogReactSurveys = {}, global.React, global.posthog));
})(this, function (exports, react, posthog_js) {
    "use strict";
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = function (to, from, except, desc) {
        if (from && typeof from === "object" || typeof from === "function")
            for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
                key = keys[i];
                if (!__hasOwnProp.call(to, key) && key !== except)
                    __defProp(to, key, {
                        get: (function (k) { return from[k]; }).bind(null, key),
                        enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                    });
            }
        return to;
    };
    var __toESM = function (mod, isNodeMode, target) { return (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
        value: mod,
        enumerable: true
    }) : target, mod)); };
    react = __toESM(react);
    var PostHogContext = (0, react.createContext)({
        get client() { },
        bootstrap: void 0
    });
    var usePostHog = function () {
        var client = (0, react.useContext)(PostHogContext).client;
        return client;
    };
    var TRIGGER_ATTR = "data-ph-thumb-survey-trigger";
    function useThumbSurvey(_a) {
        var surveyId = _a.surveyId, _b = _a.displayPosition, displayPosition = _b === void 0 ? posthog_js.SurveyPosition.NextToTrigger : _b, properties = _a.properties, onResponse = _a.onResponse, disableAutoShownTracking = _a.disableAutoShownTracking;
        var posthog = usePostHog();
        var _c = (0, react.useState)(null), responded = _c[0], setResponded = _c[1];
        var instanceId = (0, react.useState)(function () { return Math.random().toString(36).slice(2, 9); })[0];
        var triggerValue = (0, react.useMemo)(function () { return "".concat(surveyId, "-").concat(instanceId); }, [surveyId, instanceId]);
        var elementRef = (0, react.useRef)(null);
        var triggerRef = (0, react.useCallback)(function (el) {
            if (elementRef.current)
                elementRef.current.removeAttribute(TRIGGER_ATTR);
            elementRef.current = el;
            if (el)
                el.setAttribute(TRIGGER_ATTR, triggerValue);
        }, [triggerValue]);
        var shownRef = (0, react.useRef)(false);
        var respondedRef = (0, react.useRef)(false);
        var trackShown = (0, react.useCallback)(function () {
            var _a;
            var _b;
            if (shownRef.current || !posthog)
                return;
            shownRef.current = true;
            posthog.capture(posthog_js.SurveyEventName.SHOWN, __assign((_a = {}, _a[posthog_js.SurveyEventProperties.SURVEY_ID] = surveyId, _a.sessionRecordingUrl = (_b = posthog.get_session_replay_url) === null || _b === void 0 ? void 0 : _b.call(posthog), _a), properties));
        }, [
            posthog,
            surveyId,
            properties
        ]);
        (0, react.useEffect)(function () {
            if (!disableAutoShownTracking)
                trackShown();
        }, [trackShown, disableAutoShownTracking]);
        return __assign({ respond: (0, react.useCallback)(function (value) {
                if (!(posthog === null || posthog === void 0 ? void 0 : posthog.surveys) || respondedRef.current)
                    return;
                respondedRef.current = true;
                setResponded(value);
                onResponse === null || onResponse === void 0 ? void 0 : onResponse(value);
                posthog.surveys.displaySurvey(surveyId, {
                    displayType: posthog_js.DisplaySurveyType.Popover,
                    ignoreConditions: true,
                    ignoreDelay: true,
                    properties: properties,
                    initialResponses: { 0: value === "up" ? 1 : 2 },
                    position: displayPosition,
                    selector: "[".concat(TRIGGER_ATTR, "=\"").concat(triggerValue, "\"]"),
                    skipShownEvent: true
                });
            }, [
                posthog,
                surveyId,
                displayPosition,
                properties,
                onResponse,
                triggerValue
            ]), response: responded, triggerRef: triggerRef }, disableAutoShownTracking && { trackShown: trackShown });
    }
    exports.useThumbSurvey = useThumbSurvey;
});
}).call(this);
//# sourceMappingURL=index.js.map