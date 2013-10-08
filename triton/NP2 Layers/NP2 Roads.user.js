// ==UserScript==
// @name        NP2 Roads
// @description -----------------
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game/*
// @version     1
// @run-at      document-start
// @grant       none
// ==/UserScript==

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
        w.debug = debug;

        debug("starting");

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

        function wrap (f, pre, post) {
            var w = function wrapped_function () {
                var args = arguments;
                if (pre) {
                    args = pre(args);
                }
                var result = f.apply(this, args);
                if (!post) {
                    return result;
                }
                return post(args, result);
            };
            
            return w;
        }

        function canvas (width, height) {
            var c = document.createElement('canvas');
            c.width = width;
            c.height = height;
            return c;
        }



        function clearCircle (ctx, x, y, radius) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
            ctx.clip();
            ctx.clearRect(x - radius - 1, y - radius - 1,
                              radius * 2 + 2, radius * 2 + 2);
            ctx.restore();
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
            ctx.moveTo(starA.sprite.ox, starA.sprite.oy);
            ctx.lineTo(starB.sprite.ox, starB.sprite.oy);
            ctx.stroke();
        }

        function drawPaths (universe, map) {
                debug('drawPaths', arguments);
                var stars       = universe.galaxy.stars,
                    prop        = universe.player ? universe.player.tech.propulsion.value : 4/8,
                    next_prop   = prop + (1/8), // speed and distance units are in 1/8th of ly
                    ctx         = map.context;

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

        function drawBoundaries (universe, map) {
            var players = universe.galaxy.players;

            for (var i in players)  if (players.hasOwnProperty(i)) {
                drawPlayerBoundary(universe, map, players[i]);
            }
        }

        function drawPlayerBoundary (universe, map, player) {
                var map_ctx         = map.context,
                    map_canvas      = map_ctx.canvas,
                    stars           = universe.galaxy.stars,
                    buffer          = canvas(map_canvas.width, map_canvas.height),
                    ctx             = buffer.getContext('2d');

                // draw scanning ranges
                for (var j in stars)  if (stars.hasOwnProperty(j)) {
                    if (stars[j].player !== player) {
                        continue;
                    }
                    var star    = stars[j],
                        tx      = (star.x * map.scale + map.sx) * map.pixelRatio,
                        ty      = (star.y * map.scale + map.sy) * map.pixelRatio,
                        sc      = (star.player.tech.scanning.value) * map.scale * map.pixelRatio / 250;
                    
                    // so original code will draw on our buffer
                    map.context = ctx;
                    map.drawSprite({
                            ox: tx,
                            oy: ty,
                            width: 576,
                            height: 576,
                            pivotX: 288,
                            pivotY: 288,
                            rotation: 0,
                            scale: sc,
                            image: tint(map.scanningRangeSrc, player.color),
                            spriteX: 0,
                            spriteY: 0,
                            visible: true});
                    map.context = map_ctx;
                }

                for (var i in stars) if (stars.hasOwnProperty(i)) {
                    if (stars[i].player !== player) {
                        continue;
                    }
                    var star    = stars[i],
                        x       = star.sprite.ox,
                        y       = star.sprite.oy,
                        radius  = (star.player.tech.scanning.value) * map.scale * 0.95;

                        clearCircle(ctx, x, y, radius);
                }

                // draw buffer
                map_ctx.globalCompositeOperation = 'source-over';
                map_ctx.drawImage(buffer, 0, 0);
        }


        w._init = function (Mousetrap, Crux, NeptunesPride, universe, inbox, npui, npuis, np, si) {
            debug('_init args: ', arguments);

            np.onStartPaths = function (e) {
                debug("onStartPaths");
                if (universe.editMode === "show_paths") {
                    universe.editMode = "normal";
                } else {
                    universe.editMode = "show_paths";
                    np.trigger("hide_screen");
                }
                np.trigger("map_refresh");
            };
            
            np.on("start_paths", np.onStartPaths);
            Mousetrap.bind("p", caller(np.trigger, "start_paths"));


            np.onStartBoundaries = function (e) {
                debug("onStartBoundaries");
                if (universe.editMode === "show_boundaries") {
                    universe.editMode = "normal";
                } else {
                    universe.editMode = "show_boundaries";
                    np.trigger("hide_screen");
                }
                np.trigger("map_refresh");
            };
            
            np.on("start_boundaries", np.onStartBoundaries);
            Mousetrap.bind("b", caller(np.trigger, "start_boundaries"));


            document.oncontextmenu = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
            };

            NeptunesPride.Map = wrap(NeptunesPride.Map, function (args) {
                debug('NP.Map args', args); //npui, universe
                return args;
            }, function (args, map) {
                w.map = map;

                debug('wrapping map.draw');
                map.draw = wrap(map.draw, function (args) {
                    return args;
                }, function (args, ret) {

                    if (universe.editMode === "show_boundaries") {
                        drawBoundaries(universe, map);
                    }
                    else if (universe.editMode === "show_paths") {
                        drawPaths(universe, map);
                    }

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
    console.log(e);
}