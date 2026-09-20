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
    doesDeviceTypeMatch: ()=>doesDeviceTypeMatch,
    hasPeriodPassed: ()=>hasPeriodPassed
});
const core_namespaceObject = require("@posthog/core");
const external_globals_js_namespaceObject = require("./globals.js");
const external_property_utils_js_namespaceObject = require("./property-utils.js");
function doesDeviceTypeMatch(deviceTypes, matchType) {
    if (!deviceTypes || 0 === deviceTypes.length) return true;
    if (!external_globals_js_namespaceObject.userAgent) return false;
    const deviceType = (0, core_namespaceObject.detectDeviceType)(external_globals_js_namespaceObject.userAgent, {
        userAgentDataPlatform: external_globals_js_namespaceObject.navigator?.userAgentData?.platform,
        maxTouchPoints: external_globals_js_namespaceObject.navigator?.maxTouchPoints,
        screenWidth: external_globals_js_namespaceObject.window?.screen?.width,
        screenHeight: external_globals_js_namespaceObject.window?.screen?.height,
        devicePixelRatio: external_globals_js_namespaceObject.window?.devicePixelRatio
    });
    return external_property_utils_js_namespaceObject.propertyComparisons[matchType ?? 'icontains'](deviceTypes, [
        deviceType
    ]);
}
function hasPeriodPassed(periodDays, lastSeenDate) {
    if (!periodDays || !lastSeenDate) return true;
    const date = 'string' == typeof lastSeenDate ? new Date(lastSeenDate) : lastSeenDate;
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffMs / 86400000);
    return diffDays > periodDays;
}
exports.doesDeviceTypeMatch = __webpack_exports__.doesDeviceTypeMatch;
exports.hasPeriodPassed = __webpack_exports__.hasPeriodPassed;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "doesDeviceTypeMatch",
    "hasPeriodPassed"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
