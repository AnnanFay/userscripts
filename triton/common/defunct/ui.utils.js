
/*******************/
/*     UTILITY     */
/*******************/

var log = (debug_level > 0 && window.console && window.console.log) ? function log() {
  return window.console.log.apply(window.console, arguments);
} : function () {};

// String.prototype.splice = function(idx, rem, s) {
//   return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
// };
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
function pass(x) {
  return x;
}

function log() {
  if (DEBUG) {
    console.log.apply(console, arguments);
  }
}

function addGlobalStyle(css) {
  var head, style;
  head = document.getElementsByTagName('head')[0];
  if (!head) {
    return;
  }
  style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css;
  head.appendChild(style);
}

function find_widget(widget, needle) {
  var children = widget.children;

  for (var i = children.length - 1; i >= 0; i--) {
    var c = children[i],
      text = (children[i].label || children[i])
      .ui.text();
    if (text.indexOf(needle) != -1) {
      return c;
    }
  }
  return undefined;
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

// function distance (a, b) {
//   if (!b) {
//     return sqrt(pow(a.x || a[0], 2) + pow(a.y || a[1], 2));
//   }
//   return sqrt(pow((a.x || a[0]) - (b.x || b[0]), 2) + pow((a.y || a[1]) - (b.y || b[1]), 2));
// }

// function normaliseVector(v) {
//   var d = distance(v);
//   return [(v.x || v[0]) / d, (v.y || v[1]) / d];
// }

/*******************/
/*      IMAGE      */
/*******************/
function canvas_to_image(c) {
  var i = document.createElement('img');
  if (c) {
    i.src = c.toDataURL();
  }
  return i;
}

// copy existing image: canvas(image)
// create blank canvas: canvas(width, height)
function canvas(width, height) {
  var image;
  if (!height) {
    image = width;
    width = image.width;
    height = image.height;
  }
  var c = document.createElement('canvas');
  c.width = width;
  c.height = height;

  if (image) {
    var ctx = c.getContext('2d');
    ctx.drawImage(image, 0, 0);
  }

  return c;
}

function clearCircle(ctx, x, y, radius) {
  // ctx.save();
  // ctx.beginPath();
  // ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  // ctx.clip();
  // ctx.clearRect(x - radius - 1, y - radius - 1,
  //                   radius * 2 + 2, radius * 2 + 2);
  // ctx.restore();
  var gco = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'destination-out';

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fill();

  ctx.globalCompositeOperation = gco;
}

function tint(image, colour) {
  var buffer = canvas(image.width, image.height),
    bctx = buffer.getContext('2d');

  bctx.fillStyle = colour;
  bctx.fillRect(0, 0, buffer.width, buffer.height);

  bctx.globalCompositeOperation = "destination-atop";
  bctx.drawImage(image, 0, 0);

  return buffer;
}

function remove_alpha(image) {

  var ctx = canvas(image).getContext('2d');

  function rma(id) {
    var d = id.data;
    for (var i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 0) {
        d[i + 3] = 255;
      }
    }
    return id;

  }
  return apply_image_filter(ctx, rma);
}

function scale_alpha(image, scaling_factor) {

  var ctx = canvas(image).getContext('2d');

  function rma(id) {
    var d = id.data;
    for (var i = 0; i < d.length; i += 4) {
      d[i + 3] *= scaling_factor;
    }
    return id;

  }
  return apply_image_filter(ctx, rma);
}

function get_image_data(ctx) {
  return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function apply_image_filter(ctx, filter) {
  var args = _.toArray(arguments).slice(2),
    buffer = canvas(ctx.canvas.width, ctx.canvas.height),
    bctx = buffer.getContext('2d'),
    id = get_image_data(ctx);

  args.unshift(id);
  var nid = filter.apply(this, args);

  bctx.putImageData(nid, 0, 0);
  return buffer;
}
/*******************/
/*  MISCELLANEOUS  */
/*******************/

function pointToScreen(ctx, p) {
  return [(p.x || p[0]) * 250 + ctx.canvas.width / 2, (p.y || p[1]) * 250 + ctx.canvas.height / 2];
}


function drawLine(ctx, posA, posB, ss) {
  if (ss) {
    ctx.strokeStyle = ss;
  }
  var cox = ctx.canvas.width / 2;
  var coy = ctx.canvas.height / 2;
  ctx.beginPath();
  ctx.moveTo((posA.x || posA[0]) * 250 + cox, (posA.y || posA[1]) * 250 + coy);
  ctx.lineTo((posB.x || posB[0]) * 250 + cox, (posB.y || posB[1]) * 250 + coy);
  ctx.stroke();
}

// lines is an array of [x1, y1, x2, y2, strokeStyle, strokeWidth] sub-arrays
// points are world coordinates (star points)
function batchDrawLines(ctx, lines) {
  var cox = ctx.canvas.width / 2;
  var coy = ctx.canvas.height / 2;

  ctx.save();
  ctx.translate(cox, coy);

  for (var l = lines.length, i = 0; i < l; i++){
    var line = lines[i];
    var ll = line.length;
    // TODO:  if previous point was same as
    //        current do not start new path
    if (ll === 5) {
      ctx.strokeStyle = line[4];
    }
    else if (ll === 6) {
      ctx.strokeStyle = line[4];
      ctx.lineWidth = line[5];
    }

    ctx.beginPath();
    ctx.moveTo(line[0] * 250, line[1] * 250);
    ctx.lineTo(line[2] * 250, line[3] * 250);
    ctx.stroke();
  }
  ctx.restore();
  return ctx;
}


function getQuadtreeNeighbours(quadtree, object, distanceLimit) {
  var neighbours = [];

  var objectX = object.x;
  var objectY = object.y;
  var boundingBoxX1 = objectX - distanceLimit;
  var boundingBoxX2 = objectX + distanceLimit;
  var boundingBoxY1 = objectY - distanceLimit;
  var boundingBoxY2 = objectY + distanceLimit;
  var limitSquared = square(distanceLimit);

  quadtree.visit(function (node, x1, y1, x2, y2) {
    if (
      x1 < boundingBoxX1 ||
      y1 < boundingBoxY1 ||
      x2 > boundingBoxX2 ||
      y2 > boundingBoxY2) {
      // do not recurse children
      return true;
    }

    if (node.point) {
      var otherObject = node.point;
      var distanceSquared = Math.pow(otherObject.x - objectX, 2) + Math.pow(otherObject.y - objectY, 2);
      if (distanceSquared < limitSquared) {
        neighbours.push(otherObject);
      }
    }

    // continue searching any children
    return false;
  });
  return neighbours;
}

function getStarNeighbours(stars, star, distanceLimit) {
  var limitSquared = square(distanceLimit);
  var neighbours = [];
  for (var j in stars) {
    var otherStar = stars[j];
    // discard via: identity, already done and bounding box
    if (star === otherStar || Math.abs(star.x - otherStar.x) > distanceLimit || Math.abs(star.y - otherStar.y) > distanceLimit) {
      continue;
    }
    var distanceSquared = Math.pow(star.x - otherStar.x, 2) + Math.pow(star.y - otherStar.y, 2);
    // If the stars are too far apart
    if (distanceSquared > limitSquared) {
      continue;
    }
    neighbours.push(otherStar);
  }
  return neighbours;
}


// low values are a s sign of high strategic value!
var du = (1 / 8); // distance unit, 1/8th of ly
function localClusteringCoefficient(stars, star, movementRange) {
  if (!movementRange) {
    var propulsion = 3 + (star.player ? star.player.tech.propulsion.level : 1);
    movementRange = propulsion * du;
  }

  var neighbours = getStarNeighbours(stars, star, movementRange);
  var neighbourCount = neighbours.length;

  if (neighbourCount === 0) {
    return 1;
  }

  var neighbourLinkCount = 0;

  var allNeighbourNeighbours = [];
  for (var i = 0, l = neighbours.length; i < l; i++) {
    var neighbour = neighbours[i];
    var neighbourNeighbours = getStarNeighbours(stars, neighbour, movementRange);
    allNeighbourNeighbours.push(neighbourNeighbours);
  }
  // flatten
  allNeighbourNeighbours = [].concat.apply([], allNeighbourNeighbours);

  for (i = 0, l = allNeighbourNeighbours.length; i < l; i++) {
    if (_.includes(neighbours, allNeighbourNeighbours[i])) {
      neighbourLinkCount++;
    }
  }

  if (neighbourLinkCount === 0) {
    return 0;
  }

  var coefficient = neighbourLinkCount / (neighbourCount * (neighbourCount - 1));
  if (coefficient > 1) {
    log('Bad LCC:', star.n, coefficient, neighbourCount, neighbourLinkCount);
  }
  return coefficient;
}


function starPositionUtilityHeuristic(stars, star, movementRange) {
  var neighbours = getStarNeighbours(stars, star, movementRange);
  var neighbourCount = neighbours.length;

  var coefficient = localClusteringCoefficient(stars, star, movementRange);


  var score = 1 - coefficient;
  return score;
}


function clusterStarNet(stars, clusterStars, distanceLimit) {

}


function accessor(k) {
  return function (o) {
    return o[k];
  };
}

function findCommonEdge(a, b) {
  var edge = [];
  for (var i = 0, il = a.length; i < il; i++) {
    var pointA = a[i];
    for (var j = 0, jl = b.length; j < jl; j++) {
      var pointB = b[j];
      if (pointA[0] === pointB[0] && pointA[1] === pointB[1]) {
        edge.push(pointA);
        break;
      }
    }
    if (edge.length > 1) {
      return edge;
    }
  }
  return undefined;
}

function point(foo) {
  return [foo.x || foo[0], foo.y || foo[1]];
}

function midPoint(a, b) {
  return [
    (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
  ];
}


function drawPoly(ctx, vertices, width, style, fill) {
  var type = fill ? 'fill' : 'stroke';
  if (width) {
    ctx.lineWidth = width;
  }
  if (style) {
    ctx.strokeStyle = style;
    ctx.fillStyle = style;
  }
  var verticeCount = vertices.length;
  if (!verticeCount) return;

  var start = pointToScreen(ctx, vertices[0]);
  var canvasCorrectionX = ctx.canvas.width / 2;
  var canvasCorrectionY = ctx.canvas.height / 2;

  ctx.beginPath();
  ctx.moveTo(start[0], start[1]);
  for (var i = 1; i < verticeCount; i++) {
    var v = vertices[i];
    // log('lining to ', v);
    ctx.lineTo(
      (v.x || v[0]) * 250 + canvasCorrectionX, (v.y || v[1]) * 250 + canvasCorrectionY);
  }
  ctx.closePath();
  ctx[type]();
}

function drawHalo(ctx, x, y, r, hex_color) {
  var gradient = ctx.createRadialGradient(x, y, 0, x, y, r);

  // TODO: Remove this hackery!
  var m = hex_color.match(/#?(..?)(..?)(..?)/);
  var c = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)].join(',');

  gradient.addColorStop(0, 'rgba(' + c + ',1)');
  gradient.addColorStop(1, 'rgba(' + c + ',0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(x - r, y - r, x + r, y + r);
}

function drawFleetHalo(ctx, x, y, size, c) {
  debug('dfh', arguments);
  x = x * 250 + ctx.canvas.width / 2;
  y = y * 250 + ctx.canvas.width / 2;
  drawHalo(ctx, x, y, overlayMiddle * area_to_radius(size), c);
}

function drawCOM(src, ctx, c, label, color) {
  //debug('drawCOM', _.toArray(arguments));
  var offset = ctx.canvas.width / 2,
    x = c.x * 250 + offset,
    y = c.y * 250 + offset,
    sc = 0.2;

  drawSprite(ctx, {
    screenX: x,
    screenY: y,
    width: src.width,
    height: src.height,
    pivotX: src.width / 2,
    pivotY: src.height / 2,
    rotation: 0,
    scale: sc,
    image: src,
    spriteX: 0,
    spriteY: 0,
    visible: true
  });

  var radius = (src.height * sc) / 2;
  ctx.fillStyle = color;
  ctx.font = 'bold ' + (radius * 1.5) + 'px sans-serif';
  ctx.textBaseline = 'top';
  var tw = ctx.measureText(label).width;
  ctx.fillText(label, x - (tw / 2), y - (radius / 2));
}

function drawDot(ctx, point, radius, color, label) {
  //debug('drawCOM', _.toArray(arguments));
  var offset = ctx.canvas.width / 2;
  var x = (point.x || point[0]) * 250 + offset;
  var y = (point.y || point[1]) * 250 + offset;

  if (color) {
    ctx.fillStyle = color;
  }
  if (label) {
    ctx.font = 'bold ' + (radius * 1.5) + 'px sans-serif';
    ctx.textBaseline = 'top';
    var tw = ctx.measureText(label).width;
    ctx.fillText(label, x - (tw / 2), y + radius);
  }

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function strokeCircle(ctx, point, radius, options) {
  var color = options.color;
  var lineWidth = options.width || 1;

  var offset = ctx.canvas.width / 2;
  var x = (point.x || point[0]) * 250 + offset;
  var y = (point.y || point[1]) * 250 + offset;

  if (color) {
    ctx.strokeStyle = color;
  }
  if (lineWidth) {
    ctx.lineWidth = lineWidth;
  }

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawFleetCentres(src, ctx, player, data) {
  //debug('drawFleetCentres', _.toArray(arguments));
  var total = player.total_strength;
  src = tint(src, player.color);

  function Node(d) {
    return {
      x: parseFloat(d.x),
      y: parseFloat(d.y),
      m: 1
    };
  }

  var player_data = _.filter(data, function (v) {
      return v.puid === player.uid;
    }),
    star_data = _.filter(player_data, function (v) {
      return v.kind === 'star';
    }),
    fleet_data = _.filter(player_data, function (v) {
      return v.kind === 'fleet';
    }),
    equal_stars = _.map(star_data, Node),
    equal_fleets = _.map(fleet_data, Node),
    resource_stars = _.map(star_data, function (v) {
      return _.extend(Node(v), {
        m: v.r
      });
    }),
    industry_stars = _.map(star_data, function (v) {
      return _.extend(Node(v), {
        m: v.i
      });
    }),
    fleet_nodes = _.map(player_data, function (v) {
      return _.extend(Node(v), {
        m: v.st
      });
    });

  // if (equal_stars.length) {
  //     drawCOM(src, ctx, centre_of_mass(equal_stars), 'S', player.color);
  // }
  // if (resource_stars.length) {
  //     drawCOM(src, ctx, centre_of_mass(resource_stars), 'R', player.color);
  // }
  if (industry_stars.length) {
    drawCOM(src, ctx, centre_of_mass(industry_stars), 'I', player.color);
  }
  if (fleet_nodes.length) {
    drawCOM(src, ctx, centre_of_mass(fleet_nodes), 'F', player.color);
  }
  if (equal_fleets.length) {
    drawCOM(src, ctx, centre_of_mass(equal_fleets), 'C', player.color);
  }
}


// assuming you can travel directly from a to b return the travel time.
function travelTime(starA, starB, ignoreGates) {
  var speed = fleet_speed;
  if (ignoreGates || (starA.ga && starB.ga)) {
    speed *= 4;
  }
  var dist = distance(starA, starB);
  var time = Math.ceil(dist / fleet_speed);
  return time;
}

function reconstructPath(paths, current) {
  var path = [current];
  current = paths.current;
  while (current) {
    path.push(current);
    current = paths.current;
  }
  path.pop();
  path.reverse();
  return path;
}

// generic astar search
// all nodes are identifiers and must be basic types strings or ints.
function astar(start, goal, getNeighbours, heuristic, cost) {
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
  // we failed to find a solution
  return;
}

// uses the above astar algorithm to find a route from start to goal
function findRoute (stars, start, goal, maxPropDist) {
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

  function heuristic(uidA, uidB) {
    return travelTime(stars[uidA], stars[uidB]);
  }
  function cost(uidA, uidB) {
    return travelTime(stars[uidA], stars[uidB], true);
  }
  var bareRoute = astar(start.uid, goal.uid, neighbours, heuristic);
  if (bareRoute) {
    // extract stars from uids
    return map(function(uid){return stars[uid];}, bareRoute);
  }
  // else return nothing
}



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


function routeLength (stars, route) {
  if (!route || !route.length) return [0, 0];
  var space = 0;
  var time = 0;
  for (var i = 1, l = route.length; i < l; i++) {
    space += distance(stars[route[i]], stars[route[i-1]]);
    time += travelTime(stars[route[i]], stars[route[i-1]]);
  }
  return [space, time];
}










  var sqrt = Math.sqrt;
  var pow = Math.pow;

  function reconstructPath(paths, current) {
    var path = [current];
    while (current = paths[current]) {
      path.push(current);
    }
    path.pop();
    path.reverse();
    return path;
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

  // function routeLength (stars, route) {
  //   var d = 0;
  //   for (var i = 0, l = route.length; i < l-1; i++) {
  //     d += travelTime(route[i], route[i+1]);
  //   }
  //   return d;
  // }



















    // var NeptunesPride = data.NeptunesPride;
    // var universe = data.universe;
    // var np = data.np;
    // var fleet_speed = 0.041666666666666664; // oly
    // var du  = (1/8); // distance unit, 1/8th of ly
    // // TODO: make this a user setting.
    // var alwaysRoute = true;
    // //fleet_speed     = universe.galaxy.fleet_speed; // 0.041666666666666664 oly

    // function reconstructPath(paths, current) {
    //   var path = [current];
    //   while (current = paths[current]) {
    //     path.push(current);
    //   }
    //   path.pop();
    //   path.reverse();
    //   return path;
    // }
    // var sqrt = Math.sqrt;
    // var pow = Math.pow;
    // function distance (a, b) {
    //   return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2));
    // }

    // // assuming you can travel directly from a to b return the travel time.
    // function travelTime(a, b, ignoreGates) {
    //   if (a === b) {
    //     return 1;
    //   }
    //   var speed = fleet_speed;
    //   if (ignoreGates || (a.ga && b.ga)) {
    //     speed *= 3;
    //   }
    //   var dist = distance(a, b);
    //   var time = 1 + Math.floor(dist / speed);
    //   return time;
    // }

    // // all nodes must be basic types. That is identifiers to objects.
    // function _astar(start, goal, get_neighbours, heuristic, cost) {
    //   var closedNodes = [];
    //   var openNodes = [start];
    //   var paths = {}; // (destination -> coming from)
    //   var bestScores = {}; // g
    //   var estimateScores = {}; // f

    //   function estimator(s) {
    //     return estimateScores[s];
    //   }

    //   bestScores[start] = 0;
    //   estimateScores[start] = bestScores[start] + heuristic(start, goal);

    //   var currentNode;
    //   while (openNodes.length > 0) {
    //     // console.log('openset.length: ', openNodes.length);

    //     // move current from open to closed
    //     openNodes = _.sortBy(openNodes, estimator);
    //     currentNode = openNodes.shift();
    //     closedNodes.push(currentNode);

    //     // console.log('current: ', currentNode, 'estimateScore:', estimateScores[currentNode]);

    //     if (currentNode === goal) {
    //       // console.log('Finished! Returning path');
    //       return reconstructPath(paths, goal);
    //     }

    //     // console.log('Finding neighbours of', currentNode);
    //     var neighbor, neighbours = get_neighbours(currentNode);

    //     // console.log('Neighbours:');

    //     for (var nn in neighbours) {
    //       neighbor = neighbours[nn];
    //       if (_.contains(closedNodes, neighbor)) {
    //         // console.log('ignoring ', neighbor);
    //         continue;
    //       }
    //       var tentativeBestScore = bestScores[currentNode] + cost(currentNode, neighbor);

    //       // console.log('c, n, ts, bs', currentNode, neighbor, tentativeBestScore, bestScores[neighbor]);

    //       if (!_.contains(openNodes, neighbor) || tentativeBestScore < bestScores[neighbor]) {

    //         paths[neighbor] = currentNode;
    //         bestScores[neighbor] = tentativeBestScore;
    //         estimateScores[neighbor] = bestScores[neighbor] + heuristic(neighbor, goal);

    //         if (!_.contains(openNodes, neighbor)) {
    //           openNodes.push(neighbor);
    //         }
    //       }
    //     }
    //   }

    // }

    // function route (stars, start, goal, maxPropDist, ignoreGates) {
    //   debug('calculating route', stars, start, goal, maxPropDist);

    //   function neighbours(uid) {
    //     var currentStar = stars[uid];
    //     var uids = _(stars)
    //       .filter(function(star) {
    //         // console.log(currentStar, star, distance(currentStar, star), distance(currentStar, star) < maxPropDist, maxPropDist);
    //         return distance(currentStar, star) <= maxPropDist;
    //       })
    //       .map('uid')
    //       .value();
    //     return uids;
    //   }

    //   var epsilon = 0.00001; // to choose least jumps as well as speed
    //   function heuristic(uidA, uidB) {
    //     return epsilon + travelTime(stars[uidA], stars[uidB], true);
    //   }
    //   function cost(uidA, uidB) {
    //     return epsilon + travelTime(stars[uidA], stars[uidB], ignoreGates);
    //   }
    //   return _astar(start.uid, goal.uid, neighbours, heuristic, cost);
    // }


    // np.onMapClicked = NP2M.wrap(np.onMapClicked, function pre(args) {
    //   if (universe.editMode !== "edit_waypoints") {
    //     return args;
    //   }

    //   var evt = args[0];
    //   var data = args[1];
    //   var originalEvent = data.originalEvent;
    //   var ignoreGates;

    //   if (originalEvent.ctrlKey) {
    //     ignoreGates = true;
    //   }

    //   var ps = universe.seekSelection(data.x, data.y);

    //   if (!ps.length) {
    //     return args;
    //   }

    //   var clickedWaypoints = _.intersection(ps, universe.waypoints);

    //   if (!alwaysRoute && clickedWaypoints.length) {
    //     return args;
    //   }


    //   var propulsion = universe.player ? universe.player.tech.propulsion.level : 1;
    //   var maxPropDist  = (propulsion + 3) * du;

    //   var stars = universe.galaxy.stars;
    //   var fleet = universe.selectedFleet;
    //   var start = _.last(fleet.path) || fleet.orbiting;
    //   var goal = ps[0];

    //   if (clickedWaypoints[0] === start) {
    //     return args;
    //   }

    //   var new_path = route(stars, start, goal, maxPropDist, ignoreGates);

    //   if (!new_path) {
    //     console.log('Goal is unreachable!');
    //     return args;
    //   }
    //   _.each(new_path, function(uid) {
    //     np.trigger('add_waypoint', universe.galaxy.stars[uid]);
    //   });
    //   return; // do not call normal click code
    // }, function post(args, ret) {return ret;});

    // replace_widget_handlers(np, 'map_clicked', np.onMapClicked);
