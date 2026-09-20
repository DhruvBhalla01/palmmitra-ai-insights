import { Survey } from '../posthog-surveys-types';
import type { PostHog } from '../posthog-core';
import { ActivationOutcome, EventReceiver } from './event-receiver';
import { createLogger } from '@posthog/browser-common/utils/logger';
export declare class SurveyEventReceiver extends EventReceiver<Survey> {
    constructor(instance: PostHog);
    protected _getActivatedKey(): string;
    protected _getActivatedSessionKey(): string;
    protected _getActivationTimestampsKey(): string;
    protected _writeActivationTimestamps(timestamps: Record<string, number>): void;
    protected _clearActivationTimestampsStore(): void;
    /**
     * A survey with a popup delay must survive navigation so the delay resumes from the recorded
     * activation time on the next page instead of restarting from zero. Surveys without a delay
     * keep the in-memory arming, so an exit-intent trigger does not surface them on a later page.
     */
    protected _shouldPersistArmedActivation(itemId: string): boolean;
    protected _getShownEventName(): string;
    protected _getItems(callback: (items: Survey[]) => void): void;
    protected _cancelPendingItem(itemId: string): void;
    protected _getLogger(): ReturnType<typeof createLogger>;
    protected _setActivatedItems(eligibleItems: string[]): void;
    protected _setActivatedSession(sessionId: string): void;
    protected _clearActivatedSession(): void;
    protected _isItemPermanentlyIneligible(): boolean;
    protected _activationOutcome(event: string, itemId: string): ActivationOutcome;
    getSurveys(): string[];
    getEventToSurveys(): Map<string, string[]>;
}
