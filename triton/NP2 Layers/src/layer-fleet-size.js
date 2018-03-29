
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
