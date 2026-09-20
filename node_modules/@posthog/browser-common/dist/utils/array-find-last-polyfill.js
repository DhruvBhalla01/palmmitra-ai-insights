var __webpack_exports__ = {};
if ('function' != typeof Array.prototype.findLast) Object.defineProperty(Array.prototype, 'findLast', {
    value: function(predicate, thisArg) {
        for(let index = this.length - 1; index >= 0; index--){
            const value = this[index];
            if (predicate.call(thisArg, value, index, this)) return value;
        }
    },
    writable: true,
    enumerable: false,
    configurable: true
});
for(var __rspack_i in __webpack_exports__)exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
