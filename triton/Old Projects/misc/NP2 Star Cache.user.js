// ==UserScript==
// @name        NP2 Star Cache
// @description 
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game*
// @version     1
// @require     http://userscripts.org/scripts/source/181520.user.js
// @require     http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.3.0/lodash.min.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals $, unsafeWindow, NP2M */
(function () {
    "strict true";

    var DEBUG   = true,
        NAME    = 'Star Cache',
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
        localStorage.setItem(k, s)
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
        var NeptunesPride   = unsafeWindow.NeptunesPride,
            gameId          = _.last(window.location.href.split('/')),
            cacheKey        = 'starCache' + gameId;

        NeptunesPride.Game = NP2M.wrap(NeptunesPride.Game, function (args, np) {
            function getData (newData) {
                var oldData = get(cacheKey, {});
                delete oldData.fleets; // fleets get destroyed and move so caching isn't very useful.

                debug(_.cloneDeep({key: cacheKey, old: oldData, new: newData}));

                _.each(newData.stars, function (star, i) {
                    if (oldData.stars[i]) {
                        delete star.v;
                    }
                    // star.v = '0';
                });

                // function useCache (star, i) {
                //     return star.v === '0' && oldData.stars[i];
                // }
                // // filter out stars which are outside of scan range
                // var rejected    = _.filter(newData.stars, useCache);

                // var nonCachedStars  = _.reject(newData.stars, useCache);
                // newData.stars       = _.zipObject(_.map(nonCachedStars, 'uid'), nonCachedStars);


                oldData = _.merge(oldData, newData);    // update old with new but keep old entries

                debug(_.cloneDeep({mergedData: oldData}));

                // commented out for testing. 
                // set(cacheKey, oldData);         // update cache
                return oldData;
            }
            function onFullUniverse  (event, newData) {
                return np.onFullUniverse(event, getData(newData));
            }
            function onPostJoinGame (event, newData) {
                return np.onPostJoinGame(event, getData(newData));
            }

            replace_widget_handlers(np, "order:full_universe", onFullUniverse);
            replace_widget_handlers(np, "order:post_join_game", onPostJoinGame);

            return np;
        });
    }

    function post_init_hook (data) {
        debug(NAME + ': post_init_hook', data);
    }

    NP2M.register(NAME, VERSION, pre_init_hook, post_init_hook);
})();