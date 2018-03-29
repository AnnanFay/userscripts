
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
