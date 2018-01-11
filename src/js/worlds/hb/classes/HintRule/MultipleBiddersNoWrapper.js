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
        this.HINT_ISSUE = "There are multiple header bidders operating on this page, but no wrapper. We recommend that you consider using Prebid wrapper, so you might be able to improve the performance and monetization of your site.";
        this.HINT_CONSEQUENCE  = '';
        this.HINT_FIX          = '';
    }

    /**
     * Generate a list of hints regarding the observed calls.
     */
    generate(preparedFrame) {
        let numWrappers = 0;
        let numBidders = 0;
        preparedFrame.lanes.forEach(lane => {
            if (lane.type == st.SYSTYPE_WRAPPER) {
                numWrappers++;
            }
            if (lane.type == st.SYSTYPE_AUCTION) {
                numBidders++;
            }
        });

        if ((numBidders <= 1) || (numWrappers >= 1)) {
            return [];
        }

        // Compose hint
        return [
            this._createHint(this.HINT_TYPE, this.HINT_ISSUE, this.HINT_CONSEQUENCE, this.HINT_FIX)
        ];
    }
};
