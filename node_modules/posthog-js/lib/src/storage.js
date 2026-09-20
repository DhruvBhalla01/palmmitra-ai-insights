"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionStore = exports.resetSessionStorageSupported = exports.memoryStore = exports.createLocalPlusCookieStore = exports.getCookiePropertiesFingerprint = exports.getCookiePersistedPropertiesFromMetadata = exports.getCookiePersistedPropertiesMetadataState = exports.getCookiePersistedPropertiesMetadata = exports.getCookiePersistedProperties = exports.getSafeCookieProperties = exports.getCookiePersistedPropertiesMetadataName = exports.COOKIE_PERSISTED_PROPERTIES = exports.COOKIE_IDENTITY_BOUND_LOCAL_PROPERTIES = exports.localStore = exports.resetLocalStorageSupported = exports.cookieStore = exports.resetCookieStorageSupported = exports.resetSubDomainCache = void 0;
exports.seekFirstNonPublicSubDomain = seekFirstNonPublicSubDomain;
exports.chooseCookieDomain = chooseCookieDomain;
var general_utils_1 = require("@posthog/browser-common/utils/general-utils");
var constants_1 = require("./constants");
var core_1 = require("@posthog/core");
var logger_1 = require("@posthog/browser-common/utils/logger");
var globals_1 = require("@posthog/browser-common/utils/globals");
var cookie_utils_1 = require("@posthog/browser-common/utils/cookie-utils");
var uuidv7_1 = require("@posthog/browser-common/utils/uuidv7");
// we store the discovered subdomain in memory because it might be read multiple times
var firstNonPublicSubDomain = '';
// helper to allow tests to clear this "cache"
var resetSubDomainCache = function () {
    firstNonPublicSubDomain = '';
};
exports.resetSubDomainCache = resetSubDomainCache;
/**
 * Browsers don't offer a way to check if something is a public suffix
 * e.g. `.com.au`, `.io`, `.org.uk`
 *
 * But they do reject cookies set on public suffixes
 * Setting a cookie on `.co.uk` would mean it was sent for every `.co.uk` site visited
 *
 * So, we can use this to check if a domain is a public suffix
 * by trying to set a cookie on a subdomain of the provided hostname
 * until the browser accepts it
 *
 * inspired by https://github.com/AngusFu/browser-root-domain
 */
function seekFirstNonPublicSubDomain(hostname, cookieJar) {
    if (cookieJar === void 0) { cookieJar = globals_1.document; }
    if (firstNonPublicSubDomain) {
        return firstNonPublicSubDomain;
    }
    if (!cookieJar) {
        return '';
    }
    if (['localhost', '127.0.0.1'].includes(hostname))
        return '';
    var list = hostname.split('.');
    var len = Math.min(list.length, 8); // paranoia - we know this number should be small
    var key = 'dmn_chk_' + (0, uuidv7_1.uuidv7)();
    while (!firstNonPublicSubDomain && len--) {
        var candidate = list.slice(len).join('.');
        var candidateCookieValue = key + '=1;domain=.' + candidate + ';path=/';
        // try to set cookie, include a short expiry in seconds since we'll check immediately
        cookieJar.cookie = candidateCookieValue + ';max-age=3';
        if (cookieJar.cookie.includes(key)) {
            // the cookie was accepted by the browser, remove the test cookie
            cookieJar.cookie = candidateCookieValue + ';max-age=0';
            firstNonPublicSubDomain = candidate;
        }
    }
    return firstNonPublicSubDomain;
}
var DOMAIN_MATCH_REGEX = /[a-z0-9][a-z0-9-]+\.[a-z]{2,}$/i;
var originalCookieDomainFn = function (hostname) {
    var matches = hostname.match(DOMAIN_MATCH_REGEX);
    return matches ? matches[0] : '';
};
function chooseCookieDomain(hostname, cross_subdomain) {
    if (cross_subdomain) {
        // NOTE: Could we use this for cross domain tracking?
        var matchedSubDomain = seekFirstNonPublicSubDomain(hostname);
        if (!matchedSubDomain) {
            var originalMatch = originalCookieDomainFn(hostname);
            if (originalMatch !== matchedSubDomain) {
                logger_1.logger.info('Warning: cookie subdomain discovery mismatch', originalMatch, matchedSubDomain);
            }
            matchedSubDomain = originalMatch;
        }
        return matchedSubDomain ? '; domain=.' + matchedSubDomain : '';
    }
    return '';
}
var cookieStorageSupported = null;
// helper to allow tests to clear this "cache"
var resetCookieStorageSupported = function () {
    cookieStorageSupported = null;
};
exports.resetCookieStorageSupported = resetCookieStorageSupported;
// Methods partially borrowed from quirksmode.org/js/cookies.html
exports.cookieStore = {
    _is_supported: function () {
        if (!(0, core_1.isNull)(cookieStorageSupported)) {
            return cookieStorageSupported;
        }
        // `document` existing is not enough: a page served from a `data:` URL has a
        // document but reading or writing `document.cookie` throws, and some embedded
        // contexts silently drop every cookie. Round-trip a probe cookie instead, the
        // same way localStore and sessionStore establish support.
        cookieStorageSupported = false;
        if (globals_1.document) {
            try {
                var key = "__ph_cookie_support_".concat((0, uuidv7_1.uuidv7)());
                exports.cookieStore._set(key, 'xyz');
                cookieStorageSupported = (0, cookie_utils_1.getCookieValue)(key) === '"xyz"';
                exports.cookieStore._remove(key);
            }
            catch (_a) {
                cookieStorageSupported = false;
            }
        }
        return cookieStorageSupported;
    },
    _error: function (msg) {
        logger_1.logger.error('cookieStore error: ' + msg);
    },
    _get: cookie_utils_1.getCookieValue,
    _parse: function (name) {
        var cookie;
        try {
            cookie = JSON.parse(exports.cookieStore._get(name)) || {};
        }
        catch (_a) {
            // noop
        }
        return cookie;
    },
    _set: function (name, value, days, cross_subdomain, is_secure) {
        if (!globals_1.document) {
            return false;
        }
        try {
            var expires = '', secure = '';
            var cdomain = chooseCookieDomain(globals_1.document.location.hostname, cross_subdomain);
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
                expires = '; expires=' + date.toUTCString();
            }
            if (is_secure) {
                secure = '; secure';
            }
            var new_cookie_val = name +
                '=' +
                encodeURIComponent(JSON.stringify(value)) +
                expires +
                '; SameSite=Lax; path=/' +
                cdomain +
                secure;
            // 4096 bytes is the size at which some browsers (e.g. firefox) will not store a cookie, warn slightly before that
            if (new_cookie_val.length > 4096 * 0.9) {
                logger_1.logger.warn('cookieStore warning: large cookie, len=' + new_cookie_val.length);
            }
            globals_1.document.cookie = new_cookie_val;
            return true;
        }
        catch (_a) {
            return false;
        }
    },
    _remove: function (name, cross_subdomain) {
        if (!(globals_1.document === null || globals_1.document === void 0 ? void 0 : globals_1.document.cookie)) {
            return;
        }
        try {
            exports.cookieStore._set(name, '', -1, cross_subdomain);
        }
        catch (_a) {
            return;
        }
    },
};
var _localStorage_supported = null;
var resetLocalStorageSupported = function () {
    _localStorage_supported = null;
};
exports.resetLocalStorageSupported = resetLocalStorageSupported;
exports.localStore = {
    _is_supported: function () {
        if (!(0, core_1.isNull)(_localStorage_supported)) {
            return _localStorage_supported;
        }
        var supported = true;
        if (!(0, core_1.isUndefined)(globals_1.window)) {
            try {
                var key = '__mplssupport__', val = 'xyz';
                exports.localStore._set(key, val);
                if (exports.localStore._get(key) !== '"xyz"') {
                    supported = false;
                }
                exports.localStore._remove(key);
            }
            catch (_a) {
                supported = false;
            }
        }
        else {
            supported = false;
        }
        if (!supported) {
            logger_1.logger.error('localStorage unsupported; falling back to cookie store');
        }
        _localStorage_supported = supported;
        return supported;
    },
    _error: function (msg) {
        logger_1.logger.error('localStorage error: ' + msg);
    },
    _get: function (name) {
        try {
            return globals_1.window === null || globals_1.window === void 0 ? void 0 : globals_1.window.localStorage.getItem(name);
        }
        catch (err) {
            exports.localStore._error(err);
        }
        return null;
    },
    _parse: function (name) {
        try {
            return JSON.parse(exports.localStore._get(name)) || {};
        }
        catch (_a) {
            // noop
        }
        return null;
    },
    _set: function (name, value) {
        try {
            globals_1.window === null || globals_1.window === void 0 ? void 0 : globals_1.window.localStorage.setItem(name, JSON.stringify(value));
            return true;
        }
        catch (err) {
            exports.localStore._error(err);
        }
        return false;
    },
    _remove: function (name) {
        try {
            globals_1.window === null || globals_1.window === void 0 ? void 0 : globals_1.window.localStorage.removeItem(name);
        }
        catch (err) {
            exports.localStore._error(err);
        }
    },
};
// Use localstorage for most data but still use cookie for COOKIE_PERSISTED_PROPERTIES
// This solves issues with cookies having too much data in them causing headers too large
// Also makes sure we don't have to send a ton of data to the server
exports.COOKIE_IDENTITY_BOUND_LOCAL_PROPERTIES = [
    constants_1.STORED_PERSON_PROPERTIES_KEY,
    constants_1.PERSISTENCE_ACTIVE_FEATURE_FLAGS,
    constants_1.ENABLED_FEATURE_FLAGS,
    constants_1.PERSISTENCE_FEATURE_FLAG_DETAILS,
    constants_1.PERSISTENCE_FEATURE_FLAG_PAYLOADS,
    constants_1.PERSISTENCE_FEATURE_FLAG_REQUEST_ID,
    constants_1.PERSISTENCE_FEATURE_FLAG_EVALUATED_AT,
    constants_1.PERSISTENCE_FEATURE_FLAG_ERRORS,
    constants_1.FLAG_CALL_REPORTED,
];
exports.COOKIE_PERSISTED_PROPERTIES = [
    constants_1.DEVICE_ID,
    constants_1.DISTINCT_ID,
    constants_1.SESSION_ID,
    constants_1.SESSION_RECORDING_IS_SAMPLED,
    constants_1.ENABLE_PERSON_PROCESSING,
    constants_1.INITIAL_PERSON_INFO,
    constants_1.PERSISTENCE_FACEBOOK_CLICK_ID,
    constants_1.USER_STATE,
];
// Snapshot metadata lives in a separate cookie so older SDKs cannot merge it
// into event-visible persistence. Besides custom-key authority, its presence
// distinguishes current writers (which preserve falsy values) from legacy writers
// that omitted them. The payload is tied to the exact main-cookie snapshot;
// mixed-version or concurrent writes invalidate stale removal semantics.
var COOKIE_PERSISTED_PROPERTIES_METADATA_SUFFIX = '_cpm';
var getCookiePersistedPropertiesMetadataName = function (name) {
    return name + COOKIE_PERSISTED_PROPERTIES_METADATA_SUFFIX;
};
exports.getCookiePersistedPropertiesMetadataName = getCookiePersistedPropertiesMetadataName;
var UNSAFE_COOKIE_PROPERTY_KEYS = ['__proto__', 'constructor', 'prototype'];
var getSafeCookieProperties = function (value) {
    if (!(0, core_1.isObject)(value)) {
        return {};
    }
    var safeProperties = {};
    Object.keys(value).forEach(function (key) {
        if (UNSAFE_COOKIE_PROPERTY_KEYS.indexOf(key) === -1) {
            safeProperties[key] = value[key];
        }
    });
    return safeProperties;
};
exports.getSafeCookieProperties = getSafeCookieProperties;
var getCookiePersistedProperties = function (value, customCookieProperties) {
    if (customCookieProperties === void 0) { customCookieProperties = []; }
    var cookiePersistedProperties = {};
    __spreadArray(__spreadArray([], __read(exports.COOKIE_PERSISTED_PROPERTIES), false), __read(customCookieProperties), false).forEach(function (key) {
        var persistedValue = value[key];
        if (!(0, core_1.isUndefined)(persistedValue) && !(0, core_1.isNull)(persistedValue) && persistedValue !== '') {
            cookiePersistedProperties[key] = persistedValue;
        }
    });
    return cookiePersistedProperties;
};
exports.getCookiePersistedProperties = getCookiePersistedProperties;
var getCookieSnapshotFingerprint = function (cookieValue) {
    // Two independent 32-bit hashes plus the byte length keep the sidecar
    // compact even when the main cookie is close to its 4 KB limit.
    var first = 5381;
    var second = 2166136261;
    for (var i = 0; i < cookieValue.length; i++) {
        var code = cookieValue.charCodeAt(i);
        first = (first * 33) ^ code;
        second = Math.imul(second ^ code, 16777619);
    }
    return cookieValue.length.toString(36) + '.' + (first >>> 0).toString(36) + '.' + (second >>> 0).toString(36);
};
var getCookiePersistedPropertiesMetadata = function (cookieProperties, customCookieProperties) { return ({
    p: customCookieProperties,
    f: getCookieSnapshotFingerprint(JSON.stringify(cookieProperties)),
}); };
exports.getCookiePersistedPropertiesMetadata = getCookiePersistedPropertiesMetadata;
var getCookiePersistedPropertiesMetadataState = function (name, cookieValue) {
    if (!cookieValue) {
        return { properties: [], isValid: false };
    }
    try {
        var metadata = exports.cookieStore._parse((0, exports.getCookiePersistedPropertiesMetadataName)(name));
        var isValid = (metadata === null || metadata === void 0 ? void 0 : metadata.f) === getCookieSnapshotFingerprint(cookieValue) && (0, core_1.isArray)(metadata.p);
        return { properties: isValid ? metadata.p : [], isValid: isValid };
    }
    catch (_a) {
        return { properties: [], isValid: false };
    }
};
exports.getCookiePersistedPropertiesMetadataState = getCookiePersistedPropertiesMetadataState;
var getCookiePersistedPropertiesFromMetadata = function (name, cookieValue) { return (0, exports.getCookiePersistedPropertiesMetadataState)(name, cookieValue).properties; };
exports.getCookiePersistedPropertiesFromMetadata = getCookiePersistedPropertiesFromMetadata;
var getCookiePropertiesFingerprint = function (name, cookieValue) {
    return cookieValue + '|' + (exports.cookieStore._get((0, exports.getCookiePersistedPropertiesMetadataName)(name)) || '');
};
exports.getCookiePropertiesFingerprint = getCookiePropertiesFingerprint;
/**
 * Creates a localPlusCookieStore instance with custom cookie-persisted properties.
 *
 * When `preferCookieOnConflict` is true, the cookie's values win over localStorage on
 * merge for any key both stores carry. Null/empty cookie values are filtered out
 * before the merge so a malformed legacy cookie cannot override valid localStorage
 * data. localStorage-only keys are unaffected. See the docs for
 * `cookieWinsOnConflict` for context.
 */
var createLocalPlusCookieStore = function (customCookieProperties, preferCookieOnConflict) {
    if (customCookieProperties === void 0) { customCookieProperties = []; }
    if (preferCookieOnConflict === void 0) { preferCookieOnConflict = false; }
    var cookiePropertiesToPersist = __spreadArray(__spreadArray([], __read(exports.COOKIE_PERSISTED_PROPERTIES), false), __read(customCookieProperties), false);
    return __assign(__assign({}, exports.localStore), { _parse: function (name) {
            var _a;
            try {
                var cookieValue = void 0;
                var cookieProperties_1 = {};
                try {
                    // Read the main cookie once so values and metadata validation
                    // always refer to the same snapshot.
                    cookieValue = exports.cookieStore._get(name) || undefined;
                    cookieProperties_1 = cookieValue ? (0, exports.getSafeCookieProperties)(JSON.parse(cookieValue)) : {};
                }
                catch (_b) { }
                var localStorageData_1 = JSON.parse(exports.localStore._get(name) || '{}');
                var value = void 0;
                if (preferCookieOnConflict) {
                    // Built-in keys are stable and authoritative for legacy cookies too.
                    // Separate metadata adds only custom keys understood by the writer.
                    var metadataState_1 = (0, exports.getCookiePersistedPropertiesMetadataState)(name, cookieValue);
                    var authoritativeCookieProperties_1 = __spreadArray(__spreadArray([], __read(exports.COOKIE_PERSISTED_PROPERTIES), false), __read(metadataState_1.properties), false);
                    // Defensive: skip null / empty-string cookie values so a malformed
                    // legacy cookie cannot wipe out valid localStorage data.
                    var safeCookieProperties_1 = {};
                    Object.keys(cookieProperties_1).forEach(function (key) {
                        var v = cookieProperties_1[key];
                        if (!(0, core_1.isNull)(v) &&
                            v !== '' &&
                            (key !== constants_1.USER_STATE || v === constants_1.USER_STATE_ANONYMOUS || v === constants_1.USER_STATE_IDENTIFIED)) {
                            safeCookieProperties_1[key] = v;
                        }
                    });
                    var hasValidCookieIdentity_1 = constants_1.DISTINCT_ID in safeCookieProperties_1 ||
                        safeCookieProperties_1[constants_1.USER_STATE] === constants_1.USER_STATE_ANONYMOUS ||
                        safeCookieProperties_1[constants_1.USER_STATE] === constants_1.USER_STATE_IDENTIFIED;
                    // A non-empty cookie is the complete shared snapshot for the key
                    // set understood by its writer. Remove omitted keys so a subdomain
                    // reopened after reset cannot resurrect prior-user values.
                    if (Object.keys(safeCookieProperties_1).length > 0) {
                        var previousDistinctId = localStorageData_1[constants_1.DISTINCT_ID];
                        var previousUserState = (_a = localStorageData_1[constants_1.USER_STATE]) !== null && _a !== void 0 ? _a : constants_1.USER_STATE_ANONYMOUS;
                        cookiePropertiesToPersist.forEach(function (key) {
                            if (authoritativeCookieProperties_1.indexOf(key) !== -1 &&
                                !(key in cookieProperties_1) &&
                                (hasValidCookieIdentity_1 || (key !== constants_1.DISTINCT_ID && key !== constants_1.USER_STATE))) {
                                var localValue = localStorageData_1[key];
                                var legacyFalsyBuiltIn = !metadataState_1.isValid &&
                                    exports.COOKIE_PERSISTED_PROPERTIES.indexOf(key) !== -1 &&
                                    (localValue === false || localValue === 0);
                                if (!legacyFalsyBuiltIn) {
                                    delete localStorageData_1[key];
                                }
                            }
                        });
                        if (hasValidCookieIdentity_1 &&
                            !(constants_1.USER_STATE in cookieProperties_1) &&
                            !(constants_1.USER_STATE in localStorageData_1)) {
                            localStorageData_1[constants_1.USER_STATE] = constants_1.USER_STATE_ANONYMOUS;
                        }
                        var nextDistinctId = constants_1.DISTINCT_ID in safeCookieProperties_1
                            ? safeCookieProperties_1[constants_1.DISTINCT_ID]
                            : localStorageData_1[constants_1.DISTINCT_ID];
                        var nextUserState = constants_1.USER_STATE in safeCookieProperties_1
                            ? safeCookieProperties_1[constants_1.USER_STATE]
                            : localStorageData_1[constants_1.USER_STATE];
                        if (hasValidCookieIdentity_1 &&
                            (nextDistinctId !== previousDistinctId || nextUserState !== previousUserState)) {
                            // Identity-bound local fields are not mirrored into
                            // the shared cookie. Drop them when the authoritative
                            // cookie identity differs during initial load, matching
                            // live reconciliation behavior.
                            exports.COOKIE_IDENTITY_BOUND_LOCAL_PROPERTIES.forEach(function (key) { return delete localStorageData_1[key]; });
                            if (safeCookieProperties_1[constants_1.USER_STATE] === constants_1.USER_STATE_IDENTIFIED &&
                                constants_1.DISTINCT_ID in safeCookieProperties_1) {
                                localStorageData_1.$user_id = safeCookieProperties_1[constants_1.DISTINCT_ID];
                            }
                            else {
                                delete localStorageData_1.$user_id;
                            }
                            if (safeCookieProperties_1[constants_1.USER_STATE] !== constants_1.USER_STATE_IDENTIFIED) {
                                delete localStorageData_1[constants_1.GROUPS];
                                delete localStorageData_1[constants_1.STORED_GROUP_PROPERTIES_KEY];
                            }
                            delete localStorageData_1.__alias;
                        }
                    }
                    value = (0, general_utils_1.extend)(localStorageData_1, safeCookieProperties_1);
                }
                else {
                    value = (0, general_utils_1.extend)(cookieProperties_1, localStorageData_1);
                }
                exports.localStore._set(name, value);
                return value;
            }
            catch (_c) {
                // noop
            }
            return null;
        }, _set: function (name, value, days, cross_subdomain, is_secure, debug) {
            // The localStorage write is the durable one and reports its own
            // success. The cookie mirror is best-effort: a cookie failure must
            // not flip an already-landed localStorage write to `false`, or the
            // caller would treat the durable entry as un-persisted and re-write
            // it on every later save.
            var stored = exports.localStore._set(name, value, undefined, undefined, debug);
            try {
                var cookiePersistedProperties = (0, exports.getCookiePersistedProperties)(value, customCookieProperties);
                if (Object.keys(cookiePersistedProperties).length) {
                    if (preferCookieOnConflict) {
                        var metadataName = (0, exports.getCookiePersistedPropertiesMetadataName)(name);
                        var metadata = (0, exports.getCookiePersistedPropertiesMetadata)(cookiePersistedProperties, customCookieProperties);
                        // Publish and verify metadata before the main snapshot. A
                        // reader in between sees metadata that does not match the
                        // old main cookie and conservatively retains custom keys and
                        // legacy falsy built-ins.
                        // If the sidecar cannot land, do not publish a main snapshot
                        // whose omitted custom keys would have ambiguous semantics.
                        exports.cookieStore._set(metadataName, metadata, days, cross_subdomain, is_secure, debug);
                        if (exports.cookieStore._get(metadataName) !== JSON.stringify(metadata)) {
                            // Keep cross-subdomain identity/session propagation even
                            // when custom-key metadata exceeds cookie limits. With no
                            // matching sidecar, omitted custom keys are conservatively
                            // non-authoritative.
                            exports.cookieStore._remove(metadataName, cross_subdomain);
                            var builtInCookieProperties = (0, exports.getCookiePersistedProperties)(value);
                            exports.cookieStore._set(name, builtInCookieProperties, days, cross_subdomain, is_secure, debug);
                            return stored;
                        }
                    }
                    exports.cookieStore._set(name, cookiePersistedProperties, days, cross_subdomain, is_secure, debug);
                }
            }
            catch (err) {
                exports.localStore._error(err);
            }
            return stored;
        }, _remove: function (name, cross_subdomain) {
            try {
                globals_1.window === null || globals_1.window === void 0 ? void 0 : globals_1.window.localStorage.removeItem(name);
                exports.cookieStore._remove(name, cross_subdomain);
                exports.cookieStore._remove((0, exports.getCookiePersistedPropertiesMetadataName)(name), cross_subdomain);
            }
            catch (err) {
                exports.localStore._error(err);
            }
        } });
};
exports.createLocalPlusCookieStore = createLocalPlusCookieStore;
var memoryStorage = {};
// Storage that only lasts the length of the pageview if we don't want to use cookies
// NB: reads use an `in` check rather than `||` so a stored falsy value survives.
// Consent writes `0` to mean "opted out", and returning null for it would read back
// as "no decision recorded".
exports.memoryStore = {
    _is_supported: function () {
        return true;
    },
    _error: function (msg) {
        logger_1.logger.error('memoryStorage error: ' + msg);
    },
    _get: function (name) {
        return name in memoryStorage ? memoryStorage[name] : null;
    },
    _parse: function (name) {
        return name in memoryStorage ? memoryStorage[name] : null;
    },
    _set: function (name, value) {
        memoryStorage[name] = value;
        return true;
    },
    _remove: function (name) {
        delete memoryStorage[name];
    },
};
var sessionStorageSupported = null;
var resetSessionStorageSupported = function () {
    sessionStorageSupported = null;
};
exports.resetSessionStorageSupported = resetSessionStorageSupported;
// Storage that only lasts the length of a tab/window. Survives page refreshes
exports.sessionStore = {
    _is_supported: function () {
        if (!(0, core_1.isNull)(sessionStorageSupported)) {
            return sessionStorageSupported;
        }
        sessionStorageSupported = true;
        if (!(0, core_1.isUndefined)(globals_1.window)) {
            try {
                var key = '__support__', val = 'xyz';
                exports.sessionStore._set(key, val);
                if (exports.sessionStore._get(key) !== '"xyz"') {
                    sessionStorageSupported = false;
                }
                exports.sessionStore._remove(key);
            }
            catch (_a) {
                sessionStorageSupported = false;
            }
        }
        else {
            sessionStorageSupported = false;
        }
        return sessionStorageSupported;
    },
    _error: function (msg) {
        logger_1.logger.error('sessionStorage error: ', msg);
    },
    _get: function (name) {
        try {
            return globals_1.window === null || globals_1.window === void 0 ? void 0 : globals_1.window.sessionStorage.getItem(name);
        }
        catch (err) {
            exports.sessionStore._error(err);
        }
        return null;
    },
    _parse: function (name) {
        try {
            return JSON.parse(exports.sessionStore._get(name)) || null;
        }
        catch (_a) {
            // noop
        }
        return null;
    },
    _set: function (name, value) {
        try {
            globals_1.window === null || globals_1.window === void 0 ? void 0 : globals_1.window.sessionStorage.setItem(name, JSON.stringify(value));
            return true;
        }
        catch (err) {
            exports.sessionStore._error(err);
        }
        return false;
    },
    _remove: function (name) {
        try {
            globals_1.window === null || globals_1.window === void 0 ? void 0 : globals_1.window.sessionStorage.removeItem(name);
        }
        catch (err) {
            exports.sessionStore._error(err);
        }
    },
};
//# sourceMappingURL=storage.js.map