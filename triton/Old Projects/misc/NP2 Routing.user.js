// ==UserScript==
// @name        NP2 Routing
// @description
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game*
// @version     2
// @require     http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.3.0/lodash.js
// @require     ../NP2_Mod_Framework.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals $, NP2M */
(function() {
  "strict true";

  var DEBUG = true;
  var NAME = 'Routing';
  var VERSION = '2';

  function debug() {
    if (DEBUG) {
      console.log.apply(console, arguments);
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

  function pre_init_hook() {
    debug(NAME + ': pre_init_hook');
  }

  function post_init_hook(data) {
    debug(NAME + ': post_init_hook', data);

    var NeptunesPride = data.NeptunesPride;
    var universe = data.universe;
    var np = data.np;
    var fleet_speed = 0.041666666666666664; // oly
    var du  = (1/8); // distance unit, 1/8th of ly
    // TODO: make this a user setting.
    var alwaysRoute = true;
    //fleet_speed     = universe.galaxy.fleet_speed; // 0.041666666666666664 oly

    function reconstructPath(paths, current) {
      var path = [current];
      while (current = paths[current]) {
        path.push(current);
      }
      path.pop();
      path.reverse();
      return path;
    }
    var sqrt = Math.sqrt;
    var pow = Math.pow;
    function distance (a, b) {
      return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2));
    }

    // assuming you can travel directly from a to b return the travel time.
    function travelTime(a, b, ignoreGates) {
      if (a === b) {
        return 1;
      }
      var speed = fleet_speed;
      if (ignoreGates || (a.ga && b.ga)) {
        speed *= 3;
      }
      var dist = distance(a, b);
      var time = 1 + Math.floor(dist / speed);
      return time;
    }

    // all nodes must be basic types. That is identifiers to objects.
    function _astar(start, goal, get_neighbours, heuristic, cost) {
      var closedNodes = [];
      var openNodes = [start];
      var paths = {}; // (destination -> coming from)
      var bestScores = {}; // g
      var estimateScores = {}; // f

      function estimator(s) {
        return estimateScores[s];
      }

      bestScores[start] = 0;
      estimateScores[start] = bestScores[start] + heuristic(start, goal);

      var currentNode;
      while (openNodes.length > 0) {
        // console.log('openset.length: ', openNodes.length);

        // move current from open to closed
        openNodes = _.sortBy(openNodes, estimator);
        currentNode = openNodes.shift();
        closedNodes.push(currentNode);

        // console.log('current: ', currentNode, 'estimateScore:', estimateScores[currentNode]);

        if (currentNode === goal) {
          // console.log('Finished! Returning path');
          return reconstructPath(paths, goal);
        }

        // console.log('Finding neighbours of', currentNode);
        var neighbor, neighbours = get_neighbours(currentNode);

        // console.log('Neighbours:');

        for (var nn in neighbours) {
          neighbor = neighbours[nn];
          if (_.contains(closedNodes, neighbor)) {
            // console.log('ignoring ', neighbor);
            continue;
          }
          var tentativeBestScore = bestScores[currentNode] + cost(currentNode, neighbor);

          // console.log('c, n, ts, bs', currentNode, neighbor, tentativeBestScore, bestScores[neighbor]);

          if (!_.contains(openNodes, neighbor) || tentativeBestScore < bestScores[neighbor]) {

            paths[neighbor] = currentNode;
            bestScores[neighbor] = tentativeBestScore;
            estimateScores[neighbor] = bestScores[neighbor] + heuristic(neighbor, goal);

            if (!_.contains(openNodes, neighbor)) {
              openNodes.push(neighbor);
            }
          }
        }
      }

    }

    function route (stars, start, goal, maxPropDist, ignoreGates) {
      debug('calculating route', stars, start, goal, maxPropDist);

      function neighbours(uid) {
        var currentStar = stars[uid];
        var uids = _(stars)
          .filter(function(star) {
            // console.log(currentStar, star, distance(currentStar, star), distance(currentStar, star) < maxPropDist, maxPropDist);
            return distance(currentStar, star) <= maxPropDist;
          })
          .map('uid')
          .value();
        return uids;
      }

      var epsilon = 0.00001; // to choose least jumps as well as speed
      function heuristic(uidA, uidB) {
        return epsilon + travelTime(stars[uidA], stars[uidB], true);
      }
      function cost(uidA, uidB) {
        return epsilon + travelTime(stars[uidA], stars[uidB], ignoreGates);
      }
      return _astar(start.uid, goal.uid, neighbours, heuristic, cost);
    }


    np.onMapClicked = NP2M.wrap(np.onMapClicked, function pre(args) {
      if (universe.editMode !== "edit_waypoints") {
        return args;
      }

      var evt = args[0];
      var data = args[1];
      var originalEvent = data.originalEvent;
      var ignoreGates;

      if (originalEvent.ctrlKey) {
        ignoreGates = true;
      }

      var ps = universe.seekSelection(data.x, data.y);

      if (!ps.length) {
        return args;
      }

      var clickedWaypoints = _.intersection(ps, universe.waypoints);

      if (!alwaysRoute && clickedWaypoints.length) {
        return args;
      }


      var propulsion = universe.player ? universe.player.tech.propulsion.level : 1;
      var maxPropDist  = (propulsion + 3) * du;

      var stars = universe.galaxy.stars;
      var fleet = universe.selectedFleet;
      var start = _.last(fleet.path) || fleet.orbiting;
      var goal = ps[0];

      if (clickedWaypoints[0] === start) {
        return args;
      }

      var new_path = route(stars, start, goal, maxPropDist, ignoreGates);

      if (!new_path) {
        console.log('Goal is unreachable!');
        return args;
      }
      _.each(new_path, function(uid) {
        np.trigger('add_waypoint', universe.galaxy.stars[uid]);
      });
      return; // do not call normal click code
    }, function post(args, ret) {return ret;});

    replace_widget_handlers(np, 'map_clicked', np.onMapClicked);
  }

  NP2M.register(NAME, VERSION, pre_init_hook, post_init_hook);
})();
