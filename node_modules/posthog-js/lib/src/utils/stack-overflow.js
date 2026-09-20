"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStackOverflowError = void 0;
var core_1 = require("@posthog/core");
var isStackOverflowError = function (error) {
    return (0, core_1.isError)(error) &&
        ((error.name === 'RangeError' && error.message.indexOf('Maximum call stack size exceeded') === 0) ||
            (error.name === 'InternalError' && error.message === 'too much recursion'));
};
exports.isStackOverflowError = isStackOverflowError;
//# sourceMappingURL=stack-overflow.js.map