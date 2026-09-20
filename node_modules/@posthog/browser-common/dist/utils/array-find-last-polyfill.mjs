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
export { };
