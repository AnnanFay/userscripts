// ==UserScript==
// @name        NP2 Layers
// @description Adds various information overlays to the star map
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game*
// @version     1
// @require     http://underscorejs.org/underscore-min.js
// @require     http://userscripts.org/scripts/source/181520.user.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals unsafeWindow, $, _, google, NP2M */
(function () {
    "strict true";

    var overlaySize = 5000,
        overlayMiddle = overlaySize / 2;

    String.prototype.splice = function( idx, rem, s ) {
        return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
    };

    function noop () {}

    function to_array (a) {
        return Array.prototype.slice.call(a, 0);
    }

    function partial (f) {
        var args = to_array(arguments).slice(1);
        return function () {
            return f.apply(this, args.concat(to_array(arguments)));
        };
    }

    function caller (f) {
        var args = to_array(arguments).slice(1);
        return function () {
            return f.apply(this, args);
        };
    }
    //
    // image functions
    //
    function canvas_to_image (c) {
        var i = document.createElement('img');
        i.src = c.toDataURL();
        return i;
    }

    function canvas (width, height) {
        var image;
        if (!height) {
            image = width;
            width = image.width;
            height = image.height;
        }
        var c = document.createElement('canvas');
        c.width = width;
        c.height = height;

        if (image) {
            var ctx = c.getContext('2d');
            ctx.drawImage(image, 0, 0);
        }

        return c;
    }
    function clearCircle (ctx, x, y, radius) {
        // ctx.save();
        // ctx.beginPath();
        // ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        // ctx.clip();
        // ctx.clearRect(x - radius - 1, y - radius - 1,
        //                   radius * 2 + 2, radius * 2 + 2);
        // ctx.restore();
        var gco = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'destination-out';

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fill();

        ctx.globalCompositeOperation = gco;
    }
    function tint (image, colour) {
        var buffer = canvas(image.width, image.height),
            bctx = buffer.getContext('2d');

        bctx.fillStyle = colour;
        bctx.fillRect(0, 0, buffer.width, buffer.height);
        
        bctx.globalCompositeOperation = "destination-atop";
        bctx.drawImage(image, 0, 0);

        return buffer;
    }
    function remove_alpha (image) {

        var ctx = canvas(image).getContext('2d');

        function rma (id) {
            var d = id.data;
            for (var i = 0; i < d.length; i += 4) {
                if (d[i+3] > 0) {
                    d[i+3] = 255;
                }
            }
            return id;

        }
        return apply_image_filter(ctx, rma);
    }
    function scale_alpha (image, scaling_factor) {

        var ctx = canvas(image).getContext('2d');

        function rma (id) {
            var d = id.data;
            for (var i = 0; i < d.length; i += 4) {
                d[i+3] *= scaling_factor;
            }
            return id;

        }
        return apply_image_filter(ctx, rma);
    }
    function get_image_data (ctx) {
        return ctx.getImageData(0,0,ctx.canvas.width, ctx.canvas.height);
    }
    function apply_image_filter (ctx, filter) {
        var args = to_array(arguments).slice(2),
            buffer  = canvas(ctx.canvas.width, ctx.canvas.height),
            bctx    = buffer.getContext('2d'),
            id      = get_image_data(ctx);

        args.unshift(id);
        var nid = filter.apply(this, args);

        bctx.putImageData(nid, 0, 0);
        return buffer;
    }


    function drawPath (ctx, starA, starB, easy) {
        if (easy) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        } else {
            ctx.strokeStyle = "rgba(255, 100, 100, 0.1)";
        }
        
        ctx.beginPath();
        ctx.moveTo(starA.x * 250 + ctx.canvas.width/2, starA.y * 250 + ctx.canvas.height/2);
        ctx.lineTo(starB.x * 250 + ctx.canvas.width/2, starB.y * 250 + ctx.canvas.height/2);
        ctx.stroke();
    }

    function pathLayer (ctx, data, map) {
        var universe    = data.universe,
            stars       = universe.galaxy.stars,
            prop        = universe.player ? universe.player.tech.propulsion.value : 4/8,
            next_prop   = prop + (1/8); // speed and distance units are in 1/8th of ly

        ctx.lineWidth = 4 * map.pixelRatio;

        var done = []; // efficiency hack because stars is an object.

        // TODO: Make more efficient. This is basically collision detection
        for (var i in stars) if (stars.hasOwnProperty(i)) {
            var starA = stars[i];
            done[i] = true;

            for (var j in stars) {
                var starB = stars[j];
                if (starA === starB
                    || done[j]
                    || Math.abs(starA.x - starB.x) > next_prop
                    || Math.abs(starA.y - starB.y) > next_prop) {
                    continue;
                }

                var dist2 = Math.pow(starA.x-starB.x, 2) + Math.pow(starA.y-starB.y, 2);
                if (dist2 <= Math.pow(next_prop, 2)) {
                    drawPath(ctx, starA, starB, Math.sqrt(dist2) <= prop);
                }
            }
        }
    }

    function drawHalo (ctx, x, y, r, c) {
        var gradient = ctx.createRadialGradient(x,y,0,x,y,r);
        gradient.addColorStop(0, 'rgba('+c+',1)');
        gradient.addColorStop(1, 'rgba('+c+',0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x-r,y-r,x+r,y+r);
    }

    function drawFleetHalo (ctx, x, y, size, c) {
        debug('dfh', arguments);
        x = x * 250 + ctx.canvas.width/2;
        y = y * 250 + ctx.canvas.width/2;
        drawHalo(ctx, x, y, overlayMiddle*area_to_radius(size), hex_to_rgb(c));
    }

    function hex_to_rgb (hex) {
        var m = hex.match(/#?(..?)(..?)(..?)/);
        return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)].join(',');
    }

    function area_to_radius (area) {
        return Math.sqrt(area/Math.PI);
    }

    function volume_to_radius (vol) {
        // v = 1/3 * base_area * height
        // base_area = (3 * v) / height
        // radius = area_to_radius((3 * v) / height)
        return area_to_radius(3 * vol);
    }

    function fleetSizeLayer (ctx, data, map) {
        var universe    = data.universe,
            stars       = universe.galaxy.stars,
            fleets      = universe.galaxy.fleets,
            players     = universe.galaxy.players,
            total       = 0;
        var i;
        for (i in players) if (stars.hasOwnProperty(i)) {
            var p = players[i];

            total += p.total_strength;
        }

        for (i in stars) if (stars.hasOwnProperty(i)) {
            var star = stars[i];
            if (star.totalDefenses > 0) {
                drawFleetHalo(ctx, star.x, star.y, (star.totalDefenses/total), star.player.color);
            }
        }
        for (i in fleets) if (stars.hasOwnProperty(i)) {
            var fleet = fleets[i];
            if (fleet.orbiting !== null) {
                continue;
            }

            drawFleetHalo(ctx, parseFloat(fleet.x), parseFloat(fleet.y), (fleet.st/total), fleet.player.color);
        }
    }

    function drawCOM (src, ctx, c, label, color) {
        //debug('drawCOM', to_array(arguments));
        var offset  = ctx.canvas.width/2,
            x       = c.x * 250 + offset,
            y       = c.y * 250 + offset,
            sc      = 0.2;

            drawSprite(ctx, {
                    ox: x,
                    oy: y,
                    width:  src.width,
                    height: src.height,
                    pivotX: src.width/2,
                    pivotY: src.height/2,
                    rotation: 0,
                    scale: sc,
                    image: src,
                    spriteX: 0,
                    spriteY: 0,
                    visible: true});

            var radius          = (src.height*sc)/2;
            ctx.fillStyle       = color;
            ctx.font            = 'bold '+(radius*1.5)+'px sans-serif';
            ctx.textBaseline    = 'top';
            var tw = ctx.measureText(label).width;
            ctx.fillText(label, x-(tw/2), y-(radius/2));
    }


    function centre_of_mass (nodes) {
        var totalm  = 0,
            totalx  = 0,
            totaly  = 0;

        for (var i in nodes) {
            var node = nodes[i];
            totalm += node.m;
            totalx += node.x * node.m;
            totaly += node.y * node.m;
        }
        return {x: totalx/totalm, y: totaly/totalm};
    }
    
    function drawFleetCentres (src, ctx, player, data) {
        //debug('drawFleetCentres', to_array(arguments));
        var total   = player.total_strength,
            src     = tint(src, player.color);

        function Node (d) {
            return {
                x: parseFloat(d.x),
                y: parseFloat(d.y),
                m: 1
            };
        }

        var player_data     = _.filter(data, function (v) { return v.puid === player.uid}),
            star_data       = _.filter(player_data, function (v) { return v.kind === 'star'; }),
            fleet_data      = _.filter(player_data, function (v) { return v.kind === 'fleet'; }),
            equal_stars     = _.map(star_data, Node),
            equal_fleets    = _.map(fleet_data, Node),
            resource_stars  = _.map(star_data, function (v) {return _.extend(Node(v), {m: v.r}); }),
            industry_stars  = _.map(star_data, function (v) {return _.extend(Node(v), {m: v.i}); }),
            fleet_nodes     = _.map(player_data, function (v) {return _.extend(Node(v), {m: v.st}); });

        // if (equal_stars.length) {
        //     drawCOM(src, ctx, centre_of_mass(equal_stars), 'S', player.color);
        // }
        // if (resource_stars.length) {
        //     drawCOM(src, ctx, centre_of_mass(resource_stars), 'R', player.color);
        // }
        if (industry_stars.length) {
            drawCOM(src, ctx, centre_of_mass(industry_stars), 'I', player.color);
        }
        if (fleet_nodes.length) {
            drawCOM(src, ctx, centre_of_mass(fleet_nodes), 'F', player.color);
        }
        if (equal_fleets.length) {
            drawCOM(src, ctx, centre_of_mass(equal_fleets), 'C', player.color);
        }
    }

    function fleetStrengthLayer (ctx, data, map) {
        // debug('fleetStrengthLayer', to_array(arguments));
        // we want 3 centres
            // star centre
            // scannable ship centre
            // weighted combination
            // resource centre
        var universe    = data.universe,
            stars       = universe.galaxy.stars,
            fleets      = universe.galaxy.fleets,
            players     = universe.galaxy.players,
            total       = 0,
            src         = scale_alpha(map.fleetWaypointSrc, 3);

        for (var i in players) {
            var player = players[i];
            var els = [].concat(_.values(stars), _.values(fleets));
            drawFleetCentres(src, ctx, player, els);
        }
    }

    function drawSprite (ctx, sprite) {
        if (sprite.visible){
            ctx.save();
            ctx.translate(sprite.ox, sprite.oy);
            ctx.rotate(sprite.rotation);
            ctx.scale(sprite.scale, sprite.scale);
            ctx.drawImage(sprite.image, sprite.spriteX, sprite.spriteY, sprite.width, sprite.height, -sprite.pivotX, -sprite.pivotY, sprite.width , sprite.height);
            ctx.restore();
        }
    };



    function hyperdriveBoundaryLayer (ctx, data, map) {
        debug('hyperdriveBoundaryLayer', arguments);
        var universe    = data.universe,
            players     = universe.galaxy.players,
            stars       = universe.galaxy.stars,
            image       = scale_alpha(map.fleetRangeSrc, 3),
            negative    = scale_alpha(image, 3);

        for (var i in players) {
            drawHyperdriveBoundary(ctx, stars, players[i], image, negative);
        }
        return ctx;
    }

    function scanningBoundaryLayer (ctx, data, map) {
        debug('scanningBoundaryLayer', arguments);
        var universe    = data.universe,
            players     = universe.galaxy.players,
            stars       = universe.galaxy.stars,
            image       = scale_alpha(map.scanningRangeSrc, 3),
            negative    = scale_alpha(image, 3);

        for (var i in players) {
            drawScanningBoundary(ctx, stars, players[i], image, negative);
        }
        return ctx;
    }

    function drawHyperdriveBoundary (ctx, stars, player, image, negative) {
        debug('drawHyperdriveBoundary', arguments);
        var buffer          = canvas(overlaySize, overlaySize),
            bctx            = buffer.getContext('2d'),
            player_range    = tint(image, player.color),
            canvas_offset   = overlayMiddle;

        for (var j in stars) {
            if (stars[j].player !== player) {
                continue;
            }
            var star    = stars[j],
                x       = star.x * 250 + canvas_offset,
                y       = star.y * 250 + canvas_offset,
                sc      = star.player.tech.propulsion.value + 0.0125;

            drawSprite(bctx, {
                    ox: x,
                    oy: y,
                    width: player_range.width,
                    height: player_range.height,
                    pivotX: player_range.width/2,
                    pivotY: player_range.height/2,
                    rotation: 0,
                    scale: sc,
                    image: player_range,
                    spriteX: 0,
                    spriteY: 0,
                    visible: true});
        }

        bctx.globalCompositeOperation = 'destination-out';

        for (var i in stars) {
            if (stars[i].player !== player) {
                continue;
            }
            var star    = stars[i],
                x       = star.x * 250 + canvas_offset,
                y       = star.y * 250 + canvas_offset,
                sc      = star.player.tech.propulsion.value + 0.0125,
                radius  = sc * 243;

                clearCircle(bctx, x, y, radius);
                drawSprite(bctx, {
                        ox: x,
                        oy: y,
                        width: negative.width,
                        height: negative.height,
                        pivotX: negative.width/2,
                        pivotY: negative.height/2,
                        rotation: 0,
                        scale: sc*0.97,
                        image: negative,
                        spriteX: 0,
                        spriteY: 0,
                        visible: true});

        }

        ctx.drawImage(buffer, 0, 0);
        return ctx;
    }
    
    function drawScanningBoundary (ctx, stars, player, image, negative) {
        debug('drawScanningBoundary', arguments);
        var buffer          = canvas(overlaySize, overlaySize),
            bctx            = buffer.getContext('2d'),
            player_range    = tint(image, player.color),
            canvas_offset   = overlayMiddle;

        for (var j in stars) {
            if (stars[j].player !== player) {
                continue;
            }
            var star    = stars[j],
                x       = star.x * 250 + canvas_offset,
                y       = star.y * 250 + canvas_offset,
                sc      = star.player.tech.scanning.value;

            drawSprite(bctx, {
                    ox: x,
                    oy: y,
                    width: player_range.width,
                    height: player_range.height,
                    pivotX: player_range.width/2,
                    pivotY: player_range.height/2,
                    rotation: 0,
                    scale: sc,
                    image: player_range,
                    spriteX: 0,
                    spriteY: 0,
                    visible: true});
        }

        bctx.globalCompositeOperation = 'destination-out';

        for (var i in stars) {
            if (stars[i].player !== player) {
                continue;
            }
            var star    = stars[i],
                x       = star.x * 250 + canvas_offset,
                y       = star.y * 250 + canvas_offset,
                sc      = star.player.tech.scanning.value,
                radius  = sc * 240;

                clearCircle(bctx, x, y, radius);
                drawSprite(bctx, {
                        ox: x,
                        oy: y,
                        width: negative.width,
                        height: negative.height,
                        pivotX: negative.width/2,
                        pivotY: negative.height/2,
                        rotation: 0,
                        scale: sc*0.97,
                        image: negative,
                        spriteX: 0,
                        spriteY: 0,
                        visible: true});

        }

        ctx.drawImage(buffer, 0, 0);
        return ctx;
    }

    function registerLayer (Mousetrap, np, universe, name, key) {
        var method_name = 'on_'+name,
            event_name  = 'start_'+name,
            mode_name   = name;

        np[method_name] = function (e) {
            debug(method_name);
            universe[mode_name] = !universe[mode_name];
            
            debug(name + ' layer is ' + (universe[mode_name] ? 'ON' : 'OFF'))

            np.trigger("map_refresh");
        };
        
        np.on(event_name, np[method_name]);
        Mousetrap.bind(key, caller(np.trigger, event_name));
    }

    function getLayer (data, map, layer) {
        debug('getLayer', arguments)
        var map_canvas      = map.context.canvas,
            buffer          = canvas(overlaySize, overlaySize),
            bctx            = buffer.getContext('2d');
        layer(bctx, data, map);
        return buffer;
    }

    function drawLayer (map, cvs) {
        var width   = cvs.width,
            height  = cvs.height,
            scale   = map.pixelRatio * map.scale / 250;

        map.drawSprite({
                ox: map.sx * map.pixelRatio,
                oy: map.sy * map.pixelRatio,
                width:  width,
                height: height,
                pivotX: width / 2,
                pivotY: height / 2,
                rotation: 0,
                scale: scale,
                image: cvs,
                spriteX: 0,
                spriteY: 0,
                visible: true});
    }

    function pre_init_hook () {
        console.log('LAYERS: pre_init_hook');
    }
    function post_init_hook (data) {
        console.log('LAYERS: post_init_hook', data);
        var Crux        = data.Crux,
            universe    = data.universe,
            np          = data.np;

        registerLayer(Mousetrap, np, universe, 'show_paths', 'l p');
        registerLayer(Mousetrap, np, universe, 'show_scanning_boundaries', 'l s');
        registerLayer(Mousetrap, np, universe, 'show_hyperdrive_boundaries', 'l h');
        registerLayer(Mousetrap, np, universe, 'show_fleet_size_halos', 'l a');
        registerLayer(Mousetrap, np, universe, 'show_centre_of_strength', 'l t');

        NeptunesPride.Map = NP2M.wrap(NeptunesPride.Map, function (args, map) {
            var sbl, hbl, pl, al, fs;
            
            map.createSprites = NP2M.wrap(map.createSprites, function (args, ret) {
                pl = hbl = sbl = al = undefined;
                return ret;
            });

            map.draw = NP2M.wrap(map.draw, function (args, ret) {
                // TODO: abstract this out a bit
                if (universe['show_scanning_boundaries']) {
                    if (!sbl) {
                        sbl = getLayer(data, map, scanningBoundaryLayer);
                    }
                    drawLayer(map, sbl);
                }
                if (universe['show_hyperdrive_boundaries']) {
                    if (!hbl) {
                        hbl = getLayer(data, map, hyperdriveBoundaryLayer);
                    }
                    drawLayer(map, hbl);
                }
                if (universe['show_paths']) {
                    // drawPaths(universe, map);
                    if (!pl) {
                        pl = getLayer(data, map, pathLayer);
                    }
                    drawLayer(map, pl);
                }
                if (universe['show_fleet_size_halos']) {
                    // drawPaths(universe, map);
                    if (!al) {
                        al = getLayer(data, map, fleetSizeLayer);
                    }
                    drawLayer(map, al);
                }
                if (universe['show_centre_of_strength']) {
                    // drawPaths(universe, map);
                    if (!fs) {
                        fs = getLayer(data, map, fleetStrengthLayer);
                    }
                    drawLayer(map, fs);
                }

                return ret;
            });

            map.drawSprite = NP2M.wrap(map.drawSprite, function (args, ret) {
                // debug('drawing sprites', arguments);
                return ret;
            });

            // reregister draw function
            Crux.tickCallbacks.pop();
            Crux.tickCallbacks.push(map.draw);
            return map;
        });
    }

    NP2M.register("NP2 Layers", "1", pre_init_hook, post_init_hook);
})();