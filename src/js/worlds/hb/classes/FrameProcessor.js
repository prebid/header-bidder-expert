'use strict';

import {systemTypes as st, systemIds as si, responseTypes as rt} from '../../../definitions/constants';

/**
 * The class responsible to expand frame of observed calls to the so called "prepared frame" - i.e. information
 * about the calls in a format more convenient for rendering on the page.
 */
export default class {
    constructor(callsConfig) {
        this._callsConfig = callsConfig;

        // Properties
        this._mapOfSysIds = null; // Map of sysId => callsConfig entry
    }

    /**
     * Convert the observation frame to the frame, prepared for being rendered
     */
    frame2PreparedFrame(frame) {
        // Init
        this._createMapOfSysIds();
        frame = JSON.parse(JSON.stringify(frame)); // clone

        // Result structure
        const result = {
            url:            frame.url,
            tsmStarted:     frame.tsmStarted,
            tsmEnded:       frame.tsmEnded || null,
            msDom:          frame.msDom || null,
            msCompleted:    frame.msCompleted || null,
            lanes:          null,
        };

        result.lanes = this._extractLanes(frame);

        return result;
    }

    /**
     * Creates a map of sysId => entry in callConfig - for faster search and access
     */
    _createMapOfSysIds() {
        if (this._mapOfSysIds) {
            return;
        }

        this._mapOfSysIds = {};
        this._callsConfig.forEach(entry => {
            this._mapOfSysIds[entry.sysId] = entry;
        });
    }

    /**
     * Format the calls into lanes per partner
     */
    _extractLanes(frame) {
        const result = [];

        const laneMatchedCalls = this._callsToLaneMatchedCalls(frame.calls);

        laneMatchedCalls.forEach(lmc => {
            const {sysInfo, laneEvent} = lmc;
            const {sysId} = sysInfo;

            if (!result[sysId]) {
                result[sysId] = this._createLane(sysInfo);
            }

            result[sysId].events.push(laneEvent);
        });

        // Add the systems that were found on the page, but didn't have events
        this._addDiscoveredSystems(result, frame);

        // Result is a flattened array
        return Object.keys(result)
            .map(sysId => result[sysId]);
    }

    /**
     * Convert calls to the structure with information of how a call matches to a lane
     */
    _callsToLaneMatchedCalls(calls) {
        const result = [];

        calls.forEach(call => {
            const lms = this._callToLaneMatchedCalls(call);
            if (lms) {
                result.push(lms);
            }
        });

        return result;
    }

    /**
     * Convert call to the structure with information of how a call matches to a lane
     */
    _callToLaneMatchedCalls(call) {
        const {sysId} = call;

        // Match the event to a known category
        const sysInfo = this._getFinalSysInfo(sysId);
        if (!sysInfo) {
            console.error('Unknown sysId: ' + sysId);
            return null;
        }

        // Convert wrapper events to library ones
        const eventViewType = (call.sysType === st.SYSTYPE_WRAPPER)
            ? st.SYSTYPE_LIBRARY
            : call.sysType;

        // Create the lane event
        const laneEvent = this._createLaneEvent(call, eventViewType);

        // Result
        return {sysInfo, laneEvent};
    }

    /**
     * Follow the references and return the final system id for the call to be matched to a system.
     * Return null, if unable to resolve sysId.
     */
    _getFinalSysInfo(sysId) {
        let sysInfo = this._mapOfSysIds[sysId];
        if (!sysInfo) {
            return null;
        }

        if (sysInfo.ref) {
            sysInfo = this._mapOfSysIds[sysInfo.ref];
        }

        return sysInfo || null;
    }

    /**
     * Create an lane structure to be rendered
     */
    _createLane(sysInfo) {
        return {
            id:     sysInfo.sysId,
            type:   sysInfo.sysType,
            title:  sysInfo.title,
            vendor: sysInfo.vendor,
            events: [],
        };
    }

    /**
     * Create a lane event structure to be rendered
     */
    _createLaneEvent(call, setType) {
        const rResult = this._getRequestResultDescription(call);

        return {
            id:                 Math.floor(Math.random() * 1000000000),
            sysId:              call.sysId,
            sysType:            call.sysType, // Original type of the system called
            type:               setType, // How to render the call - e.g. wrappers are rendered same as libraries
            msStart:            call.msStart,
            msEnd:              call.msEnd,
            resType:            call.resType,
            statusCode:         rResult.statusCode,
            isFailure:          rResult.isFailure,
            isServerFailure:    rResult.isServerFailure,
            stFailureReason:    rResult.stFailureReason,
            url:                call.url,
        };
    }

    /**
     * Return the information on how the request finished - successfully or with some kind of an error
     */
    _getRequestResultDescription(call) {
        const result = {
            statusCode:         this._formatStatusCode(call.statusCode),
            isFailure:          false,
            isServerFailure:    null,
            stFailureReason:    null,
        };

        if (call.resType === rt.ERROR) {
            result.isFailure = true;
            result.isServerFailure = (result.statusCode >= 400);

            // Now compose the error message
            result.stFailureReason = 'Unknown error';
            if (result.isServerFailure) {
                result.stFailureReason = result.statusCode
                    ? 'Server error: ' + result.statusCode
                    : 'Server error';
            } else {
                result.stFailureReason = 'Client side/browser error';
            }
        }

        // Result
        return result;
    }

    /**
     * Checks the status code and formats it to a HTTP int value or null
     */
    _formatStatusCode(statusCode) {
        statusCode = statusCode || null;
        if (statusCode) {
            statusCode = parseInt(statusCode, 10);
            if (isNaN(statusCode)) {
                statusCode = null;
            }
        }

        return statusCode;
    }

    /**
     * Add the lanes for the systems that were discovered on the page, but didn't have the events.
     */
    _addDiscoveredSystems(lanes, frame) {
        // For now only 'wrappers' are supported
        const wrappers = this._discoverWrappersIndirectly(frame);

        wrappers.forEach(sysId => {
            // Maybe this lane already exists
            if (lanes[sysId]) {
                return;
            }

            const sysInfo = this._getFinalSysInfo(sysId);
            if (!sysInfo) {
                console.error('Unknown sysId: ' + sysId);
                return;
            }

            lanes[sysId] = this._createLane(sysInfo);
        });

        return lanes;
    }

    /**
     * Scan the frame information and discover the present wrappers by indirect traces
     */
    _discoverWrappersIndirectly(frame) {
        // For now only Prebid supported
        let prebidFound = false;
        for (let i = 0; i < frame.calls.length; i++) {
            const call = frame.calls[i];

            switch (call.sysId) {
                case si.SYSID_AS_DFP:
                    prebidFound = this._isPrebidPresentInDfpCall(call.url);
                    break;

                case si.SYSID_AUC_RP_FL_STANDARD:
                case si.SYSID_AUC_RP_FL_MAS:
                    prebidFound = this._isPrebidPresentInFlCall(call.url);
                    break;
            }

            if (prebidFound) {
                break;
            }
        }

        // Result
        return prebidFound
            ? [si.SYSID_WRAP_PREBID]
            : [];
    }

    /**
     * Whether Prebid is found in the DFP call
     */
    _isPrebidPresentInDfpCall(url) {
        // Find the param string
        const matches = url.match(/[?&](scp|prev_scp)=([^&]+)/);
        if (!matches) {
            return false;
        }
        const paramString = decodeURIComponent(matches[2]);

        // Find the prebid GET parameters
        const string = '?' + paramString; // Guarantee that the first param also has ? at the beginning
        const prebidMatches = string.match('/[?&](hb_pb|hb_adid)/')
        return Boolean(prebidMatches);
    }

    /**
     * Whether Prebid is found in the FastLane call
     */
    _isPrebidPresentInFlCall(url) {
        return url.indexOf('tk_flint=pbjs') >= 0;
    }
};
