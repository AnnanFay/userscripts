// ==UserScript==
// @name        NP2 Groups
// @description 
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game*
// @version     1
// @require     http://userscripts.org/scripts/source/181520.user.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals $, NP2M */
(function () {
    "strict true";

    var DEBUG   = false,
        NAME    = 'Groups',
        VERSION = '1';

    function debug () {
        if (DEBUG) {
            console.log.apply(console, arguments);
        }
    }

    function get (k, d) {
        debug('GETTING >> key: ', k, ', default: ', d);
        var v = localStorage.getItem(k);
        if (!v) {
            return d;
        }
        return JSON.parse(v);
    }

    function set (k, v) {
        debug('SETTING >>', k, v);
        var s = JSON.stringify(v);
        localStorage.setItem(k, s);
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

    function pre_init_hook () {
        debug(NAME + ': pre_init_hook');
    }

    function post_init_hook (data) {
        debug(NAME + ': post_init_hook', data);
        var np          = data.np,
            npui        = data.npui,
            inbox       = data.inbox,
            universe    = data.universe;



    }

    NP2M.register(NAME, VERSION, pre_init_hook, post_init_hook);
})();