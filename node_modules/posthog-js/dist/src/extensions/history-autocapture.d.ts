import { PostHog } from '../posthog-core';
import type { Extension } from './types';
/**
 * Captures pageviews when selected URL components change through the history API, browser back/forward navigation,
 * or hash navigation.
 */
export declare class HistoryAutocapture implements Extension {
    private _instance;
    private _popstateListener;
    private _hashchangeListener;
    private _lastLocation;
    constructor(instance: PostHog);
    initialize(): void;
    get isEnabled(): boolean;
    startIfEnabled(): void;
    startIfEnabledOrStop(): void;
    stop(): void;
    monitorHistoryChanges(): void;
    private _patchHistoryMethod;
    private _getCurrentLocation;
    private _getCaptureOptions;
    private _shouldCaptureHashChanges;
    private _hasLocationChanged;
    private _capturePageview;
    private _setupPopstateListener;
    private _setupHashchangeListener;
}
