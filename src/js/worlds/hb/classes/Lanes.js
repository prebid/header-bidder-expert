'use strict';

import $ from 'jquery';
import ViewModel_Lanes from '../classes/ViewModel/Lanes';

/**
 * Manager and renderer of the lanes
 */
export default class {
    constructor(config, factory, templates, tooltip, util, vmLanes, selector) {
        this._config = config;
        this._factory = factory;
        this._templates = templates;
        this._tooltip = tooltip;
        this._util = util;
        this._vmLanes = vmLanes;
        this._selector = selector;

        // Properties
        this._scale = null;
        this._chartWidth = null;
        this._renderedLanes = null;

        // Callbacks
        this._fnOnLaneCollapseChanged = null;
    };

    /**
     * Initialize the object and setup all the events
     */
    run(scale, chartWidth) {
        this.setScaleAndWidth(scale, chartWidth);
    }

    /**
     * Update the scale and width of the chart
     */
    setScaleAndWidth(scale, chartWidth) {
        // Clear the view, if it has been initialized already
        if (this._scale !== null) {
            this._clearView();
        }

        // Set new measurements
        this._scale = scale;
        this._chartWidth = chartWidth;
        this._setSize();

        // Run the UI
        this._runView();
    }

    /**
     * Render the view and init everything
     */
    _runView() {
        this._renderTimeMeasures();
        this._renderMomentEvents();
        this._renderLanes();
        this._listenEvents();
    }

    /**
     * Clear the view - design and listeners
     */
    _clearView() {
        this._clearTimeMeasures();
        this._clearMomentEvents();
        this._clearLanes();
        this._unlistenEvents();
    }

    /**
     * Create all the visual lanes
     */
    _setSize() {
        $(this._selector + ' .time')
            .add(this._selector + ' .lanes')
            .css('width', this._chartWidth + 'px');
    }

    /**
     * Render the time measures on the time panel
     */
    _renderTimeMeasures() {
        const $template = $('#time-mark')
            .clone()
            .removeAttr('id');

        const step = this._util.chooseTimeTicksStep(this._chartWidth, this._scale);

        const maxLeft = this._chartWidth - this._config.TIME_TICKS_DISTANCE_MIN_TO_RIGHT;
        for (let msLeft = 0; true; msLeft += step.msStep) {
            const pxLeft = msLeft * this._scale;
            if (pxLeft > maxLeft) {
                break;
            }

            const text = this._util.getTimeMarkText(msLeft, step.unit);

            const $element = $template
                .clone()
                .css('left', pxLeft + 'px');
            $element.find('.time-text')
                .text(text);

            $(this._selector + ' .time')
                .append($element);
        }
    }

    /**
     * Clear the time measures on the time panel
     */
    _clearTimeMeasures() {
        $(this._selector + ' .time').html('');
    };

    /**
     * Create all the visual lanes
     */
    _createLanes() {
        this._renderedLanes = [];
        const $container = $(this._selector + ' .lanes');

        let accumulatedTop = 0;
        this._vmLanes
            .getLanes()
            .forEach(lane => {
                const rLane = this._createRenderedLane();
                rLane.lane = lane;

                rLane.$element = $('<div class="lane ' + lane.type + '"></div>')
                    .css('height', this._config.LANE_COLLAPSED_HEIGHT + 'px');
                $container.append(rLane.$element);

                // Visual properties
                rLane.left = 0;
                rLane.top = accumulatedTop;
                rLane.width = this._chartWidth;
                rLane.height = this._config.LANE_COLLAPSED_HEIGHT;

                accumulatedTop += rLane.height;

                // Store the lane
                this._renderedLanes.push(rLane);
            });
    }

    /**
     * Create empty lane structure
     */
    _createRenderedLane() {
        return {
            $element: null,
            lane: null,
            rEvents: [],

            // Visual properties
            left: null,
            top: null,
            width: null,
            height: null
        };
    }

    /**
     * Create empty rendered event structure
     */
    _createRenderedEvent() {
        return {
            $element: null,
            cEvent: null,
            event: null,

            // Visual properties
            left: null,
            top: null,
            width: null,
            height: null
        };
    }

    /**
     * Render the events on the lanes
     */
    _renderMomentEvents() {
        const $container = $(this._selector + ' .lanes');
        const top = this._config.MOMENT_TOP_OFFSET;
        const height = this._vmLanes.getTotalHeight() - top;

        this._vmLanes.getMomentEvents().forEach(momentEvent => {
            const left = momentEvent.ms * this._scale;
            const $element = $('<div class="moment moment-' + momentEvent.type + '"></div>')
                .css('top', top + 'px')
                .css('left', left + 'px')
                .css('height', height + 'px');

            $container.append($element);

            if (momentEvent.type != ViewModel_Lanes.MEV_ZERO) {
                this._tooltip.assign($element, this._getMomentEventHint(momentEvent));
            }
        });
    }

    /**
     * Clear the events on the lanes
     */
    _clearMomentEvents() {
        $(this._selector + ' .lanes')
            .find('.moment').remove();
    }

    /**
     * Get the moment event hint
     */
    _getMomentEventHint(momentEvent) {
        const content = this._templates.getContent('mev-' + momentEvent.type);
        const time = this._templates.formatTimeString(momentEvent.ms);
        return this._templates.fill(content, {time: time});
    }

    /**
     * Render the events on the lanes
     */
    _renderLanes() {
        if (!this._renderedLanes) {
            this._createLanes();
        }
        this._renderedLanes.forEach(this._renderLane.bind(this));
    }

    /**
     * Clear the events on the lanes
     */
    _clearLanes() {
        this._renderedLanes.forEach(this._clearLane.bind(this));
    }

    /**
     * Listen for the possible events from other objects
     */
    _listenEvents() {
        if (!this._fnOnLaneCollapseChanged) {
            this._fnOnLaneCollapseChanged = this._onLaneCollapseChanged.bind(this);
        }

        $(this._vmLanes)
            .on(ViewModel_Lanes.EV_LANE_COLLAPSED, this._fnOnLaneCollapseChanged)
            .on(ViewModel_Lanes.EV_LANE_UNCOLLAPSED, this._fnOnLaneCollapseChanged);
    }

    /**
     * Unlisten events
     */
    _unlistenEvents() {
        $(this._vmLanes)
            .off(ViewModel_Lanes.EV_LANE_COLLAPSED, this._fnOnLaneCollapseChanged)
            .off(ViewModel_Lanes.EV_LANE_UNCOLLAPSED, this._fnOnLaneCollapseChanged);
    }

    /**
     * Re-render lane.
     * input can be index or the rLane element itself.
     */
    _renderLane(input) {
        const rLane = $.isNumeric(input) ? this._renderedLanes[input] : input;
        const lane = rLane.lane;

        if (lane.isCollapsed) {
            rLane.height = lane.collapsedHeight;
            rLane.$element
                .css('height', lane.collapsedHeight + 'px');
            this._clearRenderedEvents(rLane);
            this._renderCollapsedEvents(rLane);
        } else {
            rLane.height = lane.uncollapsedHeight;
            rLane.$element
                .css('height', lane.uncollapsedHeight + 'px');
            this._clearRenderedEvents(rLane);
            this._renderUncollapsedEvents(rLane);
        }
    }

    /**
     * Clear the rendered lane
     */
    _clearLane(input) {
        const rLane = $.isNumeric(input) ? this._renderedLanes[input] : input;
        this._clearRenderedEvents(rLane);
    }

    /**
     * Clear all the events that were rendered on a rLane
     */
    _clearRenderedEvents(rLane) {
        rLane.rEvents.forEach(rEvent => {
            rEvent.$element.remove();
        });

        rLane.rEvents = [];
    }

    /**
     * Render the collapsed events
     */
    _renderCollapsedEvents(rLane) {
        rLane.lane.collapsedEvents.forEach(cEvent => {
            this._renderEvent(rLane, cEvent);
        });
    };

    /**
     * Render the uncollapsed events
     */
    _renderUncollapsedEvents(rLane) {
        rLane.lane.events.forEach((event, index) => {
            this._renderEvent(rLane, event, index);
        });
    }

    /**
     * Render either collapsed or uncollapsed event.
     * In case of uncollapsed event there must be passed uncollapsedEventIndex.
     */
    _renderEvent(rLane, anyEvent, uncollapsedEventIndex) {
        const rEvent = this._createRenderedEvent();
        const isCollapsed = uncollapsedEventIndex === void 0;
        if (isCollapsed) {
            rEvent.cEvent = anyEvent;
        } else {
            rEvent.event = anyEvent;
        }

        const left = anyEvent.msStart * this._scale;
        const right = (anyEvent.msEnd === null)
            ? this._chartWidth - 1
            : anyEvent.msEnd * this._scale;

        const width = right - left + 1;

        const height = this._config.EVENT_HEIGHT;

        let top = Math.floor((this._config.LANE_COLLAPSED_HEIGHT - height) / 2);
        if (!isCollapsed) {
            top += uncollapsedEventIndex * (this._config.EVENT_HEIGHT + this._config.LANE_UNCOLLAPSED_EVENTS_MARGIN);
        }

        // Class for the element
        const eventType = isCollapsed ? anyEvent.mergedType : anyEvent.type;
        const isFailure = isCollapsed ? anyEvent.hasFailure : anyEvent.isFailure;

        let cls = 'event';
        cls += ' event-' + eventType;
        cls += isFailure ? ' event-failure' : '';
        cls += (anyEvent.msEnd === null) ? ' event-no-end' : '';

        // Create the element
        rEvent.$element = $('<div class="' + cls + '"></div>')
            .css({
                    left: left + 'px',
                    top: top + 'px',
                    width: width + 'px',
                    height: height + 'px'
                }
            );

        rEvent.left = left;
        rEvent.top = top;
        rEvent.width = width;
        rEvent.height = height;

        // Add number of collapsed events
        let isCollapsedNumber = false;
        if (isCollapsed && (anyEvent.events.length > 1)) {
            isCollapsedNumber = true;

            // Add the counter
            rEvent.$element
                .addClass('counter')
                .append('<div class="event-num">' + anyEvent.events.length + '</div>');

            // Listen for the event to uncollapse the lane
            rEvent.$element.on('click', () => {
                this._vmLanes.uncollapseLane(rLane.lane);
            });
        } else {
            rEvent.$element.on('click', event => {
                const $dialog = $("#event-info");

                // Close tooltips
                this._tooltip.closeAll();

                // Set url
                const url = rEvent.cEvent ? rEvent.cEvent.events[0].url : rEvent.event.url;
                const $input = $dialog.find('.input-url');
                $input.val(url);

                // Show
                $dialog
                    .dialog({
                        dialogClass: "url-dialog-container no-titlebar",
                        modal: true,
                        width: 600,
                        position: {my: "left top", at: "right+10 bottom+10", of: event.currentTarget},
                        buttons: [
                            {
                                text: "Close",
                                click: function () { // "this" should be jQuery's element, so use function() definition
                                    $(this).dialog("close");
                                }
                            }
                        ]
                    });

                $input.prop('scrollTop', 0);
            });
        }

        // Tooltip
        const tooltipOptions = this._getEventHintOptions(rEvent);
        this._tooltip.assign(rEvent.$element, tooltipOptions);

        // Append the event
        rLane.$element.append(rEvent.$element);

        // Check to resize the event depending on the collapsed number
        if (isCollapsedNumber) {
            const widthNumber = rEvent.$element.find('.event-num').get(0).clientWidth;
            const widthEvent = rEvent.$element.get(0).clientWidth;
            const minWidthMustBe = widthNumber + 2;
            if (widthEvent < minWidthMustBe) {
                rEvent.$element.width(minWidthMustBe);
                rEvent.width = minWidthMustBe;
            }
        }

        // Record the event
        rLane.rEvents.push(rEvent);
    }

    /**
     * Return the hint for an event
     */
    _getEventHintOptions(rEvent) {
        const content = this._templates.getContent('event-tooltip');
        const openFuncs = [];

        // Prepare the values
        const data = {};

        // Event class
        data.eventType = this._templates.stEventType(rEvent.cEvent ? rEvent.cEvent.mergedType : rEvent.event.type);

        // Calls
        if (rEvent.cEvent && (rEvent.cEvent.events.length > 1)) {
            data.nCalls = rEvent.cEvent.events.length;
            data.stCalls = this._templates.stCalls(data.nCalls);
        } else {
            if (!this._fnRemoveCalls) {
                this._fnRemoveCalls = (event, ui) => {
                    ui.tooltip.find('.n-calls').remove();
                };
            }
            openFuncs.push(this._fnRemoveCalls);
        }

        // Failure status
        if (rEvent.cEvent && rEvent.cEvent.hasFailure) {
            data.stFailureReasons = rEvent.cEvent.stFailureReasons.join(', ');
        } else if (rEvent.event && rEvent.event.isFailure) {
            data.stFailureReasons = rEvent.event.stFailureReason;
        } else {
            if (!this._fnRemoveFailure) {
                this._fnRemoveFailure = (event, ui) => {
                    ui.tooltip.find('.failure').remove();
                };
            }
            openFuncs.push(this._fnRemoveFailure);
        }

        // Start time
        const anyEvent = rEvent.cEvent || rEvent.event;
        data.startTime = this._templates.formatTimeString(anyEvent.msStart);

        // End time and length
        if (anyEvent.msEnd) {
            data.endTime = this._templates.formatTimeString(anyEvent.msEnd);
            data.lengthTime = this._templates.formatTimeString(anyEvent.msStart - anyEvent.msEnd);
        } else {
            data.endTime = this._templates.stDidntFinish();
            if (!this._fnRemoveLength) {
                this._fnRemoveLength = (event, ui) => {
                    ui.tooltip.find('.length').remove();
                };
            }
            openFuncs.push(this._fnRemoveLength);
        }

        // Return the filled content
        return {
            open: openFuncs,
            content: this._templates.fill(content, data)
        };
    }

    /**
     * Recalculate the lane tops starting from some index
     */
    _recalcLaneTops(rLaneIndexFrom) {
        let currentTop = rLaneIndexFrom > 0
            ? this._renderedLanes[rLaneIndexFrom - 1].top + this._renderedLanes[rLaneIndexFrom - 1].height
            : 0;
        for (let i = rLaneIndexFrom; i < this._renderedLanes.length; i++) {
            this._renderedLanes[i].top = currentTop;
            currentTop += this._renderedLanes[i].height;
        }
    }

    /**
     * When a lane changes its collapse event - redraw it
     */
    _onLaneCollapseChanged(event, lane) {
        const rLaneIndex = this._getRLaneIndexByLane(lane);
        this._renderLane(rLaneIndex);
        this._recalcLaneTops(rLaneIndex + 1);

        this._clearMomentEvents();
        this._renderMomentEvents();
    }

    /**
     * Return the title element that owns this lane
     */
    _getRLaneIndexByLane(lane) {
        for (let i = 0; i < this._renderedLanes.length; i++) {
            if (this._renderedLanes[i].lane === lane) {
                return i;
            }
        }
        return null;
    }
};
