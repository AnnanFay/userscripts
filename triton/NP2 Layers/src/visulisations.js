// visualisations (vis) are ways of displaying information
//
// visFunction(canvasContextBuffer, globals, dataPoints, options)

// we need some common data structure to pass from metric to vis
// data structure is:
//
// [{point: [x, y], var1: 0, var2: 0, ..., varX: 0}, ..., ..., ...]
//

var visualisations = {};

visualisations.voronoi = {
  name: 'Voronoi',
  defaults: {
    alpha: 0.8,
    lineWidthMultiplier: 2,
    lineDashPattern: false,
    stroke: true,
    fill: false,
    styleKeys: ['v'],
    autoStyle: true,
    styleModifier: function (style, source, target) {
      return style;
    },
    borderCondition: function (source, target) {
      return !source.n ^ !target.n || source.player || target.player;
      // return true;
    }
  },
  vis: function voronoi(buffer, globals, dataPoints, options) {
    var universe = globals.universe;
    var map = globals.map;

    var currentPropulsion = 3 + (universe.player ? universe.player.tech.propulsion.level : 1);
    var currentMovementRange = currentPropulsion * du;

    var voronoiData = new_getVoronoiData(dataPoints, currentMovementRange);
    var voronoiPolygons = voronoiData.polygons;
    var delaunayLinks = voronoiData.links;
    var hull = voronoiData.hull;

    buffer.globalAlpha = options.alpha;
    buffer.lineWidth = options.lineWidthMultiplier * map.pixelRatio;

    if (options.lineDashPattern) {
      buffer.setLineDash(options.lineDashPattern);
    }

    var i, style = {};
    var source, target;
    if (options.stroke) {
      for (i = 0, l = delaunayLinks.length; i < l; i++) {
        var link = delaunayLinks[i];
        source = link.source;
        target = link.target;

        // we have fake and real points
        // draw border if fake-real OR different real-real
        if (options.borderCondition(source, target)) {
          var sourcePoly = _.findWhere(voronoiPolygons, {
            point: source
          });
          var targetPoly = _.findWhere(voronoiPolygons, {
            point: target
          });

          var commonEdge = findCommonEdge(sourcePoly, targetPoly);
          if (!commonEdge) {
            continue;
          }
          var sourceStyle = source.player ? source.player.color : undefined;
          var targetStyle = target.player ? target.player.color : undefined;

          if (!sourceStyle && !targetStyle) {
            style.color = 'white';
          } else if (!sourceStyle || !targetStyle) {
            style.color = sourceStyle || targetStyle;
          } else {
            style.color = d3.interpolateLab(sourceStyle, targetStyle)(0.5);
          }

          style = options.styleModifier(style, source, target);
          drawLine(buffer, commonEdge[0], commonEdge[1], style.color);
        }
      }
    }

    if (options.fill) {
      for (i = 0, l = voronoiPolygons.length; i < l; i++) {
        var poly = voronoiPolygons[i];
        if (!poly || !poly.point || !poly.point.player) {
          continue;
        }
        var point = poly.point;
        style = {
          color: point.player.color
        };
        style = options.styleModifier(style, source, target);

        // dataPoints <--wtf is this from? just sitting here....

        drawPoly(buffer, poly, 2, style.color, true);
      }
    }

    buffer.globalAlpha = 1;
    return buffer;
  }
};



var voronoiData;
function new_getVoronoiData (dataPoints, limit) {
  if (voronoiData) {
    return voronoiData;
  }
  var stars = dataPoints;
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
  var voronoi = d3.voronoi()
    .x(accessor('x'))
    .y(accessor('y'))
    .extent(extent);

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
