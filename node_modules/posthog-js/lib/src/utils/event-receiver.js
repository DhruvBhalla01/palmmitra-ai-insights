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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
exports.EventReceiver = void 0;
var posthog_surveys_types_1 = require("../posthog-surveys-types");
var action_matcher_1 = require("../extensions/surveys/action-matcher");
var property_utils_1 = require("@posthog/browser-common/utils/property-utils");
var core_1 = require("@posthog/core");
/**
 * Abstract base class for receiving events and matching them to triggerable items.
 * Subclasses implement type-specific behavior for surveys and product tours.
 */
var EventReceiver = /** @class */ (function () {
    function EventReceiver(instance) {
        var _this = this;
        var _a, _b;
        /**
         * Items armed by an event or action but not yet shown live here, in memory only.
         * They are intentionally NOT persisted, so they do not survive a page reload: an
         * event trigger only displays an item in the session the event fired in. Once an
         * item is shown, surviving items are promoted into persistence (see `onEvent`) so
         * a reload re-reads and re-displays them until the user interacts — but that
         * persisted activation is scoped to the triggering session (see
         * `_getPersistedActivatedIds`), so it does not leak into a brand-new session where
         * the trigger never fired.
         */
        this._pendingActivatedItems = [];
        this._instance = instance;
        this._eventToItems = new Map();
        this._cancelEventToItems = new Map();
        this._actionToItems = new Map();
        // A persisted activation belongs to the session the item was shown in. When the session
        // rotates (idle timeout, max length, cross-tab adoption) the trigger did not fire in the
        // new session, so the activation is stale and must be dropped. We subscribe to rotations
        // here rather than relying only on reading the session id on the display path: that read
        // is read-only and so cannot observe an idle-expired session (and must not force a
        // rotation, since merely checking whether to show a survey should never keep a session
        // alive). The read-time check in `_getPersistedActivatedIds` remains as a complementary
        // backstop for a session that had already rotated in persistence before this page loaded.
        this._sessionIdUnsubscribe = (_b = (_a = this._instance) === null || _a === void 0 ? void 0 : _a.onSessionId) === null || _b === void 0 ? void 0 : _b.call(_a, function (sessionId) { return _this._onSessionIdChanged(sessionId); });
    }
    /**
     * Whether an item armed by a trigger should be persisted immediately (session-scoped)
     * instead of kept in memory until it is shown. Overridden by receivers whose items carry a
     * display delay that must survive a navigation, so the delay can resume from where it left
     * off on the next page. Default: keep in memory, so the arming is page-scoped and an
     * exit-intent-style trigger cannot leak an armed item onto a later page load.
     */
    EventReceiver.prototype._shouldPersistArmedActivation = function (_itemId) {
        return false;
    };
    /**
     * Persistence key under which per-item activation timestamps are read from, or null for
     * receivers that don't track them. Used to resume a display delay across navigations. Writes
     * go through `_writeActivationTimestamps` / `_clearActivationTimestampsStore` so the register
     * sink always resolves to a literal key constant.
     */
    EventReceiver.prototype._getActivationTimestampsKey = function () {
        return null;
    };
    /** Persist the activation timestamp map. Overridden by receivers that track timestamps. */
    EventReceiver.prototype._writeActivationTimestamps = function (_timestamps) { };
    /** Forget the whole activation timestamp map. Overridden by receivers that track timestamps. */
    EventReceiver.prototype._clearActivationTimestampsStore = function () { };
    EventReceiver.prototype._doesEventMatchFilter = function (eventConfig, eventPayload) {
        if (!eventConfig) {
            return false;
        }
        return (0, property_utils_1.matchPropertyFilters)(eventConfig.propertyFilters, eventPayload === null || eventPayload === void 0 ? void 0 : eventPayload.properties);
    };
    EventReceiver.prototype._buildEventToItemMap = function (items, conditionField) {
        var map = new Map();
        items.forEach(function (item) {
            var _a, _b, _c;
            (_c = (_b = (_a = item.conditions) === null || _a === void 0 ? void 0 : _a[conditionField]) === null || _b === void 0 ? void 0 : _b.values) === null || _c === void 0 ? void 0 : _c.forEach(function (event) {
                if (event === null || event === void 0 ? void 0 : event.name) {
                    var existing = map.get(event.name) || [];
                    existing.push(item.id);
                    map.set(event.name, existing);
                }
            });
        });
        return map;
    };
    /**
     * build a map of (Event1) => [Item1, Item2, Item3]
     * used for items that should be [activated|cancelled] by Event1
     */
    EventReceiver.prototype._getMatchingItems = function (eventName, eventPayload, conditionField) {
        var _this = this;
        var itemIdMap = conditionField === posthog_surveys_types_1.SurveyEventType.Activation ? this._eventToItems : this._cancelEventToItems;
        var itemIds = itemIdMap.get(eventName);
        var items = [];
        this._getItems(function (allItems) {
            items = allItems.filter(function (item) { return itemIds === null || itemIds === void 0 ? void 0 : itemIds.includes(item.id); });
        });
        return items.filter(function (item) {
            var _a, _b, _c;
            var eventConfig = (_c = (_b = (_a = item.conditions) === null || _a === void 0 ? void 0 : _a[conditionField]) === null || _b === void 0 ? void 0 : _b.values) === null || _c === void 0 ? void 0 : _c.find(function (e) { return e.name === eventName; });
            return _this._doesEventMatchFilter(eventConfig, eventPayload);
        });
    };
    EventReceiver.prototype.register = function (items) {
        this._register(items, false);
    };
    EventReceiver.prototype.replace = function (items) {
        this._register(items, true);
    };
    EventReceiver.prototype._register = function (items, replace) {
        var _a;
        if ((0, core_1.isUndefined)((_a = this._instance) === null || _a === void 0 ? void 0 : _a._addCaptureHook)) {
            return;
        }
        this._setupEventBasedItems(items, replace);
        this._setupActionBasedItems(items, replace);
    };
    EventReceiver.prototype._setupActionBasedItems = function (items, replace) {
        var _this = this;
        var _a;
        var actionBasedItems = items.filter(function (item) { var _a, _b, _c; return (_c = (_b = (_a = item.conditions) === null || _a === void 0 ? void 0 : _a.actions) === null || _b === void 0 ? void 0 : _b.values) === null || _c === void 0 ? void 0 : _c.length; });
        if (replace) {
            this._actionToItems.clear();
        }
        if (actionBasedItems.length === 0) {
            if (replace) {
                (_a = this._actionMatcher) === null || _a === void 0 ? void 0 : _a.replace([]);
            }
            return;
        }
        if (!this._actionMatcher) {
            this._actionMatcher = new action_matcher_1.ActionMatcher(this._instance);
            this._actionMatcher.init();
            this._actionMatcher._addActionHook(function (actionName) { return _this.onAction(actionName); });
        }
        var actions = [];
        actionBasedItems.forEach(function (item) {
            var _a, _b;
            (_b = (_a = item.conditions) === null || _a === void 0 ? void 0 : _a.actions) === null || _b === void 0 ? void 0 : _b.values.forEach(function (action) {
                var _a;
                actions.push(action);
                if (action.name) {
                    var matchingItems = (_a = _this._actionToItems.get(action.name)) !== null && _a !== void 0 ? _a : [];
                    if (!matchingItems.includes(item.id)) {
                        matchingItems.push(item.id);
                    }
                    _this._actionToItems.set(action.name, matchingItems);
                }
            });
        });
        if (replace) {
            this._actionMatcher.replace(actions);
        }
        else {
            this._actionMatcher.register(actions);
        }
    };
    EventReceiver.prototype._mergeItemMaps = function (target, source) {
        source.forEach(function (itemIds, eventName) {
            var _a;
            var matchingItems = (_a = target.get(eventName)) !== null && _a !== void 0 ? _a : [];
            itemIds.forEach(function (itemId) {
                if (!matchingItems.includes(itemId)) {
                    matchingItems.push(itemId);
                }
            });
            target.set(eventName, matchingItems);
        });
    };
    EventReceiver.prototype._setupEventBasedItems = function (items, replace) {
        var _this = this;
        var _a, _b;
        var eventBasedItems = items.filter(function (item) { var _a, _b, _c, _d; return ((_a = item.conditions) === null || _a === void 0 ? void 0 : _a.events) && ((_d = (_c = (_b = item.conditions) === null || _b === void 0 ? void 0 : _b.events) === null || _c === void 0 ? void 0 : _c.values) === null || _d === void 0 ? void 0 : _d.length) > 0; });
        var itemsWithCancelEvents = items.filter(function (item) { var _a, _b, _c, _d; return ((_a = item.conditions) === null || _a === void 0 ? void 0 : _a.cancelEvents) && ((_d = (_c = (_b = item.conditions) === null || _b === void 0 ? void 0 : _b.cancelEvents) === null || _c === void 0 ? void 0 : _c.values) === null || _d === void 0 ? void 0 : _d.length) > 0; });
        var eventToItems = this._buildEventToItemMap(items, posthog_surveys_types_1.SurveyEventType.Activation);
        var cancelEventToItems = this._buildEventToItemMap(items, posthog_surveys_types_1.SurveyEventType.Cancellation);
        if (replace) {
            this._eventToItems = eventToItems;
            this._cancelEventToItems = cancelEventToItems;
        }
        else {
            this._mergeItemMaps(this._eventToItems, eventToItems);
            this._mergeItemMaps(this._cancelEventToItems, cancelEventToItems);
        }
        if (eventBasedItems.length === 0 && itemsWithCancelEvents.length === 0) {
            return;
        }
        // match any events to its corresponding item.
        var matchEventToItem = function (eventName, eventPayload) {
            _this.onEvent(eventName, eventPayload);
        };
        (_a = this._captureHookUnsubscribe) !== null && _a !== void 0 ? _a : (this._captureHookUnsubscribe = (_b = this._instance) === null || _b === void 0 ? void 0 : _b._addCaptureHook(matchEventToItem));
    };
    EventReceiver.prototype.onEvent = function (event, eventPayload) {
        var _this = this;
        var _a, _b;
        var logger = this._getLogger();
        // An item reacting to one of its own lifecycle events (shown / dismissed / sent).
        var itemId = ((_a = eventPayload === null || eventPayload === void 0 ? void 0 : eventPayload.properties) === null || _a === void 0 ? void 0 : _a.$survey_id) || ((_b = eventPayload === null || eventPayload === void 0 ? void 0 : eventPayload.properties) === null || _b === void 0 ? void 0 : _b.$product_tour_id);
        if (itemId && this.getActivatedIds().includes(itemId)) {
            var outcome = this._activationOutcome(event, itemId);
            if (outcome === 'consume') {
                logger.info('event consumed activated item, removing it', { event: event, itemId: itemId });
                this._deactivateItems([itemId]);
                return;
            }
            if (outcome === 'persist') {
                logger.info('shown item promoted to persisted activation', { event: event, itemId: itemId });
                this._persistActivation(itemId);
                // The display delay has served its purpose once the item was shown, so drop the
                // activation time: a later page load in this session waits the full delay again
                // instead of re-rendering the item instantly on every navigation.
                this._clearActivationTimestamps([itemId]);
                return;
            }
            // 'ignore': no activation transition for this item on this event — fall through.
        }
        // check if this event should cancel any pending items
        if (this._cancelEventToItems.has(event)) {
            var itemsToCancel = this._getMatchingItems(event, eventPayload, posthog_surveys_types_1.SurveyEventType.Cancellation);
            if (itemsToCancel.length > 0) {
                logger.info('cancel event matched, cancelling items', {
                    event: event,
                    itemsToCancel: itemsToCancel.map(function (s) { return s.id; }),
                });
                this._deactivateItems(itemsToCancel.map(function (item) { return item.id; }));
                // cancel any pending timeout for these items
                itemsToCancel.forEach(function (item) { return _this._cancelPendingItem(item.id); });
            }
        }
        // if the event is not in the eventToItems map, nothing else to do
        if (!this._eventToItems.has(event)) {
            return;
        }
        logger.info('event name matched', {
            event: event,
            eventPayload: eventPayload,
            items: this._eventToItems.get(event),
        });
        var matchedItems = this._getMatchingItems(event, eventPayload, posthog_surveys_types_1.SurveyEventType.Activation);
        this._activateItems(matchedItems.map(function (item) { return item.id; }));
    };
    EventReceiver.prototype.onAction = function (actionName) {
        if (this._actionToItems.has(actionName)) {
            this._activateItems(this._actionToItems.get(actionName) || []);
        }
    };
    /**
     * Arm items. Most are held in memory only (not persisted) until they are shown, so their
     * arming is page-scoped. Items that opt in via `_shouldPersistArmedActivation` (those with a
     * display delay) are persisted right away and stamped with the activation time, so the delay
     * survives a navigation and resumes from the elapsed time on the next page.
     */
    EventReceiver.prototype._activateItems = function (itemIds) {
        var e_1, _a;
        var _b, _c;
        if (itemIds.length === 0) {
            return;
        }
        // A persisted activation is scoped to the current session, so it can only be persisted
        // when a session id is resolvable. With none (e.g. cookieless mode) we keep the in-memory
        // arming — a reload can't be scoped anyway, so persisting would make it unreadable.
        var canPersist = !!((_c = (_b = this._instance) === null || _b === void 0 ? void 0 : _b.get_session_id) === null || _c === void 0 ? void 0 : _c.call(_b));
        var armedInMemory = [];
        try {
            for (var itemIds_1 = __values(itemIds), itemIds_1_1 = itemIds_1.next(); !itemIds_1_1.done; itemIds_1_1 = itemIds_1.next()) {
                var itemId = itemIds_1_1.value;
                if (canPersist && this._shouldPersistArmedActivation(itemId)) {
                    if (this._persistActivation(itemId)) {
                        this._recordActivationTimestamp(itemId);
                    }
                }
                else {
                    armedInMemory.push(itemId);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (itemIds_1_1 && !itemIds_1_1.done && (_a = itemIds_1.return)) _a.call(itemIds_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (armedInMemory.length > 0) {
            this._pendingActivatedItems = __spreadArray([], __read(new Set(__spreadArray(__spreadArray([], __read(this._pendingActivatedItems), false), __read(armedInMemory), false))), false);
        }
        this._getLogger().info('updating activated items', { activatedItems: this.getActivatedIds() });
    };
    /**
     * Move an in-memory activation into persistence so it survives a page reload within the
     * triggering session. The set is (re)stamped with the current session id; reading it back
     * via `_getPersistedActivatedIds` discards it once the session rolls over. Because we build
     * on top of the session-scoped read, a stale set left over from a previous session is
     * dropped here rather than accumulated.
     */
    EventReceiver.prototype._persistActivation = function (itemId) {
        this._pendingActivatedItems = this._pendingActivatedItems.filter(function (id) { return id !== itemId; });
        var persisted = this._getPersistedActivatedIds();
        if (persisted.includes(itemId)) {
            return false;
        }
        this._setActivatedItems(__spreadArray(__spreadArray([], __read(persisted), false), [itemId], false));
        this._stampActivationSession();
        return true;
    };
    /** Drop items from both the in-memory and persisted activation sets. */
    EventReceiver.prototype._deactivateItems = function (itemIds) {
        var remove = new Set(itemIds);
        this._pendingActivatedItems = this._pendingActivatedItems.filter(function (id) { return !remove.has(id); });
        var persisted = this._getRawPersistedActivatedIds();
        var nextPersisted = persisted.filter(function (id) { return !remove.has(id); });
        if (nextPersisted.length !== persisted.length) {
            this._setActivatedItems(nextPersisted);
            if (nextPersisted.length === 0) {
                this._clearActivationSession();
            }
        }
        this._clearActivationTimestamps(itemIds);
    };
    /** The raw persisted activation timestamps as stored, ignoring session scoping. */
    EventReceiver.prototype._getRawActivationTimestamps = function () {
        var _a, _b;
        var key = this._getActivationTimestampsKey();
        if (!key) {
            return {};
        }
        var stored = (_b = (_a = this._instance) === null || _a === void 0 ? void 0 : _a.persistence) === null || _b === void 0 ? void 0 : _b.props[key];
        return stored && typeof stored === 'object' ? stored : {};
    };
    /**
     * Stamp when an item enters persisted activation, so a resumed display delay can be computed
     * from the elapsed time on a later page load. Repeated triggers do not call this method because
     * `_persistActivation` returns false while the current activation is still live.
     */
    EventReceiver.prototype._recordActivationTimestamp = function (itemId) {
        var _a;
        var key = this._getActivationTimestampsKey();
        if (!key) {
            return;
        }
        var timestamps = this._getRawActivationTimestamps();
        this._writeActivationTimestamps(__assign(__assign({}, timestamps), (_a = {}, _a[itemId] = Date.now(), _a)));
    };
    /** Drop the activation timestamps for the given items. */
    EventReceiver.prototype._clearActivationTimestamps = function (itemIds) {
        var e_2, _a;
        var key = this._getActivationTimestampsKey();
        if (!key) {
            return;
        }
        var timestamps = this._getRawActivationTimestamps();
        var next = {};
        var changed = false;
        try {
            for (var _b = __values(Object.entries(timestamps)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), id = _d[0], ts = _d[1];
                if (itemIds.includes(id)) {
                    changed = true;
                }
                else {
                    next[id] = ts;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (!changed) {
            return;
        }
        if ((0, core_1.isEmptyObject)(next)) {
            this._clearActivationTimestampsStore();
            return;
        }
        this._writeActivationTimestamps(next);
    };
    /** Forget all activation timestamps (e.g. on reset or a session rollover). */
    EventReceiver.prototype._clearAllActivationTimestamps = function () {
        if (this._getActivationTimestampsKey()) {
            this._clearActivationTimestampsStore();
        }
    };
    /**
     * The time (epoch ms) an item was armed by its trigger, or undefined if none is recorded.
     * Session-scoped: a timestamp is only honored while its activation is still live for the
     * current session, so a stale entry left in persistence cannot resurrect an expired delay.
     */
    EventReceiver.prototype.getActivationTimestamp = function (itemId) {
        if (!this._getPersistedActivatedIds().includes(itemId)) {
            return undefined;
        }
        var ts = this._getRawActivationTimestamps()[itemId];
        return (0, core_1.isNumber)(ts) ? ts : undefined;
    };
    /** The raw persisted set as stored, ignoring session scoping. */
    EventReceiver.prototype._getRawPersistedActivatedIds = function () {
        var _a, _b;
        var activatedKey = this._getActivatedKey();
        var existingActivatedItems = (_b = (_a = this._instance) === null || _a === void 0 ? void 0 : _a.persistence) === null || _b === void 0 ? void 0 : _b.props[activatedKey];
        return existingActivatedItems ? existingActivatedItems : [];
    };
    /**
     * The persisted activations that still belong to the current session. A persisted activation
     * is scoped to the session the item was shown in: an event/action trigger only earns a display
     * in the session it fired in, so once the session rolls over the activation is stale and must
     * not silently re-display the item in a brand-new session where the trigger never fired.
     */
    EventReceiver.prototype._getPersistedActivatedIds = function () {
        var _a, _b, _c, _d;
        var ids = this._getRawPersistedActivatedIds();
        if (ids.length === 0) {
            return [];
        }
        var stampedSessionId = (_b = (_a = this._instance) === null || _a === void 0 ? void 0 : _a.persistence) === null || _b === void 0 ? void 0 : _b.props[this._getActivatedSessionKey()];
        // Read-only: this catches a session that had already rotated in persistence before this
        // page loaded (the stamped id no longer matches the current one). It intentionally does
        // NOT force a rotation of an idle-expired session — that case is handled by the
        // `onSessionId` subscription in the constructor, which clears the activation when the
        // session actually rotates on the next real event.
        var currentSessionId = (_d = (_c = this._instance) === null || _c === void 0 ? void 0 : _c.get_session_id) === null || _d === void 0 ? void 0 : _d.call(_c);
        // No resolvable session (e.g. cookieless mode) → treat the activation as un-scopable and
        // do not carry it across a reload.
        if (!currentSessionId || stampedSessionId !== currentSessionId) {
            return [];
        }
        return ids;
    };
    /** Stamp the persisted activation set with the current session id. */
    EventReceiver.prototype._stampActivationSession = function () {
        var _a, _b;
        var currentSessionId = (_b = (_a = this._instance) === null || _a === void 0 ? void 0 : _a.get_session_id) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (currentSessionId) {
            this._setActivatedSession(currentSessionId);
        }
    };
    /** Forget the session stamp once nothing is persisted under it. */
    EventReceiver.prototype._clearActivationSession = function () {
        this._clearActivatedSession();
    };
    /**
     * Drop a persisted activation once the session it was stamped under is no longer current.
     * Fired on session rotation (idle timeout, max length, cross-tab adoption) — the cases the
     * read-only session read on the display path cannot observe. Pending timers must also be
     * cancelled so a fresh trigger in the new session starts its full delay from the new timestamp.
     */
    EventReceiver.prototype._onSessionIdChanged = function (sessionId) {
        var _this = this;
        var _a, _b;
        var stampedSessionId = (_b = (_a = this._instance) === null || _a === void 0 ? void 0 : _a.persistence) === null || _b === void 0 ? void 0 : _b.props[this._getActivatedSessionKey()];
        if (stampedSessionId && stampedSessionId !== sessionId) {
            var activatedItemIds = this._getRawPersistedActivatedIds();
            var activationTimestamps_1 = this._getRawActivationTimestamps();
            if (activatedItemIds.length > 0) {
                this._setActivatedItems([]);
                activatedItemIds
                    .filter(function (itemId) { return (0, core_1.isNumber)(activationTimestamps_1[itemId]); })
                    .forEach(function (itemId) { return _this._cancelPendingItem(itemId); });
            }
            this._clearActivationSession();
            this._clearAllActivationTimestamps();
        }
    };
    EventReceiver.prototype.getActivatedIds = function () {
        var _this = this;
        // The activated set is the union of in-memory (armed, not yet shown) and persisted
        // (shown and surviving) items. In-memory ones do not survive a reload by design.
        var all = __spreadArray([], __read(new Set(__spreadArray(__spreadArray([], __read(this._getPersistedActivatedIds()), false), __read(this._pendingActivatedItems), false))), false);
        return all.filter(function (itemId) { return !_this._isItemPermanentlyIneligible(itemId); });
    };
    /**
     * Clear all activations. Called on `posthog.reset()` so a logout or account switch
     * (without a full page reload) does not leave an event-armed item live for the next
     * user — the in-memory set would otherwise survive `persistence.clear()`.
     */
    EventReceiver.prototype.dispose = function () {
        var _a, _b, _c;
        (_a = this._sessionIdUnsubscribe) === null || _a === void 0 ? void 0 : _a.call(this);
        this._sessionIdUnsubscribe = undefined;
        (_b = this._captureHookUnsubscribe) === null || _b === void 0 ? void 0 : _b.call(this);
        this._captureHookUnsubscribe = undefined;
        (_c = this._actionMatcher) === null || _c === void 0 ? void 0 : _c.dispose();
        this._actionMatcher = undefined;
    };
    EventReceiver.prototype.reset = function () {
        this._pendingActivatedItems = [];
        if (this._getRawPersistedActivatedIds().length > 0) {
            this._setActivatedItems([]);
        }
        this._clearActivationSession();
        this._clearAllActivationTimestamps();
    };
    EventReceiver.prototype.getEventToItemsMap = function () {
        return this._eventToItems;
    };
    EventReceiver.prototype._getActionMatcher = function () {
        return this._actionMatcher;
    };
    return EventReceiver;
}());
exports.EventReceiver = EventReceiver;
//# sourceMappingURL=event-receiver.js.map