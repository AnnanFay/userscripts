// ==UserScript==
// @name        NP2 Quick Join
// @description 
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game*
// @version     1
// @require     http://userscripts.org/scripts/source/181520.user.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals $, unsafeWindow, NP2M */
try {
(function () {
    "strict true";

    var DEBUG   = true,
        NAME    = 'Quick Join',
        VERSION = '1';

    function debug () {
        if (DEBUG) {
            console.log.apply(this, arguments);
        }
    }

    function replace_widget_handlers (widget, name, func) {
        var handlers = widget.handlers;
        // remove all previous handlers with that event name
        for (var i = handlers.length - 1; i >= 0; i--) {
            var h = widget.handlers[i];
            if (h.name === name) {
                debug('removed handler:', h);
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
        var NeptunesPride   = data.NeptunesPride,
            universe        = data.universe,
            npui            = data.npui,
            np              = data.np;

        // TODO: These mess things up and cause an error
        function quick_join () {
            if (universe.player) return;

            universe.joinGameAvatar = 32;
            universe.joinGameAlias  = NeptunesPride.alias;
            npui.trigger("show_screen", "join_game");
        }

        npui.JoinPlayer = NP2M.wrap(npui.JoinPlayer, function (args, joinPlayer) {
            var player = args[0];
            var eye;
            
            if (player.alias) {
                eye = joinPlayer.children[4];
            } else {
                eye = joinPlayer.children[3];
            }

            if (universe.galaxy.players[player.uid].home) {
                eye.ui.css('color', 'green');
            }

            return joinPlayer;
        });

        function trigger_logger (args) {
            debug('triggering', args);
            return args;
        }
        function pass (a, r) {
            return r;
        }
        np.trigger   = NP2M.wrap(np.trigger,   trigger_logger, pass);
        npui.trigger = NP2M.wrap(npui.trigger, trigger_logger, pass);

        np.onPostLeaveGame = function () {
            np.trigger("browse_to", "/");
            //quick_join();
        };
        replace_widget_handlers(np, "order:post_leave_game", np.onPostLeaveGame);

        np.one("order:full_universe", quick_join);

    }

    NP2M.register(NAME, VERSION, pre_init_hook, post_init_hook);
})();
} catch (e) {
    console.log(e);
}