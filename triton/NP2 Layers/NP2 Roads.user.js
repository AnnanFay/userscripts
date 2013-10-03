// ==UserScript==
// @name        NP2 Roads
// @description -----------------
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game/*
// @version     1
// @run-at      document-start
// @grant       none
// ==/UserScript==

// Start userscript at document-start
// Capture scripts with beforescriptexecute
// If the script is one which we want to patch:
//      get the contents with SYNCRONOUS http request
//      patch contents
//      inject into new script tag

/* globals unsafeWindow, Mousetrap, map*/
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

        console.log("starting");

        String.prototype.splice = function( idx, rem, s ) {
            return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
        };

        function get (page, callback, async) {
            function listener () {
                callback(this.responseText);
            }

            var r = new XMLHttpRequest();
            r.onload = listener;
            r.open("get", page, (async === undefined ? false : async));
            r.send();
        }
        
        function patch (f) {
            return f.toString().replace(/^function.*{|}$/g, '');
        }

        function patch_script (source, start_tag, end_tag, new_code) {
            function idx (c, t) {
                debug('idx', arguments);
                if (t instanceof RegExp) {
                    var m = c.match(t);
                    return m ? m.index : -1;
                }
                return c.indexOf(t);
            }
            debug("PATCHING", source.length, start_tag, end_tag, new_code);
            var start_tag_pos = idx(source, start_tag);
            if (start_tag_pos === -1) {
                debug("Could not find start tag", start_tag_pos, start_tag);
                return "";
            }

            var start_pos    = start_tag_pos + start_tag.length;
            var block_length = idx(source.slice(start_pos), end_tag);
            if (block_length === -1) {
                debug("Could not find end tag");
                debug("Near code:", (source.slice(start_pos, start_pos+400)))
                return "";
            }

            //debug("poses", start_tag_pos, start_pos, block_length);
            var code = source.splice(start_pos, block_length, new_code);
            debug('patched', code.slice(start_pos-20, start_pos+(new_code.length)+20));
            return code;
        }

        function disable_script (r, callback) {
            function listener (e) {
                var target = e.target;
                var src = target.src;
                var content = target.innerHTML;

                //debug("listening", src);
                if ((src && !r.test(src)) || (content &&  !r.test(content))) {
                    return;
                }

                //debug("heard", src);
                e.preventDefault();
                e.stopPropagation();
                
                w.removeEventListener('beforescriptexecute', listener);
                callback(src, content);
            }

            w.addEventListener('beforescriptexecute', listener);
        }

        function insert_script (source) {
            debug("inserting source");
            var s = document.createElement('script');
            s.innerHTML = source;
              document.head.appendChild(s);
              debug("inserted", s);
        }
        //
        // Patches
        //
        var draw_star_patch = patch(function() {
            var i, stars = universe.galaxy.stars;
            if (universe.editMode !== "show_paths") {
                for (i in stars) if (stars.hasOwnProperty(i)) {
                    map.drawSprite(stars[i].sprite);
                }
                return;
            }

            var j, dist,
                prop = universe.player ? universe.player.tech.propulsion.value : 4/8,
                next_prop = prop + (1/8); // speed and distance units are in 1/8th of ly           

            map.context.lineWidth = 4 * map.pixelRatio;

            // TODO: Make more efficient. This is basically collision detection
            for (i in stars) if (stars.hasOwnProperty(i)) {
                map.drawSprite(stars[i].sprite);
                for (j in stars) if (stars.hasOwnProperty(j)) {
                    dist = universe.distance(stars[i].x, stars[i].y, stars[j].x, stars[j].y);
                    if (dist <= next_prop) {
                        if (dist <= prop) {
                            map.context.strokeStyle = "rgba(255, 255, 255, 0.3)";
                        } else {
                            map.context.strokeStyle = "rgba(255, 100, 100, 0.1)";
                        }
                           
                        map.context.beginPath();
                        map.context.moveTo(stars[i].sprite.ox, stars[i].sprite.oy);
                        map.context.lineTo(stars[j].sprite.ox, stars[j].sprite.oy);
                        map.context.stroke();
                    }
                }
            }
        });
        var waypoint_patch = patch(function () {
            debug('clicked star', event, data);
            // right click from fleet screen
            if (npui.showingScreen === "fleet" &&
                    data.buttons === 2 && data.button === 2) {
                debug('go go go ');
                return;
            }
            return;
        });

        var init_patch = patch(function (settings, universe, inbox, npui, npuis, np, si) {
            debug('universe', universe);
            debug('inbox   ', inbox);
            debug('npui    ', npui);
            debug('npuis   ', npuis);
            debug('np      ', np);
            debug('settings', settings);

            np.onStartPaths = function (e) {
                if (universe.editMode === "show_paths") {
                    universe.editMode = "normal";
                } else {
                    universe.editMode = "show_paths";
                    np.trigger("hide_screen");
                }
                np.trigger("map_refresh");
            };
            
            np.on("start_paths", np.onStartPaths);
            Mousetrap.bind(["p", "P"], function () {np.trigger("start_paths");});

            document.oncontextmenu = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
            };
            // map.on("contextmenu", function (e) {
            //         e.preventDefault();
            //         e.stopPropagation();
            // });

        });

        function insert_patched_interface_map (src, content) {
            debug('patching interface_map.js');
            function cb (source) {
                var patched_source = patch_script(source,
                    "map.drawStars = function () {",
                    "};",
                    draw_star_patch);

                insert_script(patched_source);
            }
            debug("getting script");
            get("/triton/scripts/game/interface_map.js", cb, true);
        }

        function insert_patched_game (src, content) {
            debug('patching game.js');
            function cb (source) {
                debug('cb game.js');
                var patched_source = patch_script(source,
                    "if (ps[0].kind === \"star\") {",
                    "}\r\n            if (ps[0].kind === \"fleet\") {",
                    waypoint_patch);

                insert_script(patched_source);
            }
            debug("getting script");
            get("/triton/scripts/game/game.js", cb, true);
        }


        function patch_init (src, content) {
            debug("patching init");
            var patched_source = patch_script(content,
                "var si = NeptunesPride.SharedInterface(npui);",
                "",
                init_patch);

            // we need to append to end of event queue so other scripts are injected first
            setTimeout(function () {
                insert_script(patched_source);
            }, 0);
        }

        // function insert_new_screens (src, content) {
        //     function cb (source) {
        //         var patched_source = patch_script(source,
        //             "var screens = {",
        //             "",
        //             '"carriers": npui.MainMenuScreen,');

        //         insert_script(patched_source);
        //     }
        //     debug("getting script");
        //     get("/triton/scripts/game/interface.js", cb, true);
        // }

        //disable_script(/interface_map\./,                       insert_patched_interface_map);
        //disable_script(/game\./,                                insert_patched_game);
        //disable_script(/interface\./,                             insert_new_screens);
        disable_script(/\$\(window\)\.ready\(function \(\) \{/, patch_init);

    }) (unsafeWindow);
} catch (e) {
    console.log(e);
}