map_mods.push(function alternativeFleetPaths(universe, map) {
  over(map, 'drawFleetPath', function self() {
    var paths = [];
    // path is {width, color, alpha, dash, points: [{x:,y:},{x:,y:},{x:,y:},...,{x:,y:}]}

    // self.super();
    var base_line_width, line_alpha;
    var weightedLineWidth;
    var p;
    var fleets = universe.galaxy.fleets;
    for (var i in fleets) {
      var fleet = fleets[i];
      var selected = (fleet === universe.selectedFleet);
      base_line_width = 4 * map.pixelRatio;
      weightedLineWidth = Math.max(1, 20 * fleet.st / fleet.player.total_strength) * base_line_width;
      paths.push({
        width: weightedLineWidth,
        alpha: selected ? 0.75 : 0.5,
        dash: fleet.loop ? [5, 10] : false,
        color: fleet.player.color,
        points: [fleet].concat(fleet.path)
      });
    }

    if (universe.selectedFleet) {
      var sfleet = universe.selectedFleet;
      // a white line for the selected fleet.
      base_line_width = 3 * map.pixelRatio;
      weightedLineWidth = Math.max(1, 20 * sfleet.st / sfleet.player.total_strength) * base_line_width;

      paths.push({
        width: weightedLineWidth,
        alpha: 1,
        dash: [3, 6],
        color: "#FFF",
        points: [sfleet].concat(sfleet.path)
      });
    }
    drawPaths(map, paths);
  });
});

function drawPaths (map, paths) {
  // cache as local variables
  var ctx = map.context;
  var X = map.worldToScreenX;
  var Y = map.worldToScreenY;

  // TODO: Split paths by style to improve drawing performance
  // TODO: Do not draw lines offscreen
  for (var i=0,l=paths.length;i<l;i++) {
    var path = paths[i];

    // style
    ctx.globalAlpha = path.alpha;
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;
    if (path.dash) {
      ctx.setLineDash(path.dash);
    }

    // draw path
    var ps = path.points;
    ctx.beginPath();
    ctx.moveTo(X(ps[0].x), Y(ps[0].y));
    for (var j=1,lj=ps.length; j<lj; j++) {
      ctx.lineTo(X(ps[j].x), Y(ps[j].y));
    }
    ctx.stroke();

    // cleanup
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
  }
}
