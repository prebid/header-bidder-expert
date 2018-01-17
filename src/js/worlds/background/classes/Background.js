'use strict';

import $ from 'jquery';
import DataFrameManager from './DataFrameManager';

/**
 * Background process
 */
export default class {
    constructor(dfManager, chromePageAction, chromeRuntime, chromeTabs) {
        this._dfManager = dfManager;
        this._chromePageAction = chromePageAction;
        this._chromeRuntime = chromeRuntime;
        this._chromeTabs = chromeTabs;

        // Properties
        this._renderDataFrames = [];
    }

    /**
     * Run the whole background process (but actually postpone till
     */
    run() {
        $(this._run.bind(this));
    }

    /**
     * Get a frame to render
     */
    getFrame(id) {
        for (let i = 0; i < this._renderDataFrames.length; i++) {
            if (this._renderDataFrames[i].id == id) {
                return this._renderDataFrames[i];
            }
        }
        return null;
    }

    /**
     * Everything is ready, so fully start the background process - run all the sub objects here
     */
    _run() {
        this._dfManager.run();

        this._listenEvents();
    }

    /**
     * Listen all the events in the owned objects
     */
    _listenEvents() {
        $(this._dfManager).on(DataFrameManager.EV_HBACTIVITY_CHANGE, this._onHBActivityChange.bind(this));

        this._chromePageAction.onClicked.addListener(this._onIconClicked.bind(this));
    }

    /**
     * Set the icon type for the tab
     */
    _setHBActivityIcon(tabId, isHBActivity) {
        // Make sure the tab exists
        this._chromeTabs.get(tabId, (tab) => {
            // Check runtime.lastError - so that Chrome doesn't log errors when the tab doesn't exist
            if (!tab && this._chromeRuntime.lastError) {
                return;
            }

            // Chrome is strict on types in api calls
            tabId = parseInt(tabId);
            if (isHBActivity) {
                this._chromePageAction.show(tabId);
            } else {
                this._chromePageAction.hide(tabId);
            }
        });
    }

    /**
     * HB activity information has changed
     */
    _onHBActivityChange(ev, tabId) {
        this._setHBActivityIcon(tabId, this._dfManager.isHBActivity(tabId));
    }

    /**
     * User clicked the app icon to see the HB activity
     */
    _onIconClicked(tab) {
        const frame = this._dfManager.getDataFrame(tab.id);
        if (!frame) {
            window.alert('No header bidding activity on the page');
            return;
        }

        // Remember the data frame for rendering
        const id = this._addRenderDataFrameTemporarily(frame);

        // Open the page and render the data frame there
        const url = this._chromeRuntime.getURL('html/hb.html') +
            '?id=' + id;
        this._chromeTabs.create({url});
    }

    /**
     * Remember a data frame to render for some period of time.
     * Automatically delete the frame after that.
     */
    _addRenderDataFrameTemporarily(frame) {
        frame = JSON.parse(JSON.stringify(frame)); // clone
        frame.id = String(Math.random());
        frame.tsmEnded = (new Date()).getTime();
        this._renderDataFrames.push(frame);

        setTimeout(this._deleteRenderDataFrame.bind(this, frame.id), 30 * 60 * 1000);

        return frame.id;
    }

    /**
     * Delete the data frame
     */
    _deleteRenderDataFrame(id) {
        for (let i = 0; i < this._renderDataFrames.length; i++) {
            if (this._renderDataFrames[i].id == id) {
                this._renderDataFrames.splice(i, 1);
                return;
            }
        }
    }
};
