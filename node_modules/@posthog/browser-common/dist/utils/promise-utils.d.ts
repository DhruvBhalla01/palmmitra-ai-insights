export type MaybePromise<T> = T | Promise<T>;
/** Chain sync and async values without deferring synchronous work to a microtask. */
export declare const continueWith: <T, R>(result: MaybePromise<T>, callback: (value: T) => MaybePromise<R>) => MaybePromise<R>;
