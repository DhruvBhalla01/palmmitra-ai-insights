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
const win = "u" > typeof window ? window : void 0;
const global = "u" > typeof globalThis ? globalThis : win;
const navigator = global?.navigator;
const document = global?.document;
const location = global?.location;
const fetch = global?.fetch;
const XMLHttpRequest = global?.XMLHttpRequest && 'withCredentials' in new global.XMLHttpRequest() ? global.XMLHttpRequest : void 0;
const AbortController = global?.AbortController;
const CompressionStream = global?.CompressionStream;
const userAgent = navigator?.userAgent;
function isBrowserOnline() {
    return !!(win && false !== win.navigator.onLine);
}
__webpack_require__.d(__webpack_exports__, {
    isBrowserOnline: ()=>isBrowserOnline
}, {
    AbortController: AbortController,
    CompressionStream: CompressionStream,
    XMLHttpRequest: XMLHttpRequest,
    document: document,
    fetch: fetch,
    location: location,
    navigator: navigator,
    userAgent: userAgent,
    window: win
});
exports.AbortController = __webpack_exports__.AbortController;
exports.CompressionStream = __webpack_exports__.CompressionStream;
exports.XMLHttpRequest = __webpack_exports__.XMLHttpRequest;
exports.document = __webpack_exports__.document;
exports.fetch = __webpack_exports__.fetch;
exports.isBrowserOnline = __webpack_exports__.isBrowserOnline;
exports.location = __webpack_exports__.location;
exports.navigator = __webpack_exports__.navigator;
exports.userAgent = __webpack_exports__.userAgent;
exports.window = __webpack_exports__.window;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "AbortController",
    "CompressionStream",
    "XMLHttpRequest",
    "document",
    "fetch",
    "isBrowserOnline",
    "location",
    "navigator",
    "userAgent",
    "window"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
