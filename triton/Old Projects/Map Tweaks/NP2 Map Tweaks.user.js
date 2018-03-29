// ==UserScript==
// @name        NP2 Map Tweaks
// @description Various modification to the star map (see main description)
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game*
// @version     4
// @require     ../NP2_Mod_Framework.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals $, NP2M */
(function () {
    "strict true";

    var DEBUG   = true,
        NAME    = 'Map Tweaks',
        VERSION = '4',
        miniScanRange = "data:image/png;base64,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";

    function debug () {
        if (DEBUG) {
            console.log.apply(console, arguments);
        }
    }

    function pre_init_hook () {
        debug(NAME + ': pre_init_hook');
    }
    function post_init_hook (data) {
        debug(NAME + ': post_init_hook', data);

        var NeptunesPride   = data.NeptunesPride,
            universe        = data.universe;

        NeptunesPride.Map = NP2M.wrap(NeptunesPride.Map, function (args, map) {

            debug(NAME + ': map is ', map);
            // map.drawSprite = function (sprite) {
            // // this should speed up rendering!?
            //     if (sprite.screenY < 0 ||
            //         sprite.screenY > map.viewportHeight ||
            //         sprite.screenX < 0 ||
            //         sprite.screenX > map.viewportWidth) {
            //         return;
            //     }
            //     if (sprite.visible){
            //         map.context.save();
            //         map.context.translate(sprite.screenX, sprite.screenY);
            //         map.context.rotate(sprite.rotation);
            //         map.context.scale(sprite.scale, sprite.scale);
            //         map.context.drawImage(sprite.image, sprite.spriteX, sprite.spriteY, sprite.width, sprite.height, -sprite.pivotX, -sprite.pivotY, sprite.width , sprite.height);
            //         map.context.restore();
            //     }
            // };

    // map.updateSpritePositions = function () {
    //     var i = 0, leni = 0;
    //     var star = {}, fleet = {}, ring = {}, ripple = {};
    //     var tx, ty;

    //     for (i in universe.galaxy.stars) {
    //         star = universe.galaxy.stars[i];

    //         tx = (star.x * map.scale + map.sx) * map.pixelRatio;
    //         ty = (star.y * map.scale + map.sy) * map.pixelRatio;

    //         // BOUND CHECKING
    //         if (    ty < 0 ||
    //                 ty > map.viewportHeight ||
    //                 tx < 0 ||
    //                 tx > map.viewportWidth) {
    //             star.sprite.visible = false;
    //             if (star.spriteOwner) {
    //                 star.spriteOwner.visible = false;
    //             }
    //             if (star.spriteGate) {
    //                 star.spriteGate.visible = false;
    //             }
    //             if (star.halo) {
    //                 star.halo.visible = false;
    //             }
    //             //continue;
    //         } else {
    //             star.sprite.visible = true;
    //             if (star.spriteOwner) {
    //                 star.spriteOwner.visible = true;
    //             }
    //             if (star.spriteGate) {
    //                 star.spriteGate.visible = true;
    //             }
    //             if (star.halo) {
    //                 star.halo.visible = true;
    //             }
    //         }

    //         if (star.sprite){
    //             star.sprite.screenX = tx;
    //             star.sprite.screenY = ty;
    //             star.sprite.scale = 0.75 * map.pixelRatio;
    //             if (map.scale < 350) {
    //                 star.sprite.scale = 0.75 * map.pixelRatio;
    //             }
    //             if (map.scale < 250) {
    //                 star.sprite.scale = 0.5 * map.pixelRatio;
    //             }
    //         }

    //         if (star.halo) {
    //             star.halo.screenX = tx;
    //             star.halo.screenY = ty;
    //         }

    //         if (star.spriteBg) {
    //             star.spriteBg.screenX = tx * star.spriteBgZ;
    //             star.spriteBg.screenY = ty * star.spriteBgZ;
    //             star.spriteBg.scale = (map.scale / 400) * map.pixelRatio;
    //         }

    //         if (star.spriteOwner) {
    //             star.spriteOwner.screenX = tx;
    //             star.spriteOwner.screenY = ty;
    //             star.spriteOwner.scale = 1 * map.pixelRatio;
    //             if (map.scale < 350) {
    //                 star.spriteOwner.scale = 0.75 * map.pixelRatio;
    //             }
    //             if (map.scale < 250) {
    //                 star.spriteOwner.scale = 0.5 * map.pixelRatio;
    //             }
    //         }

    //         if (star.spriteGate) {
    //             star.spriteGate.screenX = tx;
    //             star.spriteGate.screenY = ty;
    //             star.spriteGate.scale = 2 * map.pixelRatio;
    //             if (map.scale < 350) {
    //                 star.spriteGate.scale = 1.75 * map.pixelRatio;
    //             }
    //             if (map.scale < 250) {
    //                 star.spriteGate.scale = 1.25 * map.pixelRatio;
    //             }
    //         }
    //     }

    //     for (i in universe.galaxy.fleets) {
    //         fleet = universe.galaxy.fleets[i];
    //         tx = (fleet.x * map.scale + map.sx) * map.pixelRatio;
    //         ty = (fleet.y * map.scale + map.sy) * map.pixelRatio;

    //         // BOUND CHECKING
    //         if (    ty < 0 ||
    //                 ty > map.viewportHeight ||
    //                 tx < 0 ||
    //                 tx > map.viewportWidth) {
    //             fleet.sprite.visible = false;
    //             if (fleet.spriteOwner) {
    //                 fleet.spriteOwner.visible = false;
    //             }
    //             //continue;
    //         } else {
    //             fleet.sprite.visible = true;
    //             if (fleet.spriteOwner) {
    //                 fleet.spriteOwner.visible = true;
    //             }
    //         }

    //         fleet.sprite.screenX = tx;
    //         fleet.sprite.screenY = ty;
    //         fleet.sprite.scale = 0.65 * map.pixelRatio;
    //         if (map.scale < 350) {
    //             fleet.sprite.scale = 0.5 * map.pixelRatio;
    //         }
    //         if (map.scale < 250) {
    //             fleet.sprite.scale = 0.5 * map.pixelRatio;
    //         }
    //         if (fleet.loop) {
    //             fleet.sprite.scale /= 1.25;
    //         }


    //         if (fleet.spriteOwner) {
    //             fleet.spriteOwner.screenX = tx;
    //             fleet.spriteOwner.screenY = ty;
    //             fleet.spriteOwner.scale = 1 * map.pixelRatio;
    //             if (map.scale < 350) {
    //                 fleet.spriteOwner.scale = 0.75 * map.pixelRatio;
    //             }
    //             if (map.scale < 250) {
    //                 fleet.spriteOwner.scale = 0.5 * map.pixelRatio;
    //             }
    //             if (fleet.loop) {
    //                 fleet.spriteOwner.scale /= 1.25;
    //             }
    //         }

    //     }

    //     for (i = 0, leni = map.ripples.length; i < leni; i += 1) {
    //         ripple = map.ripples[i];
    //         ripple.x = (ripple.galaxyX * map.scale + map.sx) * map.pixelRatio;
    //         ripple.y = (ripple.galaxyY * map.scale + map.sy) * map.pixelRatio;
    //     }
    // };


















            // when a star is selected this draws mini scan and hyperspace ranges
            // around stars

            var miniScanRangeImage = new Image();
            miniScanRangeImage.src = miniScanRange;

            map.drawStars = function () {
              function draw(sprite) {
                  // TODO: test the speed difference using save restore and inverse scale
                  //map.context.save();
                  map.context.scale(sprite.scale, sprite.scale);
                  map.context.drawImage(sprite.image, sprite.spriteX, sprite.spriteY, sprite.width, sprite.height, -sprite.pivotX, -sprite.pivotY, sprite.width , sprite.height);
                  map.context.scale(1/sprite.scale, 1/sprite.scale);
                  //map.context.restore();
              }

              var star;
              for (var i = map.startVisisbleStarIndex, ii = map.endVisisbleStarIndex; i < ii; i++) {
                  star = map.sortedStarSprites[i];
                  // map.debugDrawNeighbours(star.uid);
                  if (star.visible){
                      map.context.save();
                      map.context.translate(star.screenX, star.screenY);
                      if (star.resources && !map.miniMapEnabled && map.scale > 375) {
                          draw(star.resources);
                      }
                      if (star.gate) draw(star.gate);
                      if (star.star) draw(star.star);
                      if (star.ownership) draw(star.ownership);
                      if (star.alliedOwnership) {
                          for (var j = 0; j < star.alliedOwnership.length; j+=1) {
                              draw(star.alliedOwnership[j]);
                          }
                      }
                      if (star.waypoint) draw(star.waypoint);
                      if (star.waypointGate) draw(star.waypointGate);
                      if (star.waypointNext) {
                          star.waypointNext.scale = map.waypointOriginScale;
                          draw(star.waypointNext);
                      }
                      map.context.restore();
                  }
              }







                // var star, stars = universe.galaxy.stars,
                //     so          = universe.selectedStar,
                //     scanRange, hyperspaceRange, miniScanSprite, miniRangeSprite;

                // var minis = false;
                // if (so && map.scale >= 150) {
                //     var minis       = true,
                //         player      = (so.player || universe.player);
                //     scanRange       = player.tech.scanning.value;
                //     hyperspaceRange = player.tech.propulsion.value;

                //     // easier to calculate ourself
                //     var scale = map.pixelRatio
                //     if (map.scale < 250) {
                //         scale *= 0.5;
                //     } else if (map.scale < 350) {
                //         scale *= 0.75;
                //     }

                //     miniScanSprite  = {
                //         screenX: undefined,
                //         screenY: undefined,
                //         width: miniScanRangeImage.width,
                //         height: miniScanRangeImage.height,
                //         pivotX: miniScanRangeImage.width/2,
                //         pivotY: miniScanRangeImage.height/2,
                //         rotation: map.scanRotation,
                //         scale: scale,
                //         image: miniScanRangeImage,
                //         spriteX: 0,
                //         spriteY: 0,
                //         visible: true
                //     };
                //     miniRangeSprite = {
                //         screenX: undefined,
                //         screenY: undefined,
                //         width: 128,
                //         height: 128,
                //         pivotX: 64,
                //         pivotY: 64,
                //         rotation: 0,
                //         scale: scale * 0.35 * map.pixelRatio,
                //         image: map.fleetWaypointSrc,
                //         spriteX: 0,
                //         spriteY: 0,
                //         visible: true
                //     };
                // }

                // for (var i in stars) {
                //     star = stars[i];
                //     map.drawSprite(star.sprite);

                //     // TODO: Optimise this
                //     if (minis && so !== star) {
                //         var dist = universe.distance(so.x, so.y, star.x, star.y);

                //         if (dist > scanRange && dist > hyperspaceRange) {
                //             continue;
                //         }

                //         miniRangeSprite.screenX = miniScanSprite.screenX =
                //                 (star.x * map.scale + map.sx) * map.pixelRatio;
                //         miniRangeSprite.screenY = miniScanSprite.screenY =
                //                 (star.y * map.scale + map.sy) * map.pixelRatio;

                //         if (dist <= scanRange) {
                //             map.drawSprite(miniScanSprite);
                //         }
                //         if (dist <= hyperspaceRange) {
                //             map.drawSprite(miniRangeSprite);
                //         }
                //     }
                // }
            };

            // map.drawScanningRange = function () {
            //     if (!universe.selectedStar) {
            //         return;
            //     }
            //     var player = universe.selectedStar.player || universe.player;
            //     var scanRange = player.tech.scanning.value;
            //     if (map.scale < 150) return;

            //     var so = universe.selectedStar;
            //     var tx = (so.x * map.scale + map.sx) * map.pixelRatio;
            //     var ty = (so.y * map.scale + map.sy) * map.pixelRatio;
            //     var sc = scanRange * map.scale * map.pixelRatio / 250;

            //     map.drawSprite({
            //             screenX: tx,
            //             screenY: ty,
            //             width: 576, // magic numbers, yay!
            //             height: 576,
            //             pivotX: 288,
            //             pivotY: 288,
            //             rotation: map.scanRotation,
            //             scale: sc,
            //             image: map.scanningRangeSrc,
            //             spriteX: 0,
            //             spriteY: 0,
            //             visible: true});
            // };

            return map;
        });
    }

    NP2M.register(NAME, VERSION, pre_init_hook, post_init_hook);
})();
