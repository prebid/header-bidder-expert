'use strict';

import callsConfig from '../../definitions/calls';

import DataFrameManager from './classes/DataFrameManager';
import CallsInfo from './classes/CallsInfo';
import Requests from './classes/Requests';
import TabUrl from './classes/TabUrl';
import Background from './classes/Background';

// IIFE to run background and leave no unneeded traces in the global environment.
(() => {
    const tabUrl = new TabUrl(chrome.tabs, chrome.webNavigation);
    const callsInfo = new CallsInfo(callsConfig);
    const requests = new Requests(callsInfo, chrome.webRequest);
    const dfManager = new DataFrameManager(tabUrl, requests);

    const background = new Background(dfManager, chrome.pageAction, chrome.runtime, chrome.tabs);
    window.hbBackground = background; // Expose the background process for HB renderer world

    background.run();
})();
