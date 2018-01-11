'use strict';

import $ from 'jquery';

/**
 * The model storing the current state of the lanes to be rendered by the view components
 */
export default class ViewModel_Lanes {
    // Events that his class can trigger
    static get EV_LANE_COLLAPSED() {
        return 'lane-collapsed';
    }
    static get EV_LANE_UNCOLLAPSED() {
        return 'lane-uncollapsed';
    }

    // The lane moment events that we generate. These are not in-code events, rather representations of something
    // that happened in the data frame at a particular point of time. E.g. DOM has finished loading.
    static get MEV_ZERO() {
        return 'zero';
    }
    static get MEV_DOM() {
        return 'dom';
    }
    static get MEV_COMPLETED() {
        return 'completed';
    }

    constructor(config, util) {
        this._config = config;
        this._util = util;

        // Constants
        this.LANES_PRIORITY = {
            wrapper: 1,
            auction: 2,
            adserver: 3
        };

        // Properties
        this._pf = null;
        this._momentEvents = [];
        this._lanes = [];
    }

    /**
     * Analyze the view model and create the lanes
     */
    initForPreparedFrame(pf) {
        this._pf = pf;

        this._momentEvents = this._extractMomentEvents();

        this._lanes = this._convertPfLanes();
        this._lanes.sort(this._compareLanes.bind(this));
        this._timeLength = this._util.chooseTimeLength(this._lanes, this._pf);
    }

    /**
     * Get the lanes
     */
    getLanes() {
        return this._lanes;
    }

    /**
     * Get the moment events
     */
    getMomentEvents() {
        return this._momentEvents;
    }

    /**
     * Get the time length
     */
    getTimeLength() {
        return this._timeLength;
    }

    /**
     * Get total height of the lanes
     */
    getTotalHeight() {
        let result = 0;

        this.getLanes().forEach(lane => {
            result += lane.isCollapsed ? lane.collapsedHeight : lane.uncollapsedHeight;
        });

        return result;
    }

    /**
     * Collapse the lane
     */
    collapseLane(lane) {
        lane.isCollapsed = true;
        $(this).trigger(ViewModel_Lanes.EV_LANE_COLLAPSED, lane);
    }

    /**
     * Uncollapse the lane
     */
    uncollapseLane(lane) {
        lane.isCollapsed = false;
        $(this).trigger(ViewModel_Lanes.EV_LANE_UNCOLLAPSED, lane);
    }

    /**
     * Compose array of moment events
     */
    _extractMomentEvents() {
        const result = [];

        result.push(this._createMomentEvent(0, ViewModel_Lanes.MEV_ZERO));

        if (this._pf.msDom) {
            result.push(this._createMomentEvent(this._pf.msDom, ViewModel_Lanes.MEV_DOM));
        }

        if (this._pf.msCompleted) {
            result.push(this._createMomentEvent(this._pf.msCompleted, ViewModel_Lanes.MEV_COMPLETED));
        }

        return result;
    }

    /**
     * Create and return the moment event
     */
    _createMomentEvent(ms, type) {
        return {
            ms: ms,
            type: type
        };
    }

    /**
     * Convert the data frame lanes to the internal structure
     */
    _convertPfLanes() {
        return this._pf.lanes.map(pfLane => {
            const lane = this._createLane();

            // Set properties
            lane.type = pfLane.type;
            lane.title = pfLane.title;
            lane.collapsedHeight = this._config.LANE_COLLAPSED_HEIGHT;

            // All the events
            lane.events = pfLane.events;
            this._util.sortEvents(lane.events);

            // Collapsed representation
            lane.collapsedEvents = this._util.pfEvents2CollapsedEvents(pfLane.events);

            // Whether the collapsed representation is different from non-collapsed
            lane.isCollapsible = false;
            $(lane.collapsedEvents).each((index, event) => {
                if (event.events.length > 1) {
                    lane.isCollapsible = true;
                    return false; // break
                }
            });

            // Height in uncollapsed state
            const numEventsAfterFirst = Math.max(lane.events.length - 1, 0);
            lane.uncollapsedHeight = lane.collapsedHeight +
                (this._config.EVENT_HEIGHT + this._config.LANE_UNCOLLAPSED_EVENTS_MARGIN) * numEventsAfterFirst;

            // The default view state
            lane.isCollapsed = true;

            // Result
            return lane;
        });
    }

    /**
     * Create an empty lane structure
     */
    _createLane() {
        return {
            // Model properties
            title: null,
            type: null,
            isCollapsible: false,
            collapsedEvents: [],
            events: [],

            // View properties
            isCollapsed: false,
            collapsedHeight: null,
            uncollapsedHeight: null
        };
    }

    /**
     * Compare two lanes, which should go firt in the list
     */
    _compareLanes(a, b) {
        const priorityA = this.LANES_PRIORITY[a.type];
        const priorityB = this.LANES_PRIORITY[b.type];
        if (priorityA != priorityB) {
            return priorityA - priorityB;
        }

        // Otherwise compare the events
        if (a.events.length && !b.events.length) {
            return -1;
        }
        if (!a.events.length && b.events.length) {
            return 1;
        }
        if (a.events.length && b.events.length) {
            const eventA = a.events[0];
            const eventB = b.events[0];
            if (eventA.msStart < eventB.msStart) {
                return -1;
            }
            if (eventA.msStart > eventB.msStart) {
                return 1;
            }
        }

        // Alphabet comparison
        if (a.title < b.title) {
            return -1;
        }
        if (a.title > b.title) {
            return 1;
        }
        return 0;
    }
};


