# DEFUNCT DO NOT USE

function scanningBoundaryLayer(ctx, data, map, config) {
  debug('scanningBoundaryLayer', arguments);
  var universe = data.universe;
  var players = universe.galaxy.players;
  var stars = universe.galaxy.stars;
  // var image = scale_alpha(map.scanningRangeSrc, 3);
  // var negative = scale_alpha(image, 3);

  for (var i in players) {
    var radius = players[i].tech.scanning.value;
    drawBoundary(ctx, stars, players[i], radius, true, config);
  }
  return ctx;
}
function hyperdriveBoundaryLayer(ctx, data, map, config) {
  debug('scanningBoundaryLayer', arguments);
  var universe = data.universe;
  var players = universe.galaxy.players;
  var stars = universe.galaxy.stars;
  // var image = scale_alpha(map.scanningRangeSrc, 3);
  // var negative = scale_alpha(image, 3);

  for (var i in players) {
    var radius = players[i].tech.propulsion.value + 0.0125;
    drawBoundary(ctx, stars, players[i], radius, false, config);
  }
  return ctx;
}

function drawBoundary(ctx, stars, player, techValue, dashed, config) {
  debug('drawScanningBoundary', arguments);

  var buffer = canvas(config.overlaySize, config.overlaySize);
  var bctx = buffer.getContext('2d');
  var canvas_offset = config.overlayMiddle;
  var lineWidth = 3;

  if (dashed) {
    bctx.setLineDash([6, 6]);
  }

  var radius = techValue * 250;
  for (var j in stars) {
    if (stars[j].player !== player) {
      continue;
    }
    var star = stars[j];
    // console.log('strokeCircle', bctx, x, y, radius, {color: player.color, width: 3});
    strokeCircle(bctx, star, radius, {color: player.color, width: lineWidth});
    // strokeCircle(bctx, star, radius, {color: 'white', width: 10});
  }
  bctx.setLineDash([]);


  bctx.globalCompositeOperation = 'destination-out';
  for (var i in stars) {
    if (stars[i].player !== player) {
      continue;
    }
    star = stars[i];
    var x = star.x * 250 + canvas_offset;
    var y = star.y * 250 + canvas_offset;
    var sc = star.player.tech.scanning.value;
    var cradius = radius + 1 - lineWidth;
    clearCircle(bctx, x, y, cradius);
  }

  ctx.drawImage(buffer, 0, 0);
  return ctx;
}

function highDrawScanningBoundary(ctx, stars, player, image, negative) {
  debug('drawScanningBoundary', arguments);
  var buffer = canvas(config.overlaySize, config.overlaySize);
  var bctx = buffer.getContext('2d');
  var player_range = tint(image, player.color);
  var canvas_offset = config.overlayMiddle;
  var star, x, y, sc;
  for (var j in stars) {
    if (stars[j].player !== player) {
      continue;
    }
    star = stars[j];
    x = star.x * 250 + canvas_offset;
    y = star.y * 250 + canvas_offset;
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
    star = stars[i];
    x = star.x * 250 + canvas_offset;
    y = star.y * 250 + canvas_offset;
    sc = star.player.tech.scanning.value;
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
