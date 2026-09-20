"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConversationsError = exports.createConversationsError = void 0;
var HANDLED_CONVERSATIONS_ERROR = '__posthogHandledConversationsError';
var createConversationsError = function (kind, message) {
    var error = new Error(message);
    error[HANDLED_CONVERSATIONS_ERROR] = true;
    error.kind = kind;
    return error;
};
exports.createConversationsError = createConversationsError;
var isConversationsError = function (error) {
    return !!error && typeof error === 'object' && error[HANDLED_CONVERSATIONS_ERROR] === true;
};
exports.isConversationsError = isConversationsError;
//# sourceMappingURL=errors.js.map