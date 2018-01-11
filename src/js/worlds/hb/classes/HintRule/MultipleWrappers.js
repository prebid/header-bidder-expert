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
        this.HINT_ISSUE = 'More than one header bidder wrapper was detected on this page.';
        this.HINT_CONSEQUENCE  = '';
        this.HINT_FIX          = '';
    }

    /**
     * @inheritDoc
     */
    generate(preparedFrame) {
        let numWrappers = 0;
        preparedFrame.lanes.forEach(lane => {
            if (lane.type == st.SYSTYPE_WRAPPER) {
                numWrappers++;
            }
        });

        if (numWrappers <= 1) {
            return [];
        }

        // Compose hint
        return [
            this._createHint(this.HINT_TYPE, this.HINT_ISSUE, this.HINT_CONSEQUENCE, this.HINT_FIX)
        ];
    }
};
