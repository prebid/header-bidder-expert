'use strict';

import $ from 'jquery';
import {systemTypes as st} from '../../../definitions/constants';

/**
 * Simple templating class to use the templates present in HTML page.
 * Just to skip bigger libs like React, Angular, Handlebars, etc.
 *
 * Also contains some simple strings.
 */
export default class {
    constructor(selector) {
        this._selector = selector;
        this._content = {};
    }

    /**
     * Get the template content
     */
    getContent(id) {
        if (this._content[id] === void 0) {
            this._content[id] = $(this._selector + ' #' + id).html();
        }

        return this._content[id];
    }

    /**
     * Put the values to the placeholders in the content
     */
    fill(content, data) {
        let result = content;

        Object.keys(data).forEach(key => {
            result = result.replace('{' + key + '}', data[key]);
        });

        return result;
    }

    /**
     * Format time string to a human-readable value
     */
    formatTimeString(ms) {
        ms = Math.abs(ms); // Extra safety

        // 123ms
        if (ms < 1000) {
            return ms + 'ms';
        }

        // 12.123s
        if (ms < 60000) {
            return ms / 1000 + 's';
        }

        // 12m 12s
        let m = Math.floor(ms / 60000);
        ms -= m * 60000;
        const s = Math.floor(ms / 1000);
        return m + 'm ' + s + 's';
    }

    /**
     * Return description of the rendered event's type by the type itself.
     * Note: events are not supposed to have 'wrapper' type, those should come as 'library'.
     */
    stEventType(type) {
        switch (type) {
            case st.SYSTYPE_AUCTION:
                return 'Bid';
            case st.SYSTYPE_LIBRARY:
                return 'Library load';
            case st.SYSTYPE_ADSERVER:
                return 'Ad server call';
        }

        return 'Unknown';
    }

    /**
     * Return plural/singular string "call/calls"
     */
    stCalls(number) {
        if (number == 1) {
            return 'call';
        }
        return 'calls';
    }

    /**
     * Return string that the event didn't finish
     */
    stDidntFinish() {
        return "didn't finish";
    }
}
