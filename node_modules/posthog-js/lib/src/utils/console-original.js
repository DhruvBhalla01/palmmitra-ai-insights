"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.originalConsoleMethod = void 0;
/**
 * Walks the `__rrweb_original__` markers console plugins leave behind to reach the
 * real console method. Shared by the main bundle's recorder and the logs entrypoint
 * so a change to the marker protocol can't be applied to only one of them.
 */
var originalConsoleMethod = function (method) {
    while (method === null || method === void 0 ? void 0 : method.__rrweb_original__) {
        method = method.__rrweb_original__;
    }
    return method;
};
exports.originalConsoleMethod = originalConsoleMethod;
//# sourceMappingURL=console-original.js.map