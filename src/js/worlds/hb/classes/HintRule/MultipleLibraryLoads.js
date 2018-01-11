'use strict';

import Hint from '../Hint';
import HintRule_Abstract from './Abstract';
import {systemTypes as st} from '../../../../definitions/constants';

/**
 * Hint rule to detect multiple wrappers on the page
 */
export default class extends HintRule_Abstract {
    constructor(factory)
    {
        super(factory);

        // Strings
        this.HINT_TYPE = Hint.TYPE_NOTE;
        this.HINT_ISSUE = 'There were :num library loads for :lane. The library should be loaded only once, as excessive calls potentially slow down the website.';
        this.HINT_CONSEQUENCE  = '';
        this.HINT_FIX          = '';
    }

    /**
     * @inheritDoc
     */
    generate(preparedFrame) {
        const result = [];

        preparedFrame.lanes.forEach(lane => {
            let numLibraries = 0;
            lane.events.forEach(event => {
                if (event.sysType == st.SYSTYPE_LIBRARY) {
                    numLibraries++;
                }
            });

            if (numLibraries < 2) {
                return;
            }

            // Compose the hint
            let issue = this.HINT_ISSUE;
            issue = issue.replace(':lane', lane.title, issue);
            issue = issue.replace(':num', numLibraries, issue);

            result.push(this._createHint(this.HINT_TYPE, issue, this.HINT_CONSEQUENCE, this.HINT_FIX));
        });

        return result;
    }
};
