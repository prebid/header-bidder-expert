'use strict';

import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/tooltip';
import 'jquery-ui/ui/widgets/dialog';

import 'jquery-ui/themes/base/all.css';

import callsConfig from '../../definitions/calls';
import config from './config';

import HB from './classes/HB';
import Factory from './classes/Factory';
import FrameProcessor from './classes/FrameProcessor';
import HintRule_ServerError from './classes/HintRule/ServerError';
import HintRule_MultipleWrappers from './classes/HintRule/MultipleWrappers';
import HintRule_MultipleBiddersNoWrapper from './classes/HintRule/MultipleBiddersNoWrapper';
import HintRule_OldFastLaneAdapterInPrebid from './classes/HintRule/OldFastLaneAdapterInPrebid';
import HintRule_MultipleLibraryLoads from './classes/HintRule/MultipleLibraryLoads';
import Hints from './classes/Hints';
import Util from './classes/HBUtil';
import Lanes from './classes/Lanes';
import Templates from './classes/Templates';
import Titles from './classes/Titles';
import Toolbar from './classes/Toolbar';
import Tooltip from './classes/Tooltip';
import ViewModel_Lanes from './classes/ViewModel/Lanes';

// IIFE to run the scripts and leave no unneeded traces in the global environment.
(() => {
    const hbBackground = chrome.extension.getBackgroundPage().hbBackground;
    const util = new Util(config);
    const factory = new Factory();
    const frameProcessor = new FrameProcessor(callsConfig);
    const templates = new Templates('#hb-ui .templates');
    const toolbar = new Toolbar('#hb-ui .tools');
    const tooltip = new Tooltip();
    const vmLanes = new ViewModel_Lanes(config, util);
    const titlesObject = new Titles(config, vmLanes, '#hb-ui .titles');
    const lanesObject = new Lanes(config, factory, templates, tooltip, util, vmLanes, '#hb-ui .all-lanes');

    const hrMultipleWrappers = new HintRule_MultipleWrappers(factory);
    const hrMultipleBiddersNoWrapper = new HintRule_MultipleBiddersNoWrapper(factory);
    const hrServerError = new HintRule_ServerError(factory);
    const hrOldFastLaneAdapterInPrebid = new HintRule_OldFastLaneAdapterInPrebid(factory);
    const hrMultipleLibraryLoads = new HintRule_MultipleLibraryLoads(factory);
    const hints = new Hints(
        [
            hrMultipleWrappers,
            hrMultipleBiddersNoWrapper,
            hrServerError,
            hrOldFastLaneAdapterInPrebid,
            hrMultipleLibraryLoads
        ],
        templates,
        '#hb-ui .hints'
    );

    const hb = new HB(hbBackground, toolbar, tooltip, vmLanes, titlesObject, lanesObject, frameProcessor, hints, config, '#hb-ui');

    hb.run();
})();
