import type { ApiResponse, SendRequestInit } from '@posthog/browser-common';
import type { PostHog } from './posthog-core';
import { PostHogSurveys } from './posthog-surveys';
/** Browser-v1 compatibility wrapper for the shared surveys extension. */
export declare class BrowserSurveys extends PostHogSurveys {
    private readonly _instance;
    constructor(_instance: PostHog);
    protected _sendSurveysRequest(path: string, init: SendRequestInit): Promise<ApiResponse>;
}
