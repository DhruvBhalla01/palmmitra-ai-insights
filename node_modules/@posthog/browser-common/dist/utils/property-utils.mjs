import { isArray, isNull, isUndefined } from "@posthog/core";
import { matchPropertyFilters, propertyComparisons } from "@posthog/core/surveys";
import { jsonStringify } from "./request-utils.mjs";
function getPersonPropertiesHash(distinct_id, userPropertiesToSet, userPropertiesToSetOnce) {
    return jsonStringify({
        distinct_id,
        userPropertiesToSet,
        userPropertiesToSetOnce
    });
}
const NEGATIVE_OPERATORS = new Set([
    'is_not',
    'not_icontains',
    'not_regex'
]);
function matchTriggerPropertyFilters(filters, eventProperties, personProperties) {
    if (!filters || 0 === filters.length) return true;
    return filters.every((filter)=>{
        const source = 'person' === filter.type ? personProperties : eventProperties;
        const propertyValue = source?.[filter.key];
        const operator = filter.operator || 'exact';
        if (isUndefined(propertyValue) || isNull(propertyValue)) return NEGATIVE_OPERATORS.has(operator);
        const comparisonFunction = propertyComparisons[operator];
        if (!comparisonFunction) return false;
        if (isUndefined(filter.value) || isNull(filter.value)) return false;
        const targetValues = isArray(filter.value) ? filter.value.map(String) : [
            String(filter.value)
        ];
        const actualValues = isArray(propertyValue) ? propertyValue.map(String) : [
            String(propertyValue)
        ];
        return comparisonFunction(targetValues, actualValues);
    });
}
export { getPersonPropertiesHash, matchPropertyFilters, matchTriggerPropertyFilters, propertyComparisons };
