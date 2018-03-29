

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
  //   console.log('triangle', triangle);
  //   drawPoly(ctx, triangle, 5, 'pink');
  // });
  // drawPoly(ctx, voronoiData.concaveHull, 3, 'pink');
  // drawRoundPoly(ctx, voronoiData.concaveHull, {type:'stroke', width: 3, style: 'green'});


  drawPoly(ctx, hull, 2, '#880000');

  _.forEach(voronoiData.fakeStars, function(fakeStar){
    drawDot(ctx, fakeStar, 6, 'white', fakeStar.label ? fakeStar.label.toString() : '');
  });

  return ctx;
}
