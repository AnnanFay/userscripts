// ==UserScript==
// @name        NP2 Self Mail
// @description Patches the inbox module to allow sending mail to your self.
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
        NAME    = 'Self Mail',
        VERSION = '1';

    function debug () {
        if (DEBUG) {
            console.log.apply(console, arguments);
        }
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

        // allow sending even when no recipients are selected
        // also removes the need for subjects, yay!
        npui.ComposeDiplomacyScreen = NP2M.wrap(npui.ComposeDiplomacyScreen, function (args, cds) {
            cds.validate = function () {
                cds.send.enable();
            };
            cds.validate();

            return cds;
        });

        inbox.onDraftSend = function () {
            var i;
            var to = inbox.draft.to;
            var to_uids = [];
            var to_aliases = [];
            var to_colors = [];

            // add the sending player to the recipient list if the list is empty
            if (to.length === 0) {
                to.unshift(universe.player.uid);
            }
            var player, players = universe.galaxy.players;
            for (i = 0; i < to.length; i+=1 ) {
                player = players[to[i]];

                to_uids.push(player.uid);
                to_aliases.push(player.rawAlias);
                to_colors.push(player.color);
            }

            inbox.trigger("server_request", {
                type: "create_game_message",
                from_color: universe.player.color,
                to_uids: to_uids.join(','),
                to_aliases: to_aliases.join(','),
                to_colors: to_colors.join(','),
                subject: inbox.draft.subject,
                body: inbox.draft.body
            });

            inbox.trigger("hide_screen");
            inbox.clearDraft();
        };

        replace_widget_handlers(inbox, "inbox_draft_send", inbox.onDraftSend);

        inbox.createToList = function (message, noHyperlinks) {
            var i, aliasProperty;
            var players = universe.galaxy.players;
            var player = players[message.payload.from_uid];
            var to_uids = message.payload.to_uids;

            var html = "";
            if (to_uids.length === universe.playerCount - 1) {
                html += player.colourBox;
                
                for (i = to_uids.length - 1; i >= 0; i--) {
                    player = players[to_uids[i]];
                    html += player.colourBox;
                }
                html += "<br>All Players<br>";
            } else if (to_uids.length === 1) {
                html += player.colourBox + " ";
                html += player.hyperlinkedAlias + "<br>";
                
                html += players[to_uids[0]].colourBox + " ";
                html += players[to_uids[0]].hyperlinkedAlias + "<br>";
            } else {
                html += player.colourBox + " ";
                html += player.hyperlinkedAlias + "<br>";

                for (i = to_uids.length - 1; i >= 0; i--) {
                    player = players[to_uids[i]];
                    if (player) {
                        html += player.hyperlinkedAlias.replace(player.alias, player.colourBox);
                    }
                }
            }

            return html;
        };


    }

    NP2M.register(NAME, VERSION, pre_init_hook, post_init_hook);
})();