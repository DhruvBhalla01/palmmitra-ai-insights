const win = "u" > typeof window ? window : void 0;
const global = "u" > typeof globalThis ? globalThis : win;
const globals_navigator = global?.navigator;
const globals_document = global?.document;
const globals_location = global?.location;
const fetch = global?.fetch;
const XMLHttpRequest = global?.XMLHttpRequest && 'withCredentials' in new global.XMLHttpRequest() ? global.XMLHttpRequest : void 0;
const AbortController = global?.AbortController;
const CompressionStream = global?.CompressionStream;
const userAgent = globals_navigator?.userAgent;
function isBrowserOnline() {
    return !!(win && false !== win.navigator.onLine);
}
export { AbortController, CompressionStream, XMLHttpRequest, fetch, globals_document as document, globals_location as location, globals_navigator as navigator, isBrowserOnline, userAgent, win as window };
