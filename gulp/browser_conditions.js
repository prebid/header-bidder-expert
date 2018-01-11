'use strict';

/**
 * This is a gulp plugin function that processes HB_IF_<BROWSER> conditions and leaves only the
 * contents for the target browser
 */

const gulpUtil = require('gulp-util');

/**
 * Trim the first part of the content, if it's a line ending
 */
function trimFirstLineEnding(content) {
    let matches = content.match(/^\n|\r\n/);
    if (matches) {
        content = content.substr(matches[0].length);
    }
    return content;
}

/**
 * The function to process the conditions inside the file. I.e. HB_IF_<BROWSER> are either left
 * for this browser, or stripped if they are for a different browser.
 */
module.exports = (browser, content, file) => {
    browser = (browser == 'firefox') ? 'ff' : browser;

    try {
        const cBrowser = browser.toUpperCase();

        // Quick check whether the file contains directives at all. Helps to skip regexp usage, which is slower.
        if (content.indexOf('HB_IF_') < 0) {
            return content;
        }

        // Do full processing
        do {
            // Find any starting directive
            let matches = content.match(new RegExp('^.*(HB_IF_([A-Z]+)).*$', 'm'));
            if (!matches) {
                break;
            }

            // Expand to the strings
            const startingLine = matches[0];
            const directiveStart = matches[1];
            const directiveEnd = 'END_' + directiveStart; // END_HB_IF_<BROWSER>
            const cDirectiveForBrowser = matches[2]; // Capitalized browser name

            // Maybe we found end directive
            if (startingLine.indexOf(directiveEnd) >= 0) {
                throw new gulpUtil.PluginError(
                    'browser_conditions',
                    `Found ending directive ${directiveEnd} before starting directive in file ${file.path}`
                );
            }

            // Divide into prefix and postfix
            const indexStartingLine = content.indexOf(startingLine);
            const prefix = content.substr(0, indexStartingLine);
            let postfix = content.substr(indexStartingLine + startingLine.length);
            postfix = trimFirstLineEnding(postfix);

            // Find the end of that snippet

            matches = postfix.match(new RegExp('^.*(' + directiveEnd + ').*$', 'm'));

            if (!matches) {
                throw new gulpUtil.PluginError(
                    'browser_conditions',
                    `Not found ending directive ${directiveEnd} in file ${file.path}`
                );
            }

            // Expand to the strings
            const endingLine = matches[0];

            // Divide the postfix into the conditional snippet's body and the rest of the code
            const indexEndingLine = postfix.indexOf(endingLine);
            const snippet = postfix.substr(0, indexEndingLine);
            postfix = postfix.substr(indexEndingLine + endingLine.length);
            postfix = trimFirstLineEnding(postfix);

            // Compose the new contents by either including or not including the snippet
            content = prefix
                + ((cDirectiveForBrowser == cBrowser) ? snippet : '')
                + postfix;
        } while (true);
    } catch (e) {
        // transform plugin silences error messages, so at least print it here
        console.error(e.message);
        throw e;
    }

    return content;
};
