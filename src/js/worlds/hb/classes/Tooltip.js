'use strict';

import $ from 'jquery';

/**
 * Tooltip control for showing the tooltips - so that it doesn't close just immediately when losing focus.
 * Must be used as a singleton, because it always patches jQuery UI in run().
 */
export default class {
    constructor() {
        // Constants
        this.WAIT_FOR_MOUSE_RETURN = 800;

        // Properties
        this._uuid = 1;
        this._fnOldOpenFunc = null;
        this._fnOldCloseFunc = null;
        this._fnOnTooltipOpen = null;
        this._closing = {};
    }

    /**
     * Run this object, which will patch jQuery UI
     */
    run() {
        // Init the custom on open function to position tooltip near mouse cursor
        this._fnOnTooltipOpen = (event, ui) => {
            ui.tooltip.position({
                my: 'left top+15',
                of: event,
            });
        };

        // Improve the jQuery UI plugin
        this._patchJQTooltip();
    }

    /**
     * Close all the tooltips that are on screen
     */
    closeAll() {
        $('.ui-tooltip').remove();
    }

    /**
     * Assign a tooltip to an element.
     * 'options' can be an object or content
     */
    assign(element, options) {
        const $element = $(element);

        const passOptions = {
            items: $element,
            show: 200,
            hide: 100,
        };

        if (typeof options === 'string' || options instanceof String) {
            options = {content: options};
        }
        $.extend(passOptions, options);

        // Special processing for 'open'
        passOptions.open = this._fnOnTooltipOpen;

        // Assign the tooltip
        $element.tooltip(passOptions);

        // If there are 'open' funcs passed - assign them
        if (options.open) {
            options.open.forEach(fnOpen => {
                $element.on('tooltipopen', fnOpen);
            });
        }
    }

    /**
     * Monkeypatch the standard jQuery tooltip.
     */
    _patchJQTooltip() {
        this._patchJQTooltipOpen();
        this._patchJQTooltipClose();
    }

    /**
     * Monkeypatch open func of the standard jQuery UI tooltip.
     * Open only if we're not just returning back.
     */
    _patchJQTooltipOpen() {
        this._fnOldOpenFunc = $.ui.open;

        $.ui.open = (event) => {
            const uniqueId = this._getUniqueId(event.currentTarget);

            // If we have returned to the same element - no sense to close the tooltip
            if (this._closing[uniqueId]) {
                clearTimeout(this._closing[uniqueId].timeoutHandle);
                delete this._closing[uniqueId];
                return;
            }

            // Before opening a new tooltip - close all the other existing tooltips
            Object.keys(this._closing).forEach((key) => {
                clearTimeout(this._closing[key].timeoutHandle);
                this._fnOldCloseFunc.apply(this._closing[key].thisArg, this._closing[key].args);
            });
            this._closing = {};

            // Open this tooltip
            this._fnOldOpenFunc(...arguments);
        };
    }

    /**
     * Monkeypatch close func of the standard jQuery UI tooltip.
     */
    _patchJQTooltipClose() {
        this._fnOldCloseFunc = $.ui.close;

        $.ui.close = (event) => {
            // Wait some time and only then close
            const uniqueId = this._getUniqueId(event.currentTarget);
            if (this._closing[uniqueId]) {
                clearTimeout(this._closing[uniqueId].timeoutHandle);
            }

            // Create an empty closing structure
            this._closing[uniqueId] = {
                timeoutHandle: null,
                thisArg: this,
                args: arguments,
            };

            // Wait before closing
            this._closing[uniqueId].timeoutHandle = setTimeout(
                () => {
                    this._fnOldCloseFunc.apply(this._closing[uniqueId].thisArg, this._closing[uniqueId].args);
                    delete this._closing[uniqueId];
                },
                this.WAIT_FOR_MOUSE_RETURN
            );
        };
    }

    /**
     * Generate or retrieve a unique id from a node
     */
    _getUniqueId(element) {
        const $element = $(element);

        let result = $element.data('hb-ui-tooltip-id');
        if (!result) {
            result = this._uuid++;
            $element.data('hb-ui-tooltip-id', result);
        }

        return result;
    }
};
