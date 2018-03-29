// map init
map.context.lineCap = "round";
map.sprites = {};
map.objects = {};

// takes a position object or other object with x and y. Returns screen coordinates.
function spaceToScreen(pos) {
    var x = pos.x ? pos.x : pos[0],
        y = pos.y ? pos.y : pos[1];
    return {
        x: (x * map.scale + map.sx) * map.pixelRatio,
        y: (y * map.scale + map.sy) * map.pixelRatio
    }
}

// offset, dim and pivot are optional
map.addSprite = function(id, image, offset, dim, pivot) {
    map.sprites[id] = {
        image: image,
        offset: offset,
        dim: dim,
        pivot: pivot
    };
};

map.addObject = function(id, object) {
    // var sprites = object.sprites,
    //     screenPos = spaceToScreen(object.pos);
    map.objects[id] = object;
}

map.addSprites = function() {
    // Background
    map.addSprite('neb1', map.starBgSrc1);
    map.addSprite('neb2', map.starBgSrc2);
    map.addSprite('neb3', map.starBgSrc3);
    map.addSprite('neb4', map.starBgSrc4);

    map.addSprite('white-star', map.starSrc, [0, 0], [64, 64]);
    map.addSprite('black-star', map.starSrc, [64, 0], [64, 64]);
    map.addSprite('resource-ring', map.haloSrc);
    map.addSprite('star-selected', map.ringSrc);

    // Ownership Rings
    var i, row, col, offset;
    for (i = 0; i < 64; i++) {
        row = Math.floor(i / 8);
        col = i % 8;
        offset = [row * 64, col * 64 + 64];
        map.addSprite('player-' + i, map.starSrc, offset, [64, 64]);
    }

    // Warp Gates
    for (i = 0; i < 8; i++) {
        offset = [8 * 64, col * 64 + 64];
        map.addSprite('gate-' + i, map.starSrc, offset, [64, 64]);
    }

    // map.fleetRangeSrc = document.getElementById("img_fleet_range");
    // map.scanningRangeSrc = document.getElementById("img_scanning_range");
    // map.fleetWaypointSrc = document.getElementById("img_fleet_waypoint");
    // map.selectionRingSrc = document.getElementById("img_selection_ring");
}

map.addObjects = function() {
    // for each object, first update it so it has sufficient render data
    // then pass to addObject.

    //todo: when 'drawing' stuff scale 'object.scale' by map.pixelRatio.
    var scale, i, star, stars = universe.galaxy.stars;
    for (i in stars) {
        var star = stars[i];

        star.sprites = [];

        // if it's outside of our scan range
        if (universe.galaxy.stars[i].v === "0") {
            star.sprites.push(['black-star', 1]);
        } else {
            star.sprites.push(['white-star', 1]);
        }

        // player owned
        if (star.puid >= 0) {
            star.sprites.push('player-' + star.puid)
            if (star.ga) {
                star.sprites.push(['gate-' + Math.floor(star.puid / 8), 1]);
            }
        }

        // natural resources
        if (star.r > 0) {
            var scale = ((universe.galaxy.stars[i].nr + 12) / 48);
            star.sprites.push(['resource-ring', scale]);
        }
        addObject(star);
    }

    // for (var i in universe.galaxy.fleets) {
    //     var fleet = universe.galaxy.fleets[i];

    //     addObject(fleet);
    // }
}

map.createSpritesNebular = function() {
    var i, sprite;

    var neb;
    var neb_count = 0;
    var neb_choice = 1;

    for (i in universe.galaxy.stars) {
        neb_count += 1;
        if (neb_count > 6) {
            neb_count = 0;
            neb_choice += 1;

            if (neb_choice > 6) {
                neb_choice = 0;
            }
            if (neb_choice === 0) {
                neb = map.starBgSrc2;
            }
            if (neb_choice === 1) {
                neb = map.starBgSrc1;
            }
            if (neb_choice === 2) {
                neb = map.starBgSrc2;
            }
            if (neb_choice === 3) {
                neb = map.starBgSrc3;
            }
            if (neb_choice === 4) {
                neb = map.starBgSrc4;
            }
            if (neb_choice === 5) {
                neb = map.starBgSrc2;
            }
            if (neb_choice === 6) {
                neb = map.starBgSrc1;
            }

            sprite = {
                ox: 0,
                oy: 0,
                width: 640,
                height: 640,
                pivotX: 320,
                pivotY: 320,
                rotation: universe.galaxy.stars[i].x * 360,
                scale: 0.5,
                image: neb,
                spriteX: 0,
                spriteY: 0,
                visible: true
            };

            universe.galaxy.stars[i].spriteBgZ = 1.25 - ((universe.galaxy.stars[i].n.length - 3) / 10);
            if (universe.galaxy.stars[i].spriteBgZ < 0.75) {
                universe.galaxy.stars[i].spriteBgZ = 0.75;
            }
            universe.galaxy.stars[i].spriteBg = sprite;
        } else {
            universe.galaxy.stars[i].spriteBgZ = 0;
            universe.galaxy.stars[i].spriteBg = null;
        }
    }
};
map.createSpritesFleets = function() {
    var i, j, sprite, fleet, fleetj, inRange;

    // add a show strength property
    for (i in universe.galaxy.fleets) {
        fleet = universe.galaxy.fleets[i];
        fleet.showStrength = true;
    }

    // to prevent players stacking fleets and hiding strength, well combine
    // strength of fleets into one number.
    map.strengthDisplayFleets = {};
    for (i in universe.galaxy.fleets) {
        fleet = universe.galaxy.fleets[i];
        if (fleet.orbiting !== null) continue;
        if (!fleet.showStrength) continue;
        map.strengthDisplayFleets[i] = {
            x: fleet.x,
            y: fleet.y,
            strength: fleet.st
        };
        for (j in universe.galaxy.fleets) {
            fleetj = universe.galaxy.fleets[j];
            if (fleetj.orbiting !== null) continue;
            if (fleet === fleetj) continue;
            if (fleet.puid !== fleetj.puid) continue;
            inRange = universe.isInRange(fleet, fleetj, 0.0125);
            if (inRange) {
                map.strengthDisplayFleets[i].strength += fleetj.st;
                fleetj.showStrength = false;
            }
        }
    }

    for (i in universe.galaxy.fleets) {
        fleet = universe.galaxy.fleets[i];
        sprite = {
            ox: 0,
            oy: 0,
            width: 64,
            height: 64,
            pivotX: 32,
            pivotY: 32,
            rotation: 0,
            scale: 0.75 * map.pixelRatio,
            image: map.starSrc,
            spriteX: 128,
            spriteY: 0,
            visible: true
        };


        if (universe.galaxy.fleets[i].path[0]) {
            sprite.rotation = map.lookAngle(fleet.x, fleet.y, fleet.path[0].x, fleet.path[0].y) + 90;
        } else {
            if ((fleet.x === fleet.lx && fleet.y === fleet.ly) || fleet.orbiting !== null) {
                // not moving
                sprite.rotation = 0;
            } else {
                sprite.rotation = map.lookAngle(fleet.x, fleet.y, fleet.lx, fleet.ly) - 90;
            }

        }
        sprite.rotation = (Math.PI * sprite.rotation) / 180;

        fleet.sprite = sprite;
    }
};
map.createSprites = function() {
    if (!universe.galaxy.stars) {
        return;
    }

    map.createSpritesStars();
    map.createSpritesFleets();
    map.createSpritesNebular();
    map.createSpritesOwnershipRings();

    Crux.drawReqired = true;
};

//--------------------------------------------------------------------------
map.updateSpritePositions = function() {
    var i = 0,
        leni = 0;
    var star = {}, fleet = {}, ring = {}, ripple = {};
    var tx, ty;

    for (i in universe.galaxy.stars) {
        star = universe.galaxy.stars[i];
        tx = (star.x * map.scale + map.sx) * map.pixelRatio;
        ty = (star.y * map.scale + map.sy) * map.pixelRatio;
        if (star.sprite) {
            star.sprite.ox = tx;
            star.sprite.oy = ty;
            star.sprite.scale = 0.75 * map.pixelRatio;
            if (map.scale < 350) {
                star.sprite.scale = 0.75 * map.pixelRatio;
            }
            if (map.scale < 250) {
                star.sprite.scale = 0.5 * map.pixelRatio;
            }

        }

        if (star.halo) {
            star.halo.ox = tx;
            star.halo.oy = ty;
        }

        if (star.spriteBg) {
            star.spriteBg.ox = tx * star.spriteBgZ;
            star.spriteBg.oy = ty * star.spriteBgZ;
            star.spriteBg.scale = (map.scale / 400) * map.pixelRatio;
        }

        if (star.spriteOwner) {
            star.spriteOwner.ox = tx;
            star.spriteOwner.oy = ty;
            star.spriteOwner.scale = 1 * map.pixelRatio;
            if (map.scale < 350) {
                star.spriteOwner.scale = 0.75 * map.pixelRatio;
            }
            if (map.scale < 250) {
                star.spriteOwner.scale = 0.5 * map.pixelRatio;
            }
        }

        if (star.spriteGate) {
            star.spriteGate.ox = tx;
            star.spriteGate.oy = ty;
            star.spriteGate.scale = 2 * map.pixelRatio;
            if (map.scale < 350) {
                star.spriteGate.scale = 1.75 * map.pixelRatio;
            }
            if (map.scale < 250) {
                star.spriteGate.scale = 1.25 * map.pixelRatio;
            }
        }
    }

    for (i in universe.galaxy.fleets) {
        fleet = universe.galaxy.fleets[i];
        tx = (fleet.x * map.scale + map.sx) * map.pixelRatio;
        ty = (fleet.y * map.scale + map.sy) * map.pixelRatio;

        fleet.sprite.ox = tx;
        fleet.sprite.oy = ty;
        fleet.sprite.scale = 0.65 * map.pixelRatio;
        if (map.scale < 350) {
            fleet.sprite.scale = 0.5 * map.pixelRatio;
        }
        if (map.scale < 250) {
            fleet.sprite.scale = 0.5 * map.pixelRatio;
        }
        if (fleet.loop) {
            fleet.sprite.scale /= 1.25;
        }


        if (fleet.spriteOwner) {
            fleet.spriteOwner.ox = tx;
            fleet.spriteOwner.oy = ty;
            fleet.spriteOwner.scale = 1 * map.pixelRatio;
            if (map.scale < 350) {
                fleet.spriteOwner.scale = 0.75 * map.pixelRatio;
            }
            if (map.scale < 250) {
                fleet.spriteOwner.scale = 0.5 * map.pixelRatio;
            }
            if (fleet.loop) {
                fleet.spriteOwner.scale /= 1.25;
            }
        }


    }

    for (i = 0, leni = map.ripples.length; i < leni; i += 1) {
        ripple = map.ripples[i];
        ripple.x = (ripple.galaxyX * map.scale + map.sx) * map.pixelRatio;
        ripple.y = (ripple.galaxyY * map.scale + map.sy) * map.pixelRatio;
    }
};









map.drawSprite = function(sprite) {
    if (sprite.visible) {
        map.context.save();
        map.context.translate(sprite.ox, sprite.oy);
        map.context.rotate(sprite.rotation);
        map.context.scale(sprite.scale, sprite.scale);
        map.context.drawImage(sprite.image, sprite.spriteX, sprite.spriteY, sprite.width, sprite.height, -sprite.pivotX, -sprite.pivotY, sprite.width, sprite.height);
        map.context.restore();
    }
};

map.draw = function() {
    if (map.scale !== map.scaleTarget) {
        map.zoom(map.scaleTarget - map.scale);
    }

    map.updateSpritePositions();

    map.context.fillStyle = "#000000";
    map.context.fillRect(0, 0, map.viewportMask.w, map.viewportMask.h);

    //map.drawNebular();
    if (!map.miniMapEnabled && universe.interfaceSettings.showNebular) {
        var i, star;
        for (i in universe.galaxy.stars) {
            star = universe.galaxy.stars[i];
            if (star.spriteBg) {
                map.drawSprite(star.spriteBg);
            }
        }
    }

    // map.drawSelectionRing();
    if (universe.selectedSpaceObject) {
        var so = universe.selectedSpaceObject,
            sDim = spaceToScreen(so);

        map.drawSprite({
            ox: sDim.x,
            oy: sDim.y,
            rotation: 0.5,
            scale: 0.5 * map.pixelRatio * map.scale / 250,
            visible: true,

            image: map.selectionRingSrc,
            width: 128,
            height: 128,
            pivotX: 64,
            pivotY: 64,
            spriteX: 0,
            spriteY: 0
        });
    }

    if (universe.interfaceSettings.showRipples && !map.miniMapEnabled) {
        //map.drawRipples();
        var i, ripple;
        for (i = map.ripples.length - 1; i >= 0; i--) {
            ripple = map.ripples[i];
            map.context.globalAlpha = ripple.a;
            map.drawSprite({
                ox: ripple.x,
                oy: ripple.y,
                width: 128,
                height: 128,
                pivotX: 64,
                pivotY: 64,
                rotation: 0,
                scale: (ripple.r / 64) * map.pixelRatio,
                image: map.haloSrc,
                spriteX: 0,
                spriteY: 0,
                visible: true
            });
            map.context.globalAlpha = 1;
        }
    }

    if (!map.miniMapEnabled) {
        //map.drawResourceRings();
        var i, star;
        if (map.scale < 375) return;
        map.context.globalAlpha = 0.25;
        for (i in universe.galaxy.stars) {
            if (universe.galaxy.stars[i].halo) {
                map.drawSprite(universe.galaxy.stars[i].halo);
            }
        }
        map.context.globalAlpha = 1;
    }

    //map.drawGates();
    var i, j, size;

    for (i in universe.galaxy.stars) {
        if (universe.galaxy.stars[i].spriteGate) {
            map.drawSprite(universe.galaxy.stars[i].spriteGate);
        }
    }

    //map.drawStars();
    var i;
    for (i in universe.galaxy.stars) {
        map.drawSprite(universe.galaxy.stars[i].sprite);
    }

    //map.drawOwnershipRings();
    var i, j, size;

    for (i in universe.galaxy.stars) {
        if (universe.galaxy.stars[i].spriteOwner) {
            map.drawSprite(universe.galaxy.stars[i].spriteOwner);
        }
    }

    //map.drawScanningRange();
    if (!universe.selectedStar) {
        return;
    }
    if (!universe.selectedStar.player) {
        return;
    }
    if (map.scale < 150) return;
    // if (universe.selectedStar.player !== universe.player) {
    //     return;
    // }
    var so = universe.selectedStar;
    var tx = (so.x * map.scale + map.sx) * map.pixelRatio;
    var ty = (so.y * map.scale + map.sy) * map.pixelRatio;
    var sc = (universe.selectedStar.player.tech.scanning.value) * map.scale * map.pixelRatio / 250;

    map.drawSprite({
        ox: tx,
        oy: ty,
        width: 576,
        height: 576,
        pivotX: 288,
        pivotY: 288,
        rotation: map.scanRotation,
        scale: sc,
        image: map.scanningRangeSrc,
        spriteX: 0,
        spriteY: 0,
        visible: true
    });

    //map.drawWaypoints();

    var i, sprite;
    if (!universe.selectedFleet) {
        return;
    }

    // way point origin
    map.context.globalAlpha = 0.25;
    if (universe.interfaceSettings.showWaypointChoices && map.scale > 199) {
        if (universe.selectedFleet.lastStar) {
            sprite = universe.selectedFleet.lastStar.sprite;
            map.drawSprite({
                ox: sprite.ox,
                oy: sprite.oy,
                width: 128,
                height: 128,
                pivotX: 64,
                pivotY: 64,
                rotation: 0,
                scale: map.waypointOriginScale * map.pixelRatio,
                image: map.fleetWaypointSrc,
                spriteX: 0,
                spriteY: 0,
                visible: true
            });
        }
        map.context.globalAlpha = 1;
        // way points
        map.context.strokeStyle = "rgba(0, 255, 0, 1)";
        map.context.lineWidth = 4 * map.pixelRatio;
        for (i = 0; i < universe.waypoints.length; i += 1) {
            if (!universe.waypoints[i]) {
                //special case for when a fleet lost its orders
                // the way point is a fleet not a star.
                continue;
            }
            sprite = universe.waypoints[i].sprite;
            map.drawSprite({
                ox: sprite.ox,
                oy: sprite.oy,
                width: 128,
                height: 128,
                pivotX: 64,
                pivotY: 64,
                rotation: 0,
                scale: 0.5 * map.pixelRatio,
                image: map.fleetWaypointSrc,
                spriteX: 0,
                spriteY: 0,
                visible: true
            });

            if (universe.waypoints[i].ga) {

                map.drawSprite({
                    ox: sprite.ox,
                    oy: sprite.oy,
                    width: 128,
                    height: 128,
                    pivotX: 64,
                    pivotY: 64,
                    rotation: 0,
                    scale: 0.30 * map.pixelRatio,
                    image: map.fleetWaypointSrc,
                    spriteX: 0,
                    spriteY: 0,
                    visible: true
                });
            }

        }
    }
    map.context.globalAlpha = 1;

    if (universe.interfaceSettings.showFleets && !map.miniMapEnabled) {
        //map.drawFleetOwnershipRings();

        var i;
        for (i in universe.galaxy.fleets) {
            if (universe.galaxy.fleets[i].spriteOwner) {
                map.drawSprite(universe.galaxy.fleets[i].spriteOwner);
            }
        }
        // map.drawFleetRange();

        if (!universe.selectedFleet) {
            return;
        }
        if (!universe.selectedFleet.lastStar) {
            return;
        }
        if (universe.editMode !== "edit_waypoints") {
            return;
        }

        var so = universe.selectedFleet.lastStar;
        var tx = (so.x * map.scale + map.sx) * map.pixelRatio;
        var ty = (so.y * map.scale + map.sy) * map.pixelRatio;
        var sc = (universe.player.tech.propulsion.value + 0.0125) * map.scale * map.pixelRatio / 250;
        map.drawSprite({
            ox: tx,
            oy: ty,
            width: 576,
            height: 576,
            pivotX: 288,
            pivotY: 288,
            rotation: map.rangeRotation,
            scale: sc,
            image: map.fleetRangeSrc,
            spriteX: 0,
            spriteY: 0,
            visible: true
        });

        // map.drawFleetPath();
        var i, j, p, fleet;
        for (i in universe.galaxy.fleets) {
            fleet = universe.galaxy.fleets[i];
            if (!fleet.orbiting && fleet.path.length) {
                // in the pipe
                map.context.strokeStyle = "rgba(255, 255, 255, 0.35)";
                map.context.lineWidth = 14 * map.pixelRatio;
                map.context.beginPath();
                map.context.moveTo(fleet.sprite.ox, fleet.sprite.oy);
                map.context.lineTo(fleet.path[0].sprite.ox, fleet.path[0].sprite.oy);
                map.context.stroke();
            }

            var a = 0.5,
                lw = 4;
            if (fleet === universe.selectedFleet) {
                a = 0.75;
                lw = 10;
            }

            map.context.globalAlpha = a;
            map.context.strokeStyle = fleet.player.color;
            map.context.lineWidth = lw * map.pixelRatio;
            map.context.beginPath();
            map.context.moveTo(fleet.sprite.ox, fleet.sprite.oy);

            for (j = 0; j < fleet.path.length; j += 1) {
                map.context.lineTo(fleet.path[j].sprite.ox, fleet.path[j].sprite.oy);
            }
            map.context.stroke();
            map.context.globalAlpha = 1;

        }
        // map.drawFleets();

        var i, j, fleet;
        for (i in universe.galaxy.fleets) {
            map.drawSprite(universe.galaxy.fleets[i].sprite);
        }
    }
    // map.drawStarFleetRange();
    if (!universe.selectedStar) {
        return;
    }
    if (!universe.selectedStar.player) {
        return;
    }
    if (map.scale < 150) {
        return;
    }

    var so = universe.selectedStar;
    var tx = (so.x * map.scale + map.sx) * map.pixelRatio;
    var ty = (so.y * map.scale + map.sy) * map.pixelRatio;
    var sc = (universe.selectedStar.player.tech.propulsion.value + 0.0125) * map.scale * map.pixelRatio / 250;
    map.drawSprite({
        ox: tx,
        oy: ty,
        width: 576,
        height: 576,
        pivotX: 288,
        pivotY: 288,
        rotation: map.rangeRotation,
        scale: sc,
        image: map.fleetRangeSrc,
        spriteX: 0,
        spriteY: 0,
        visible: true
    });

    if (universe.editMode === "ruler") {
        // map.drawRuler();

        if (!universe.ruler.starA) return;
        if (!universe.ruler.starB) return;
        map.context.strokeStyle = "rgba(255, 255, 255, 0.5)";
        map.context.lineWidth = 8 * map.pixelRatio;
        map.context.beginPath();
        map.context.moveTo(universe.ruler.starA.sprite.ox, universe.ruler.starA.sprite.oy);
        map.context.lineTo(universe.ruler.starB.sprite.ox, universe.ruler.starB.sprite.oy);
        map.context.stroke();
    }

    //map.drawText();

    var sprite, labelString, s, f, star, fleet;
    var labelY = 0,
        labelX = 0;

    // todo: this needs refactoring so that the labelY increments for each star or fleet,
    // ie so that it only increments if it needs to.
    map.context.font = (14 * map.pixelRatio) + "px OpenSansRegular, sans-serif";
    map.context.textAlign = "center";
    map.context.fillStyle = "#FDF0DC";
    map.context.textBaseline = 'middle';

    if (universe.interfaceSettings.mapGraphics === "high") {
        map.context.shadowColor = "#000000";
        map.context.shadowOffsetX = 2;
        map.context.shadowOffsetY = 2;
        map.context.shadowBlur = 2;
    }


    if (universe.colorBlindHelper) {

        map.context.fillStyle = "#000000";
        map.context.globalAlpha = 0.5;
        for (s in universe.galaxy.stars) {
            star = universe.galaxy.stars[s];
            sprite = star.sprite;
            if (!sprite.visible) {
                continue;
            }
            if (!star.player) {
                continue;
            }

            map.context.fillRect(sprite.ox - (48 * map.pixelRatio), sprite.oy - (12 * map.pixelRatio), 96 * map.pixelRatio, (24 * map.pixelRatio));
        }
        for (f in universe.galaxy.fleets) {
            fleet = universe.galaxy.fleets[f];
            sprite = fleet.sprite;
            if (!sprite.visible) {
                continue;
            }
            if (!fleet.player) {
                continue;
            }

            map.context.fillRect(sprite.ox - (48 * map.pixelRatio), sprite.oy - (12 * map.pixelRatio), 96 * map.pixelRatio, (24 * map.pixelRatio));
        }


        map.context.globalAlpha = 1;
        map.context.fillStyle = "#FDF0DC";

        for (s in universe.galaxy.stars) {
            star = universe.galaxy.stars[s];
            sprite = star.sprite;
            if (!sprite.visible) {
                continue;
            }
            if (!star.player) {
                continue;
            }

            labelString = star.player.colorName;
            map.context.fillText(labelString, sprite.ox, sprite.oy);
        }

        for (f in universe.galaxy.fleets) {
            fleet = universe.galaxy.fleets[f];
            sprite = fleet.sprite;
            if (!sprite.visible) {
                continue;
            }
            if (!fleet.player) {
                continue;
            }

            labelString = fleet.player.colorName;
            map.context.fillText(labelString, sprite.ox, sprite.oy);
        }

    }

    if (universe.interfaceSettings.showBasicInfo) {
        if (map.scale >= universe.interfaceSettings.textZoomStarNames) {
            for (s in universe.galaxy.stars) {
                sprite = universe.galaxy.stars[s].sprite;
                if (sprite.visible) {
                    map.context.fillText(universe.galaxy.stars[s].n, sprite.ox + labelX, sprite.oy + (34 * map.pixelRatio) + labelY);
                }
            }
            labelY += 18 * map.pixelRatio;
        }

        if (map.scale >= universe.interfaceSettings.textZoomShips) {
            for (s in universe.galaxy.stars) {
                sprite = universe.galaxy.stars[s].sprite;
                if (sprite.visible) {
                    labelString = universe.galaxy.stars[s].totalDefenses;
                    if (Number(labelString !== 0)) {
                        map.context.fillText(labelString, sprite.ox + labelX, sprite.oy + (34 * map.pixelRatio) + labelY);
                    }
                }
            }
            for (f in map.strengthDisplayFleets) {
                if (!universe.galaxy.fleets[f].orbiting) {
                    sprite = universe.galaxy.fleets[f].sprite;
                    if (sprite.visible) {
                        labelString = map.strengthDisplayFleets[f].strength;
                        map.context.fillText(labelString, sprite.ox + labelX, sprite.oy + (34 * map.pixelRatio));

                    }
                }
            }
        }
    }

    if (universe.interfaceSettings.showStarInfrastructure && universe.player && map.scale >= universe.interfaceSettings.textZoomInf) {
        for (s in universe.galaxy.stars) {
            star = universe.galaxy.stars[s];
            if ((star.v > 0 && star.puid >= 0) || (star.puid === universe.player.uid)) {
                sprite = star.sprite;
                if (sprite.visible) {
                    labelString = star.e + "  " + star.i + "  " + star.s;
                    map.context.fillText(labelString, sprite.ox + labelX, sprite.oy + (-25 * map.pixelRatio));
                }
            }
        }
    }

    if (map.scale > universe.interfaceSettings.textZoomStarPlayerNames) {
        labelY += 18 * map.pixelRatio;
        for (s in universe.galaxy.stars) {
            sprite = universe.galaxy.stars[s].sprite;
            if (universe.galaxy.stars[s].player) {
                labelString = universe.galaxy.stars[s].player.alias;
                map.context.fillText(labelString, sprite.ox + labelX, sprite.oy + (34 * map.pixelRatio) + labelY);
            }
        }
    }

    if (universe.interfaceSettings.showQuickUpgrade && universe.player && map.scale >= universe.interfaceSettings.textZoomShips) {
        for (s in universe.galaxy.stars) {
            star = universe.galaxy.stars[s];
            if (star.v > 0 && star.puid === universe.player.uid) {
                sprite = star.sprite;
                if (sprite.visible) {
                    labelString = star.uce + "  " + star.uci + "  " + star.ucs;
                    map.context.fillText(labelString, sprite.ox + labelX, sprite.oy + (35 * map.pixelRatio));
                }
            }

        }
        return;
    }
    if (universe.interfaceSettings.mapGraphics === "high") {
        map.context.shadowColor = null;
        map.context.shadowOffsetX = 0;
        map.context.shadowOffsetY = 0;
        map.context.shadowBlur = 0;
    }

    map.context.globalAlpha = 1;
};