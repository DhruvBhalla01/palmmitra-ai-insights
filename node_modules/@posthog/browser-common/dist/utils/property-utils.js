"use strict";
var __webpack_require__ = {};
(()=>{
    __webpack_require__.d = (exports1, getters, values)=>{
        var define = (defs, kind)=>{
            for(var key in defs)if (__webpack_require__.o(defs, key) && !__webpack_require__.o(exports1, key)) Object.defineProperty(exports1, key, {
                enumerable: true,
                [kind]: defs[key]
            });
        };
        define(getters, "get");
        define(values, "value");
    };
})();
(()=>{
    __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
})();
(()=>{
    __webpack_require__.r = (exports1)=>{
        if ("u" > typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports1, Symbol.toStringTag, {
            value: 'Module'
        });
        Object.defineProperty(exports1, '__esModule', {
            value: true
        });
    };
})();
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
    getPersonPropertiesHash: ()=>getPersonPropertiesHash,
    matchPropertyFilters: ()=>surveys_namespaceObject.matchPropertyFilters,
    matchTriggerPropertyFilters: ()=>matchTriggerPropertyFilters,
    propertyComparisons: ()=>surveys_namespaceObject.propertyComparisons
});
const core_namespaceObject = require("@posthog/core");
const surveys_namespaceObject = require("@posthog/core/surveys");
const external_request_utils_js_namespaceObject = require("./request-utils.js");
function getPersonPropertiesHash(distinct_id, userPropertiesToSet, userPropertiesToSetOnce) {
    return (0, external_request_utils_js_namespaceObject.jsonStringify)({
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
        if ((0, core_namespaceObject.isUndefined)(propertyValue) || (0, core_namespaceObject.isNull)(propertyValue)) return NEGATIVE_OPERATORS.has(operator);
        const comparisonFunction = surveys_namespaceObject.propertyComparisons[operator];
        if (!comparisonFunction) return false;
        if ((0, core_namespaceObject.isUndefined)(filter.value) || (0, core_namespaceObject.isNull)(filter.value)) return false;
        const targetValues = (0, core_namespaceObject.isArray)(filter.value) ? filter.value.map(String) : [
            String(filter.value)
        ];
        const actualValues = (0, core_namespaceObject.isArray)(propertyValue) ? propertyValue.map(String) : [
            String(propertyValue)
        ];
        return comparisonFunction(targetValues, actualValues);
    });
}
exports.getPersonPropertiesHash = __webpack_exports__.getPersonPropertiesHash;
exports.matchPropertyFilters = __webpack_exports__.matchPropertyFilters;
exports.matchTriggerPropertyFilters = __webpack_exports__.matchTriggerPropertyFilters;
exports.propertyComparisons = __webpack_exports__.propertyComparisons;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "getPersonPropertiesHash",
    "matchPropertyFilters",
    "matchTriggerPropertyFilters",
    "propertyComparisons"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
