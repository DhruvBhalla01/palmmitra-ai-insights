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
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DisplaySurveyType, SurveyEventName, SurveyEventProperties, SurveyPosition } from "posthog-js";
var PostHogContext = createContext({
    get client() { },
    bootstrap: void 0
});
var usePostHog = function () {
    var client = useContext(PostHogContext).client;
    return client;
};
var TRIGGER_ATTR = "data-ph-thumb-survey-trigger";
function useThumbSurvey(_a) {
    var surveyId = _a.surveyId, _b = _a.displayPosition, displayPosition = _b === void 0 ? SurveyPosition.NextToTrigger : _b, properties = _a.properties, onResponse = _a.onResponse, disableAutoShownTracking = _a.disableAutoShownTracking;
    var posthog = usePostHog();
    var _c = useState(null), responded = _c[0], setResponded = _c[1];
    var instanceId = useState(function () { return Math.random().toString(36).slice(2, 9); })[0];
    var triggerValue = useMemo(function () { return "".concat(surveyId, "-").concat(instanceId); }, [surveyId, instanceId]);
    var elementRef = useRef(null);
    var triggerRef = useCallback(function (el) {
        if (elementRef.current)
            elementRef.current.removeAttribute(TRIGGER_ATTR);
        elementRef.current = el;
        if (el)
            el.setAttribute(TRIGGER_ATTR, triggerValue);
    }, [triggerValue]);
    var shownRef = useRef(false);
    var respondedRef = useRef(false);
    var trackShown = useCallback(function () {
        var _a;
        var _b;
        if (shownRef.current || !posthog)
            return;
        shownRef.current = true;
        posthog.capture(SurveyEventName.SHOWN, __assign((_a = {}, _a[SurveyEventProperties.SURVEY_ID] = surveyId, _a.sessionRecordingUrl = (_b = posthog.get_session_replay_url) === null || _b === void 0 ? void 0 : _b.call(posthog), _a), properties));
    }, [
        posthog,
        surveyId,
        properties
    ]);
    useEffect(function () {
        if (!disableAutoShownTracking)
            trackShown();
    }, [trackShown, disableAutoShownTracking]);
    return __assign({ respond: useCallback(function (value) {
            if (!(posthog === null || posthog === void 0 ? void 0 : posthog.surveys) || respondedRef.current)
                return;
            respondedRef.current = true;
            setResponded(value);
            onResponse === null || onResponse === void 0 ? void 0 : onResponse(value);
            posthog.surveys.displaySurvey(surveyId, {
                displayType: DisplaySurveyType.Popover,
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
export { useThumbSurvey };
//# sourceMappingURL=index.js.map