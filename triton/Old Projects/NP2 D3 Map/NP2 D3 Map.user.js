// ==UserScript==
// @name        NP2 D3 Map
// @description 
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game*
// @version     1
// @require     http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.3.0/lodash.js
// @require     http://userscripts.org/scripts/source/181520.user.js
// @require     http://d3js.org/d3.v3.min.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals $, NP2M, d3 */
(function() {
    "strict true";

    // Constants
    var DEBUG = true,
        NAME = 'NP2 D3 Map',
        VERSION = '1',
        CSS = str(function() {
            /*!
        svg {
            stroke: #FFF5EE;
            font-family: "OpenSansRegular";
            font-size: 14px;
            background: #000;
        }
        .axis path,
        .axis line {
            fill: none;
            stroke: #FFF;
            shape-rendering: crispEdges;
        }

        .x.axis path {
            display: none;
        }

        .line {
            fill: none;
            -stroke: steelblue;
            stroke-width: 3px;
        }

        .line:hover {
            stroke: white;
        }


        .d3-tip {
            line-height: 1;
            font-weight: bold;
            padding: 12px;
            background: rgba(200, 50, 0, 0.8);
            color: #fff;
            border-radius: 2px;
        }

        .d3-tip:after {
            box-sizing: border-box;
            display: inline;
            font-size: 10px;
            width: 100%;
            line-height: 1;
            color: rgba(0, 0, 0, 0.8);
            position: absolute;
        }

        .d3-tip.n:after {
            content: "\25BC";
            margin: -1px 0 0 0;
            top: 100%;
            left: 0;
            text-align: center;
        }
    */
        });

    // Utility Functions
    function debug() {
        if (DEBUG) {
            console.log.apply(console, arguments);
        }
    }

    function str(f) {
        return f.toString()
            .replace(/^[^\/]+\/\*!?/, '')
            .replace(/\*\/[^\/]+$/, '');
    }

    function addCss(css) {
        $("<style type='text/css'></style>")
            .html(css)
            .appendTo("head");
    }

    function replace_widget_handlers(widget, name, func) {
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

    function pre_init_hook() {
        debug(NAME + ': pre_init_hook');
        google.load("visualization", "1", {
            packages: ["imagesparkline"],
            callback: function() {}
        });

        addCss(CSS);
    }

    function post_init_hook(data) {
        debug(NAME + ': post_init_hook', data);

        var Crux = data.Crux,
            universe = data.universe,
            np = data.np,
            npui = data.npui;

        unsafeWindow.data = data;
        unsafeWindow.npui = npui;
        unsafeWindow.np = np;


        // Wrap Map
        NeptunesPride.Map = NP2M.wrap(NeptunesPride.Map, function(args, map) {
            unsafeWindow.map = map;

            debug(NAME + ': map is ', map);

            //--------------------------------------------------------------------------
            // Initialisation
            //--------------------------------------------------------------------------
            map.init = function init() {
                map.ui.empty(); // remove the canvas element from the DOM
                var container = map.ui.get(0);
                map.svg = d3.select(container).append("svg:svg");

                map.canvas = map.ui.find('svg'); // allows map.layout() to set the width and height.

                // map.context.lineCap = "round"; -- should already be the case
                map.sprites = {};
                map.objects = {};
                map.addSprites();
                map.addObjects();

                // 9x9 icons of 64x64px each
                var defs = map.svg.append('defs');

                defs.append("clipPath")
                    .attr("id", "icon-cp-64")
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 64)
                    .attr("height", 64);

                var images = [map.starSrc];

                defs.selectAll('image')
                    .data(images)
                    .enter()
                    .append('image')
                    .attr('id', function(d) {
                        return _.last(d.src.split('/')).replace('.', '_');
                    })
                    .attr('width', function(d) {
                        return d.width;
                    })
                    .attr('height', function(d) {
                        return d.height;
                    })
                    .attr('xlink:href', function(d) {
                        return d.src;
                    });

                defs.selectAll('g')
                    .data(d3.range(9 * 9).map(function(i) {
                        return [64 * Math.floor(i / 9), 64 * (i % 9)];
                    }))
                    .enter()
                    .append('g')
                    .attr('id', function(d, i) {
                        return 'g-' + d.join('x');
                    })
                    .attr('clip-path', 'url(#icon-cp-64)')
                    .append('use')
                    .attr('xlink:href', '#stars_png')
                    .attr('transform', function(d) {
                        return 'translate(' + d + ')';
                    });
            };

            // takes a position object or other object with x and y. Returns screen coordinates.
            function spaceToScreen(pos) {
                var x = pos.x ? pos.x : pos[0],
                    y = pos.y ? pos.y : pos[1];
                return {
                    x: (x * map.scale + map.sx) * map.pixelRatio,
                    y: (y * map.scale + map.sy) * map.pixelRatio
                };
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
            };

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
            };

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
                        star.sprites.push(['player-' + star.puid, 1]);
                        if (star.ga) {
                            star.sprites.push(['gate-' + Math.floor(star.puid / 8), 1]);
                        }
                    }

                    // natural resources
                    if (star.r > 0) {
                        var scale = ((universe.galaxy.stars[i].nr + 12) / 48);
                        star.sprites.push(['resource-ring', scale]);
                    }
                    map.addObject('star-' + star.uid, star);
                }

                // for (var i in universe.galaxy.fleets) {
                //     var fleet = universe.galaxy.fleets[i];

                //     addObject(fleet);
                // }
            };

            // svg.append("defs").selectAll(".rectdef")
            //     .data(data).enter()
            //     .append("symbol")
            //     .attr("class", "rectdef")
            //     .attr("id", function(d, i) {
            //         return "rect" + d.name;
            //     })
            //     .append("rect")
            //     .attr("x", 0) / / overridden below
            //     .attr("width", "100%") / / overridden below
            //     .attr("y", 0) // overridden below
            // .attr("height", function(d, i) {
            //     return d.height
            // });

            // svg.selectAll(".bar")
            //     .data(data).enter()
            //     .append("use")
            //     .attr("class", "bar")
            //     .attr("xlink:href", function(d) {
            //         return "#rect" + d.type;
            //     })
            //     .attr("x", function(d) {
            //         return d.x
            //     })
            //     .attr("width", function(d) {
            //         return d.w;
            //     }) // this correctly adjusts width!
            // .attr("y", function(d) {
            //     return 0;
            // });



            //--------------------------------------------------------------------------
            // Move and Touch Events
            //--------------------------------------------------------------------------
            map.onMouseDown = function(event) {
                if (map.ignoreMouseEvents) return;

                // if (event.target !== map.canvas[0]) {
                //     return;
                // }
                if ($(event.target).closest(container).length === 0) {
                    return;
                }

                // get the global position of the map
                var gx = map.ui.offset().left;
                var gy = map.ui.offset().top;
                npui.ui.trigger("map_clicked", {
                    x: (event.pageX - map.sx - gx) / map.scale,
                    y: (event.pageY - map.sy - gy) / map.scale
                });

                map.dragging = true;
                map.oldX = event.pageX - map.x;
                map.oldY = event.pageY - map.y;
                map.one("mouseup", map.onMouseUp);
            };

            //--------------------------------------------------------------------------
            // Rendering
            //--------------------------------------------------------------------------
            // We need to port any methods which use `canvas.context` to d3

            map.draw = function() {

                if (map.scale !== map.scaleTarget) {
                    map.zoom(map.scaleTarget - map.scale);
                }
                map.updateSprites(map.objects);
            };
            // map.draw = function() {
            //     map.old_sprites = []; // remove all sprites
            //     if (map.scale !== map.scaleTarget) {
            //         map.zoom(map.scaleTarget - map.scale);
            //     }

            //     map.updateSpritePositions();
            //     var noMiniMap = !map.miniMapEnabled;
            //     if (noMiniMap) {
            //         map.drawNebular();
            //     }
            //     map.drawSelectionRing();

            //     if (noMiniMap && universe.interfaceSettings.showRipples) {
            //         map.drawRipples();
            //     }

            //     if (noMiniMap) {
            //         map.drawResourceRings();
            //     }

            //     map.drawGates();
            //     map.drawStars();
            //     map.drawOwnershipRings();
            //     map.drawScanningRange();
            //     map.drawWaypoints();

            //     if (universe.interfaceSettings.showFleets && noMiniMap) {
            //         map.drawFleetOwnershipRings();
            //         map.drawFleetRange();
            //         map.drawFleetPath();
            //         map.drawFleets();
            //     }
            //     map.drawStarFleetRange();

            //     if (universe.editMode === "ruler") {
            //         map.drawRuler();
            //     }
            //     map.drawText();

            //     map.updateSprites(map.old_sprites);
            // };

            map.drawSprite = function(sprite) {
                // original

                // if (sprite.visible){
                //     map.context.save();
                //     map.context.translate(sprite.ox, sprite.oy);
                //     map.context.rotate(sprite.rotation);
                //     map.context.scale(sprite.scale, sprite.scale);
                //     map.context.drawImage(sprite.image, sprite.spriteX, sprite.spriteY, sprite.width, sprite.height, -sprite.pivotX, -sprite.pivotY, sprite.width , sprite.height);
                //     map.context.restore();
                // }

                // must take into account map.context.globalAlpha
                sprite.alpha = map.context.globalAlpha;
                map.old_sprites.push(sprite);
            };

            // map.updateSprites = function(sprites) {
            //     // DATA JOIN
            //     // Join new data with old elements, if any.
            //     var images = map.svg.selectAll("image").data(sprites);

            //     // UPDATE
            //     // Update old elements as needed.
            //     images.attr("class", "update");

            //     // ENTER
            //     // Create new elements as needed.
            //     //TODO: filter by sprite.visible

            //     images.enter().append("svg:use")
            //         .attr("class", "enter")
            //         .attr('debug', function(d) {
            //             return d.image.src + ' --- ' + d.toSource();
            //         })
            //         .attr("xlink:href", function(d) {
            //             return '#g-' + d.spriteX + 'x' + d.spriteY + '';
            //         })
            //         .attr("x", function(d, i) {
            //             return d.ox - d.pivotX;
            //         })
            //         .attr("y", function(d, i) {
            //             return d.oy - d.pivotY;
            //         })
            //         .attr("transform", function(d, i) {
            //             return 'rotate(' + d.rotation + ') scale(' + d.scale + ')';
            //         });

            //     // ENTER + UPDATE
            //     // Appending to the enter selection expands the update selection to include
            //     // entering elements; so, operations on the update selection after appending to
            //     // the enter selection will apply to both entering and updating nodes.
            //     //images.text(function(d) { return d; });

            //     // EXIT
            //     // Remove old elements as needed.
            //     images.exit().remove();
            // };


            map.updateSprites = function(objects) {

                debug('updateSprites', arguments);

                var objects = _.toArray(objects);

                // DATA JOIN
                // Join new data with old elements, if any.
                var gs = map.svg
                    .selectAll(".object")
                    .data(objects)
                    .enter()
                    .append('g')
                    .attr('class', 'object');

                debug('updateSprites gs', gs);

                var sprites = gs.selectAll(".sprite")
                    .data(function(d) {
                        return _.map(d.sprites, function(s, i) {
                            return [s, i];
                        });
                    });

                debug('updateSprites sprites', sprites);

                // UPDATE
                // Update old elements as needed.
                // sprites.attr("class", "update");

                // ENTER
                // Create new elements as needed.
                //TODO: filter by sprite.visible

                sprites.enter().append("svg:use")
                    .attr("class", "sprite")
                    .attr("xlink:href", function(d) {
                        return '#' + d[0].sprites[d[1]][0];
                    })
                    .attr("x", function(d, i) {
                        return d[0].x;
                    })
                    .attr("y", function(d, i) {
                        return d[0].y;
                    })
                    .attr("transform", function(d, i) {
                        return 'rotate(' + 0 + ') scale(' + d[0].sprites[d[1]][1] + ')';
                    });

                // ENTER + UPDATE
                // Appending to the enter selection expands the update selection to include
                // entering elements; so, operations on the update selection after appending to
                // the enter selection will apply to both entering and updating nodes.
                //sprites.text(function(d) { return d; });

                // EXIT
                // Remove old elements as needed.
                sprites.exit().remove();
            };




            map.drawText = function(sprite) {
                debug('NOT IMPLEMENTED: map.drawText');
            };
            map.drawRadialRuler = function(sprite) {
                debug('NOT IMPLEMENTED: map.drawRadialRuler');
            };
            map.drawFleetPath = function(sprite) {
                debug('NOT IMPLEMENTED: map.drawFleetPath');
            };
            map.drawRuler = function(sprite) {
                debug('NOT IMPLEMENTED: map.drawRuler');
            };







            // var w = 960,
            //     h = 500;

            // var vertices = d3.range(100).map(function(d) {
            //   return [Math.random() * w, Math.random() * h];
            // });

            // var svg = d3.select("#chart")
            //   .append("svg:svg")
            //     .attr("width", w)
            //     .attr("height", h)
            //     .attr("class", "PiYG")
            //     .on("mousemove", update);

            // svg.selectAll("path")
            //     .data(d3.geom.voronoi(vertices))
            //   .enter().append("svg:path")
            //     .attr("class", function(d, i) { return i ? "q" + (i % 9) + "-9" : null; })
            //     .attr("d", function(d) { return "M" + d.join("L") + "Z"; });

            // svg.selectAll("circle")
            //     .data(vertices.slice(1))
            //   .enter().append("svg:circle")
            //     .attr("transform", function(d) { return "translate(" + d + ")"; })
            //     .attr("r", 2);

            // function update() {
            //   vertices[0] = d3.svg.mouse(this);
            //   svg.selectAll("path")
            //       .data(d3.geom.voronoi(vertices)
            //       .map(function(d) { return "M" + d.join("L") + "Z"; }))
            //       .filter(function(d) { return this.getAttribute("d") != d; })
            //       .attr("d", function(d) { return d; });
            // }






            // var stars = _.toArray(universe.galaxy.stars);
            // var vertices = _.map(stars, function (star) {
            //     return [map.sx + star.x * 100, map.sy + star.y * 100];
            // });
            // var vv = d3.geom.voronoi(vertices);


            // var svg = d3.select(container).append("svg:svg");

            // map.canvas = map.ui.find('svg'); // allows map.layout to set the width and height.

            // _.each(stars, function (star, i) {
            //     star.edge = vv[i];
            // })

            // svg.selectAll("path")
            //     .data(stars)
            //   .enter().append("svg:path")
            //     .attr("d", function(d) { return "M" + d.edge.join("L") + "Z"; });

            // svg.selectAll("circle")
            //     .data(stars)
            //   .enter().append("svg:circle")
            //     .attr("transform", function(d) { return "translate(" + [map.sx + d.x * 100, map.sy + d.y * 100] + ")"; })
            //     .attr("r", 6)
            //     .style('fill', function (d) { debug('d is ', d); return d.player ? d.player.color : 'white'; })
            //     .style('stroke', 'black');

            // function updateD3Graph() {
            //     svg.selectAll("path")
            //         .data(d3.geom.voronoi(vertices).map(function(d) { return "M" + d.join("L") + "Z"; }))
            //         .filter(function(d) { return this.getAttribute("d") != d; })
            //         .attr("d", function(d) { return d; });

            //     svg.selectAll("circle")
            //         .data(vertices.slice(1))
            //         .filter(function(d) { return this.getAttribute("transform") != d; })
            //         .attr("transform", function(d) { return "translate(" + d + ")"; })
            // }

            // map.moveDelta = NP2M.wrap(map.moveDelta, function () {
            //     vertices = _.map(universe.galaxy.stars, function (star) {
            //         return [map.sx+star.x*100, map.sy+star.y*100];
            //     });
            //     updateD3Graph();
            // });

            // map.onMouseDown = function (event) {
            //     if (map.ignoreMouseEvents) return;

            //     // get the global position of the map
            //     var gx = map.ui.offset().left;
            //     var gy = map.ui.offset().top;
            //     npui.ui.trigger("map_clicked",  {
            //         x: (event.pageX - map.sx - gx) / map.scale,
            //         y: (event.pageY - map.sy - gy) / map.scale
            //     });

            //     map.dragging = true;
            //     map.oldX = event.pageX - map.x;
            //     map.oldY = event.pageY - map.y;
            //     map.one("mouseup", map.onMouseUp);
            // };




            map.init();



            return map;
        });
    }

    NP2M.register(NAME, VERSION, pre_init_hook, post_init_hook);
})();