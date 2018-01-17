'use strict';

import $ from 'jquery';

import ViewModel_Lanes from '../classes/ViewModel/Lanes';

/**
 * Manager for the "titles" section
 */
export default class {
    constructor(config, vmLanes, selector) {
        this._config = config;
        this._vmLanes = vmLanes;
        this._selector = selector;

        this._titles = [];
    }

    /**
     * Initialize the object and setup all the events
     */
    run() {
        this._createLanes();
        this._listenEvents();
    }

    /**
     * Get width of the container
     */
    getWidth() {
        return $(this._selector).width();
    }

    /**
     * Create all the visual lanes
     */
    _createLanes() {
        this._addVisualLaneElements();
    }

    /**
     * Listen for the possible events from other objects
     */
    _listenEvents() {
        $(this._vmLanes).on(ViewModel_Lanes.EV_LANE_COLLAPSED, this._onLaneCollapseChanged.bind(this));
        $(this._vmLanes).on(ViewModel_Lanes.EV_LANE_UNCOLLAPSED, this._onLaneCollapseChanged.bind(this));
    }

    /**
     * Render the current lanes
     */
    _addVisualLaneElements() {
        const $container = $(this._selector + ' .lanes');
        return this._vmLanes
            .getLanes()
            .forEach(lane => {
                const titleElement = this._createTitleElement();
                titleElement.lane = lane;

                titleElement.$element = $('<div class="lane ' + lane.type + '"></div>')
                    .text(lane.title);

                // Set elements for collapsible lane
                if (lane.isCollapsible) {
                    titleElement.$iconCollapse = $('#collapse-icon')
                        .clone()
                        .removeAttr('id');

                    titleElement.$iconUncollapse = $('#uncollapse-icon')
                        .clone()
                        .removeAttr('id');

                    titleElement.$element
                        .addClass('collapsible')
                        .append(titleElement.$iconCollapse)
                        .append(titleElement.$iconUncollapse)
                        .click(this._onTitleElementClick.bind(this, titleElement));
                }

                // Update the view
                this._updateCollapsedView(titleElement);

                // Store the title element
                $container.append(titleElement.$element);
                this._titles.push(titleElement);
            });
    }

    /**
     * Create an empty title element
     */
    _createTitleElement() {
        return {
            lane: null,
            $element: null,
            $iconCollapse: null,
            $iconUncollapse: null,
        };
    }

    /**
     * The element was clicked - trigger class
     */
    _onTitleElementClick(titleElement) {
        if (titleElement.$element.hasClass('collapsed')) {
            this._vmLanes.uncollapseLane(titleElement.lane);
        } else {
            this._vmLanes.collapseLane(titleElement.lane);
        }
    }

    /**
     * Update the collapsed view for a title
     * 'input' can be index or the title element itself
     */
    _updateCollapsedView(input) {
        const titleElement = $.isNumeric(input) ? this._titles[input] : input;
        const {lane} = titleElement;

        if (lane.isCollapsed) {
            titleElement.$element
                .removeClass('uncollapsed')
                .addClass('collapsed')
                .css('height', lane.collapsedHeight + 'px');
        } else {
            titleElement.$element
                .removeClass('collapsed')
                .addClass('uncollapsed')
                .css('height', lane.uncollapsedHeight + 'px');
        }
    }

    /**
     * When a lane changes its collapse event - redraw it
     */
    _onLaneCollapseChanged(event, lane) {
        const titleIndex = this._getTitleIndexByLane(lane);
        this._updateCollapsedView(titleIndex);
    }

    /**
     * Return the title element that owns this lane
     */
    _getTitleIndexByLane(lane) {
        for (let i = 0; i < this._titles.length; i++) {
            if (this._titles[i].lane === lane) {
                return i;
            }
        }
        return null;
    }
}
