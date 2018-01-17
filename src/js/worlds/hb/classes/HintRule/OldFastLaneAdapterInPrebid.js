'use strict';

import Hint from '../Hint';
import HintRule_Abstract from './Abstract';
import {systemIds as si} from '../../../../definitions/constants';

/**
 * The publisher uses Prebid with old FL adapter, which needed to call RP library before doing auction calls
 */
export default class extends HintRule_Abstract {
    constructor(factory) {
        super(factory);

        // Strings
        this.HINT_TYPE = Hint.TYPE_NOTE;
        this.HINT_ISSUE = 'This site appears to be using an outdated version of Rubicon Project’s Prebid adapter. If you are a Rubicon Project client and this is your site, contact your account manager to discuss updating to the newest version.';
        this.HINT_CONSEQUENCE  = '';
        this.HINT_FIX          = '';
    }

    /**
     * @inheritDoc
     */
    generate(preparedFrame) {
        // Do we have Prebid here
        let isPrebid = false;
        preparedFrame.lanes.forEach(lane => {
            if (lane.id === si.SYSID_WRAP_PREBID) {
                isPrebid = true;
            }
        });
        if (!isPrebid) {
            return [];
        }

        // Do we have FastLane Library load here
        let isFLLibrary = false;
        preparedFrame.lanes.forEach(lane => {
            lane.events.forEach(event => {
                if (event.sysId === si.SYSID_LIB_RP_HIGHLANDER) {
                    isFLLibrary = true;
                }
            });
        });
        if (!isFLLibrary) {
            return [];
        }

        // Hint the user
        return [this._createHint(this.HINT_TYPE, this.HINT_ISSUE, this.HINT_CONSEQUENCE, this.HINT_FIX)];
    }
};
