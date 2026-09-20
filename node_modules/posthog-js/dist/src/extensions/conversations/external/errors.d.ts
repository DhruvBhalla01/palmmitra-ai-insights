declare const HANDLED_CONVERSATIONS_ERROR: "__posthogHandledConversationsError";
export type ConversationsErrorKind = 'network' | 'rate_limit' | 'http' | 'invalid_response';
export type ConversationsError = Error & {
    [HANDLED_CONVERSATIONS_ERROR]: true;
    kind: ConversationsErrorKind;
};
export declare const createConversationsError: (kind: ConversationsErrorKind, message: string) => ConversationsError;
export declare const isConversationsError: (error: unknown) => error is ConversationsError;
export {};
