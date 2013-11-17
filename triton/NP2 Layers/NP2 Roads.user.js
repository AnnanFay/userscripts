// ==UserScript==
// @name        NP2 Roads
// @description -----------------
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game*
// @version     2
// @require     http://underscorejs.org/underscore-min.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/*TODO:
Split into multiple seperate modulare files
    Modding Library
    Layers
    Info Selection
    UI Tweaks
        Use pathfinding to plan fastest multi stop routes
            Taking into account gateways and enemies
        Charts
            Add buttons to added empire charts
            Chart highlighting
                Hover over icons
                setSelection([{row:0,column:1},{row:1, column:null}]) 
    Routing Guide

*/ 

/* globals unsafeWindow */
try {
    (function (w) {
        "strict true";

        var DEBUG = true;

        function debug () {
            if (DEBUG) {
                console.log.apply(this, arguments);
            }
        }

        function debug_watch (obj, method) {
            if (DEBUG) {
                obj[method] = wrap(obj[method], function (args) {
                    debug(method + ' input: ', args);
                    return args;
                },  function (args, ret) {
                    debug(method + ' returns: ', ret);
                    return ret;

                });
            }
        }
        w.debug = debug;
        w.debug_watch = debug_watch;

        debug("starting");

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

        function get_values (object) {
            // get key value pairs
            var list = [];
            for (var key in object) {
                  list.push([key, object[key]]);
            }
            // sort by keys
            list.sort(function(a, b) {
                if (a[0] > b[0])
                  return 1;
                if (a[0] < b[0])
                  return -1;
                return 0;
            });
            // remove keys
            for (var i = list.length - 1; i >= 0; i--) {
                list[i] = list[i][1];
            }
            // return sorted values
            return list;
        }

        function caller (f) {
            var args = to_array(arguments).slice(1);
            return function () {
                return f.apply(this, args);
            };
        }

        function wrap (f, pre, post) {
            if (!post) {
                post = pre;
                pre = undefined;
            }
            var w = function wrapped_function () {
                var args = arguments;
                if (pre) {
                    args = pre(args);
                    if (args === undefined) {
                        return;
                    }
                }
                var result = f.apply(this, args);
                if (!post) {
                    return result;
                }
                return post(args, result);
            };
            
            return w;
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

        // hook into script loading and append a call to _init() after jQuery.ready is called.
        function inject_init () {
            var injection_code = '_init(Mousetrap, Crux, NeptunesPride, universe, inbox, npui, npuis, np, si);\n';

            function insert_script (content) {
                content = content.splice(content.lastIndexOf('});'), 0, injection_code);
                var s = document.createElement('script');
                s.innerHTML = content;
                document.head.appendChild(s);
            }

            function script_handler (e) {
                var content = e.target.innerHTML;
                if (content.indexOf('$(window).ready(function () {') === -1) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                w.removeEventListener('beforescriptexecute', script_handler);

                insert_script(content);
            }

            w.addEventListener('beforescriptexecute', script_handler);
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

                for (var j in stars) if (stars.hasOwnProperty(j)) {
                    var starB = stars[j];
                    if (starA === starB || done[j]) {
                        continue;
                    }
                    if (Math.abs(starA.x - starB.x) > next_prop || Math.abs(starA.y - starB.y) > next_prop) {
                        continue;
                    }
                    var dist = universe.distance(starA.x, starA.y, starB.x, starB.y);
                    if (dist <= next_prop) {
                        drawPath(ctx, starA, starB, dist <= prop);
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
            drawHalo(ctx, x, y, 2000*area_to_radius(size), hex_to_rgb(c));
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
            var buffer          = canvas(4000, 4000),
                bctx            = buffer.getContext('2d'),
                player_range    = tint(image, player.color),
                canvas_offset   = 2000;

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
            var buffer          = canvas(4000, 4000),
                bctx            = buffer.getContext('2d'),
                player_range    = tint(image, player.color),
                canvas_offset   = 2000;

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
                buffer          = canvas(4000, 4000),
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

        function replace_widget_handlers (widget, name, func) {
            var handlers = widget.handlers;
            // remove all previous handlers with that event name
            for (var i = handlers.length - 1; i >= 0; i--) {
                var h = widget.handlers[i];
                if (h.name === name) {
                    handlers.splice(i, 1);
                    h.node.ui.off(h.name, h.func);
                }
            }
            // add the new one
            widget.on(name, func);
        }


        function find_widget (widget, needle) {
            var children = widget.children;

            for (var i = children.length - 1; i >= 0; i--) {
                var c       = children[i],
                    text    = (children[i].label || children[i]).ui.text();
                if (text.indexOf(needle) != -1) {
                    return c;
                }
            }
            return undefined;
        }

        // function replace_widget (old_widget, new_widget) {
        //     // record old_widget data

        //     // remove old widget
        //     // add new widget
        // }

        w._init = function _init(Mousetrap, Crux, NeptunesPride, universe, inbox, npui, npuis, np, si) {
            universe.interfaceSettings.showFleets = true;
            var data = {
                'Mousetrap': Mousetrap,
                'Crux': Crux,
                'NeptunesPride': NeptunesPride,
                'universe': universe,
                'inbox': inbox,
                'npui': npui,
                'npuis': npuis,
                'np': np,
                'si': si
            };
            debug('_init data: ', data);

            google.load("visualization", "1", {packages:["imagesparkline"], callback: noop});

            debug_watch(universe, "calcWaypoints");

            registerLayer(Mousetrap, np, universe, 'show_paths', 'l p');
            registerLayer(Mousetrap, np, universe, 'show_scanning_boundaries', 'l s');
            registerLayer(Mousetrap, np, universe, 'show_hyperdrive_boundaries', 'l h');
            registerLayer(Mousetrap, np, universe, 'show_fleet_size_halos', 'l a');
            registerLayer(Mousetrap, np, universe, 'show_centre_of_strength', 'l t');


            function sparkline (data, container) {
                debug('SPARKLINE: ', data);
                var data = google.visualization.arrayToDataTable(data);
                var chart = new google.visualization.ImageSparkLine(container);
                var chart_options = //$.extend({},universe.IntelChartOptions, 
                {
                    width: 6 * Crux.gridSize,
                    height: 32,
                    showAxisLines: false,
                    showValueLabels: false,
                    labelPosition: 'none'
                }//);
                chart.draw(data, chart_options);
            }

            document.oncontextmenu = function (e) {
                if (e.target === $('canvas')[0]) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            };

            function trigger_logger (args) {
                debug('triggering', args);
                return args;
            }
            // np.trigger   = wrap(np.trigger,   trigger_logger, noop);
            // npui.trigger = wrap(npui.trigger, trigger_logger, noop);

            npui.StarInfStatus = wrap(npui.StarInfStatus, function (args) {
                if (!args[0]) {
                    var star = universe.selectedStar;
                    star.uce = Math.floor((500/star.r) * (star.e+1));
                    star.uci = Math.floor((1000/star.r) * (star.i+1));
                    star.ucs = Math.floor((4000/star.r) * (star.s+1));

                    // always show buttons
                    args[0] = true;
                }
                return args;
            }, function (args, ret) {
                return ret;
            });

            npui.FleetNavOrder = wrap(npui.FleetNavOrder, function (args, fno) {
                debug('in FleetNavOrder', args, fno);
                var order       = args[0],
                    star        = universe.galaxy.stars[order[1]],
                    starText    = fno.children[1];


                if (star === undefined) {
                    return fno;
                }

                // remove current text
                fno.removeChild(starText);
                

                //var starLink = Crux.Clickable("select_star", {star: star});
                var starLink = Crux.Widget();
                
                starText
                    .rawHTML(star.hyperlinkedName)
                    .roost(starLink);

                var sibling = fno.children[0];
                // insert child not supported officially
                starLink.mum = fno;
                fno.children.splice(fno.children.indexOf(sibling)+1,0,starLink);
                sibling.ui.after(starLink.ui);

                return fno;
            });

            // empire screen modifications
            npui.PlayerPanel = wrap(npui.PlayerPanel, function (args, playerPanel) {
                var player = args[0];

                if (universe.intelDataFull) {
                    var widge_labels    = ['Total Stars', 'Total Ships', 'Total Carriers', 'New Ships'];

                    // Sparklines
                    for (var i = 0; i < widge_labels.length; i++) {
                        var widge = find_widget(playerPanel, widge_labels[i]);
                        widge.grid(10, 6+(2*i), 14, 3);

                        var chartWidge = Crux.Widget()
                                .grid(24, 6+(2*i), 6, 3)
                                .roost(playerPanel);

                            var columns = [widge_labels[i]];
                            var array = filter_matrix(player.intelData, columns);
                            sparkline(array, chartWidge.ui.get(0));
                    }
                }

                var ship_widge      = find_widget(playerPanel,'Total Ships'),
                    all_nodes       = [].concat(_.values(universe.galaxy.stars), _.values(universe.galaxy.fleets));
                    player_nodes    = _.filter(all_nodes, function (star) {return star.puid === player.uid;})
                    visible_st      = _.reduce(player_nodes, function (m, n) {return m + n.st;}, 0);

                ship_widge.value.rawHTML(player.total_strength + ' ('+visible_st+' visible)');


                return playerPanel;
            });
            // npui.EmpireInf = wrap(npui.EmpireInf, function (args, empireInf) {
            //     return empireInf;
            // });

    

            var // valid_keys = ['bt','gt','ht','mt','st','tt','wt'],
                selections = {
                "ts": "Total Stars",
                "e": "Total Economy",
                "i": "Total Industry",
                "s": "Total Science",
                "sh": "Total Ships",
                "fl": "Total Carriers",
                "wt": "Weapons",
                "bt": "Banking",
                "mt": "Manufacturing",
                "ht": "Hyperspace",
                "st": "Scanning",
                "gt": "Experimentation",
                "tt": "Terraforming"};

            function updatePlayerIntel (player, data) {
                debug('updatePlayerIntel', arguments);

                // function filter (object, keys) {
                //     var o = {};
                //     for (var i in object) {
                //         if (keys.indexOf(i) !== -1) {
                //             o[i] = object[i];
                //         }
                //     }
                //     return o;
                // }

                var constructionArray = [];
                for (i = 0; i < universe.intelDataFull.length; i++) {
                    var snapshot    = universe.intelDataFull[i],
                        stats       = snapshot.players[player.uid],
                        // fstats      = filter(stats, valid_keys),
                        row         = get_values(stats);
                    row.unshift(snapshot.tick);
                    constructionArray.push(row);
                    if (snapshot.tick === 384)
                        debug(stats, stats, row);
                }

                // sort the data based on the first element of each array, the tick
                // the data from the sever seems to become unsorted as a js object
                constructionArray.sort(function(a, b){
                    return a[0] - b[0];
                });

                // add stat name labels
                var labels = Object.keys(stats).sort();
                for (var f in labels) {
                    labels[f] = selections[labels[f]];
                }

                labels.unshift("Tick");
                constructionArray.unshift(labels);
                debug('constructionArray', constructionArray);

                player.intelData = constructionArray;
            }

            np.onIntelDataRecieved = wrap(np.onIntelDataRecieved, function (args, ret) {
                debug('OIDR args', arguments);
                var data = args[1];
                if (data.stats.length) {
                    var players = universe.galaxy.players;
                    for (var i in players) {
                        updatePlayerIntel(players[i], data);
                    };
                }
                return ret;
            });

            replace_widget_handlers(np, "order:intel_data", np.onIntelDataRecieved);

            function filter_matrix (matrix, cols) {
                var headers     = matrix[0],
                    new_header  = [];

                for (var i = 0; i < headers.length; i++) {
                    if (cols.indexOf(headers[i]) != -1) {
                        new_header.push(headers[i]);
                    }
                }

                var new_matrix  = [new_header];
                for (var i = 1; i < matrix.length; i++) {
                    var row     = matrix[i],
                        new_row = [];
                    for (var j = 0; j < row.length; j++) {
                        if (cols.indexOf(headers[j]) != -1) {
                            new_row.push(row[j]);
                        }
                    };
                    new_matrix.push(new_row);
                }
                return new_matrix;
            }

            npui.EmpireTechChart = function (player) {
                 var empireTechChart = Crux.Widget("rel")
                        .setSize(480, 256);
                if (!player.intelData) {
                    return empireTechChart;
                }
                var columns = ["Tick", "Weapons","Banking","Manufacturing","Hyperspace","Scanning", "Experimentation", "Terraforming"];
                var array = filter_matrix(player.intelData, columns);
                array = _.map(array, function (row, i) {
                    return _.map(row, function (value, j) {
                        if (i > 0 && j > 0) {
                            return value * (1 + (j*0.01));
                        }
                        return value;
                    });
                });
                var data = google.visualization.arrayToDataTable(array);
                var chart = new google.visualization.LineChart(empireTechChart.ui.get(0));
                var options = $.extend({},
                    universe.IntelChartOptions,
                    {
                        colors: universe.playerColors, 
                        // legend: {
                        //     position: 'top',
                        //     textStyle :   {color: "SeaShell", fontName: "OpenSansRegular", fontSize: 14},
                        // },
                        // "chartArea" : {
                        //     left: 0, top: 60, 
                        //     width: 480, height: 256-60
                        // }
                    });
                debug(options)

                // $("body").append(playerIntelChart.ui[0]);
                chart.draw(data, options);
                
                // google.visualization.events.addListener(chart, 'ready', function () {
                //     $(playerIntelChart.ui[0]).remove();
                // });

                return empireTechChart
            }

            npui.EmpireScience = wrap(npui.EmpireScience, function (args, empireScience) {
                var player = args[0];

                if (!player.intelData) {
                    return empireScience;
                }

                var size = empireScience.getSize();
                empireScience.setSize(size.w, size.h + 256);

                // npui.EmpireTechChart(player)
                //     .grid(0, 256/Crux.gridSize + 1, 480/Crux.gridSize, 256/Crux.gridSize)
                //     .roost(empireScience)


                return empireScience;
            });



            // Micro Research screen
            // No longer needed, officially added
            // npui.TechRow = wrap(npui.TechRow, function (args, techRow) {
            //     var img         = techRow.children[1],
            //         title       = techRow.children[0],
            //         titleText   = title.ui.text();

            //     // resize image
            //     img.setSize(32, 48);
            //     img.ui.attr({ alt: titleText, title: titleText });

            //     // status message
            //     if (techRow.children.length == 6) {
            //         techRow.children[5].grid(2, 0, 7, 3)
            //     }

            //     // change block values to be on same line
            //     techRow.children[2].grid(9, 0, 7, 3)
            //     techRow.children[3].grid(16, 0, 14, 3)

            //     // remove the description and title
            //     techRow.removeChild(techRow.children[4]);
            //     title.hide(); // can't removeChild, referenced by update event somewhere

            //     // resize entire techrow to account for changes 
            //     techRow.setSize(Crux.gridSize*30, 13*3*1);

            //     return techRow;
            // });


            universe.describeTickRate = wrap(universe.describeTickRate, function (args, ret) {
                return ret.replace('every', '/');
            });


            universe.selectStar = wrap(universe.selectStar, function (args) {
                debug('STAR: ', args);
                return args;
            }, function (args, ret) {
                return ret;
            });
            universe.selectFleet = wrap(universe.selectFleet, function (args) {
                debug('Fleet: ', args);
                return args;
            }, function (args, ret) {
                return ret;
            });

            function drawSelectionBox (map) {
                var sb  = map.selectionBox,
                    ctx = map.context;

                np.trigger("map_refresh");

                ctx.strokeStyle = '#00F000';
                ctx.strokeRect(
                    sb.x * map.scale + map.sx,
                    sb.y * map.scale + map.sy,
                    sb.w * map.scale,
                    sb.h * map.scale);
            }

            NeptunesPride.Map = wrap(NeptunesPride.Map, function (args, map) {
                debug('MAP!!!', map);

                // special condition for right clicks and right click drags
                map.onMouseDown = wrap(map.onMouseDown, function (args) {
                    var event = args[0];
                    if (event.button === 2) {
                        debug('right mouse down', event);

                        // we need to repeat this stuff for compatability with original code
                        if  (map.ignoreMouseEvents || event.target !== map.canvas[0]) { return; }

                        var gpos = map.getGlobalPos(),
                            pos = {
                                x: event.pageX,//(event.pageX - map.sx - gpos.x),
                                y: event.pageY//(event.pageY - map.sy - gpos.y)
                            };

                        debug('right mouse down position: ', gpos, pos, map.sx, map.sy)

                        map.rightDragging = true;
                        if (map.selectionBox) {
                            map.selectionBox.mum.removeChild(map.selectionBox)
                            delete map.selectionBox;
                        }
                        map.selectionBox = Crux.Widget()
                            .place(pos.x, pos.y, 0, 0)
                            .roost(map);
                        map.selectionBox.initPos = pos;
                        map.selectionBox.ui.css('border','2px solid #08AA22')

                        map.one("mouseup", map.onMouseUp);
                        
                        return undefined; // to stop original code from running
                    }

                    return args;
                }, noop);

                map.onMouseUp = wrap(map.onMouseUp, function (args) {
                    var event = args[0];
                    if (event.button === 2 && map.selectionBox) {

                        var players = universe.galaxy.players,
                            message  = 'SELECTION CONTAINS: \n';

                        for (var p in players) {
                            var player      = players[p],
                                dim         = map.selectionBox.selection,
                                objects     = getObjectsIn(dim),
                                pobjects    = _.filter(objects, function (o) { return o.puid === player.uid}),
                                fleets      = _.filter(pobjects, function (o) {return o.kind === 'fleet';}),
                                stars       = _.filter(pobjects, function (o) {return o.kind === 'star';}),

                                strength    = _.reduce(pobjects, function (m, v) {return m + (v.st ? v.st : 0)}, 0),
                                resources   = _.reduce(pobjects, function (m, v) {return m + (v.r ? v.r : 0)}, 0),
                                economy     = _.reduce(stars,   function (m, s) {return m + s.e}, 0),
                                science     = _.reduce(stars,   function (m, s) {return m + s.s}, 0),
                                industry    = _.reduce(stars,   function (m, s) {return m + s.i}, 0);
                            //    ship_prod   = industry * (5 + 1);
                            if (pobjects.length > 0) {
                                message += '\tPLAYER: ' + player.alias + '\n';
                                message += '\t\t' + pobjects.length + ' objects\n';
                                message += '\t\t\t' + stars.length + ' stars\n';
                                message += '\t\t\t\t' + resources + ' res.\n';
                                message += '\t\t\t\t$' + (economy * 10) + ' income\n';
                                message += '\t\t\t\t' + science + ' science\n';
                                message += '\t\t\t\t' + industry + ' industry\n';
                                // message += '\t\t\t' + ship_prod + ' ships / day\n';
                                message += '\t\t\t' + fleets.length + ' fleets\n';
                                message += '\t\t' + strength + ' total strength\n';
                            }
                        }

                        alert(message); 

                        map.selectionBox.mum.removeChild(map.selectionBox)
                        delete map.selectionBox;

                        map.rightDragging = false;
                        return undefined;
                    }
                    return args;
                }, noop);

                function toMapCoord (dim) {
                    return {
                        x: (dim.x - map.sx) / map.scale,
                        y: (dim.y - map.sy) / map.scale,
                        w: dim.w/map.scale,
                        h: dim.h/map.scale
                    };
                }

                function getObjectsIn (dim) {
                    // translate to map coordinates
                    var dim = toMapCoord(dim),
                        nodes = [].concat(_.values(universe.galaxy.stars), _.values(universe.galaxy.fleets)),
                        found = _.filter(nodes, function (v) {
                            var x = parseFloat(v.x), y = parseFloat(v.y);
                            return dim.x        <= x
                                && dim.x+dim.w  >= x
                                && dim.y        <= y
                                && dim.y+dim.h  >= y;
                        });

                    return found;
                }

                // fix for black screen bug
                // 31 10 2013
                map.drawWaypoints = wrap(map.drawWaypoints, function (args) {
                    if (map.waypointOriginScale === 0) {
                        map.waypointOriginScale = 1;
                    }
                    return args;
                }, noop);

                map.onMouseMove = wrap(map.onMouseMove, function (args, ret) {
                    if (map.rightDragging) {
                        var event = args[0];
                        var gpos = map.getGlobalPos(),
                            pos = {
                                x: event.pageX,//(event.pageX - map.sx - gpos.x),
                                y: event.pageY//(event.pageY - map.sy - gpos.y)
                            },
                            cpos = map.selectionBox.initPos,
                            dim = {
                                x: _.min([cpos.x, pos.x]),
                                y: _.min([cpos.y, pos.y]),
                                w: Math.abs(pos.x - cpos.x),
                                h: Math.abs(pos.y - cpos.y)
                            };

                        map.selectionBox.place(dim.x, dim.y, dim.w, dim.h);
                        map.selectionBox.selection = dim;


                    }
                    return ret;
                });

                replace_widget_handlers(map, "mousemove", map.onMouseMove);
                replace_widget_handlers(map, "mousedown", map.onMouseDown);

                var sbl, hbl, pl, al, fs;
                
                map.createSprites = wrap(map.createSprites, function (args, ret) {
                    pl = hbl = sbl = al = undefined;
                    return ret;
                });

                map.draw = wrap(map.draw, function (args, ret) {
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

                map.drawSprite = wrap(map.drawSprite, function (args, ret) {
                    // debug('drawing sprites', arguments);

                    return ret;
                });




                // reregister draw function
                Crux.tickCallbacks.pop();
                Crux.tickCallbacks.push(map.draw);
                return map;
            });
        };

        inject_init();

    }) (unsafeWindow);
} catch (e) {
    console.error(e);
}