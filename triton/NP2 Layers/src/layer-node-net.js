
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
