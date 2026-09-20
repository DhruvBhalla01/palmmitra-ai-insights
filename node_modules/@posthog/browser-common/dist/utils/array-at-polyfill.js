var __webpack_exports__ = {};
if ('function' != typeof Array.prototype.at) Object.defineProperty(Array.prototype, 'at', {
    value: function(index) {
        const len = this.length;
        let relativeIndex = Math.trunc(index) || 0;
        if (relativeIndex < 0) relativeIndex += len;
        return relativeIndex < 0 || relativeIndex >= len ? void 0 : this[relativeIndex];
    },
    writable: true,
    enumerable: false,
    configurable: true
});
for(var __rspack_i in __webpack_exports__)exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
