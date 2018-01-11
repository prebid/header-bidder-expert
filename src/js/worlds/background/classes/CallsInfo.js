'use strict';

/**
 * Wrapper for the calls config. Used to find the configuration by the URL.
 */
export default class {
    constructor(callsConfig) {
        this._callsConfig = callsConfig;

        this._preparedCallsConfig = null;
    }

    /**
     * Find the the system by URL.
     * Return: {sysId, sysType} or null.
     */
    findSystem(url) {
        let callsConfig = this.getPreparedCallsConfig();

        for (let i = 0; i < callsConfig.length; i++) {
            const entry = callsConfig[i];

            if (this._anyMatch(url, entry.match) && !this._anyMatch(url, entry.not_match)) {
                const result = {};
                result.sysId = entry.sysId;
                result.sysType = entry.sysType;
                return result;
            }
        }

        return null;
    }

    /**
     * Return the call config prepared for easier and faster usage.
     * - non-existing `vendor` properties are copied from `title`
     * - all array/string properties are replaced with arrays
     * - slash is added to `listen`, `match` and `not_match` properties, if they do not contain it
     * - non-existing `match` properties are copied from `listen`
     * - non-existing `not_match` properties are replaced with empty arrays
     * - `match` and `not_match` properties are replaced with corresponding RegExp objects
     * - `listen` property formatted to the way we can pass to the API, so that we are listening to those URLs
     */
    getPreparedCallsConfig() {
        if (!this._preparedCallsConfig) {
            let callsConfig = JSON.parse(JSON.stringify(this._callsConfig)); // clone

            this._preparedCallsConfig = callsConfig.map(item => {
                if (!item.vendor) {
                    item.vendor = item.title;
                }

                if (!(item.listen instanceof Array)) {
                    item.listen = [item.listen];
                }

                if (!item.match) {
                    item.match = item.listen;
                }

                if (!(item.match instanceof Array)) {
                    item.match = [item.match];
                }

                if (!item.not_match) {
                    item.not_match = [];
                }
                if (!(item.not_match instanceof Array)) {
                    item.not_match = [item.not_match];
                }

                // Convert `listen` property
                item.listen = this._expandListenConfig(item.listen);

                // Convert masks to real regexps
                item.match = this._convertMasksToRegexps(item.match);
                item.not_match = this._convertMasksToRegexps(item.not_match);

                // Result
                return item;
            });
        }

        return this._preparedCallsConfig;
    }


    /**
     * Convert an array of masks (modified regexps) for URLs to the real regexps.
     */
    _convertMasksToRegexps(masks) {
        return masks.map(item => {
            // Subdomain-marked records must have a subdomain (or multiple)
            if (item.charAt(0) == '.') {
                item = '*' + item;
            }

            // Add the protocols
            item = '^(http|https)://' + item;

            // Escape special characters
            item = item.replace(/\./g, '\\.');
            item = item.replace(/\?/g, '\\?');

            // Replace ** with raw regexp - phase 1 - placeholder %STAR%
            item = item.replace(/\*\*/g, '%STAR%');

            // Replace * with regexp notation - .*
            item = item.replace(/\*/g, '.*');

            // Replace ** with raw regexp - phase 2 - replace placeholder %STAR%
            item = item.replace(/%STAR%/g, '*');

            // Result
            return new RegExp(item);
        });
    }

    /**
     * Convert an array of listen-ed URLs to API-compatible strings.
     * e.g. '.example.com/something' => '*://*.example.com/something*'
     */
    _expandListenConfig(listens) {
        return listens.map(item => {
            // Subdomain-marked records must have a subdomain (or multiple)
            if (item.charAt(0) == '.') {
                item = '*' + item;
            }

            // Add the protocols
            item = '*://' + item;

            // Add the ending slash, if none is present (required for listen directives)
            const indexProto = item.indexOf('//');
            const indexPathSlash = (indexProto >= 0) ? item.indexOf('/', indexProto + 2) : item.indexOf('/');
            if (indexPathSlash == -1) {
                item += '/';
            }

            // Add the ending wildcard
            item += '*';

            // Result
            return item;
        });
    }

    /**
     * Check whether the string matches any of the regexps
     */
    _anyMatch(string, regexps) {
        return regexps.reduce(
            (result, regexp) => {
                if (result) {
                    return result;
                }
                return !!string.match(regexp);
            },
            false);
    }
};
