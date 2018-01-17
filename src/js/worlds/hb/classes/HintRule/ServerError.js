'use strict';

import Hint from '../Hint';
import HintRule_Abstract from './Abstract';

/**
 * Hint rule to notify about 4xx and 5xx server errors
 */
export default class extends HintRule_Abstract {
    constructor(factory) {
        super(factory);

        // Strings
        this.HINT_TYPE = Hint.TYPE_WARNING;

        this.HINT_ISSUE_SINGLE_VENDOR_WITH_STATUS = 'A request to :lane returned HTTP status :status, meaning the request failed. If this behavior persists, contact :vendor.';
        this.HINT_ISSUE_SINGLE_VENDOR_MULTI_FAILURES = 'A number of requests to :lane failed. If this behavior persists, contact :vendor.';
        this.HINT_ISSUE_SINGLE_VENDOR_WITHOUT_STATUS  = 'A request to :lane failed. If this behavior persists, contact :vendor.';

        this.HINT_ISSUE_MULTI_VENDORS = 'A number of requests to various vendors failed. If this behavior persists, contact the vendors.';
    }

    /**
     * @inheritDoc
     */
    generate(preparedFrame) {
        const laneErrors = {};
        preparedFrame.lanes.forEach(lane => {
            lane.events.forEach(event => {
                if (!event.isFailure || !event.isServerFailure) {
                    return;
                }

                if (!laneErrors[lane.id]) {
                    laneErrors[lane.id] = {
                        lane,
                        events: [],
                    };
                }

                laneErrors[lane.id].events.push(event);
            });
        });

        return Object.keys(laneErrors).length
            ? this._laneErrorsToHint(laneErrors)
            : [];
    }

    /**
     * Return the Hint depending on what kind of errors we have seen
     */
    _laneErrorsToHint(laneErrors) {
        let issue = null;
        const consequence = null;
        const fix = null;

        // Compose issue and fix strings
        const lineIds = Object.keys(laneErrors);
        if (lineIds.length === 1) {
            // There was just 1 vendor with failure(s)
            // Calculate the failures and find out their status codes
            const statuses = {};
            const id = lineIds[0];
            const thisLaneErrors = laneErrors[id];

            const {lane, events} = thisLaneErrors;

            events.forEach(event => {
                if (!statuses[event.statusCode]) {
                    statuses[event.statusCode] = {
                        statusCode: event.statusCode,
                        num: 0,
                    };
                }
                statuses[event.statusCode].num++;
            });

            // Come up with proper strings
            const statusCodes = Object.keys(statuses);
            const statusCode0 = statusCodes[0];
            const isMultiRequests = (statusCodes.length > 1) || (statuses[statusCode0].num > 1);
            if (isMultiRequests) {
                issue = this.HINT_ISSUE_SINGLE_VENDOR_MULTI_FAILURES;
                issue = issue.replace(':lane', lane.title, issue);
                issue = issue.replace(':vendor', lane.vendor, issue);
            } else {
                if (statusCode0) {
                    issue = this.HINT_ISSUE_SINGLE_VENDOR_WITH_STATUS;
                    issue = issue.replace(':lane', lane.title, issue);
                    issue = issue.replace(':vendor', lane.vendor, issue);
                    issue = issue.replace(':status', statusCode0, issue);
                } else {
                    issue = this.HINT_ISSUE_SINGLE_VENDOR_WITHOUT_STATUS;
                    issue = issue.replace(':lane', lane.title, issue);
                    issue = issue.replace(':vendor', lane.vendor, issue);
                    issue = issue.replace(':status', statusCode0, issue);
                }
            }
        } else {
            issue = this.HINT_ISSUE_MULTI_VENDORS;
        }

        // Result
        return [this._createHint(this.HINT_TYPE, issue, consequence, fix)];
    }
};
