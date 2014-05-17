// ==UserScript==
// @name        NP2 Export
// @description Very basic star data export script
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game/*
// @version     1
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals $, NP2M */
(function () {
    "strict true";

    var DEBUG   = false,
        NAME    = 'Export';

    function debug () {
        if (DEBUG) {
            console.log.apply(this, arguments);
        }
    }

    function pre_init_hook () {
        debug(NAME + ': pre_init_hook');
    }

    function replace_widget_handlers (widget, name, func) {
        var handlers = widget.handlers;
        // remove all previous handlers with that event name
        for (var i = handlers.length - 1; i >= 0; i--) {
            var h = widget.handlers[i];
            if (h.name === name) {
                handlers.splice(i, 1);
                h.node.ui.off(h.name, h.func);
            }
        }
        // add the new one
        widget.on(name, func);
    }
    function toCSV (o) {
        var s = '';

        for (var i in o) {
            for (var j in o[i]) {
                s += JSON.stringify(o[i][j]) + ',';
            }
            s += '\n';
        };

        // header
        var h = '', keys = Object.keys(o[i]);
        for (var k in keys) {
            h += keys[k] + ',';
        }

        return h + '\n' + s;
    }

    function post_init_hook (data) {
        debug(NAME + ': post_init_hook', data);
        replace_widget_handlers(data.np, "order:full_universe",
            function (event, newGalaxy) {
                var data = toCSV(newGalaxy.stars);
                $('body').html('<textarea></textarea>');
                $('textarea')
                    .width(window.innerWidth)
                    .height(window.innerHeight)
                    .val(data);
            });
    }

    NP2M.register(NAME, "1", pre_init_hook, post_init_hook);
})();