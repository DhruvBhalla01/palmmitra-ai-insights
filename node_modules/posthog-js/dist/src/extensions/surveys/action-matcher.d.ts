import type { PostHog } from '../../posthog-core';
import { SurveyActionType } from '../../posthog-surveys-types';
import { CaptureResult } from '../../types';
export declare class ActionMatcher {
    private readonly _instance?;
    private readonly _actionRegistry;
    private readonly _actionEvents;
    private _debugEventEmitter;
    private _captureHookUnsubscribe?;
    constructor(_instance?: PostHog | undefined);
    init(): void;
    dispose(): void;
    register(actions: SurveyActionType[]): void;
    replace(actions: SurveyActionType[]): void;
    on(eventName: string, eventPayload?: CaptureResult): void;
    _addActionHook(callback: (actionName: string, eventPayload?: any) => void): void;
    private _checkAction;
    onAction(event: 'actionCaptured', cb: (...args: any[]) => void): () => void;
    private _checkStep;
    private _checkStepEvent;
    private _checkStepUrl;
    private _checkStepElement;
    private _checkStepHref;
    private _checkStepText;
    private _checkStepSelector;
    private _getElementsList;
    private _checkStepProperties;
}
