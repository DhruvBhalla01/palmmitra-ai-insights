import type { PropertyOperator } from '@posthog/core';
import type { Properties } from '@posthog/types';
export type { PropertyFilters, PropertyMatchType, PropertyOperator } from '@posthog/core';
export { matchPropertyFilters, propertyComparisons } from '@posthog/core/surveys';
export interface SessionRecordingTriggerPropertyFilter {
    key: string;
    value?: string | number | boolean | (string | number | boolean)[] | null;
    operator?: PropertyOperator | null;
    type?: string | null;
}
export declare function getPersonPropertiesHash(distinct_id: string, userPropertiesToSet?: Properties, userPropertiesToSetOnce?: Properties): string;
/**
 * Evaluate trigger property filters (WHERE clauses) against event and person properties.
 * All filters must match (implicit AND). Returns true if no filters are present.
 */
export declare function matchTriggerPropertyFilters(filters: SessionRecordingTriggerPropertyFilter[] | undefined, eventProperties: Properties | undefined, personProperties: Properties | undefined): boolean;
