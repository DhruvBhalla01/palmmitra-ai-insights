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
    getNativeImplementation: ()=>getNativeImplementation,
    getNativeMutationObserverImplementation: ()=>getNativeMutationObserverImplementation
});
const core_namespaceObject = require("@posthog/core");
const external_logger_js_namespaceObject = require("./logger.js");
const external_type_utils_js_namespaceObject = require("./type-utils.js");
const cachedImplementations = {};
function getNativeImplementation(name, assignableWindow) {
    const cached = cachedImplementations[name];
    if (cached) return cached;
    let impl = assignableWindow[name];
    if ((0, core_namespaceObject.isNativeFunction)(impl) && !(0, external_type_utils_js_namespaceObject.isAngularZonePresent)()) return cachedImplementations[name] = impl.bind(assignableWindow);
    const document = assignableWindow.document;
    if (document && (0, core_namespaceObject.isFunction)(document.createElement)) {
        let sandbox;
        let keepSandboxAttached = false;
        try {
            sandbox = document.createElement('iframe');
            sandbox.hidden = true;
            document.head.appendChild(sandbox);
            const contentWindow = sandbox.contentWindow;
            if (contentWindow && contentWindow[name]) {
                impl = contentWindow[name];
                if ('MutationObserver' === name && (0, core_namespaceObject.isWebKit)(assignableWindow.navigator?.userAgent ?? '')) {
                    sandbox.classList.add('rr-block', 'ph-no-capture');
                    keepSandboxAttached = true;
                }
            }
        } catch (e) {
            external_logger_js_namespaceObject.logger.warn(`Could not create sandbox iframe for ${name} check, bailing to assignableWindow.${name}: `, e);
        } finally{
            if (!keepSandboxAttached && sandbox?.parentNode) sandbox.parentNode.removeChild(sandbox);
        }
    }
    if (!impl || !(0, core_namespaceObject.isFunction)(impl)) return impl;
    return cachedImplementations[name] = impl.bind(assignableWindow);
}
function getNativeMutationObserverImplementation(assignableWindow) {
    return getNativeImplementation('MutationObserver', assignableWindow);
}
exports.getNativeImplementation = __webpack_exports__.getNativeImplementation;
exports.getNativeMutationObserverImplementation = __webpack_exports__.getNativeMutationObserverImplementation;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "getNativeImplementation",
    "getNativeMutationObserverImplementation"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
