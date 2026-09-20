import type { Disposable } from './disposable';
/**
 * Call it with a handler to start listening; dispose the returned
 * {@link Disposable} to stop. There is one `Listener` per event type, so every
 * event carries its own payload type. The handler is called synchronously, and
 * stateful listeners may replay their current value during registration when
 * documented. The returned disposable unregisters it from future payloads.
 */
export type Listener<T> = (handler: (payload: T) => void) => Disposable;
/**
 * Publish/subscribe helper for client events exposed to extensions. A client
 * owns the publisher, calls {@link Publisher.publish} to fire payloads, and
 * exposes only {@link Publisher.listener} to extensions so they can subscribe
 * without gaining publish access. Calling {@link Publisher.dispose} drops all
 * listeners.
 */
export declare class Publisher<T> implements Disposable {
    /** Subscriptions currently registered with this publisher. */
    private _subscriptions;
    private _disposed;
    private readonly _onError;
    constructor(onError?: (error: unknown) => void);
    /**
     * Register a handler for future payloads. The returned disposable
     * subscription unregisters this handler.
     */
    readonly listener: Listener<T>;
    /** Notify every currently registered listener with the provided payload. */
    publish(payload: T): void;
    /** Drop all registered listeners. Safe to call more than once. */
    dispose(): void;
}
