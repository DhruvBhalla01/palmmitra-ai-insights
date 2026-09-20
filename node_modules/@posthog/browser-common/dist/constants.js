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
const TOOLBAR_ID = '__POSTHOG_TOOLBAR__';
const TOOLBAR_CONTAINER_CLASS = 'toolbar-global-fade-container';
const SDK_DIST_CHANNEL = '$sdk_dist_channel';
__webpack_require__.d(__webpack_exports__, {}, {
    SDK_DIST_CHANNEL: SDK_DIST_CHANNEL,
    TOOLBAR_CONTAINER_CLASS: TOOLBAR_CONTAINER_CLASS,
    TOOLBAR_ID: TOOLBAR_ID
});
exports.SDK_DIST_CHANNEL = __webpack_exports__.SDK_DIST_CHANNEL;
exports.TOOLBAR_CONTAINER_CLASS = __webpack_exports__.TOOLBAR_CONTAINER_CLASS;
exports.TOOLBAR_ID = __webpack_exports__.TOOLBAR_ID;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "SDK_DIST_CHANNEL",
    "TOOLBAR_CONTAINER_CLASS",
    "TOOLBAR_ID"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
