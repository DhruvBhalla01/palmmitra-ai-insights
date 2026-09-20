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
    prepareStylesheet: ()=>prepareStylesheet
});
const core_namespaceObject = require("@posthog/core");
const external_logger_js_namespaceObject = require("./logger.js");
const logger = (0, external_logger_js_namespaceObject.createLogger)('[Stylesheet Loader]');
const getStylesheetPreparer = (context)=>{
    if ((0, core_namespaceObject.isFunction)(context)) return context;
    return context?.config?.prepare_external_dependency_stylesheet;
};
const prepareStylesheet = (document, innerText, context)=>{
    let stylesheet = document.createElement('style');
    stylesheet.innerText = innerText;
    const prepareExternalDependencyStylesheet = getStylesheetPreparer(context);
    if (prepareExternalDependencyStylesheet) stylesheet = prepareExternalDependencyStylesheet(stylesheet);
    if (!stylesheet) {
        logger.error('prepare_external_dependency_stylesheet returned null');
        return null;
    }
    return stylesheet;
};
exports.prepareStylesheet = __webpack_exports__.prepareStylesheet;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "prepareStylesheet"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
