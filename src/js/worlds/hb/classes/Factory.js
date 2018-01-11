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
    create(classInstance) {
        const args = Array.prototype.slice.call(arguments);
        args.shift();

        return new classInstance(...args);
    }

    /**
     * Create or return already created object of the class
     */
    getSingleton(name, classInstance) {
        if (!this._singletons[name]) {
            const args = Array.prototype.slice.call(arguments);
            args.shift(); // remove 'name' arg

            this._singletons[name] = this.create.apply(this, args);
        }

        return this._singletons[name];
    }
};
