import type { PostHog } from './posthog-core';
import { RequestResponse } from './types';
export declare class RateLimiter {
    instance: PostHog;
    serverLimits: Record<string, number>;
    lastEventRateLimited: boolean;
    constructor(instance: PostHog);
    get captureEventsPerSecond(): number;
    get captureEventsBurstLimit(): number;
    clientRateLimitContext(checkOnly?: boolean): {
        isRateLimited: boolean;
        remainingTokens: number;
    };
    private _isPropertyAllowed;
    /**
     * The page the limiter tripped on, without the query string or hash - enough to spot a
     * self-reloading 404 without putting whatever a customer keeps in their query params into
     * an ingestion warning. Because this value recombines `$current_url` and `$pathname`, omit it
     * if either standard property has been denylisted rather than reintroducing denied context.
     */
    private _triggeringPage;
    private _captureWarning;
    isServerRateLimited(batchKey: string | undefined): boolean;
    checkForLimiting: (httpResponse: RequestResponse) => void;
}
