'use strict';

/**
 * Plain object to store hint data
 */
export default class {
    /**
     * Constants
     */
    static get TYPE_NOTE() {
        return 'note';
    }
    static get TYPE_WARNING() {
        return 'warning';
    }
    static get TYPE_ERROR() {
        return 'error';
    }

    constructor(type, issue, consequence, fix) {
        this._type = type;
        this._issue = issue;
        this._consequence = consequence;
        this._fix = fix;
    }

    getType()
    {
        return this._type;
    }

    getIssue()
    {
        return this._issue;
    }

    getConsequence()
    {
        return this._consequence;
    }

    getFix()
    {
        return this._fix;
    }
};
