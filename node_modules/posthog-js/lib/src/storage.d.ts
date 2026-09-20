import { PersistentStore, Properties } from './types';
export declare const resetSubDomainCache: () => void;
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
export declare function seekFirstNonPublicSubDomain(hostname: string, cookieJar?: Document | undefined): string;
export declare function chooseCookieDomain(hostname: string, cross_subdomain: boolean | undefined): string;
export declare const resetCookieStorageSupported: () => void;
export declare const cookieStore: PersistentStore;
export declare const resetLocalStorageSupported: () => void;
export declare const localStore: PersistentStore;
export declare const COOKIE_IDENTITY_BOUND_LOCAL_PROPERTIES: string[];
export declare const COOKIE_PERSISTED_PROPERTIES: string[];
export declare const getCookiePersistedPropertiesMetadataName: (name: string) => string;
export declare const getSafeCookieProperties: (value: unknown) => Properties;
export declare const getCookiePersistedProperties: (value: Properties, customCookieProperties?: readonly string[]) => Properties;
export declare const getCookiePersistedPropertiesMetadata: (cookieProperties: Properties, customCookieProperties: readonly string[]) => Properties;
export declare const getCookiePersistedPropertiesMetadataState: (name: string, cookieValue: string | undefined) => {
    properties: readonly string[];
    isValid: boolean;
};
export declare const getCookiePersistedPropertiesFromMetadata: (name: string, cookieValue: string | undefined) => readonly string[];
export declare const getCookiePropertiesFingerprint: (name: string, cookieValue: string) => string;
/**
 * Creates a localPlusCookieStore instance with custom cookie-persisted properties.
 *
 * When `preferCookieOnConflict` is true, the cookie's values win over localStorage on
 * merge for any key both stores carry. Null/empty cookie values are filtered out
 * before the merge so a malformed legacy cookie cannot override valid localStorage
 * data. localStorage-only keys are unaffected. See the docs for
 * `cookieWinsOnConflict` for context.
 */
export declare const createLocalPlusCookieStore: (customCookieProperties?: readonly string[], preferCookieOnConflict?: boolean) => PersistentStore;
export declare const memoryStore: PersistentStore;
export declare const resetSessionStorageSupported: () => void;
export declare const sessionStore: PersistentStore;
