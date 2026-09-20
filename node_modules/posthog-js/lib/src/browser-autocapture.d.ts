import { Autocapture } from './autocapture';
import type { PostHog } from './posthog-core';
/** Browser-v1 compatibility wrapper for the SDK-neutral autocapture extension. */
export declare class BrowserAutocapture extends Autocapture {
    instance: PostHog;
    constructor(instance: PostHog);
}
