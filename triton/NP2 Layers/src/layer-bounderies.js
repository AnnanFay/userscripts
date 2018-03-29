
function scanningBoundaryLayer(ctx, data, map) {
  debug('scanningBoundaryLayer', arguments);
  var universe = data.universe;
  var players = universe.galaxy.players;
  var stars = universe.galaxy.stars;
  // var image = scale_alpha(map.scanningRangeSrc, 3);
  // var negative = scale_alpha(image, 3);

  if (universe.player){
    var playerStars = _.filter(stars, function (star) {
      return star.player && (
        star.player === universe.player ||
        universe.player.war[star.player.uid] === 0);
    });
    drawBoundary(ctx, playerStars, true, true);
  }
  // for (var i in players) {
  //   var radius = players[i].tech.scanning.value;
  //   drawBoundary(ctx, stars, players[i], radius, true, true);
  // }
  return ctx;
}
function hyperdriveBoundaryLayer(ctx, data, map) {
  log('scanningBoundaryLayer', arguments);
  var universe = data.universe;
  var players = universe.galaxy.players;
  var stars = universe.galaxy.stars;
  // var image = scale_alpha(map.scanningRangeSrc, 3);
  // var negative = scale_alpha(image, 3);

  for (var i in players) {
    var radius = players[i].tech.propulsion.value + 0.0125;
    drawBoundary(ctx, stars, players[i], radius, false, true);
  }
  return ctx;
}

function drawBoundary(ctx, stars, dashed, out) {
  log('drawScanningBoundary');

  // var buffer = canvas(overlaySize, overlaySize);
  // var bctx = buffer.getContext('2d');
  // the above is really slow!

  var canvas_offset = overlayMiddle;
  var lineWidth = 3;

  if (dashed) {
    ctx.setLineDash([6, 6]);
  }
  var star;
  var radius;
  // var radius = techValue * 250;

  for (var j in stars) {
    star = stars[j];
    radius = star.player.tech.scanning.value * 250;
    // log('strokeCircle', pointToScreen(ctx, star), radius, {color: star.player.color, width: lineWidth});
    strokeCircle(ctx, pointToScreen(ctx, star), radius, {color: star.player.color, width: lineWidth});
    // strokeCircle(ctx, star, radius, {color: 'white', width: 10});
  }
  ctx.setLineDash([]);

  if (out) {
    ctx.globalCompositeOperation = 'destination-out';
    for (var i in stars) {
      star = stars[i];
      var x = star.x * 250 + canvas_offset;
      var y = star.y * 250 + canvas_offset;
      radius = star.player.tech.scanning.value * 250;
      var cradius = radius + 1 - lineWidth;
      // log('clearCircle', x, y, cradius);
      clearCircle(ctx, x, y, cradius);
    }
  }

  // ctx.drawImage(buffer, 0, 0);
}

// function hyperdriveBoundaryLayer(ctx, data, map) {
//   debug('hyperdriveBoundaryLayer', arguments);
//   var universe = data.universe,
//     players = universe.galaxy.players,
//     stars = universe.galaxy.stars,
//     image = scale_alpha(map.fleetRangeSrc, 3),
//     negative = scale_alpha(image, 3);

//   for (var i in players) {
//     drawHyperdriveBoundary(ctx, stars, players[i], image, negative);
//   }
//   return ctx;
// }

// function scanningBoundaryLayer(ctx, data, map) {
//   debug('scanningBoundaryLayer', arguments);
//   var universe = data.universe,
//     players = universe.galaxy.players,
//     stars = universe.galaxy.stars,
//     image = scale_alpha(map.scanningRangeSrc, 3),
//     negative = scale_alpha(image, 3);

//   for (var i in players) {
//     drawScanningBoundary(ctx, stars, players[i], image, negative);
//   }
//   return ctx;
// }

// function drawHyperdriveBoundary(ctx, stars, player, image, negative) {
//   debug('drawHyperdriveBoundary', arguments);
//   var buffer = canvas(overlaySize, overlaySize);
//   var bctx = buffer.getContext('2d');
//   var player_range = tint(image, player.color);
//   var canvas_offset = overlayMiddle;

//   var star, x, y, sc, radius;

//   for (var j in stars) {
//     if (stars[j].player !== player) {
//       continue;
//     }
//     star = stars[j];
//     x = star.x * 250 + canvas_offset;
//     y = star.y * 250 + canvas_offset;
//     sc = star.player.tech.propulsion.value + 0.0125;

//     drawSprite(bctx, {
//       screenX: x,
//       screenY: y,
//       width: player_range.width,
//       height: player_range.height,
//       pivotX: player_range.width / 2,
//       pivotY: player_range.height / 2,
//       rotation: 0,
//       scale: sc,
//       image: player_range,
//       spriteX: 0,
//       spriteY: 0,
//       visible: true
//     });
//   }

//   bctx.globalCompositeOperation = 'destination-out';

//   for (var i in stars) {
//     if (stars[i].player !== player) {
//       continue;
//     }
//     star = stars[i];
//     x = star.x * 250 + canvas_offset;
//     y = star.y * 250 + canvas_offset;
//     sc = star.player.tech.propulsion.value + 0.0125;
//     radius = sc * 243;

//     clearCircle(bctx, x, y, radius);
//     drawSprite(bctx, {
//       screenX: x,
//       screenY: y,
//       width: negative.width,
//       height: negative.height,
//       pivotX: negative.width / 2,
//       pivotY: negative.height / 2,
//       rotation: 0,
//       scale: sc * 0.97,
//       image: negative,
//       spriteX: 0,
//       spriteY: 0,
//       visible: true
//     });

//   }

//   ctx.drawImage(buffer, 0, 0);
//   return ctx;
// }

// function drawScanningBoundary(ctx, stars, player, image, negative) {
//   debug('drawScanningBoundary', arguments);
//   var buffer = canvas(overlaySize, overlaySize),
//     bctx = buffer.getContext('2d'),
//     player_range = tint(image, player.color),
//     canvas_offset = overlayMiddle;

//   for (var j in stars) {
//     if (stars[j].player !== player) {
//       continue;
//     }
//     var star = stars[j],
//       x = star.x * 250 + canvas_offset,
//       y = star.y * 250 + canvas_offset,
//       sc = star.player.tech.scanning.value;

//     drawSprite(bctx, {
//       screenX: x,
//       screenY: y,
//       width: player_range.width,
//       height: player_range.height,
//       pivotX: player_range.width / 2,
//       pivotY: player_range.height / 2,
//       rotation: 0,
//       scale: sc,
//       image: player_range,
//       spriteX: 0,
//       spriteY: 0,
//       visible: true
//     });
//   }


//   bctx.globalCompositeOperation = 'destination-out';

//   for (var i in stars) {
//     if (stars[i].player !== player) {
//       continue;
//     }
//     var star = stars[i],
//       x = star.x * 250 + canvas_offset,
//       y = star.y * 250 + canvas_offset,
//       sc = star.player.tech.scanning.value,
//       radius = sc * 240;


//     clearCircle(bctx, x, y, radius);
//     drawSprite(bctx, {
//       screenX: x,
//       screenY: y,
//       width: negative.width,
//       height: negative.height,
//       pivotX: negative.width / 2,
//       pivotY: negative.height / 2,
//       rotation: 0,
//       scale: sc * 0.97,
//       image: negative,
//       spriteX: 0,
//       spriteY: 0,
//       visible: true
//     });

//   }

//   ctx.drawImage(buffer, 0, 0);
//   return ctx;
// }
