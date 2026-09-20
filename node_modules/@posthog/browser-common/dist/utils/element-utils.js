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
    isElementInToolbar: ()=>isElementInToolbar,
    isElementNode: ()=>isElementNode,
    isShadowRoot: ()=>isShadowRoot,
    isTag: ()=>isTag,
    isTextNode: ()=>isTextNode
});
const external_constants_js_namespaceObject = require("../constants.js");
const NODE_TYPE_ELEMENT = 1;
const NODE_TYPE_TEXT = 3;
const NODE_TYPE_DOCUMENT_FRAGMENT = 11;
function isElementInToolbar(el) {
    if (el instanceof Element) return el.id === external_constants_js_namespaceObject.TOOLBAR_ID || !!el.closest?.('.' + external_constants_js_namespaceObject.TOOLBAR_CONTAINER_CLASS);
    return false;
}
function isElementNode(el) {
    return !!el && el.nodeType === NODE_TYPE_ELEMENT;
}
function isTag(el, tag) {
    return !!el && !!el.tagName && el.tagName.toLowerCase() === tag.toLowerCase();
}
function isTextNode(el) {
    return !!el && el.nodeType === NODE_TYPE_TEXT;
}
function isShadowRoot(el) {
    return !!el && el.nodeType === NODE_TYPE_DOCUMENT_FRAGMENT && isElementNode(el.host);
}
exports.isElementInToolbar = __webpack_exports__.isElementInToolbar;
exports.isElementNode = __webpack_exports__.isElementNode;
exports.isShadowRoot = __webpack_exports__.isShadowRoot;
exports.isTag = __webpack_exports__.isTag;
exports.isTextNode = __webpack_exports__.isTextNode;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "isElementInToolbar",
    "isElementNode",
    "isShadowRoot",
    "isTag",
    "isTextNode"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
