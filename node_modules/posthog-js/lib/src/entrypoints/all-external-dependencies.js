"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// `lazy-recorder` is the script session recording lazy loads by default, so inlining it here is what
// makes the `.full` bundles genuinely self-contained for replay. Importing `./recorder` instead only
// defines `__PosthogExtensions__.rrweb.record`, which isn't enough for the guard in
// `session-recording.ts` to skip the remote fetch — it also needs `initSessionRecording`.
require("./lazy-recorder");
require("./surveys");
require("./logs");
require("./exception-autocapture");
require("./tracing-headers");
// Full bundles must include every web-vitals callback flavor because no-external
// builds cannot fetch a different flavor after initialization.
require("./web-vitals-with-attribution-soft-navs");
require("./web-vitals-soft-navs");
require("./web-vitals-with-attribution");
require("./web-vitals");
require("./dead-clicks-autocapture");
//# sourceMappingURL=all-external-dependencies.js.map