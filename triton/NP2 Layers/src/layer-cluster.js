

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
