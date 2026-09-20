const continueWith = (result, callback)=>{
    const promise = result;
    return promise?.then ? promise.then(callback) : callback(result);
};
export { continueWith };
