// ==UserScript==
// @name        NP2 Export
// @description Very basic star data export script
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game/*
// @version     2
// @require     http://userscripts.org/scripts/source/181520.user.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals $, NP2M */
(function () {
    "strict true";

    var DEBUG   = false,
        NAME    = 'Export'
        VERSION = '2';

    function debug () {
        if (DEBUG) {
            console.log.apply(console, arguments);
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
        var s = '', keys;

        for (var i in o) {
            if (!keys) keys = Object.keys(o[i]);
            for (var j in keys) {
                s += JSON.stringify(o[i][keys[j]]) + ',';
            }
            s += '\n';
        };

        // header
        var h = '';
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

    NP2M.register(NAME, VERSION, pre_init_hook, post_init_hook);
})();