
// function voronoiLayerWeighted(ctx, data, map) {
//   var options = {
//     alpha: 0.6,
//     lineWidthMultiplier: 2,
//     lineDashPattern: [1, 2],
//     borderCondition: function (source, target) {
//       // return source.n || target.n;
//       return !source.n ^ !target.n || source.player || target.player;
//     },
//     styleModifier: function (style, source, target) {
//       style.color = d3.lab(style).brighter(1).toString();
//       return style;
//     },
//     weight: function(a, b) {
//       return routeLength(a, b);
//     }
//   };
//   return voronoiLayer(ctx, data, map, options);
// }

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


function voronoiLayerBordersOnly(ctx, data, map) {
  console.log('voronoiLayerBordersOnly', ctx, data, map);
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

// simple cache
var voronoiData;
function getVoronoiData (universe, limit) {
  if (voronoiData) {
    return voronoiData;
  }
  var stars = _.toArray(universe.galaxy.stars);
  var fakeStars = [];
  var hullPoints = d3.polygonHull(stars.map(s=>[s.x, s.y]));

  var hullCentre = d3.polygonCentroid(_.map(hullPoints, point));
  var cHull = hull(_.map(stars, point), limit);
  var cHullCentre = d3.polygonCentroid(_.map(cHull, point));

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

    var pointSeparation = vec_distance(hullPoint, nextHullPoint);

    // Add a fake point near the hull point
    // but move it away from galactic centre

    var seg1 = vectorSubtract(prevHP, hullPoint);//[prevHP[0] - hullPoint[0], prevHP[1] - hullPoint[1]];
    var seg2 = vectorSubtract(hullPoint, nextHullPoint);//[hullPoint[0] - nextHullPoint[0], hullPoint[1] - nextHullPoint[1]];
    var dSeg = vectorSubtract(normaliseVector(seg2), normaliseVector(seg1));//[seg1[0]-seg2[0], seg1[1]-seg2[1]];
    var d2 = vec_distance(dSeg);
    var nDSeg = [dSeg[0] / d2, dSeg[1] / d2];
    var padding = Math.max((vec_distance(seg1) + vec_distance(seg2)) / 6, 0.5);

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

    var segmentCount = Math.max(
        1,
        Math.floor(pointSeparation * 2)
    );// / limit);
    // var padding = pointSeparation % limit; // remainder

    var dx = (nextHullPoint[0] - hullPoint[0]) / segmentCount;
    var dy = (nextHullPoint[1] - hullPoint[1]) / segmentCount;
    var x = hullPoint[0];
    var y = hullPoint[1];

    var pointCount = segmentCount - 1;
    for (var j = 0; j < pointCount; j++) {
      x += dx;
      y += dy;

      var cdx = hullCentre[0] - x;
      var cdy = hullCentre[1] - y;
      var cdl = vec_distance([cdx, cdy]);

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
  var voronoiator = d3.voronoi()
    .x(accessor('x'))
    .y(accessor('y'))
    .extent(extent);

  var starPoints = [].concat(stars, fakeStars);

  var diagram = voronoiator(starPoints);
  var voronoiPolygons = diagram.polygons(starPoints);
  var delaunayLinks = diagram.links(starPoints);

  voronoiData = {
    hull: hullPoints,
    hullCentre: hullCentre,
    concaveHull: cHull,
    concaveHullCentre: cHullCentre,
    polygons: voronoiPolygons,
    diagram: diagram,
    links: delaunayLinks,
    fakeStars: fakeStars,
    starPoints: starPoints
  };

  log('voronoiData', voronoiData);
  return voronoiData;
}

function voronoiLayer(ctx, data, map, options) {
  options = _.merge({}, voronoiDefaultOptions, options);

  log('voronoiLayer options', options);

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
  var voronoiEdges = voronoiData.diagram.edges;
  var hull = voronoiData.hull;

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

  ctx.globalAlpha = options.alpha;

  ctx.lineWidth = options.lineWidthMultiplier * map.pixelRatio;
  if (options.lineDashPattern) {
    ctx.setLineDash(options.lineDashPattern);
  }
  var style;
  if (options.stroke) {
    console.log('stroking!');

    var lines = [];
    for (i = 0, l = delaunayLinks.length; i < l; i++) {
      var link = delaunayLinks[i];
      var edge = voronoiEdges[i];
      var source = link.source;
      var target = link.target;

      // we have fake and real points
      // draw border if fake-real OR different real-real
      if (options.borderCondition(source, target)) {
        // var skey = source.x + ',' + source.y;
        // var tkey = target.x + ',' + target.y;
        // var sourcePoly = voronoiPolygonsCache[skey];
        // var targetPoly = voronoiPolygonsCache[tkey];

        // if (options.weight) {
        //   // modify sourcePoly to match weight
        //   var weight = options.weight(source, target);
        //   for (var i = 0; i < voronoiPolygons.length; i++) {
        //     var poly = voronoiPolygons[i];
        //   }
        // }

        // log('ip', interestingPolies);
        // console.log('findCommonEdge', sourcePoly, targetPoly);
        // var commonEdge = findCommonEdge(sourcePoly, targetPoly);
        // if (!commonEdge) {
        //   continue;
        // }
        // log('commonEdge', commonEdge);


        var sPlayer = source.player;
        var tPlayer = target.player;
        var colors = universe.playerColors;
        var sourceStyle = sPlayer && colors[sPlayer.colorIndex || sPlayer.color];
        var targetStyle = tPlayer && colors[tPlayer.colorIndex || tPlayer.color];

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

        // drawLine(ctx, commonEdge[0], commonEdge[1], style);
        lines.push([
          edge[0][0], edge[0][1],
          edge[1][0], edge[1][1],
          style]);
      }
    }
    batchDrawLines(ctx, lines);
  }
  if (options.fill) {
    for (i = 0, l = voronoiPolygons.length; i < l; i++) {
      var poly = voronoiPolygons[i];
      if (!poly || !poly.point || !poly.point.player) {
        continue;
      }
      var point = poly.point;
      style = options.styleModifier({
        color: point.player.color
      });
      drawPoly(ctx, poly, 2, style.color, true);
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
