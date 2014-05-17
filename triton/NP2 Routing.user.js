// ==UserScript==
// @name        NP2 Routing
// @description 
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game*
// @version     1
// @require     http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.3.0/lodash.js
// @require     http://userscripts.org/scripts/source/181520.user.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals $, NP2M */
(function () {
    "strict true";

    var DEBUG   = true,
        NAME    = 'Routing',
        VERSION = '1';

    function debug () {
        if (DEBUG) {
            console.log.apply(this, arguments);
        }
    }


    function replace_widget_handlers(widget, name, func) {
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
        
        var NeptunesPride   = data.NeptunesPride,
            universe        = data.universe,
            np              = data.np,
            fleet_speed     = 0.041666666666666664;// oly
            //fleet_speed     = universe.galaxy.fleet_speed; // 0.041666666666666664 oly

        function distance (a,b) {
            var cdist = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)),
                tdist = Math.ceil(cdist/fleet_speed);
            return tdist;
        }
        // very verbose, ineficient and ugly
        // it will do for now
        function astar (stars, start, goal, dist) {
            console.log('Pathing: ', start.n, '[', start.uid,']', ' to ', goal.n, '[', goal.uid,']')

            var closedset = [],
                openset = [start.uid],
                came_from = {},
                g_score = {},
                f_score = {};

            g_score[start.uid] = 0;
            f_score[start.uid] = g_score[start.uid] + heuristic(start);

            function heuristic (star) {
                return distance(goal, star)
            }
            function reconstruct_path (came_from, current) {
                console.log('reconstruct_path', came_from, current);
                var path = [];
                while (current) {
                    path.push(current);
                    current = came_from[current];
                }
                path.pop();
                path.reverse();
                return path;
            }
            function neighbor_nodes (node) {
                return _.filter(stars, function (star) {
                    return distance(node, star) < (dist/fleet_speed);
                });
            }

            var current;
            while (openset.length > 0) {

                console.log('openset.length: ', openset.length);

                openset = _.sortBy(openset, function (s) {
                    return f_score[s];
                });
                current = stars[_.first(openset)];
                console.log('current: ', current.n, current.uid, 'f_score:', f_score[current.uid]);

                if (current === goal) {
                    console.log('Finished, returning path');
                    return reconstruct_path(came_from, current.uid);
                }
                // move current from open to closed sets
                openset.shift();
                closedset.push(current.uid);

                console.log('Finding neighbours of', current.n);
                var neighbor, neighbors = neighbor_nodes(current);

                console.log('Neighbors', _.map(_.sortBy(neighbors, function (s) {
                    return distance(s, current);
                }), function (s) {
                    return s.n + '['+distance(s, current)+']';
                }));

                for (var nn in neighbors) {
                    neighbor = neighbors[nn];
                    if (_.contains(closedset, neighbor.uid)) {
                        console.log('ignoring ', neighbor.n);
                        continue;
                    }
                    var tentative_g_score = g_score[current.uid] + distance(current, neighbor);
                    if (!_.contains(openset, neighbor)
                            || (g_score[neighbor.uid] === undefined 
                                && tentative_g_score < g_score[neighbor.uid])) {

                        came_from[neighbor.uid] = current.uid;
                        g_score[neighbor.uid]   = tentative_g_score;
                        f_score[neighbor.uid]   = g_score[neighbor.uid] + distance(neighbor, goal);

                        if (!_.contains(openset, neighbor)) {
                            openset.push(neighbor.uid);
                        }
                    }
                }
            }
        }












        np.onMapClicked = NP2M.wrap(np.onMapClicked, function (args, __) {
            debug('onMapClicked hook');
            var event   = args[0],
                data    = args[1];
            if (universe.editMode === "edit_waypoints") {
                var ps = universe.seekSelection(data.x, data.y);
                debug('ps', ps);

                var clickedWaypoints = _.intersection(ps, universe.waypoints);
                debug('clickedWaypoints',clickedWaypoints);
                if (!clickedWaypoints.length && ps.length) {
                    var fleet   = universe.selectedFleet,
                        start   = _.last(fleet.path) || fleet.orbiting,
                        goal    = ps[0],
                        hr      = universe.player.tech.propulsion.level,
                        dist    = (hr + 3) / 8;
                    debug('calling astar', universe.galaxy.stars, start, goal, dist);

                    var new_path = astar(universe.galaxy.stars, start, goal, dist);
                    console.log('FOUND:', new_path.join(' -> '));
                    _.each(new_path, function (p) {
                        np.trigger("add_waypoint", universe.galaxy.stars[p]);
                    });
                }
            }
        });
        
        replace_widget_handlers(np, 'map_clicked', np.onMapClicked);
    }

    NP2M.register(NAME, VERSION, pre_init_hook, post_init_hook);
})();