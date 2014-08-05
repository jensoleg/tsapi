'use strict';

var Options = module.exports = {
    options: undefined,
    set: function (opt) {
        this.options = opt || this.options;
    },
    get: function () {
        return this.options;
    }
};