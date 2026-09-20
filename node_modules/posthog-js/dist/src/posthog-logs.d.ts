import { PostHog } from './posthog-core';
import type { CaptureLogOptions, RemoteConfigResult, Logger, LogSdkContext } from './types';
import type { Client, DeepReadonly, Extension } from '@posthog/browser-common';
export declare const RECORDER_MAX_AGE_MS = 30000;
export declare class PostHogLogs implements Extension {
    private readonly _instance;
    readonly name: import("@posthog/browser-common").ExtensionToken<PostHogLogs>;
    private _isLogsEnabled;
    private _isLoaded;
    private _isLoading;
    private readonly _logger;
    private readonly _coreLogger;
    private _queue;
    private _core;
    private _resolvedConfig;
    private _resolvedFrom;
    private _capture_logger;
    private _consoleQueue;
    private _consoleCore;
    private _consoleLogsDispose;
    private _consoleResolvedConfig;
    private _consoleResolvedFrom;
    private _consecutiveStatusZeroFailures;
    private _client?;
    private _remoteConfigSubscription?;
    private _disposed;
    private _consoleBuffer;
    private _consoleRecorderUnpatchers;
    private _isRecordingConsole;
    private _consoleRecorderTimeout;
    private _isRecordingConsoleEntry;
    constructor(_instance: PostHog);
    private _onReconnect;
    private _buildCore;
    private _getCore;
    private _getConsoleCore;
    setup(client: Client): void;
    dispose(): void;
    onRemoteConfig(result: DeepReadonly<RemoteConfigResult>): void;
    reset(): void;
    captureLog(options: CaptureLogOptions): void;
    /** @internal */
    captureConsoleLog(options: CaptureLogOptions): void;
    /** @internal */
    captureBufferedConsoleLog(options: CaptureLogOptions, context: LogSdkContext, occurredAtMs: number): void;
    private _persistedCaptureHint;
    private _remoteConfigWillArrive;
    /**
     * Releases everything console capture is holding when capturing is turned off: the
     * pre-load buffer, the `console` patches, and console records already queued — at
     * that moment rather than whenever the page next writes to the console.
     *
     * @internal
     */
    _onOptOut(): void;
    private _stopRecorderStartedByPersistedHint;
    private _startConsoleRecorder;
    private _recordConsoleEntry;
    private _stopConsoleRecorder;
    private _takeConsoleBuffer;
    get logger(): Logger;
    flushLogs(transport?: 'XHR' | 'fetch' | 'sendBeacon'): void;
    private _logFlushError;
    loadIfEnabled(): void;
    private _createHost;
    private _sendLogsBatch;
    private _trackEndpointReachability;
    private _flushViaTransport;
    private _drainQueueViaTransport;
    private _logsUrl;
    private _getSdkContext;
}
