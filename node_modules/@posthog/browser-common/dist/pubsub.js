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
class Publisher {
    constructor(onError){
        this._subscriptions = [];
        this._disposed = false;
        this.listener = (handler)=>{
            if (this._disposed) return {
                dispose () {}
            };
            const subscription = [
                handler,
                true
            ];
            this._subscriptions.push(subscription);
            let active = true;
            return {
                dispose: ()=>{
                    if (!active) return;
                    active = false;
                    subscription[1] = false;
                    const index = this._subscriptions.indexOf(subscription);
                    if (-1 !== index) this._subscriptions.splice(index, 1);
                }
            };
        };
        this._onError = onError;
    }
    publish(payload) {
        const subscriptions = this._subscriptions.slice();
        for (const subscription of subscriptions)if (subscription[1]) try {
            subscription[0](payload);
        } catch (error) {
            if (!this._onError) throw error;
            this._onError(error);
        }
    }
    dispose() {
        this._disposed = true;
        this._subscriptions.forEach((subscription)=>{
            subscription[1] = false;
        });
        this._subscriptions = [];
    }
}
__webpack_require__.d(__webpack_exports__, {
    Publisher: ()=>Publisher
});
exports.Publisher = __webpack_exports__.Publisher;
for(var __rspack_i in __webpack_exports__)if (-1 === [
    "Publisher"
].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
Object.defineProperty(exports, '__esModule', {
    value: true
});
