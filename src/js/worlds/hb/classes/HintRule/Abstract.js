'use strict';

import Hint from '../Hint';

/**
 * Abstract hint rule
 */
export default class {
    constructor(factory) {
        this._factory = factory;
    }

    /**
     * Generate a list of hints regarding the observed calls.
     */
    generate(preparedFrame) {
        throw new Error('generate() should be implemented in the ancestor of HintRule_Abstract');
    }

    /**
     * Create the hint object
     */
    _createHint(type, issue, consequence, fix) {
        return this._factory.create(Hint, type, issue, consequence, fix);
    }
};
