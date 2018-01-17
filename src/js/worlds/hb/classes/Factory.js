'use strict';

/**
 * Factory class to create objects on the fly
 */
export default class {
    constructor() {
        this._singletons = {};
    }

    /**
     * Create an object of the provided class
     */
    create(classInstance, ...args) {
        return new classInstance(...args);
    }

    /**
     * Create or return already created object of the class
     */
    getSingleton(name, ...args) {
        if (!this._singletons[name]) {
            this._singletons[name] = this.create(...args);
        }

        return this._singletons[name];
    }
};
