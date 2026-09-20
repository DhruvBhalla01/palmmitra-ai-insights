import type { ExtensionToken } from '@posthog/browser-common';
import type { Autocapture } from './autocapture';
import type { PostHogFeatureFlags } from './posthog-featureflags';
import type { PostHogLogs } from './posthog-logs';
import type { PostHogSurveys } from './posthog-surveys';
export declare const AutocaptureExtension: ExtensionToken<Autocapture>;
export declare const FeatureFlagsExtension: ExtensionToken<PostHogFeatureFlags>;
export declare const LogsExtension: ExtensionToken<PostHogLogs>;
export declare const SurveysExtension: ExtensionToken<PostHogSurveys>;
