'use strict';

module.exports = {
    warnings: false,
    parse: {},
    compress: false,
    mangle: false,
    output: {
        beautify: true,
        width: 120,
        comments: /copyright|\(c\)|©/i
    },
    nameCache: null,
    toplevel: false,
    ie8: false,
};
