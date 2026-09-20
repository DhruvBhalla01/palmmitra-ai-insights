import type { eventWithTime } from '../types/rrweb-types';
import type { rrwebRecord } from '../types/rrweb';
export declare const DEFAULT_MUTATION_BYTES_REFILL_RATE: number;
export declare const DEFAULT_MUTATION_RESYNC_INTERVAL_MS: number;
export declare class MutationThrottler {
    private readonly _rrweb;
    private readonly _options;
    private _loggedTracker;
    private _rateLimiter;
    private _bytesBucketSize;
    private _bytesRefillRate;
    private _byteBudgetDisabled;
    private _byteTokens;
    private _lastByteRefill;
    private _resyncIntervalMs;
    private _resyncTimer;
    private _lastResyncAt;
    constructor(_rrweb: rrwebRecord, _options?: {
        bucketSize?: number;
        refillRate?: number;
        bytesBucketSize?: number;
        bytesRefillRate?: number;
        resyncIntervalMs?: number;
        onBlockedNode?: (id: number, node: Node | null) => void;
        onDroppedAttributeMutations?: (count: number) => void;
        onDroppedOversizedMutation?: (bytes: number) => void;
        requestFullSnapshot?: () => void;
    });
    private _refillByteBudget;
    private _onNodeRateLimited;
    private _getNodeOrRelevantParent;
    private _getNode;
    private _numberOfChanges;
    throttleMutations: (event: eventWithTime) => eventWithTime | undefined;
    private _scheduleResync;
    reset(): void;
    stop(): void;
}
