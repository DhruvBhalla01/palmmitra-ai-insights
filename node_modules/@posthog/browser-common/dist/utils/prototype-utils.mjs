import { isFunction, isNativeFunction, isWebKit } from "@posthog/core";
import { logger } from "./logger.mjs";
import { isAngularZonePresent } from "./type-utils.mjs";
const cachedImplementations = {};
function getNativeImplementation(name, assignableWindow) {
    const cached = cachedImplementations[name];
    if (cached) return cached;
    let impl = assignableWindow[name];
    if (isNativeFunction(impl) && !isAngularZonePresent()) return cachedImplementations[name] = impl.bind(assignableWindow);
    const document = assignableWindow.document;
    if (document && isFunction(document.createElement)) {
        let sandbox;
        let keepSandboxAttached = false;
        try {
            sandbox = document.createElement('iframe');
            sandbox.hidden = true;
            document.head.appendChild(sandbox);
            const contentWindow = sandbox.contentWindow;
            if (contentWindow && contentWindow[name]) {
                impl = contentWindow[name];
                if ('MutationObserver' === name && isWebKit(assignableWindow.navigator?.userAgent ?? '')) {
                    sandbox.classList.add('rr-block', 'ph-no-capture');
                    keepSandboxAttached = true;
                }
            }
        } catch (e) {
            logger.warn(`Could not create sandbox iframe for ${name} check, bailing to assignableWindow.${name}: `, e);
        } finally{
            if (!keepSandboxAttached && sandbox?.parentNode) sandbox.parentNode.removeChild(sandbox);
        }
    }
    if (!impl || !isFunction(impl)) return impl;
    return cachedImplementations[name] = impl.bind(assignableWindow);
}
function getNativeMutationObserverImplementation(assignableWindow) {
    return getNativeImplementation('MutationObserver', assignableWindow);
}
export { getNativeImplementation, getNativeMutationObserverImplementation };
