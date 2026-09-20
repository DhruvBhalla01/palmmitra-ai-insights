"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUFFERED_CONSOLE_LEVELS = void 0;
// Internal contract between the main bundle and the lazily-loaded logs entrypoint.
/**
 * The console methods both bundles agree on: the main bundle records these, the
 * entrypoint maps and serializes them. Deriving both sides from this tuple makes
 * a missing level a compile error rather than a silently unbuffered one.
 */
exports.BUFFERED_CONSOLE_LEVELS = ['debug', 'log', 'warn', 'error', 'info'];
//# sourceMappingURL=logs-types.js.map