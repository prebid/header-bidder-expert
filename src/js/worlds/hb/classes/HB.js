'use strict';

import $ from 'jquery';

import Toolbar from './Toolbar';

/**
 * Header Bidding renderer
 */
export default class {
    constructor(hbBackground, toolbar, tooltip, vmLanes, titlesObject, lanesObject, frameProcessor, hints, config,
                selector)
    {
        this._hbBackground = hbBackground;
        this._toolbar = toolbar;
        this._tooltip = tooltip;
        this._vmLanes = vmLanes;
        this._titlesObject = titlesObject;
        this._lanesObject = lanesObject;
        this._frameProcessor = frameProcessor;
        this._hints = hints;
        this._config = config;
        this._selector = selector;

        // Properties
        this._availableWidth = null;
        this._zoomLevel = null;
        this._maxZoomLevel = null;
        this._minZoomLevel = null;
        this._scale = null;
        this._chartWidth = null;
    }

    /**
     * Run the whole process (but actually postpone till
     */
    run() {
        $(this._run.bind(this));
    }

    /**
     * Everything is ready, so fully start the background process - run all the sub objects here
     */
    _run() {
        try {
            const frame = this._loadFrame();
            const preparedFrame = this._frameProcessor.frame2PreparedFrame(frame);
            this._render(preparedFrame);

            this._listenEvents();
        } catch (e) {
            this._showError(e.message || e);

            // We throw only strings as errors. If it's an object, then it's some unplanned mistake - rethrow it
            // to observe in the error console.
            if (e.message) {
                throw e;
            }
        }
    }

    /**
     * Show the error message to the user
     */
    _showError(message) {
        $(this._selector + ' .main-error')
            .text(message)
            .show();
    }

    /**
     * Render the data
     */
    _render(preparedFrame) {
        // Show the container
        $(this._selector + ' .render').show();

        this._showUrl(preparedFrame.url);

        // Other objects
        this._vmLanes.initForPreparedFrame(preparedFrame);

        this._tooltip.run();
        this._titlesObject.run();

        this._chooseInitialDimensions();
        this._toolbar.run(this._zoomLevel, this._minZoomLevel, this._maxZoomLevel);
        this._lanesObject.run(this._scale, this._chartWidth);
        this._hints.run(preparedFrame);
    }

    /**
     * Find out the frame we need to render
     */
    _loadFrame() {
        // Get the frame by id
        const matches = window.location.href.match(/\?id=([^&]*)/);
        if (!matches) {
            throw new Error('ID of the data frame is unknown');
        }

        const result = this._hbBackground.getFrame(matches[1]);
        if (!result) {
            throw new Error('Data frame is not found');
        }

        return result;
    }

    /**
     * Listen all the events in the owned objects
     */
    _listenEvents() {
        $(this._toolbar).on(Toolbar.EVENT_ZOOM_CHANGED, this._onZoomChanged.bind(this));

        $(this._selector + ' .legend-open').on('click', this._onLegendToggle.bind(this));
    }

    /**
     * Show the observed url on the screen
     */
    _showUrl(url) {
        let urlText = url;
        if (urlText.length > this._config.CUT_URL_LENGTH) {
            urlText = url.substr(0, this._config.CUT_URL_LENGTH) + '...';
        }

        $(this._selector).find('.observation a')
            .attr('href', url)
            .text(urlText);
    }

    /**
     * Choose the initial dimensions of the field
     */
    _chooseInitialDimensions() {
        this._availableWidth = $(this._selector).width() - this._titlesObject.getWidth();
        if (this._availableWidth < 100) { // If available width is too small
            this._availableWidth = 100;
        }

        // Min/max zoom levels
        this._maxZoomLevel = this._getMaxZoomLevel(this._vmLanes.getTimeLength());
        this._minZoomLevel = this._getMinZoomLevel(this._vmLanes);
        if (this._maxZoomLevel < this._minZoomLevel) {
            this._maxZoomLevel = this._minZoomLevel;
        }

        // Initial zoom level
        let zoomLevel = this._getClosestZoomLevel(this._vmLanes.getTimeLength(), this._availableWidth);
        if (zoomLevel < this._minZoomLevel) {
            zoomLevel = this._minZoomLevel;
        }
        if (zoomLevel > this._maxZoomLevel) {
            zoomLevel = this._maxZoomLevel;
        }

        // Set zoom level
        this._setZoomLevel(zoomLevel, false);
    }

    /**
     * Set new zoom level and, optionally, update the view
     */
    _setZoomLevel(zoomLevel, isUpdate) {
        this._zoomLevel = zoomLevel;

        this._scale = this._config.ZOOM_LEVEL_0 / (1 << this._zoomLevel); // pixels per millisecond

        this._chartWidth = Math.ceil(this._vmLanes.getTimeLength() * this._scale) + this._config.CHART_PADDING_RIGHT;
        if (this._chartWidth < this._config.MIN_LANE_WIDTH) {
            this._chartWidth = this._config.MIN_LANE_WIDTH;
        }

        // Update view if needed
        if (isUpdate === false) {
            return;
        }
        this._lanesObject.setScaleAndWidth(this._scale, this._chartWidth);
    }

    /**
     * Choose the closest zoom level, so that the rendered width will be as close to available width as possible
     */
    _getClosestZoomLevel(timeLength, availableWidth) {
        let result;
        let currResult = 0;
        let delta = null;

        while (true) {
            const currScale = this._config.ZOOM_LEVEL_0 / (1 << currResult);
            const currWidth = timeLength * currScale;
            const currDelta = Math.abs(availableWidth - currWidth);

            if ((delta !== null) && (currDelta > delta)) {
                break;
            }

            result = currResult;
            currResult++;
            delta = currDelta;
        }

        return result;
    }

    /**
     * Calculate the maximal zoom level - when the rendered time length is still bigger than minimal allowed one
     */
    _getMaxZoomLevel(timeLength) {
        let result = 0;

        while (true) {
            const currScale = this._config.ZOOM_LEVEL_0 / (1 << (result + 1));
            const currWidth = timeLength * currScale;
            if (currWidth < this._config.MIN_LANE_WIDTH) {
                break;
            }
            result++;
        }

        return result;
    }

    /**
     * Calculate the minimal zoom level - when the minimal rendered event is still not longer than maximal allowed
     */
    _getMinZoomLevel(vmLanes) {
        // We would like to allow zooming to minimal events only if there are no big events.
        // Because sometimes we get ridiculously small events, and zooming to them is really inconvenient.
        const MIN_CONSIDERED_MS_LENGTH = 25;

        // Choose the minimal length of the events
        const timeLength = vmLanes.getTimeLength();
        let minMsAbsLength = null;
        let minMsNormalLength = null;
        this._vmLanes.getLanes().forEach(lane => {
            lane.events.forEach(event => {
                const length = (event.msEnd === null ? timeLength : event.msEnd) - event.msStart;

                // This is the absolute minimum
                if ((minMsAbsLength === null) || (minMsAbsLength > length)) {
                    minMsAbsLength = length;
                }

                // This is the minimum among normal events
                if (length >= MIN_CONSIDERED_MS_LENGTH) {
                    if ((minMsNormalLength === null) || (minMsNormalLength > length)) {
                        minMsNormalLength = length;
                    }
                }
            });
        });

        // Chose the minimal length
        let minMsLength = minMsNormalLength;
        if (minMsLength === null) {
            minMsLength = minMsAbsLength;
        }
        if (minMsLength === null) {
            minMsLength = 100;
        }

        // Calculate the zoom level based on minimal event width
        let result = 0;
        while (true) {
            const currScale = this._config.ZOOM_LEVEL_0 / (1 << result);
            const currWidth = minMsLength * currScale;
            if (currWidth < this._config.MAX_UNC_EVENT_WIDTH) {
                break;
            }
            result++;
        }

        // Adjust zoom level, so that the chart width is not bigger than reasonably suggested max width
        while (true) {
            const scaleAdjusted = this._config.ZOOM_LEVEL_0 / (1 << result);
            const chartWidth = timeLength * scaleAdjusted;
            if (chartWidth < this._config.MAX_CHART_WIDTH) {
                break;
            }
            result++;
        }

        return result;
    }

    /**
     * Zoom has been changed
     */
    _onZoomChanged(event, newZoomLevel) {
        this._setZoomLevel(newZoomLevel);
    }

    /**
     * User wants to toggle legend
     */
    _onLegendToggle() {
        const $content = $(this._selector + ' .legend-content');
        if ($content.is(':visible')) {
            $content.slideUp(200);
        } else {
            $content.slideDown(200);
        }
    }
};
