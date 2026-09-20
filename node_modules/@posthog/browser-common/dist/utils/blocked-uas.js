"use strict";
var __webpack_require__ = {};
(()=>{
    __webpack_require__.d = (exports1, getters, values)=>{
        var define = (defs, kind)=>{
            for(var key in defs)if (__webpack_require__.o(defs, key) && !__webpack_require__.o(exports1, key)) Object.defineProperty(exports1, key, {
                enumerable: true,
                [kind]: defs[key]
            });
        };
        define(getters, "get");
        define(values, "value");
    };
})();
(()=>{
    __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
})();
(()=>{
    __webpack_require__.r = (exports1)=>{
        if ("u" > typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports1, Symbol.toStringTag, {
            value: 'Module'
        });
        Object.defineProperty(exports1, '__esModule', {
            value: true
        });
    };
})();
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
    DEFAULT_BLOCKED_UA_STRS: ()=>core_namespaceObject.DEFAULT_BLOCKED_UA_STRS,
    isBlockedUA: ()=>core_namespaceObject.isBlockedUA,
    isLikelyBot: ()=>isLikelyBot
});
const core_namespaceObject = require("@posthog/core");
const isLikelyBot = function(navigator, customBlockedUserAgents) {
    if (!navigator) return false;
    const ua = navigator.userAgent;
    if (ua) {
        if ((0, core_namespaceObject.isBlockedUA)(ua, customBlockedUserAgents)) return true;
    }
    try {
        const uaData = navigator?.userAgentData;
        if (uaData?.brands && uaData.brands.some((brandObj)=>(0, core_namespaceObject.isBlockedUA)(brandObj?.brand, customBlockedUserAgents))) return true;
    } catch  {}
    return !!navigator.webdriver;
};
exports.DEFAULT_BLOCKED_UA_STRS = __webpack_exports__.DEFAULT_BLOCKED_UA_STRS;
exports.isBlockedUA = __webpack_exports__.isBlockedUA;
exports.isLikelyBot = __webpack_exports__.isLikelyBot;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "DEFAULT_BLOCKED_UA_STRS",
    "isBlockedUA",
    "isLikelyBot"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
