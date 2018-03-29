(function () {
  "strict true";

  var debug_level = 1;
  var log = (debug_level > 0 && window.console && window.console.log) ? function log() {
    return window.console.log.apply(window.console, arguments);
  } : function () {};

  var overlaySize = 6500;
  var overlayMiddle = overlaySize / 2;
  var tileSize = 500; // pixels

  // var propulsion;
  // var maxPropDist;

  //     // unfortunatly these need to be here to have access to universe data
  //     var du  = (1 / 8); // distance unit, 1/8th of ly
  //     propulsion = universe.player ? universe.player.tech.propulsion.level : 1;
  //     maxPropDist  = (propulsion + 3) * du; // in ly

  /*******************/
  /*     UTILITY     */
  /*******************/
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

  /********************/
  /*   MATHEMATICAL   */
  /********************/
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
  function distance (a, b) {
    with (Math) {
      if (!b) {
        return sqrt(pow(a.x || a[0], 2) + pow(a.y || a[1], 2));
      }
      return sqrt(pow((a.x || a[0]) - (b.x || b[0]), 2) + pow((a.y || a[1]) - (b.y || b[1]), 2));
    }
  }

  function normaliseVector(a) {
    var d = distance(a);
    return [(a.x || a[0]) / d, (a.y || a[1]) / d];
  }

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
    ctx.beginPath();
    ctx.moveTo((posA.x || posA[0]) * 250 + ctx.canvas.width / 2, (posA.y || posA[1]) * 250 + ctx.canvas.height / 2);
    ctx.lineTo((posB.x || posB[0]) * 250 + ctx.canvas.width / 2, (posB.y || posB[1]) * 250 + ctx.canvas.height / 2);
    ctx.stroke();
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
    ctx[fill ? 'fill' : 'stroke']();
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

    radius = radius;
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


  /*******************/
  /*     LAYERS      */
  /*******************/

  function pathLayer(ctx, data, map) {
    var universe = data.universe;
    var stars = universe.galaxy.stars;

    ctx.lineWidth = 1 * map.pixelRatio;

    var du = (1 / 8); // distance unit, 1/8th of ly
    var currentPropulsion = 3 + (universe.player ? universe.player.tech.propulsion.level : 1);
    var currentMovementRange = currentPropulsion * du;
    var next_prop_dist = currentPropulsion * du;
    // var next_prop_dist = (currentPropulsion + 1) * du;
    var ignore_prop_dist = (currentPropulsion - 2) * du;

    var scurrentPropulsion = square(currentMovementRange);
    var snext_prop = square(next_prop_dist);
    var signore_prop = square(ignore_prop_dist);

    var done = []; // efficiency hack because stars is an object.

    // TODO: Make more efficient. This is basically collision detection.
    for (var i in stars) {
      if (stars.hasOwnProperty(i)) {
        var starA = stars[i];
        done[i] = true;


        // for (var j in stars) {
        //   var starB = stars[j];
        //   // discard via: identity, already done and bounding box
        //   if (starA === starB || done[j] || Math.abs(starA.x - starB.x) > next_prop_dist || Math.abs(starA.y - starB.y) > next_prop_dist) {
        //     continue;
        //   }



        // // 0.7 radious internal bounding box???

        //   var dist2 = Math.pow(starA.x - starB.x, 2) + Math.pow(starA.y - starB.y, 2);
        //   // If the stars are too far apart or too close go to next star pair.
        //   // We don't want to draw short paths, doing that makes lots of noise.
        //   if (dist2 > snext_prop){// || dist2 < signore_prop) {
        //     continue;
        //   }

        //   var easy = (dist2 <= scurrentPropulsion);
        //   var warped = easy && starA.ga && starB.ga;
        //   var ss; // = "rgba(255,255,255,1)";

        //   if (warped) {
        //     ss = "rgba(100, 255, 100, 0.6)";
        //   } else if (easy) {
        //     ss = "rgba(255, 255, 255, 0.3)";
        //   } else {
        //     ss = "rgba(255, 100, 100, 0.1)";
        //   }
        //   drawLine(ctx, starA, starB, ss);
        // }

        var neighbours = getStarNeighbours(stars, starA, next_prop_dist);
        // var neighbours = getQuadtreeNeighbours(quadtree, star, next_prop_dist);

        for (var j = 0, jl = neighbours.length; j < jl; j++) {
          var starB = neighbours[j];
          var dist2 = Math.pow(starA.x - starB.x, 2) + Math.pow(starA.y - starB.y, 2);
          var easy = (dist2 <= scurrentPropulsion);
          var warped = easy && starA.ga && starB.ga;
          var ss;
          // var ss = "rgba(255,255,255,1)";


          // var lccA = starPositionUtilityHeuristic(stars, starA, currentMovementRange);
          // var lccB = starPositionUtilityHeuristic(stars, starB, currentMovementRange);
          // var lccModifier = (lccA + lccB);
          // var alpha = lccModifier * 0.3; // max alpha is 0.6


          // if (warped) {
          //   ss = 'rgba(100, 255, 100, '+alpha+')';
          // } else if (easy) {
          //   ss = 'rgba(255, 255, 255, '+alpha+')';
          // } else {
          //   ss = 'rgba(255, 100, 100, '+alpha+')';
          // }

          if (warped) {
            ss = 'rgba(100, 255, 100, ' + 0.6 + ')';
          } else if (easy) {
            ss = 'rgba(255, 255, 255, ' + 0.6 + ')';
          } else {
            ss = 'rgba(255, 100, 100, ' + 0.2 + ')';
          }

          drawLine(ctx, starA, starB, ss);
        }

      }
    }
    return ctx;
  }

  // this is obscenely expensive.
  // please find a more efficient algorithm!
  function nodeNetLayer(ctx, data, map) {
    var universe = data.universe;
    var stars = universe.galaxy.stars;

    var du = (1 / 8); // distance unit, 1/8th of ly
    var currentPropulsion = 3 + (universe.player ? universe.player.tech.propulsion.level : 1);
    var currentMovementRange = currentPropulsion * du;

    var scurrentPropulsion = square(currentMovementRange);

    ctx.lineWidth = 3 * map.pixelRatio;

    var done = []; // efficiency hack because stars is an object.
    for (var i in stars) {
      if (stars.hasOwnProperty(i)) {
        var star = stars[i];
        // var neighbours = getStarNeighbours(stars, star, currentMovementRange);
        //getQuadtreeNeighbours(quadtree, star, currentMovementRange)
        var clusters = clusterStarNet(stars, star, currentMovementRange);

        // draw clusters
      }
    }
    return ctx;
  }

  function noteLayer(ctx, data, map) {
    var universe = data.universe;
    var notes = universe.interfaceSettings.notes;
    if (!notes) {
      notes = [
        {
          x: -1,
          y: 4.24,
          text: 'Hello world!'
        }
      ];
    }

    ctx.fillStyle = 'white';
    function drawNote (note) {
      log('drawing note', arguments);
      var point = pointToScreen(ctx, note);
      ctx.fillText(note.text, point[0], point[1]);

    }

    _.forEach(notes, drawNote);
    return ctx;
  }


  function clusterMetaDataLayer(ctx, data, map) {
    var universe = data.universe;
    var stars = universe.galaxy.stars;

    var du = (1 / 8); // distance unit, 1/8th of ly
    var currentPropulsion = 3 + (universe.player ? universe.player.tech.propulsion.level : 1);
    var currentMovementRange = currentPropulsion * du;

    ctx.lineWidth = 1 * map.pixelRatio;
    ctx.strokeStyle = 'white';

    for (var i in stars) {
      if (stars.hasOwnProperty(i)) {
        var star = stars[i];
        var spuh = starPositionUtilityHeuristic(stars, star, currentMovementRange);
        // var lcc = localClusteringCoefficient(stars, star, currentMovementRange);
        var screenPoint = pointToScreen(ctx, star);

        // log(star.n, spuh);
        ctx.beginPath();
        ctx.arc(screenPoint[0], screenPoint[1], 20, 0, spuh * 2 * Math.PI);
        ctx.stroke();
      }
    }
    return ctx;
  }

  function voronoiLayerWeighted(ctx, data, map) {
    var options = {
      alpha: 0.6,
      lineWidthMultiplier: 2,
      lineDashPattern: [1, 2],
      borderCondition: function (source, target) {
        // return source.n || target.n;
        return !source.n ^ !target.n || source.player || target.player;
      },
      styleModifier: function (style, source, target) {
        style.color = d3.lab(style).brighter(1).toString();
        return style;
      },
      weight: function(a, b) {
        return routeLength(a, b);
      }
    };
    return voronoiLayer(ctx, data, map, options);
  }

  function voronoiLayerFull(ctx, data, map) {
    var options = {
      alpha: 0.6,
      lineWidthMultiplier: 2,
      lineDashPattern: [1, 2],
      borderCondition: function (source, target) {
        // return source.n || target.n;
        return !source.n ^ !target.n || source.player || target.player;
      },
      styleModifier: function (style, source, target) {
        style.color = d3.lab(style).brighter(1).toString();
        return style;
      }
    };
    return voronoiLayer(ctx, data, map, options);
  }


  function travelTimeLayer(ctx, data, map) {
    var universe = data.universe;
    var selected =
    var options = {
      alpha: 0.6,
      lineWidthMultiplier: 2,
      lineDashPattern: [1, 2],
      stroke: false,
      fill: true,
      borderCondition: function (source, target) {
        // return source.n || target.n;
        return !source.n ^ !target.n || source.player || target.player;
      },
      // styleModifier: function (style, source, target) {
      //   style.color = d3.lab(style.color).brighter(9).toString();
      //   return style;
      // }
    };
    return voronoiLayer(ctx, data, map, options);
  }


  function voronoiLayerBordersOnly(ctx, data, map) {
    var options = {
      lineWidthMultiplier: 3,
      lineDashPattern: false,
      borderCondition: function (source, target) {
        return !source.n ^ !target.n || (source.player !== target.player);
      },
      styleModifier: function (style) {
        style.color = d3.lab(style.color).brighter(1).toString();
        return style;
      }
    };
    return voronoiLayer(ctx, data, map, options);
  }

  var voronoiDefaultOptions = {
    alpha: 0.8,
    lineWidthMultiplier: 2,
    lineDashPattern: false,
    styleModifier: function (style) {
      return style;
    },
    borderCondition: function () {
      return true;
    },
    stroke: true,
    fill: false,
    // weight: undefined
  };

  // function concaveHull (vertices, limit) {
  //   log('concaveHull', arguments);
  //    function distanceSquared(a,b) {
  //       var dx = a[0]-b[0], dy = a[1]-b[1];
  //       return dx * dx + dy * dy;
  //   }
  //   var limitSquared = limit * limit;

  //   // well, this is where the "magic" happens..
  //   var hull = d3.geom.delaunay(vertices).filter(function(t) {
  //       return (
  //         distanceSquared(t[0],t[1]) < limitSquared &&
  //         distanceSquared(t[0],t[2]) < limitSquared &&
  //         distanceSquared(t[1],t[2]) < limitSquared);
  //   });
  //   log('output', hull);

  //   // hull = [].concat.apply([], hull);
  //   return hull;

  // }

  function vectorSubtract(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
  }

  // simple cache
  var voronoiData;
  function getVoronoiData (universe, limit) {
    if (voronoiData) {
      return voronoiData;
    }
    var stars = _.toArray(universe.galaxy.stars);
    var fakeStars = [];
    var hullPoints = d3.geom.hull()
      .x(accessor('x'))
      .y(accessor('y'))
      (stars);

    var hullCentre = d3.geom.polygon(_.map(hullPoints, point)).centroid();
    var cHull = hull(_.map(stars, point), limit);
    var cHullCentre = d3.geom.polygon(_.map(cHull, point)).centroid();

    // hull = cHull;
    // hullCentre = cHullCentre;

    // TODO: make boundery proportional to maxPropDist.
    var hullPointCount = hullPoints.length;
    for (var i = 0, l = hullPointCount; i < l; i++) {
      // get previous, current and next hull points
      // TODO: optimise this
      var prevHP = point(hullPoints[(hullPointCount + i - 1) % l]);
      var hullPoint = point(hullPoints[i]);
      var nextHullPoint = point(hullPoints[(i + 1) % l]);

      var pointSeparation = distance(hullPoint, nextHullPoint);

      // Add a fake point near the hull point
      // but move it away from galactic centre

      var seg1 = vectorSubtract(prevHP, hullPoint);//[prevHP[0] - hullPoint[0], prevHP[1] - hullPoint[1]];
      var seg2 = vectorSubtract(hullPoint, nextHullPoint);//[hullPoint[0] - nextHullPoint[0], hullPoint[1] - nextHullPoint[1]];
      var dSeg = vectorSubtract(normaliseVector(seg2), normaliseVector(seg1));//[seg1[0]-seg2[0], seg1[1]-seg2[1]];
      var d2 = distance(dSeg);
      var nDSeg = [dSeg[0] / d2, dSeg[1] / d2];
      var padding = Math.max((distance(seg1) + distance(seg2)) / 6, 0.5);

      var hpFakeStar = {
        // x: hullPoint[0] - 0.3 * (cHullCentre[0] - hullPoint[0]),
        // y: hullPoint[1] - 0.3 * (cHullCentre[1] - hullPoint[1])
        x: hullPoint[0] + padding * nDSeg[0],
        y: hullPoint[1] + padding * nDSeg[1],
        label: i + ' : ' + nDSeg.toString()
      };
      fakeStars.push(hpFakeStar);


      // Add more fake points along the hull edge to even things out
      // We are using limit, which is normally the max travel distance,
      // but this is somewhat arbitary. Maybe standardise this as mean
      // distance between stars?

      // var mid = midPoint(hullPoint, nextHullPoint);

      var segmentCount = Math.max(1, Math.floor(pointSeparation * 2));// / limit);
      // var padding = pointSeparation % limit; // remainder

      var dx = (nextHullPoint[0] - hullPoint[0]) / segmentCount;
      var dy = (nextHullPoint[1] - hullPoint[1]) / segmentCount;
      var x = hullPoint[0];
      var y = hullPoint[1];

      var pointCount = segmentCount - 1;
      for (var j = 0; j < pointCount; j++) {
        x += dx;
        y += dy;

        var cdx = cHullCentre[0] - x;
        var cdy = cHullCentre[1] - y;
        var cdl = distance([cdx, cdy]);

        var fakeStar = {
          x: x - 0.5 * cdx / cdl,
          y: y - 0.5 * cdy / cdl
        };
        fakeStars.push(fakeStar);
      }
    }

    var extent;
    // var extent = [[
    //   1.4 * d3.min(stars, accessor('x')),
    //   1.4 * d3.min(stars, accessor('y'))],[
    //   1.4 * d3.max(stars, accessor('x')),
    //   1.4 * d3.max(stars, accessor('y'))
    // ]];
    var voronoi = d3.geom.voronoi()
      .x(accessor('x'))
      .y(accessor('y'))
      .clipExtent(extent);

    var starPoints = [].concat(stars, fakeStars);

    var voronoiPolygons = voronoi(starPoints);
    var delaunayLinks = voronoi.links(starPoints);

    voronoiData = {
      hull: hullPoints,
      hullCentre: hullCentre,
      concaveHull: cHull,
      concaveHullCentre: cHullCentre,
      polygons: voronoiPolygons,
      links: delaunayLinks,
      fakeStars: fakeStars,
      starPoints: starPoints
    };

    log('voronoiData', voronoiData);
    return voronoiData;
  }

  function voronoiLayer(ctx, data, map, options) {
    options = _.merge({}, voronoiDefaultOptions, options);

    var universe = data.universe;
    // var starVertices = _.map(stars, function(star) {
    //   // return [map.sx + star.x * 100, map.sy + star.y * 100];
    //   return [star.x, star.y];
    // });

    var du = (1 / 8); // distance unit, 1/8th of ly
    var currentPropulsion = 3 + (universe.player ? universe.player.tech.propulsion.level : 1);
    var currentMovementRange = currentPropulsion * du;

    var voronoiData = getVoronoiData(universe, currentMovementRange);

    var voronoiPolygons = voronoiData.polygons;
    var delaunayLinks = voronoiData.links;
    var hull = voronoiData.hull;

    _.forEach(voronoiData.concaveHull, function(triangle){
      drawPoly(ctx, triangle, 5, 'pink');
    });

    // var voronoiEdges = {};
    // var starsLength = stars.length;

    // for (var i = 0; i < starsLength; i++) {
    //   var star = stars[i];
    //   var poly = voronoiPolygons[i];
    //   var style = star.player ? star.player.color : 'white';
    //   for (var j = 0, jl = poly.length; j < jl; j++) {
    //     var edge = [poly[j], poly[(i+1) % poly.length]];

    //     var eid = edge.toString();
    //     if (voronoiEdges[eid]) {
    //       voronoiEdges[eid].stars.push(star);
    //     } else {
    //       voronoiEdges[eid] = {
    //         value: edge,
    //         stars: [star]
    //       };
    //     }
    //   }
    // }

    // ctx.globalAlpha = 0.5;
    // for (var i = 0, l = stars.length; i < l; i++) {
    //   var star = stars[i];
    //   var poly = voronoiPolygons[i];
    //   var style = star.player ? star.player.color : 'white';

    //   log('voronoi', star, poly, style);

    //   drawPoly(ctx, poly, undefined, style);
    // }
    // ctx.globalAlpha = 1;

    var intraEmpireLineWidth = 2 * map.pixelRatio; // * (map.scale / 50);
    var interEmpireLineWidth = 3 * map.pixelRatio; // * (map.scale / 50);

    log('EmpireLineWidths', intraEmpireLineWidth, interEmpireLineWidth);
    log('options', options);
    ctx.globalAlpha = options.alpha;

    ctx.lineWidth = options.lineWidthMultiplier * map.pixelRatio;
    if (options.lineDashPattern) {
      ctx.setLineDash(options.lineDashPattern);
    }
    if (options.stroke) {
      console.log('stroking');
      for (i = 0, l = delaunayLinks.length; i < l; i++) {
        var link = delaunayLinks[i];
        var source = link.source;
        var target = link.target;

        // we have fake and real points
        // draw border if fake-real OR different real-real
        if (options.borderCondition(source, target)) {
          var sourcePoly = _.filter(voronoiPolygons, function (d) {
            return d && d.point === source;
          });
          var targetPoly = _.filter(voronoiPolygons, function (d) {
            return d && d.point === target;
          });

          // if (options.weight) {
          //   // modify sourcePoly to match weight
          //   var weight = options.weight(source, target);
          //   for (var i = 0; i < voronoiPolygons.length; i++) {
          //     var poly = voronoiPolygons[i];

          //   }
          // }

          // log('ip', interestingPolies);
          var commonEdge = findCommonEdge(sourcePoly, targetPoly);
          if (!commonEdge) {
            continue;
          }
          // log('commonEdge', commonEdge);
          var sourceStyle = source.player ? source.player.color : undefined;
          var targetStyle = target.player ? target.player.color : undefined;
          var style;
          if (!sourceStyle && !targetStyle) {
            style = 'white';
          } else if (!sourceStyle || !targetStyle) {
            style = sourceStyle || targetStyle;
          } else {
            style = d3.interpolateLab(sourceStyle, targetStyle)(0.5);
          }
          style = options.styleModifier(style, source, target);


          // var intraEmpireBorder = (source.player === target.player);
          // if (intraEmpireBorder) {
          //   ctx.globalAlpha = 1;
          //   ctx.lineWidth = intraEmpireLineWidth;
          //   ctx.setLineDash([1 * map.pixelRatio, 2 * map.pixelRatio]);
          //   style = d3.lab(style).brighter(1).toString();
          // } else {
          //   ctx.lineWidth = interEmpireLineWidth;
          //   ctx.setLineDash([]);
          //   style = d3.lab(style).brighter(2).toString();
          // }

          drawLine(ctx, commonEdge[0], commonEdge[1], style);
        }
      }
    }
    if (options.fill) {
      var style;
      for (i = 0, l = voronoiPolygons.length; i < l; i++) {
        var poly = voronoiPolygons[i];
        var point = poly.point;
        if (!point.player) {
          continue;
        }
        var style = options.styleModifier({
          color: point.player.color
        });
        drawPoly(ctx, poly, 0, style.color, true);

        // if (i>200) break;
      }
    }

    // ctx.globalAlpha = 0.5;
    // for (var i = 0, il = voronoiEdges.length; i < il; i++) {
    //   var edge = voronoiEdges[i];
    //   var edgeValue = edge.value;
    //   var stars = edge.stars;
    //   var style = stars[0].player ? stars[0].player.color : 'white';

    //   drawLine(ctx, edgeValue[0], edgeValue[1], style);
    //   log('lining', edgeValue[0], edgeValue[1], style);
    // }
    // ctx.globalAlpha = 1;



    ctx.globalAlpha = 1;
    return ctx;
  }


  function devLayer(ctx, data, map) {

    var universe = data.universe;
    var du = (1 / 8); // distance unit, 1/8th of ly
    var currentPropulsion = 3 + (universe.player ? universe.player.tech.propulsion.level : 1);
    var currentMovementRange = currentPropulsion * du;

    var voronoiData = getVoronoiData(universe, currentMovementRange);

    var voronoiPolygons = voronoiData.polygons;
    var delaunayLinks = voronoiData.links;
    var hull = voronoiData.hull;

    // _.forEach(voronoiData.concaveHull, function(triangle){
    //   drawPoly(ctx, triangle, 1, 'grey');
    // });

    drawPoly(ctx, hull, 1, 'pink');

    _.forEach(voronoiData.fakeStars, function(fakeStar){
      drawDot(ctx, fakeStar, 6, 'white', fakeStar.label ? fakeStar.label.toString() : '');
    });

    return ctx;
  }

  function fleetSizeLayer(ctx, data, map) {
    var universe = data.universe,
      stars = universe.galaxy.stars,
      fleets = universe.galaxy.fleets,
      players = universe.galaxy.players,
      total = 0;
    var i;
    for (i in players)
      if (stars.hasOwnProperty(i)) {
        var p = players[i];

        total += p.total_strength;
      }

    for (i in stars)
      if (stars.hasOwnProperty(i)) {
        var star = stars[i];
        if (star.totalDefenses > 0) {
          drawFleetHalo(ctx, star.x, star.y, (star.totalDefenses / total), star.player.color);
        }
      }
    for (i in fleets)
      if (stars.hasOwnProperty(i)) {
        var fleet = fleets[i];
        if (fleet.orbiting !== null) {
          continue;
        }

        drawFleetHalo(ctx, parseFloat(fleet.x), parseFloat(fleet.y), (fleet.st / total), fleet.player.color);
      }
  }

  function fleetStrengthLayer(ctx, data, map) {
    // debug('fleetStrengthLayer', _.toArray(arguments));
    // we want 3 centres
    // star centre
    // scannable ship centre
    // weighted combination
    // resource centre
    var universe = data.universe,
      stars = universe.galaxy.stars,
      fleets = universe.galaxy.fleets,
      players = universe.galaxy.players,
      total = 0,
      src = scale_alpha(map.fleetWaypointSrc, 3);

    for (var i in players) {
      var player = players[i];
      var els = [].concat(_.values(stars), _.values(fleets));
      drawFleetCentres(src, ctx, player, els);
    }
  }

  function drawSprite(ctx, sprite) {
    if (sprite.visible) {
      ctx.save();
      ctx.translate(sprite.screenX, sprite.screenY);
      ctx.rotate(sprite.rotation);
      ctx.scale(sprite.scale, sprite.scale);
      ctx.drawImage(sprite.image, sprite.spriteX, sprite.spriteY, sprite.width, sprite.height, -sprite.pivotX, -sprite.pivotY, sprite.width, sprite.height);
      ctx.restore();
    }
  }

  function hyperdriveBoundaryLayer(ctx, data, map) {
    debug('hyperdriveBoundaryLayer', arguments);
    var universe = data.universe,
      players = universe.galaxy.players,
      stars = universe.galaxy.stars,
      image = scale_alpha(map.fleetRangeSrc, 3),
      negative = scale_alpha(image, 3);

    for (var i in players) {
      drawHyperdriveBoundary(ctx, stars, players[i], image, negative);
    }
    return ctx;
  }

  function scanningBoundaryLayer(ctx, data, map) {
    debug('scanningBoundaryLayer', arguments);
    var universe = data.universe,
      players = universe.galaxy.players,
      stars = universe.galaxy.stars,
      image = scale_alpha(map.scanningRangeSrc, 3),
      negative = scale_alpha(image, 3);

    for (var i in players) {
      drawScanningBoundary(ctx, stars, players[i], image, negative);
    }
    return ctx;
  }

  function drawHyperdriveBoundary(ctx, stars, player, image, negative) {
    debug('drawHyperdriveBoundary', arguments);
    var buffer = canvas(overlaySize, overlaySize);
    var bctx = buffer.getContext('2d');
    var player_range = tint(image, player.color);
    var canvas_offset = overlayMiddle;

    var star, x, y, sc, radius;

    for (var j in stars) {
      if (stars[j].player !== player) {
        continue;
      }
      star = stars[j];
      x = star.x * 250 + canvas_offset;
      y = star.y * 250 + canvas_offset;
      sc = star.player.tech.propulsion.value + 0.0125;

      drawSprite(bctx, {
        screenX: x,
        screenY: y,
        width: player_range.width,
        height: player_range.height,
        pivotX: player_range.width / 2,
        pivotY: player_range.height / 2,
        rotation: 0,
        scale: sc,
        image: player_range,
        spriteX: 0,
        spriteY: 0,
        visible: true
      });
    }

    bctx.globalCompositeOperation = 'destination-out';

    for (var i in stars) {
      if (stars[i].player !== player) {
        continue;
      }
      star = stars[i];
      x = star.x * 250 + canvas_offset;
      y = star.y * 250 + canvas_offset;
      sc = star.player.tech.propulsion.value + 0.0125;
      radius = sc * 243;

      clearCircle(bctx, x, y, radius);
      drawSprite(bctx, {
        screenX: x,
        screenY: y,
        width: negative.width,
        height: negative.height,
        pivotX: negative.width / 2,
        pivotY: negative.height / 2,
        rotation: 0,
        scale: sc * 0.97,
        image: negative,
        spriteX: 0,
        spriteY: 0,
        visible: true
      });

    }

    ctx.drawImage(buffer, 0, 0);
    return ctx;
  }

  function drawScanningBoundary(ctx, stars, player, image, negative) {
    debug('drawScanningBoundary', arguments);
    var buffer = canvas(overlaySize, overlaySize),
      bctx = buffer.getContext('2d'),
      player_range = tint(image, player.color),
      canvas_offset = overlayMiddle;

    for (var j in stars) {
      if (stars[j].player !== player) {
        continue;
      }
      var star = stars[j],
        x = star.x * 250 + canvas_offset,
        y = star.y * 250 + canvas_offset,
        sc = star.player.tech.scanning.value;

      drawSprite(bctx, {
        screenX: x,
        screenY: y,
        width: player_range.width,
        height: player_range.height,
        pivotX: player_range.width / 2,
        pivotY: player_range.height / 2,
        rotation: 0,
        scale: sc,
        image: player_range,
        spriteX: 0,
        spriteY: 0,
        visible: true
      });
    }


    bctx.globalCompositeOperation = 'destination-out';

    for (var i in stars) {
      if (stars[i].player !== player) {
        continue;
      }
      var star = stars[i],
        x = star.x * 250 + canvas_offset,
        y = star.y * 250 + canvas_offset,
        sc = star.player.tech.scanning.value,
        radius = sc * 240;


      clearCircle(bctx, x, y, radius);
      drawSprite(bctx, {
        screenX: x,
        screenY: y,
        width: negative.width,
        height: negative.height,
        pivotX: negative.width / 2,
        pivotY: negative.height / 2,
        rotation: 0,
        scale: sc * 0.97,
        image: negative,
        spriteX: 0,
        spriteY: 0,
        visible: true
      });

    }

    ctx.drawImage(buffer, 0, 0);
    return ctx;
  }

  /*******************/
  /* LAYER FRAMEWORK */
  /*******************/
  function registerLayer(Mousetrap, npui, layerConf) {
    // we don't want users to accidentally activate experimental layers
    if (layerConf.hidden && !debug_level) return;

    Mousetrap.bind(layerConf.hotkey, function () {
      npui.trigger('toggle_layer_setting', {
        settingName: layerConf.setting
      });
    });
  }

  function getLayer(data, map, layer) {
    debug('getLayer', arguments);
    var map_canvas = map.context.canvas,
      buffer = canvas(overlaySize, overlaySize),
      bctx = buffer.getContext('2d');
    layer(bctx, data, map);
    return buffer;
  }

  function drawLayer(map, cvs) {
    var width = cvs.width,
      height = cvs.height,
      scale = map.pixelRatio * map.scale / 250,
      sprite = {
        screenX: map.sx * map.pixelRatio,
        screenY: map.sy * map.pixelRatio,
        width: width,
        height: height,
        pivotX: width / 2,
        pivotY: height / 2,
        rotation: 0,
        scale: scale,
        image: cvs,
        spriteX: 0,
        spriteY: 0,
        visible: true
      };

    // log('layer sprite:', sprite);

    map.drawSprite(sprite);
  }

  function constructQuadtree(universe) {
    var stars = _.toArray(universe.galaxy.stars);
    var fleets = _.toArray(universe.galaxy.fleets);
    var objects = [].concat(stars, fleets);

    return d3.geom.quadtree()
      .x(accessor('x'))
      .y(accessor('y'))
      (objects);
  }


  var optionsImageSource = 'data:image/png;base64,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';
  OptionsLayers = function (universe, Crux) {
    var GS = Crux.gridSize;
    var optionsLayers = Crux.Widget('rel')
      .size(30 * GS, 32 * GS);

    // FIXME: This sets raw HTML of elements. We should really be using content IDs
    // and pushing our labels into the translation framwork

    var title = Crux.Text('layers', 'section_title col_black')
      .grid(0, 0, 30, 3)
      .roost(optionsLayers);

    title.rawHTML('Layers');

    // image must be 160x240
    Crux.Image(optionsImageSource, 'abs')
      .grid(0, 3, 10, 15)
      .roost(optionsLayers);

    // conf attributes: setting,hotkey,constructor
    optionsLayers.buttons = {};
    var previous = 0;
    layerConfigs.forEach(function (layerConf, index) {
      if (layerConf.hidden) return;

      var enabled = !!universe.interfaceSettings[layerConf.setting];
      var label = Crux.Text(layerConf.name, 'pad12 col_base')
        .grid(10, 3 + 3 * previous, 24, 3)
        .roost(optionsLayers);

      label.rawHTML(layerConf.name + ' <em>[' + layerConf.hotkey + ']</em>');

      var button = Crux.Button('', 'toggle_layer_setting', {
          settingName: layerConf.setting
        })
        .grid(24, 3 + 3 * previous, 6, 3)
        .roost(optionsLayers);

      button.rawHTML(enabled ? 'Disable' : 'Enable');

      optionsLayers.buttons[layerConf.setting] = button;
      previous++;
    });

    optionsLayers.size(30 * GS, Math.max(3 * previous, 16) * GS);

    optionsLayers.onToggleLayoutSetting = function (event, data) {
      var settingName = data.settingName;
      var enabled = !universe.interfaceSettings[settingName];
      log('optionsLayers.onToggleLayoutSetting', arguments, enabled);

      var button = optionsLayers.buttons[settingName];
      button.rawHTML(enabled ? 'Disable' : 'Enable');
    };

    optionsLayers.on('toggle_layer_setting', optionsLayers.onToggleLayoutSetting);
    return optionsLayers;
  };

  /*******************/
  /*    MOD HOOKS    */
  /*******************/

  var layerConfigs = [{
    hidden: true,
    name: 'Scanning',
    setting: 'show_scanning_boundaries',
    hotkey: 'm s',
    constructor: scanningBoundaryLayer
  }, {
    hidden: true,
    name: 'Hyper Drive',
    setting: 'show_hyperdrive_boundaries',
    hotkey: 'm h',
    constructor: hyperdriveBoundaryLayer
  }, {
    hidden: false,
    name: 'Travel Paths',
    setting: 'show_paths',
    hotkey: 'm p',
    constructor: pathLayer
  }, {
    hidden: false,
    name: 'Star Travel Time',
    setting: 'show_star_travel_time',
    hotkey: 'm j',
    constructor: travelTimeLayer
  }, {
    hidden: true,
    name: '(!!!) Fleet Size',
    setting: 'show_fleet_size_halos',
    hotkey: 'm a',
    constructor: fleetSizeLayer
  }, {
    hidden: true,
    name: '(!!!) Fleet Strength',
    setting: 'show_centre_of_strength',
    hotkey: 'm t',
    constructor: fleetStrengthLayer
  }, {
    hidden: true,
    name: '(!!!) Node Net',
    setting: 'show_node_net',
    hotkey: 'm e',
    constructor: nodeNetLayer
  }, {
    hidden: false,
    name: 'Voronoi Borders',
    setting: 'voronoiLayer',
    hotkey: 'm v',
    constructor: voronoiLayerBordersOnly
  }, {
    hidden: false,
    name: 'Voronoi Full',
    setting: 'voronoiLayerFull',
    hotkey: 'm f',
    constructor: voronoiLayerFull
  }, {
    hidden: false,
    name: 'Notes',
    setting: 'show_note_layer',
    hotkey: 'm n',
    constructor: noteLayer
  }, {
    hidden: true,
    name: 'Cluster Meta Data',
    setting: 'show_clusterMetaDataLayer',
    hotkey: 'm c',
    constructor: clusterMetaDataLayer
  }, {
    hidden: true,
    name: 'Development Layer',
    setting: 'show_devLayer',
    hotkey: 'm d',
    constructor: devLayer
  }];

  function pre_init_hook() {
    log('LAYERS: pre_init_hook');
  }

  // FIXME: Stop passing so many objects around!!!
  function registerOptions(npui, universe, Crux) {
    npui.OptionsScreen = NP2M.wrap(npui.OptionsScreen, function (args, optionsScreen) {
      log('npui.OptionsScreen', optionsScreen);

      OptionsLayers(universe, Crux)
        .roost(optionsScreen);

      return optionsScreen;
    });
  }

  function post_init_hook(data) {
    log('LAYERS: post_init_hook', data);
    var Crux = data.Crux;
    var universe = data.universe;
    var np = data.np;
    var npui = data.npui;

    layerConfigs.forEach(function (layerConf) {
      registerLayer(Mousetrap, npui, layerConf);
    });



    NeptunesPride.Map = NP2M.wrap(NeptunesPride.Map, function (args, map) {
      log('NeptunesPride.map', map);

      data.quadtree = constructQuadtree(universe);
      log('universe quadtree', data.quadtree);

      var layerCache = {};


      function resetLayerCache() {
        // reset layer cache when data is updated
        log('Invalidating layer cache!');
        layerCache = {};
        voronoiData = undefined;
      }

      universe.addGalaxy = NP2M.wrap(universe.addGalaxy, function(args, ret) {
        resetLayerCache();
        return ret;
      });

      // map.on('map_refresh', resetLayerCache);
      map.on('map_rebuild', function () {
        log('event: map_rebuild');
      });
      map.on('map_refresh', function () {
        log('event: map_refresh');
      });
      // map.createSprites = NP2M.wrap(map.createSprites, function(args, ret) {return ret;});


      // WARNING: This is called every time the map is zoomed, moved or updated!
      map.draw = NP2M.wrap(map.draw, function (args, ret) {
          layerConfigs.forEach(function (layerConf) {
            if (universe.interfaceSettings[layerConf.setting]) {
              if (!layerCache[layerConf.setting]) {
                log('getting layer', layerConf.name);
                try {
                  layerCache[layerConf.setting] = getLayer(data, map, layerConf.constructor);
                } catch (e) {
                  console.error(e)
                }
              }
              log('drawing layer', layerConf.name);
              drawLayer(map, layerCache[layerConf.setting]);
            }
          });
          return ret;
      });

      // FIXME: Stop passing so many objects around!!!
      registerOptions(npui, universe, Crux);


      function onToggleLayoutSetting(event, data) {
        var settingName = data.settingName;
        var enabled = !universe.interfaceSettings[settingName];
        log('onToggleLayoutSetting', arguments, enabled);
        universe.setInterfaceSetting(settingName, enabled);
        map.trigger('map_refresh');
      }

      npui.on('toggle_layer_setting', onToggleLayoutSetting);

      // map.drawSprite = NP2M.wrap(map.drawSprite, function (args, ret) {
      //     debug('drawing sprites', arguments);
      //     return ret;
      // });

      // reregister draw function
      Crux.tickCallbacks.pop();
      Crux.tickCallbacks.push(map.draw);
      return map;
    });
  }

  NP2M.register("NP2 Layers", "1", pre_init_hook, post_init_hook);
})();
