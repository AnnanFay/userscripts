/*******************/
/*     UTILITY     */
/*******************/
function ask (name, desc, def) {
  return prompt(name + ': '+ desc, def === undefined ? '' : def);
}

var store = {
  section: undefined,
  get: function get(name, def) {
    var v = window.localStorage.getItem(store.section + ':' + name);
    return v ? JSON.parse(v) : def;
  },
  set: function set(name, data) {
    return window.localStorage.setItem(store.section + ':' + name, JSON.stringify(data));
  },
  unset: function unset(name) {
    return window.localStorage.removeItem(store.section + ':' + name);
  },
  ensure: function ensure (name, desc, def, stringHandler) {
    var v = store.get(store.section + ':' + name, undefined);
    if (v === undefined) {
      v = ask(name, desc, def);
      if (v !== null) {
        store.set(store.section + ':' + name, stringHandler ? stringHandler(v) : v);
      }
    }
    return v;
  }
};


// Thanks Nathan Landis
function getErrorObject() {
  try {
    throw Error('');
  } catch (err) {
    return err;
  }
}

var log = (debug_level > 0 && window.console && window.console.log) ? function log() {
  // var err = getErrorObject();
  // var caller_line = err.stack.split("\n")[4];
  // var index = caller_line.indexOf("at ");
  // var clean = caller_line.slice(index + 2, caller_line.length);
  var args = Array.prototype.slice.call(arguments); // Make real array from arguments
  // args.unshift(MODULE_NAME + ',' + clean + ':');
  args.unshift(MODULE_NAME + ':');
  return window.console.log.apply(window.console, args);
} : function () {};

function noop() {}

function pass(x) {
  return x;
}

function caller(f) {
  var args = _.toArray(arguments).slice(1);
  return function () {
    return f.apply(this, args);
  };
}

function replaceWidgetHandlers(widget, name, func) {
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
/********************/
/*   MATHEMATICAL   */
/********************/

function vectorSubtract(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}

function square(x) {
  return Math.pow(x, 2);
}

function area_to_radius(area) {
  return Math.sqrt(area / Math.PI);
}

function volume_to_radius(vol) {
  // v = 1/3 * base_area * height
  // base_area = (3 * v) / height
  // radius = area_to_radius((3 * v) / height)
  return area_to_radius(3 * vol);
}

// each node must have x/y/m attributes
function centre_of_mass(nodes) {
  var totalm = 0;
  var totalx = 0;
  var totaly = 0;

  for (var i in nodes) {
    var node = nodes[i];
    totalm += node.m;
    totalx += node.x * node.m;
    totaly += node.y * node.m;
  }
  return {
    x: totalx / totalm,
    y: totaly / totalm
  };
}

// if you are worried about efficiency use
// square distance and don't call functions!
var abs = Math.abs;
var pow = Math.pow;
var sqrt = Math.sqrt;

function distance(a, b) {
  if (!b) {
    return sqrt(pow(a.x || a[0], 2) + pow(a.y || a[1], 2));
  }
  return sqrt(pow((a.x || a[0]) - (b.x || b[0]), 2) + pow((a.y || a[1]) - (b.y || b[1]), 2));
}

function normaliseVector(v) {
  var d = distance(v);
  return [(v.x || v[0]) / d, (v.y || v[1]) / d];
}

/*******************/
/*  MISCELLANEOUS  */
/*******************/

function accessor(k) {
  return function (o) {
    return o[k];
  };
}

function point(foo) {
  return [foo.x || foo[0], foo.y || foo[1]];
}

function midPoint(a, b) {
  return [
    (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
  ];
}

// assuming you can travel directly from a to b return the travel time.
function travelTime(starA, starB) {
  var speed = fleet_speed;
  if (starA.ga && starB.ga) {
    speed *= 4;
  }
  var dist = distance(starA, starB);
  var time = Math.ceil(dist / fleet_speed);
  return time;
}

function reconstructPath(paths, current) {
  var path = [current];
  while (current = paths[current]) {
    path.push(current);
  }
  path.pop();
  path.reverse();
  return path;
}

// generic astar search
// all nodes are identifiers and must be basic types strings or ints.
function astar(start, goal, getNeighbours, heuristic) {
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

  while (openNodes.length > 0) {
    console.log('openset.length: ', openNodes.length);

    // move current from open to closed
    openNodes = _.sortBy(openNodes, estimator);
    var currentNode = openNodes.shift();
    closedNodes.push(currentNode);

    // console.log('current: ', currentNode, 'estimateScore:', estimateScores[currentNode]);

    if (currentNode === goal) {
      return reconstructPath(paths, goal);
    }

    // console.log('Finding neighbours of', currentNode);
    var neighbours = getNeighbours(currentNode);

    // console.log('Neighbours:');

    for (var nn in neighbours) {
      var neighbor = neighbours[nn];
      if (_.contains(closedNodes, neighbor)) {
        // console.log('ignoring ', neighbor);
        continue;
      }
      var tentativeBestScore = bestScores[currentNode] + heuristic(currentNode, neighbor);

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
  // we failed to find a solution
  return;
}

// uses the above astar algorithm to find a route from start to goal
function findRoute(stars, start, goal, maxPropDist) {
  debug('calculating route', stars, start, goal, maxPropDist);

  function neighbours(uid) {
    var currentStar = stars[uid];
    var uids = _(stars)
      .filter(function (star) {
        // console.log(currentStar, star, distance(currentStar, star), distance(currentStar, star) < maxPropDist, maxPropDist);
        return distance(currentStar, star) <= maxPropDist;
      })
      .map('uid')
      .value()
    return uids;
  }

  function heuristic(uidA, uidB) {
    return travelTime(stars[uidA], stars[uidB]);
  }
  var bareRoute = astar(start.uid, goal.uid, neighbours, heuristic);
  if (bareRoute) {
    // extract stars from uids
    return map(function (uid) {
      return stars[uid];
    }, bareRoute);
  }
  // else return nothing
}

function routeLength(route) {
  var distance = 0;
  var duration = 0;
  for (var i = 1, l = route.length; i < l; i++) {
    distance += distance(route[i], route[i - 1]);
    duration += travelTime(route[i], route[i - 1]);
  }
  return [distance, duration];
}
