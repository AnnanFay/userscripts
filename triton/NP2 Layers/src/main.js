// some globals
var layers = {};

// slight optimisation
var sqrt = Math.sqrt;

function universe_distance(x1, y1, x2, y2) {
  var xd = x1 - x2;
  var yd = y1 - y2;
  return sqrt((xd * xd) + (yd * yd));
}
// NOT USED. potentially faster......
function shitty_distance(x1, y1, x2, y2) {
  var xd = x1 - x2;
  var yd = y1 - y2;
  return 0.394 * (dx + dy) + 0.554 * max(dx, dy);
}

/*******************/
/* LAYER FRAMEWORK */
/*******************/
function registerLayer(Mousetrap, npui, layerConf) {
  // we don't want users to accidentally activate experimental layers
  if (layerConf.hidden && !debug_level) return;

  Mousetrap.bind(layerConf.hotkey, function () {
    npui.trigger('toggle_layer_setting', {
      settingName: layerConf.setting
    });
  });
}

function getLayer(data, map, layerConstructor) {
  debug('getLayer', arguments);
  var map_canvas = map.context.canvas;
  var buffer = canvas(overlaySize, overlaySize);
  var bctx = buffer.getContext('2d');
  layerConstructor(bctx, data, map);
  return buffer;
}

function drawLayer(map, layer) {
  var width = layer.width;
  var height = layer.height;
  var scale = map.pixelRatio * map.scale / 250;
  var sprite = {
    screenX: map.sx * map.pixelRatio,
    screenY: map.sy * map.pixelRatio,
    width: width,
    height: height,
    pivotX: width / 2,
    pivotY: height / 2,
    rotation: 0,
    scale: scale,
    image: layer,
    spriteX: 0,
    spriteY: 0,
    visible: true
  };

  // log('layer sprite:', sprite);

  map.drawSprite(sprite);
}

function constructQuadtree(universe) {
  var stars = _.toArray(universe.galaxy.stars);
  var fleets = _.toArray(universe.galaxy.fleets);
  var objects = [].concat(stars, fleets);

  return d3.geom.quadtree()
    .x(accessor('x'))
    .y(accessor('y'))
    (objects);
}


// FIXME: Stop passing so many objects around!!!
function registerOptions(npui, universe, Crux) {
  npui.OptionsScreen = NP2M.wrap(npui.OptionsScreen, function (args, optionsScreen) {
    log('npui.OptionsScreen', optionsScreen);

    OptionsLayers(universe, Crux)
      .roost(optionsScreen);

    return optionsScreen;
  });
}

/*******************/
/*    MOD HOOKS    */
/*******************/

function pre_init_hook() {
  if (profiling) {
    console.profile('Layers Profiling');
  }
  log('LAYERS: pre_init_hook');
}

var layerCache = {};

function resetLayerCache() {
  // reset layer cache when data is updated
  log('Invalidating layer cache!');
  layerCache = {};
  voronoiData = undefined;
}

function drawCircularRuler(map, universe) {
  // if (map.scale < 50) { return; }

  var centre;
  if (universe.selectedFleet) {
    centre = universe.selectedFleet.lastStar;
  }
  if (universe.selectedStar) {
    centre = universe.selectedStar;
  }
  if (!centre) return;

  // map.fleetRangeSprite.scale = (universe.player.tech.propulsion.value + 0.0125) * map.scale * map.pixelRatio / 250;
  // map.fleetRangeSprite.scale = (universe.selectedStar.player.tech.propulsion.value + 0.0125) * map.scale * map.pixelRatio / 250;
  // map.scanningRangeSprite.scale = universe.selectedStar.player.tech.scanning.value * map.scale * map.pixelRatio / 250;

  // map.drawSprite(map.scanningRangeSprite);
  var color, lineWidth;
  var jumpTicks = NeptunesPride.gameConfig.turnJumpTicks;
  var normalJump = (jumpTicks/3);
  var radius = Math.max(jumpTicks, universe.selectedStar.player.tech.scanning.value / du);

  for (var i = 1; i <= radius; i++) {
    // light speed travel in jump
    if (i % jumpTicks === 0) {
      color = '#51f';
      lineWidth = 2;
    // normal travel in jump
    } else if (i % normalJump === 0 && i < jumpTicks) {
      color = '#20f';
      lineWidth = 2;
    // other light years
    } else {
      color = '#205';
      lineWidth = 1;
    }
    var r = i * du * map.scale * map.pixelRatio;
    strokeCircle(map.context, map.worldToScreen(centre), r, {
      color: color,
      width: lineWidth
    });
  }
}

function makeAndDrawLayer(npGlobals, universe, npui, map, layerConf) {
  if (universe.interfaceSettings[layerConf.setting]) {
    if (!layerCache[layerConf.setting]) {
      log('getting layer', layerConf.name);
      try {
        layerCache[layerConf.setting] = getLayer(npGlobals, map, layerConf.constructor);
        log('drawing layer', layerConf.name);
      } catch (e) {
        console.error(e);
        return;
      }
    }

    drawLayer(map, layerCache[layerConf.setting]);
  }
}

function mapCreationHandler(npGlobals, universe, npui, map) {

  layers.quadtree = constructQuadtree(universe);
  log('universe quadtree', layers.quadtree);

  universe.addGalaxy = NP2M.wrap(universe.addGalaxy, function (args, ret) {
    resetLayerCache();
    return ret;
  });

  // map.on('map_refresh', resetLayerCache);
  map.on('map_rebuild', function () {
    log('event: map_rebuild');
  });
  map.on('map_refresh', function () {
    log('event: map_refresh');
  });
  // map.createSprites = NP2M.wrap(map.createSprites, function(args, ret) {return ret;});

  // WARNING: This is called every time the map is zoomed, moved or updated!



    map.draw = function () {

        map.context.lineCap = "round";
        if (map.scale !==  map.scaleTarget) {
            map.zoom(map.scaleTarget - map.scale);
        }

        map.calcWorldViewport();
        map.calcVisibleRange();
        map.calcVisibleStarsAndFleets();

        map.updateSpritePositions();

        map.context.fillStyle = "#000000";
        map.context.globalAlpha = 1;
        map.context.fillRect(0, 0, map.viewportMask.w, map.viewportMask.h);

        if (!map.miniMapEnabled) {
            map.drawNebular();
        }
        map.drawSelectionRing();

        if (universe.interfaceSettings.showRipples && !map.miniMapEnabled) {
           map.drawRipples();
        }

        map.drawStars();

        map.drawScanningRange();
        map.drawStarFleetRange();

        if (universe.interfaceSettings.showFleets && !map.miniMapEnabled) {
            map.drawFleetRange();
            map.drawFleetPath();
            map.drawOrbitingFleets();
            map.drawFleets();
        }

        if (universe.editMode === "ruler") {
            map.drawRuler();
        }

        map.drawText();

        map.context.globalAlpha = 1;
    };


  var originalMapDraw = map.draw;
  map.draw = function () {
    var returnValue = originalMapDraw.apply(this, arguments);
    for (var i = 0, l = layerConfigs.length; i < l; i++) {
      makeAndDrawLayer(npGlobals, universe, npui, map, layerConfigs[i]);
    }
    drawCircularRuler(map, universe);
    return returnValue;
  };

  // map.draw = function () {
  //   map.context.lineCap = "round";
  //   if (map.scale !== map.scaleTarget) {
  //     map.zoom(map.scaleTarget - map.scale);
  //   }

  //   map.calcWorldViewport();
  //   map.calcVisibleRange();
  //   map.calcVisibleStarsAndFleets();

  //   map.updateSpritePositions();

  //   // map.context.fillStyle = "#000000";
  //   // map.context.globalAlpha = 1;
  //   // map.context.fillRect(0, 0, map.viewportMask.w, map.viewportMask.h);
  //   map.context.clearRect(0, 0, map.viewportMask.w, map.viewportMask.h);

  //   if (!map.miniMapEnabled) {
  //     _.defer(map.drawNebular);
  //   }
  //   _.defer(map.drawSelectionRing);

  //   if (universe.interfaceSettings.showRipples && !map.miniMapEnabled) {
  //     _.defer(map.drawRipples);
  //   }

  //   _.defer(map.drawStars);
  //   _.defer(map.drawScanningRange);
  //   _.defer(map.drawStarFleetRange);

  //   if (universe.interfaceSettings.showFleets && !map.miniMapEnabled) {
  //     _.defer(map.drawFleetRange);
  //     _.defer(map.drawFleetPath);
  //     _.defer(map.drawOrbitingFleets);
  //     _.defer(map.drawFleets);
  //   }

  //   if (universe.editMode === "ruler") {
  //     _.defer(map.drawRuler);
  //   }

  //   _.defer(map.drawText);

  //   map.context.globalAlpha = 1;
  // };
  // FIXME: Stop passing so many objects around!!!
  registerOptions(npui, universe, npGlobals.Crux);


  function onToggleLayoutSetting(event, data) {
    var settingName = data.settingName;
    var enabled = !universe.interfaceSettings[settingName];
    log('onToggleLayoutSetting', arguments, enabled);
    universe.setInterfaceSetting(settingName, enabled);
    map.trigger('map_refresh');
  }

  npui.on('toggle_layer_setting', onToggleLayoutSetting);

  // map.drawSprite = NP2M.wrap(map.drawSprite, function (args, ret) {
  //     debug('drawing sprites', arguments);
  //     return ret;
  // });

  // reregister draw function
  Crux.tickCallbacks.pop();
  Crux.tickCallbacks.push(map.draw);
}

function post_init_hook(npGlobals) {
  log('LAYERS: post_init_hook', npGlobals);
  var universe = npGlobals.universe;
  var npui = npGlobals.npui;

  // slight optimisation
  universe.distance = universe_distance;
  universe.isInRange = function isInRange(u1, u2, range) {
    var dx = (u1.x - u2.x);
    var dy = (u1.y - u2.y);
    if (Math.abs(dx) >= range || Math.abs(dy) >= range) {
      // outside bounding square
      return false;
    }
    var range2 = range * range;
    var dist2 = (dx * dx + dy * dy);
    if (dist2 <= range2) {
      return true;
    }
    return false;
  };
  layerConfigs.forEach(function (layerConf) {
    registerLayer(npGlobals.Mousetrap, npGlobals.npui, layerConf);
  });

  NeptunesPride.Map = NP2M.wrap(NeptunesPride.Map, function (args, map) {
    log('NeptunesPride.map', map);
    layers.map = map;

    map.worldToScreen = function worldToScreen(p) {
      return [map.worldToScreenX(p.x || p[0]), map.worldToScreenY(p.y || p[1])];
    };

    mapCreationHandler(npGlobals, universe, npGlobals.npui, map);

    // window.addEventListener("mousedown", function (e) {
    //   console.log('mousedown');
    //   // console.profile('Click Profile');
    //   // map.one("mouseup",
    //   setTimeout(function () {
    //     // console.profileEnd();
    //   }, 1000);
    // });



    map.outsideScreen = function (screenX, screenY) {
      return screenX < 0 || screenY < 0 || screenX > npui.width || y > npui.height;
    };


    // map.drawFleetPath = function () {
    //   var i, j, p, fleet, fleetScreenX, fleetScreenY;
    //   var fleetIsOutOfBounds;
    //   for (i in universe.galaxy.fleets) {
    //     fleetIsOutOfBounds = true;
    //     fleet = universe.galaxy.fleets[i];

    //     fleetScreenX = map.worldToScreenX(fleet.x);
    //     fleetScreenY = map.worldToScreenY(fleet.y);
    //     if (!map.outsideScreen(fleetScreenX, fleetScreenY)) {
    //       fleetIsOutOfBounds = false;
    //     }
    //     var a = 0.5,
    //       lw = 4;

    //     if (!fleet.orbiting && fleet.path.length) {
    //       // in the pipe
    //       a = 0.75;
    //       lw = 12;
    //       if (fleet === universe.selectedFleet) {
    //         a = 0.75;
    //         lw = 16;
    //       }

    //       var ts = fleet.path[0];
    //       var tsx = map.worldToScreenX(ts.x);
    //       var tsy = map.worldToScreenY(ts.y);
    //       if (fleetIsOutOfBounds && !map.outsideScreen(tsx, tsy)) {
    //         fleetIsOutOfBounds = false;
    //       }

    //       if (!fleetIsOutOfBounds) {
    //         map.context.globalAlpha = a;
    //         map.context.strokeStyle = "rgba(255, 255, 255, 0.35)";
    //         map.context.lineWidth = lw * map.pixelRatio;
    //         map.context.beginPath();
    //         map.context.moveTo(fleetScreenX, fleetScreenY);
    //         map.context.lineTo(tsx, tsy);
    //         map.context.stroke();
    //       }
    //     }

    //     a = 0.5;
    //     lw = 4;
    //     if (fleet === universe.selectedFleet) {
    //       a = 0.75;
    //       lw = 8;
    //     }

    //     if (fleet.loop) {
    //       map.context.setLineDash([5, 10]);
    //     }
    //     map.context.globalAlpha = a;
    //     map.context.strokeStyle = fleet.player.color;
    //     map.context.lineWidth = lw * map.pixelRatio;
    //     map.context.beginPath();
    //     map.context.moveTo(fleetScreenX, fleetScreenY);

    //     var path = fleet.path;
    //     for (j = 0; j < path.length; j += 1) {
    //       var currentX = map.worldToScreenX(path[j].x);
    //       var currentY = map.worldToScreenY(path[j].y);
    //       if (fleetIsOutOfBounds && !map.outsideScreen(currentX, currentY)) {
    //         fleetIsOutOfBounds = false;
    //       }
    //       map.context.lineTo(currentX, currentY);
    //     }
    //     if (!fleetIsOutOfBounds) {
    //       map.context.stroke();
    //     }
    //     map.context.setLineDash([]);
    //   }


    //   map.context.globalAlpha = 1;


    //   if (universe.selectedFleet) {
    //     var selectedFleet = universe.selectedFleet;
    //     // a white line for the selected fleet.
    //     map.context.setLineDash([3, 6]);
    //     map.context.globalAlpha = 1;
    //     map.context.strokeStyle = "#FFFFFF";
    //     map.context.lineWidth = 3 * map.pixelRatio;
    //     map.context.beginPath();
    //     map.context.moveTo(map.worldToScreenX(selectedFleet.x), map.worldToScreenY(selectedFleet.y));

    //     var path = selectedFleet.path;
    //     for (j = 0; j < path.length; j += 1) {
    //       var currentX = map.worldToScreenX(path[j].x);
    //       var currentY = map.worldToScreenY(path[j].y);
    //       if (fleetIsOutOfBounds && !map.outsideScreen(currentX, currentY)) {
    //         fleetIsOutOfBounds = false;
    //       }
    //       map.context.lineTo(currentX, currentY);
    //     }
    //     if (!fleetIsOutOfBounds) {
    //       map.context.stroke();
    //     }
    //     map.context.setLineDash([]);
    //   }

    // };


    map.createSpritesFleets = function () {
      var i, j, r, sprite, fleet, fleetj, inRange;
      var fleetSprites, row, col;
      var fleets = universe.galaxy.fleets;

      var sortedFleetSprites = [];
      var sortedFleetYPos = [];
      var fleetScale = 0.75 * map.pixelRatio;

      for (i in fleets) {
        // add a show strength property.
        // this is used so that overlapping fleets can have strength numbers combined.
        fleets[i].showStrength = !fleets[i].orbiting;
      }

      for (i in fleets) {
        fleet = fleets[i];
        fleetSprites = {};

        fleetSprites.worldX = fleet.x;
        fleetSprites.worldY = fleet.y;
        fleetSprites.screenX = map.worldToScreenX(fleetSprites.worldX);
        fleetSprites.screenY = map.worldToScreenY(fleetSprites.worldY);

        fleetSprites.visible = true;
        fleetSprites.strength = fleet.st;
        fleetSprites.showStrength = fleet.showStrength;
        fleetSprites.loop = fleet.loop;

        fleetSprites.name = fleet.n;
        fleetSprites.colorName = fleet.player ? fleet.player.colorName : '';
        fleetSprites.playerAlias = fleet.player ? fleet.player.alias : '';


        fleetSprites.fleet = null;
        fleetSprites.ownership = null;

        if (!fleet.orbiting) {
          // rotation
          r = map.calcFleetAngle(fleet);
          fleetSprites.fleet = {
            width: 64,
            height: 64,
            pivotX: 32,
            pivotY: 32,
            rotation: r,
            scale: fleetScale,
            image: map.starSrc,
            spriteX: 128,
            spriteY: 0
          };

          // ownership
          if (fleet.puid >= 0) {
            row = Math.floor(fleet.puid / 8);
            col = Math.floor(fleet.puid % 8);
            fleetSprites.ownership = {
              width: 64,
              height: 64,
              pivotX: 32,
              pivotY: 32,
              rotation: 0,
              scale: map.pixelRatio, // * 1,
              image: map.starSrc,
              spriteX: row * 64,
              spriteY: col * 64 + 64
            };
          }
        }

        // look at all other fleets and if they are very close,
        // add their strength to mine
        // and don't show their  strength
        if (!fleet.orbiting && fleet.showStrength) {
          for (j in universe.galaxy.fleets) {
            var otherFleet = universe.galaxy.fleets[j];
            if (otherFleet.orbiting) continue;
            if (fleet === otherFleet) continue;
            if (fleet.puid !== otherFleet.puid) continue;
            if (universe.isInRange(fleet, otherFleet, 0.0125)) {
              fleetSprites.strength += otherFleet.st;
              otherFleet.showStrength = false;
            }
          }
        }

        sortedFleetSprites.push(fleetSprites);
        sortedFleetYPos.push(fleetSprites.worldY);
      }

      sortedFleetSprites.sort(function (a, b) {
        return a.worldY - b.worldY;
      });
      sortedFleetYPos.sort(function (a, b) {
        return a - b;
      });

      map.sortedFleetSprites = sortedFleetSprites;
      map.sortedFleetYPos = sortedFleetYPos;
    };


    map.createSprites = function fuck() {
      if (!universe.galaxy.stars) {
        return;
      }
      _.defer(map.createEssentialSprites);
      _.defer(map.createSpritesStars);
      _.defer(map.createSpritesFleets);
      _.defer(map.createSpritesNebular);
      //map.createSpritesOwnershipRings();

      Crux.drawReqired = true;
    };

    replaceWidgetHandlers(map, 'map_rebuild', map.createSprites);

    map.drawScanningRange = function () {
        if (!universe.selectedStar) return;
        if (map.scale < 150) return;

        var star = universe.selectedStar;
        var player = star.player || universe.player;


        map.scanningRangeSprite.screenX = map.worldToScreenX(star.x);
        map.scanningRangeSprite.screenY = map.worldToScreenY(star.y);
        map.scanningRangeSprite.scale = player.tech.scanning.value * map.scale * map.pixelRatio / 250;

        map.drawSprite(map.scanningRangeSprite);
    };




    map.drawStars = function () {
        var i, ii, j, star;
        var context = map.context;
        var stars = universe.galaxy.stars;
        function draw(sprite) {
            // TODO: test the speed difference using save restore and inverse scale
            //map.context.save();
            context.scale(sprite.scale, sprite.scale);
            context.drawImage(sprite.image, sprite.spriteX, sprite.spriteY, sprite.width, sprite.height, -sprite.pivotX, -sprite.pivotY, sprite.width , sprite.height);
            context.scale(1/sprite.scale, 1/sprite.scale);
            //map.context.restore();
        }

        for (i = map.startVisisbleStarIndex, ii = map.endVisisbleStarIndex; i < ii; i+=1) {
            star = map.sortedStarSprites[i];
            // map.debugDrawNeighbours(star.uid);
            if (star.visible) {
                context.save();
                context.translate(star.screenX, star.screenY);

                if (stars[star.uid].player && stars[star.uid].player.conceded) {
                  context.globalAlpha = 0.3;
                } else {
                  context.globalAlpha = 1;
                }

                if (star.resources && !map.miniMapEnabled && map.scale > 375) {
                    draw(star.resources);
                }
                if (star.gate) draw(star.gate);
                if (star.star) draw(star.star);
                if (star.ownership) draw(star.ownership);
                if (star.alliedOwnership) {
                    for (j = 0; j < star.alliedOwnership.length; j+=1) {
                        draw(star.alliedOwnership[j]);
                    }
                }
                if (star.waypoint) draw(star.waypoint);
                if (star.waypointGate) draw(star.waypointGate);
                if (star.waypointNext) {
                    star.waypointNext.scale = map.waypointOriginScale;
                    draw(star.waypointNext);
                }
                context.restore();
            }
        }
        context.globalAlpha = 1;
    };







    return map;
  });

  if (profiling) {
    console.log('Layers ending profile!');
    setTimeout(console.profileEnd, 12000);
  }
}

NP2M.register('NP2 Layers', '1', pre_init_hook, post_init_hook);
