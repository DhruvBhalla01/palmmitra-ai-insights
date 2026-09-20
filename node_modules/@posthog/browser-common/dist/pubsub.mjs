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
export { Publisher };
