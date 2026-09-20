"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntroScreen = IntroScreen;
var jsx_runtime_1 = require("preact/jsx-runtime");
var preact_1 = require("preact");
var surveys_extension_utils_1 = require("../surveys-extension-utils");
var BottomSection_1 = require("./BottomSection");
var QuestionHeader_1 = require("./QuestionHeader");
var hooks_1 = require("preact/hooks");
var surveys_extension_utils_2 = require("../surveys-extension-utils");
function IntroScreen(_a) {
    var header = _a.header, description = _a.description, contentType = _a.contentType, forceDisableHtml = _a.forceDisableHtml, appearance = _a.appearance, onStart = _a.onStart;
    var _b = (0, hooks_1.useContext)(surveys_extension_utils_2.SurveyContext), isPopup = _b.isPopup, onPreviewSubmit = _b.onPreviewSubmit, onPopupSurveyDismissed = _b.onPopupSurveyDismissed;
    // Unlike the confirmation message, no window-level key handling here: a global Enter
    // listener would advance the intro when the user presses Enter in an unrelated host-page
    // input, and Escape would dismiss the whole survey rather than close a completed one.
    // The advance button is natively keyboard-operable once focused.
    var renderCancelButton = isPopup && appearance.hideCancelButton !== true;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "intro-screen", role: "status", tabIndex: 0, "aria-atomic": "true", children: [renderCancelButton && (0, jsx_runtime_1.jsx)(QuestionHeader_1.Cancel, { onClick: function () { return onPopupSurveyDismissed(); } }), header && (0, jsx_runtime_1.jsx)("h3", { className: "intro-screen-header", children: header }), description &&
                (0, surveys_extension_utils_1.renderChildrenAsTextOrHtml)({
                    component: (0, preact_1.h)('p', { className: 'intro-screen-body' }),
                    children: description,
                    renderAsHtml: !forceDisableHtml && contentType !== 'text',
                }), (0, jsx_runtime_1.jsx)(BottomSection_1.BottomSection, { text: appearance.introScreenButtonText || 'Get started', submitDisabled: false, appearance: appearance, onSubmit: onStart, onPreviewSubmit: function () { return onPreviewSubmit(null); } })] }));
}
//# sourceMappingURL=IntroScreen.js.map