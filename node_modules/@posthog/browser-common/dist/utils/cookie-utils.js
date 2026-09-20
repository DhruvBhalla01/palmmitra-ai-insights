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
    getCookieValue: ()=>getCookieValue
});
const external_globals_js_namespaceObject = require("./globals.js");
const getCookieValue = (name)=>{
    if (!external_globals_js_namespaceObject.document) return;
    try {
        const nameEQ = name + '=';
        const cookies = external_globals_js_namespaceObject.document.cookie.split(';').filter((cookie)=>cookie.length);
        for(let i = 0; i < cookies.length; i++){
            let cookie = cookies[i];
            while(' ' == cookie.charAt(0))cookie = cookie.substring(1, cookie.length);
            if (0 === cookie.indexOf(nameEQ)) return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
        }
    } catch  {}
    return null;
};
exports.getCookieValue = __webpack_exports__.getCookieValue;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "getCookieValue"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
