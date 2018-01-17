'use strict';

import $ from 'jquery';
import Hint from './Hint';

/**
 * Renderer for the Hints section
 */
export default class {
    constructor(hintRules, templates, selector) {
        this._hintRules = hintRules;
        this._templates = templates;
        this._selector = selector;

        // Properties
        this._hints = [];
    }

    /**
     * Create an object of the provided class
     */
    run(preparedFrame) {
        this._hints = this._composeHints(preparedFrame);

        if (this._hints.length) {
            this._renderHints();
            this._showHints();
        } else {
            this._hideHints();
        }
    }

    /**
     * Compose array of hints we'd like to show to the user
     */
    _composeHints(preparedFrame) {
        let result = [];

        this._hintRules.forEach(hintRule => {
            const hints = hintRule.generate(preparedFrame);
            if (hints.length) {
                result = result.concat(hints);
            }
        });

        return result;
    }

    /**
     * Render hints
     */
    _renderHints() {
        const $container = $(this._selector);
        const templateContent = this._templates.getContent('hint');

        this._hints.forEach(hint => {
            const data = {
                'hintType':         hint.getType(),
                'stType':           this._getHintStType(hint.getType()),
                'stIssue' :         hint.getIssue(),
                'stConsequence':    hint.getConsequence(),
                'stFix':            hint.getFix(),
            };

            const html = this._templates.fill(templateContent, data);
            $container.append(html);

            // Hide empty sections
            if (!hint.getConsequence()) {
                $container.find('>:last-child .hint-text-consequence')
                    .hide();
            }
            if (!hint.getFix()) {
                $container.find('>:last-child .hint-fix')
                    .hide();
            }
        });
    }

    /**
     * Human-readable hint type
     */
    _getHintStType(type) {
        switch (type) {
            case Hint.TYPE_NOTE:
                return 'Note';
            case Hint.TYPE_WARNING:
                return 'Warning';
            case Hint.TYPE_ERROR:
                return 'Note';
            default:
                return 'Unknown hint type';
        }
    }

    /**
     * Show hints section
     */
    _showHints() {
        $(this._selector).show();
    }

    /**
     * Hide hints section
     */
    _hideHints() {
        $(this._selector).hide();
    }
};
