// ==UserScript==
// @name        NP2 UI Tweaks
// @description Various UI and chart tweaks
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game*
// @version     2
// @require     http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.3.0/lodash.js
// @require     http://userscripts.org/scripts/source/181520.user.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* TODO
    Split this file up again
        it's getting too big.
    Multi-selectins
        Stars
        Fleets
    Groups/Labels
        Stars
        Fleets
        Players
*/

/* globals unsafeWindow, $, _, google, NP2M */
(function() {
    "strict true";

    var DEBUG = true;
    var SYMBOLS = {
        cycle: '\u262F'
    };

    var CSS = '\
.star_directory td {\
    padding: 0px;\
}\
\
.star_directory thead tr {\
    background-color: black;\
}\
\
.star_directory_name {\
    text-align: left;\
    display: block;\
}\
\
.star_directory tbody tr:first-child {\
    background-color: inherit;\
}\
\
';

    function debug() {
        if (DEBUG) {
            console.log.apply(this, arguments);
        }
    }

    function addGlobalStyle(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) {
            return;
        }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }

    function find_widget(widget, needle) {
        var children = widget.children;

        for (var i = children.length - 1; i >= 0; i--) {
            var c = children[i],
                text = (children[i].label || children[i])
                    .ui.text();
            if (text.indexOf(needle) != -1) {
                return c;
            }
        }
        return undefined;
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
        console.log('UI TWEAKS: pre_init_hook');
        addGlobalStyle(CSS);
    }

    function post_init_hook(data) {
        console.log('UI TWEAKS: post_init_hook', data);
        var Crux = data.Crux,
            GS = Crux.gridSize,
            universe = data.universe,
            np = data.np,
            npui = data.npui;

        npui.StarInspector = NP2M.wrap(npui.StarInspector, function(args, starInspector) {
            var star = universe.selectedStar;
            // we still want to show infrastructure on unclaimed stars
            var unclaimedStar = !star.player;
            if (unclaimedStar) {
                npui.StarInfStatus(false)
                    .roost(starInspector);
            }
            // add sector symbol to heading
            var home = universe.player.home;
            var dx = star.x - home.x, dy = star.y - home.y;
            var pos = '(' + Math.floor(dx*8) + ',' + Math.floor(-dy*8) + ')';
            var heading = star.homeplayer.colourBox + ' ' + star.n + ' ' + pos;
            starInspector.heading.rawHTML(heading);


            if (star ===  star.home) {
                starInspector.heading.ui.find('span').css('text-shadow', '0px 0px 12px #fff');
            }

            return starInspector;
        });

        npui.FleetNavOrder = NP2M.wrap(npui.FleetNavOrder, function(args, fno) {
            debug('in FleetNavOrder', args, fno);
            var order = args[0],
                star = universe.galaxy.stars[order[1]],
                starText = fno.children[1];


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
            fno.children.splice(fno.children.indexOf(sibling) + 1, 0, starLink);
            sibling.ui.after(starLink.ui);

            return fno;
        });

        npui.LeaderboardPlayer = NP2M.wrap(npui.LeaderboardPlayer, function(args, leaderboardPlayer) {
            var player = args[0];
            if (player.home) {
                var eye = Crux.IconButton("icon-eye", "map_center_slide", player.home)
                    .grid(27, 0, 3, 3)
                    .roost(leaderboardPlayer);

                eye.ui.css('color', 'red');
                eye.ui.attr('title', player.home.n);
            }

            return leaderboardPlayer;
        });

        // empire screen modifications
        // npui.PlayerPanel = NP2M.wrap(npui.PlayerPanel, function(args, playerPanel) {
        //     var player = args[0],
        //         showEmpire = args[1];

        //     // previous next player
        //     var uid = player.uid;
        //     if (universe.galaxy.players[uid - 1]) {
        //         var prevButton = Crux.IconButton("icon-prev", "select_player", uid - 1)
        //             .grid(10, 0, 3, 3)
        //             .roost(playerPanel);
        //     }
        //     if (universe.galaxy.players[uid + 1]) {
        //         var nextButton = Crux.IconButton("icon-next", "select_player", uid + 1)
        //             .grid(20, 0, 3, 3)
        //             .roost(playerPanel);
        //     }

        //     var ship_widge = find_widget(playerPanel, 'Total Ships'),
        //         all_nodes = [].concat(_.values(universe.galaxy.stars), _.values(universe.galaxy.fleets)),
        //         player_nodes = _.filter(all_nodes, function(star) {
        //             return star.puid === player.uid;
        //         }),
        //         visible_st = _.reduce(player_nodes, function(m, n) {
        //             return m + n.st;
        //         }, 0);

        //     ship_widge.value.rawHTML(player.total_strength + ' (' + visible_st + ' visible)');

        //     if (!showEmpire && player.home) {
        //         var eye = Crux.IconButton("icon-eye", "map_center_slide", player.home)
        //             .grid(5, 13, 3, 3)
        //             .roost(playerPanel);
        //         eye.ui.css('color', 'red');
        //         eye.ui.attr('title', player.home.n);
        //     }

        //     return playerPanel;
        // });
        // npui.EmpireInf = NP2M.wrap(npui.EmpireInf, function (args, empireInf) {
        //     return empireInf;
        // });

        universe.describeTickRate = NP2M.wrap(universe.describeTickRate, function(args, ret) {
            return ret.replace('every', '/');
        });

        npui.RulerToolbar = NP2M.wrap(npui.RulerToolbar, function(args) {
            universe.ruler.gate = true;
            return args;
        }, function(args, ret) {
            return ret;
        });

        np.onNewPlayerAchievements = function(event, data) {

            console.log('onNewPlayerAchievements', event, data);
            var player;
            for (var i in data) {
                player = universe.galaxy.players[data[i].uid];
                data[i].alias = player.colourBox + player.hyperlinkedAlias;
            }
            universe.playerAchievements = data;
            np.trigger("refresh_interface");

            unsafeWindow.playerAchievements = universe.playerAchievements;
            unsafeWindow.universe = universe;
        };
        replace_widget_handlers(np, "order:player_achievements", np.onNewPlayerAchievements);

        np.onFetchPlayerAchievements = function() {
            //if (NeptunesPride.gameConfig.anonymity === 1) return;
            //if (universe.playerAchievements !== null) return;
            np.trigger("server_request", {
                type: "fetch_player_achievements",
                game_number: NeptunesPride.gameNumber
            });
        };

        npui.TechSummary = function() {
            var techNow = Crux.Widget("rel  col_base")
                .size(30 * GS);

            Crux.Text("tech_summary", "section_title col_black rel")
                .grid(0, 0, 30, 3)
                .roost(techNow);

            var bg = Crux.Widget("rel")
                .roost(techNow);

            var html, p, yPos = 0;
            var total;
            for (p in universe.player.tech) {
                var tech = universe.player.tech[p];
                if (universe.player.tech[p].brr > 0) {
                    Crux.Text("tech_" + p, "pad12")
                        .grid(0, yPos, 30, 2)
                        .roost(bg);

                    Crux.Text("level_x", "pad12")
                        .format({
                            x: tech.level
                        })
                        .grid(14, yPos, 6, 2)
                        .roost(bg);
                    total = Number(tech.level) * Number(tech.brr);
                    //html = tech.research + " < " + total + " > " + (total - tech.research);
                    html = tech.research + " of " + total;
                    Crux.Text("", "txt_right pad12")
                        .rawHTML(html)
                        .grid(20, yPos, 10, 2)
                        .roost(bg);

                    yPos += 2;
                }
            }
            bg.size(30 * GS, yPos * 16);


            Crux.Widget("rel")
                .size(30 * GS, 16)
                .roost(techNow);

            return techNow;
        };


        function timeToTick(tick) {
            var ms_since_data = new Date()
                .valueOf() - universe.now.valueOf();
            var tf = universe.galaxy.tick_fragment;
            var ltc = universe.locTimeCorrection;

            var ms_remaining = (tick * 1000 * 60 * universe.galaxy.tick_rate) -
                (tf * 1000 * 60 * universe.galaxy.tick_rate) -
                ms_since_data - ltc;

            return ms_remaining;
        };

        universe.timeToProduction = function() {
            var tr = universe.galaxy.production_rate - universe.galaxy.production_counter;
            var date = new Date((new Date())
                .valueOf() + timeToTick(tr));

            var time = '<span style="font-size: 50%;"> [' + date.getHours() + ':' + date.getMinutes() + ']</span>';

            return universe.timeToTick(tr) + time;
        };

        npui.EditFleetOrder = NP2M.wrap(npui.EditFleetOrder, function(__, efo) {
            efo.onSettingsChange = NP2M.wrap(efo.onSettingsChange, function(__, __) {
                if (_.contains(["3", "4", "5", "6", "7"], efo.action.getValue())) {
                    var v = efo.amount.getValue();
                    if (!v) {
                        efo.amount.setValue(1);
                    }
                }
            });
            efo.onSettingsChange();
            replace_widget_handlers(efo, "efo_setting_change", efo.onSettingsChange);
            return efo;
        });

        // only two sides right now
        function battleCalc(defending, enemyShips, enemyWeapon, selfWeapon) {
            if (defending) {
                selfWeapon++;
                var rounds = Math.ceil(enemyShips / selfWeapon) - 1;
            } else {
                enemyWeapon++;
                var rounds = Math.ceil(enemyShips / selfWeapon);
            }
            var shipsLost = rounds * enemyWeapon;
            return shipsLost;
        }

        npui.StarDefStatus = NP2M.wrap(npui.StarDefStatus, function(args, starDefStatus) {
            var star = universe.selectedStar;
            var def = star.totalDefenses;
            var timeToGet, shipsLost;
            if (def === 0) {
                timeToGet = '0';
                shipsLost = '0';
            } else {
                shipsLost = battleCalc(
                    false, // we are attacking the star
                    def,
                    star.player.tech.weapons.value,
                    universe.player.tech.weapons.value);

                if (star.i === 0) {
                    timeToGet = '<span style="font-size:200%;">\u221E</span>'; // infinity
                } else {
                    var shipsPerTick = star.i *
                        (5 + universe.player.tech.manufacturing.value) /
                        universe.galaxy.production_rate;
                    timeToGet = Math.ceil(shipsLost / shipsPerTick);
                }
            }

            starDefStatus.children[1].ui.append(' {' + shipsLost + ' -> ' + timeToGet + 't}');

            return starDefStatus;
        });
        npui.FleetStatus = NP2M.wrap(npui.FleetStatus, function(args, fleetStatus) {

            var fleet = universe.selectedFleet;
            var shipsLost = battleCalc(
                true, // we are defending from the fleet
                fleet.st,
                fleet.player.tech.weapons.value,
                universe.player.tech.weapons.value);

            fleetStatus.children[1].ui.append(' {' + shipsLost + '}');
            return fleetStatus;
        });



        // Crux.Link = function(content, event, data, style) {
        //     var self = Crux.Widget();

        //     self.ui = $('<a></a>');
        //     self.ui.append(content);

        //     self.addStyle(style);

        //     self.onMouseDown = function(e) {
        //         debug('Crux.Link mouse down');
        //         Crux.crux.trigger(event, data);
        //     }

        //     self.ui.on("mousedown", self.onMouseDown);

        //     return self;
        // }

        // Crux.Sprite = function(sprite, style) {
        //     // debug('Crux.Sprite(', arguments, ')');
        //     style = style === undefined ? 'rel' : style;
        //     var self = Crux.Widget(style);
        //     self.sprite = sprite;

        //     var posX = -(sprite.spriteX + (sprite.width / 4)),
        //         posY = -(sprite.spriteY + (sprite.height / 4));

        //     self.ui.css({
        //         'visibility': sprite.visible ? 'visible' : 'hidden',
        //         'transform': 'rotate(' + sprite.rotation + 'rad) scale(' + sprite.scale + ')',
        //         'background-image': 'url(' + sprite.image.src + ')',
        //         'background-position': posX + 'px ' + posY + 'px',
        //         'width': (sprite.width / 2) + 'px',
        //         'height': (sprite.height / 2) + 'px'
        //     });

        //     self.scale = function(scaler) {

        //         self.ui.css({
        //             'transform': 'rotate(' + sprite.rotation + 'rad) scale(' + scaler + ')'
        //         });
        //         return self;
        //     }

        //     return self;
        // };

        // Crux.SpriteStack = function(sprites, style) {
        //     style = style === undefined ? 'rel' : style;
        //     var self = Crux.Widget(style);
        //     self.sprites = sprites;

        //     var s, maxWidth = 0,
        //         maxHeight = 0;
        //     for (var i = sprites.length - 1; i >= 0; i--) {
        //         s = sprites[i];
        //         if (s) {
        //             maxWidth = Math.max(maxWidth, s.width);
        //             maxHeight = Math.max(maxHeight, s.height);

        //             sprites[i] = Crux.Sprite(s, '')
        //                 .grid(0, 0)
        //                 .roost(self);
        //         }
        //     }

        //     self.size(maxWidth / 2, maxHeight / 2);

        //     self.scale = function(scaler) {
        //         for (var i = sprites.length - 1; i >= 0; i--) {
        //             if (sprites[i]) {
        //                 if (scaler[i]) {
        //                     sprites[i].scale(scaler[i]);
        //                 } else {
        //                     sprites[i].scale(scaler);
        //                 }
        //             }
        //         }
        //         return self;
        //     }

        //     return self;
        // };

        // Crux.TableHeader = function(head) {

        //     // Create initial header from string only fields
        //     var thStrings = [];
        //     var h;
        //     for (var i = 0, l = head.length; i < l; i++) {
        //         h = head[i];
        //         thStrings.push(_.isString(h) ? h : '');
        //     }
        //     var thead = $('<thead><tr><th>' + thStrings.join("</th><th>") + '</th></tr></thead>');

        //     // Deal with complex headers
        //     var ths = $('th', thead);
        //     for (var i = 0, l = head.length; i < l; i++) {
        //         h = head[i];
        //         if (!_.isString(h)) {
        //             if (h.ui) {
        //                 h = h.ui;
        //             }
        //             $(ths[i])
        //                 .append(h);
        //         }
        //     }

        //     return thead;
        // }

        // Crux.TableRow = function(data) {

        //     // Create initial row from string only fields
        //     var tdStrings = [];
        //     var cell;
        //     for (var i = 0, l = data.length; i < l; i++) {
        //         cell = data[i];
        //         tdStrings.push(_.isString(cell) ? cell : '');
        //     }
        //     var row = $('<tr><td>' + tdStrings.join("</td><td>") + '</td></tr>');

        //     // Deal with complex fields
        //     var tds = $('td', row);
        //     for (var i = 0, l = data.length; i < l; i++) {
        //         cell = data[i];
        //         if (!_.isString(cell)) {
        //             if (cell.ui) {
        //                 cell = cell.ui;
        //             }
        //             $(tds[i])
        //                 .append(cell);
        //         }
        //     }

        //     return row;
        // }

        // Crux.Table = function(head, data, extractor, style) {
        //     debug('Crux.Table', arguments);
        //     var self = Crux.Widget('rel');

        //     var table = $('<table>')
        //         .addClass(style);

        //     table.append(Crux.TableHeader(head));

        //     var dataRows = [];
        //     _.each(data, function(d) {
        //         var row = Crux.TableRow(extractor(d));
        //         dataRows.push([d, row]);
        //         table.append(row)
        //     });

        //     self.ui.append(table);

        //     self.sort = function(sorter, reverse) {
        //         debug('sorting table', arguments);
        //         // $('tbody > tr', table).detach();

        //         dataRows = _.sortBy(dataRows, function(dr, i) {
        //             return dr[0][sorter];
        //         });

        //         if (reverse) {
        //             dataRows.reverse();
        //         }
        //         _.each(dataRows, function(dr) {
        //             table.append(dr[1]);
        //         });
        //     }

        //     return self;
        // }


        // Crux.InlineButton = function(id, eventKind, eventData) {
        //     var self = Crux.Button(id, eventKind, eventData)
        //         .addStyle('rel');
        //     self.label.addStyle('rel');
        //     return self;
        // }

        // npui.PlayerDirectory = function() {
        //     var playerDir = npui.Screen("galaxy")
        //         .size(480);

        //     npui.DirectoryTabs("player")
        //         .roost(playerDir);

        //     var name = Crux.Link('Name', 'player_dir_sort', 'alias'),
        //         stars = Crux.Link('Stars', 'player_dir_sort', 'total_stars'),
        //         ships = Crux.Link('Ships', 'player_dir_sort', 'total_strength');

        //     var head = [name, stars, ships];
        //     var data = universe.galaxy.players;

        //     function extractor(player) {
        //         return [
        //             player.alias,
        //             player.total_stars,
        //             player.total_strength];
        //     };

        //     var table = Crux.Table(head, data, extractor, 'star_directory')
        //         .roost(playerDir);

        //     return playerDir;
        // }
        // np.onPlayerDirSort = function() {
        //     debug('onPlayerDirSort');
        // }
        // np.on("player_dir_sort", np.onPlayerDirSort);


        // npui.DirectoryTabs = function(active) {
        //     var dir = Crux.Widget("rel")
        //         .size(480, 48);

        //     Crux.Widget("col_accent_light")
        //         .grid(0, 2.5, 30, 0.5)
        //         .roost(dir);

        //     dir.starTab = Crux.Tab("stars", "show_screen", "star_dir")
        //         .grid(0, -0.5, 10, 3)
        //         .roost(dir);

        //     dir.fleetTab = Crux.Tab("fleets", "show_screen", "fleet_dir")
        //         .grid(10, -0.5, 10, 3)
        //         .roost(dir);

        //     dir.playerTab = Crux.Tab("players", "show_screen", "player_dir")
        //         .grid(20, -0.5, 10, 3)
        //         .roost(dir);

        //     if (active === "fleet") {
        //         dir.fleetTab.activate();
        //     }
        //     if (active === "star") {
        //         dir.starTab.activate();
        //     }
        //     if (active === "players") {
        //         dir.playerTab.activate();
        //     }

        //     return dir;
        // };

        // var _sde = function starDirectoryExtractor(star) {
        //     var conceded = (universe.player.conceded > 0);
        //     var playerCash = universe.player.cash;

        //     var colorBox = star.player ? Crux.Link(star.player.colourBox, 'map_center_slide', star.player.home) : '',
        //         sector = star.homeplayer ? Crux.Link(star.homeplayer.colourBox, 'map_center_slide', star.homeplayer.home) : '',
        //         icon = Crux.SpriteStack([star.sprite, star.spriteGate])
        //             .scale([0.5, 1]),
        //         iconLink = Crux.Link(icon.ui, 'map_center_slide', star),
        //         name = Crux.Link(star.n, 'show_star_screen_uid', star.uid, 'star_directory_name'),
        //         be = '$' + star.uce,
        //         bi = '$' + star.uci,
        //         bs = '$' + star.ucs;

        //     // iconLink.ui.on('click', function (e) {
        //     //     universe.selectStar(star);
        //     // })

        //     var activePlayer = (star.player === universe.player);
        //     var canBuy = activePlayer && !conceded;

        //     if (canBuy) {
        //         if (playerCash >= star.uce) {
        //             be = Crux.InlineButton('', 'star_dir_upgrade_e', star.uid)
        //                 .rawHTML(be);
        //         }
        //         if (playerCash >= star.uce) {
        //             bi = Crux.InlineButton('', 'star_dir_upgrade_i', star.uid)
        //                 .rawHTML(bi);
        //         }
        //         if (playerCash >= star.uce) {
        //             bs = Crux.InlineButton('', 'star_dir_upgrade_s', star.uid)
        //                 .rawHTML(bs);
        //         }
        //     }

        //     var shipsPerCycle = 0;
        //     if (star.player) {
        //         shipsPerCycle = star.i * (5 + star.player.tech.manufacturing.level);
        //     }
        //     if (!shipsPerCycle || !star.st) {
        //         star.spr = 0;
        //     } else {
        //         star.spr = 24 * (star.st / shipsPerCycle);
        //     }
        //     star.terraDiscount = ((5 / star.r) * 100);

        //     var tempR = star.r;
        //     star.r += 5;
        //     star.ucen = universe.calcUCE(star);
        //     star.ucin = universe.calcUCI(star);
        //     star.ucsn = universe.calcUCS(star);
        //     star.r = tempR;

        //     return [
        //         colorBox,
        //         sector,
        //         iconLink,
        //         name,
        //         star.st,
        //         star.spr.toFixed(1),
        //         star.pathCount,
        //         star.e,
        //         star.i,
        //         star.s,
        //         be,
        //         bi,
        //         bs,
        //         star.nr + ':' + star.r,
        //         star.terraDiscount.toFixed(1) + '%',
        //         '$' + star.ucen,
        //         '$' + star.ucin,
        //         '$' + star.ucsn
        //     ];
        // };
        // // var starDirectoryExtractor = _.memoize(_sde, function(star) {
        // //     return [star.uid, star.e, star.i, star.s, star.ga, star.st, star.uce].toSource();
        // // });
        // var starDirectoryExtractor = _sde;

        // npui.StarDirectory = function() {
        //     console.profile('StarDirectory');
        //     var prop, star, i;
        //     var starDir = npui.Screen("galaxy")
        //         .size(60 * GS);

        //     npui.DirectoryTabs("star")
        //         .roost(starDir);

        //     var filterText = "filter_show_mine";
        //     if (universe.starDirectory.filter === "my_stars") {
        //         filterText = "filter_show_all";
        //     }

        //     Crux.Text(filterText, "rel pad12 col_accent")
        //         .roost(starDir);

        //     var head = [
        //         Crux.Link('P', 'star_dir_sort', 'puid'),
        //         Crux.Link('S', 'star_dir_sort', 'hpuid'),
        //         Crux.Link('&#59146;', 'star_dir_sort', ['ga', 'v'])
        //         .addStyle('ic-eye'),
        //         Crux.Link('Name', 'star_dir_sort', 'n'),
        //         Crux.Link('Ships', 'star_dir_sort', 'st'),
        //         Crux.Link('SPR', 'star_dir_sort', 'spr'),
        //         Crux.Link('Ps', 'star_dir_sort', 'pathCount'),
        //         Crux.Link('E', 'star_dir_sort', 'e'),
        //         Crux.Link('I', 'star_dir_sort', 'i'),
        //         Crux.Link('S', 'star_dir_sort', 's'),
        //         Crux.Link('$E', 'star_dir_sort', 'uce'),
        //         Crux.Link('$I', 'star_dir_sort', 'uci'),
        //         Crux.Link('$S', 'star_dir_sort', 'ucs'),
        //         Crux.Link('Res.', 'star_dir_sort', 'r'),
        //         Crux.Link('TD', 'star_dir_sort', 'terraDiscount'),
        //         Crux.Link('N$E', 'star_dir_sort', 'ucen'),
        //         Crux.Link('N$I', 'star_dir_sort', 'ucin'),
        //         Crux.Link('N$S', 'star_dir_sort', 'ucsn')
        //     ];

        //     var data = _.filter(universe.galaxy.stars, function(star) {
        //         return (universe.starDirectory.filter !== "my_stars" || star.player === universe.player);
        //     });

        //     var table = Crux.Table(head, data, starDirectoryExtractor, 'star_directory')
        //         .roost(starDir);

        //     universe.starDirectoryTable = table;

        //     console.profileEnd()
        //     return starDir;
        // };

        // np.onStarDirSort = function(event, name) {
        //     debug('onStarDirSort', arguments, universe.starDirectory, universe.starDirectory.sortBy === name);
        //     if (universe.starDirectory.sortBy === name) {
        //         universe.starDirectory.invert = !universe.starDirectory.invert;
        //     } else {
        //         universe.starDirectory.invert = false;
        //     }

        //     if (universe.starDirectory.invert) {
        //         np.trigger("play_sound", "add");
        //     } else {
        //         np.trigger("play_sound", "subtract");
        //     }

        //     universe.StarDirRowHilight = undefined;
        //     universe.starDirectory.sortBy = name;

        //     var reverse = false;
        //     if (!universe.starDirectory.invert) {
        //         reverse = true;
        //     }

        //     // desc by default
        //     if (name === "name") {
        //         reverse != reverse;
        //     }

        //     universe.starDirectoryTable.sort(name, reverse);

        // };
        // replace_widget_handlers(np, "star_dir_sort", np.onStarDirSort);

        // npui.FleetDirectory = function() {
        //     var prop, star, i;
        //     var starDir = npui.Screen("galaxy")
        //         .size(480);

        //     npui.DirectoryTabs("fleet")
        //         .roost(starDir);

        //     var filterText = "filter_show_mine_fleets";
        //     if (universe.fleetDirectory.filter === "my_fleets") {
        //         filterText = "filter_show_all_fleets";
        //     }

        //     Crux.Text(filterText, "rel pad12 col_accent")
        //         .roost(starDir);

        //     var sortedFleets = [];
        //     for (prop in universe.galaxy.fleets) {
        //         if (universe.fleetDirectory.filter === "my_fleets") {
        //             if (universe.galaxy.fleets[prop].player === universe.player) {
        //                 sortedFleets.push(universe.galaxy.fleets[prop]);
        //             }
        //         } else {
        //             sortedFleets.push(universe.galaxy.fleets[prop]);
        //         }
        //     }

        //     if (universe.fleetDirectory.sortBy === "name") {
        //         sortedFleets.sort(function(a, b) {
        //             var result = -1;
        //             if (a.n < b.n) {
        //                 result = 1;
        //             }
        //             result *= universe.fleetDirectory.invert;
        //             return result;
        //         });
        //     }

        //     if (universe.fleetDirectory.sortBy === "st" ||
        //         universe.fleetDirectory.sortBy === "puid" ||
        //         universe.fleetDirectory.sortBy === "hpuid" ||
        //         universe.fleetDirectory.sortBy === "etaFirst" ||
        //         universe.fleetDirectory.sortBy === "eta") {
        //         sortedFleets.sort(function(a, b) {
        //             var result = b[universe.fleetDirectory.sortBy] - a[universe.fleetDirectory.sortBy];
        //             if (result === 0) {
        //                 result = 1;
        //                 if (a.n < b.n) {
        //                     result = -1;
        //                 }
        //             }
        //             result *= universe.fleetDirectory.invert;
        //             return result;
        //         });
        //     }

        //     if (universe.fleetDirectory.sortBy === "w") {
        //         sortedFleets.sort(function(a, b) {
        //             var result = b.path.length - a.path.length;
        //             if (result === 0) {
        //                 result = 1;
        //                 if (a.n < b.n) {
        //                     result = -1;
        //                 }
        //             }
        //             result *= universe.fleetDirectory.invert;
        //             return result;
        //         });
        //     }

        //     var html = "<table class='star_directory'>";
        //     html += "<tr><th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'puid\')\">P</a></th>";
        //     html += "<th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'hpuid\')\">H</a></th>";
        //     html += '<th class="ic-eye">&#59146;</th>';
        //     html += "<th class='star_directory_name'><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'name\')\">Name</a></th>";
        //     html += "<th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'st\')\">Ships</a></th>";
        //     html += "<th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'w\')\">W</a></th>";
        //     html += "<th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'etaFirst\')\">ETA</a></th>";
        //     html += "<th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'eta\')\">&Sigma;ETA</a></th>";
        //     html += "</tr>";

        //     var clickEvent, icon, rotation, name, fleet;
        //     for (i = sortedFleets.length - 1; i >= 0; i--) {
        //         fleet = sortedFleets[i];
        //         html += "<tr>";
        //         html += "<td>";

        //         if (fleet.player) {
        //             html += fleet.player.colourBox;
        //         }
        //         html += "</td>";


        //         html += "<td>";
        //         if (fleet.home) {
        //             html += fleet.homeplayer.colourBox;
        //         }
        //         html += "</td>";

        //         rotation = fleet.sprite.rotation;

        //         var iconStyle = '\
        //             display: inline-block;\
        //             transform: rotate(' + rotation + 'rad) scale(0.5);\
        //             background-image: url(/images/map/stars.png);\
        //             background-position: 432px 560px;\
        //             width: 32px;\
        //             height: 32px;'.replace(/\n/g, '');
        //         var ci = fleet.player.colorIndex;
        //         var iconStyle2 = '\
        //             position: absolute;\
        //             display: inline-block;\
        //             background-image: url(/images/map/stars.png);\
        //             background-position: 48px ' + (64 * (8 - ci) - 16) + 'px;\
        //             width: 32px;\
        //             height: 32px;'.replace(/\n/g, '');

        //         clickEvent = 'Crux.crux.trigger(\'show_fleet_uid\' , \'' + fleet.uid + '\' )';

        //         icon = '<a onclick="' + clickEvent + '">';
        //         if (fleet.warpSpeed) {
        //             icon += '<span style="' + iconStyle2 + '" ></span>';
        //         }
        //         icon += '<span style="' + iconStyle + '" ></span>';
        //         icon += '</a>';
        //         html += '<td style="">' + icon + '</td>';



        //         name = fleet.n;
        //         clickEvent = 'Crux.crux.trigger(\'show_fleet_screen_uid\' , \'' + fleet.uid + '\' )';
        //         html += '<td class="star_directory_name" style="text-align: left;"> <a onclick=\"' + clickEvent + '\"> ' + name + ' </a> </td>';

        //         html += "<td> " + fleet.st + "</td>";

        //         html += "<td> " + fleet.path.length;
        //         if (fleet.loop) {
        //             html += " <span class='icon-loop'></span>";
        //         }
        //         html += "</td>";

        //         html += "<td> " + universe.timeToTick(fleet.etaFirst, true) + "</td>";
        //         html += "<td> " + universe.timeToTick(fleet.eta, true) + "</td>";

        //         html += "</tr>";
        //     }
        //     html += "</table>";

        //     Crux.Text("", "rel")
        //         .rawHTML(html)
        //         .roost(starDir);

        //     return starDir;
        // };


        // var customScreens = {
        //     "player_dir": npui.PlayerDirectory
        // };

        // npui.onShowScreen = NP2M.wrap(npui.onShowScreen, function(args) {
        //     debug('onShowScreen', arguments);
        //     //event, screenName, screenConfig, screenConfig2
        //     var screenName = args[1];
        //     if (!customScreens[screenName]) {
        //         return args;
        //     }

        //     var scroll = 0;
        //     if (npui.showingScreen === screenName) {
        //         scroll = jQuery(window)
        //             .scrollTop();
        //     } else {
        //         npui.trigger("play_sound", "screen_open");
        //     }

        //     npui.onHideScreen(null, true);
        //     npui.onHideSelectionMenu();

        //     npui.trigger("hide_side_menu");
        //     npui.trigger("reset_edit_mode");

        //     npui.showingScreen = screenName;
        //     var screenConfig = args[2];

        //     npui.activeScreen = customScreens[npui.showingScreen](screenConfig);

        //     if (npui.activeScreen) {
        //         npui.activeScreen.roost(npui.screenContainer);
        //         npui.layoutElement(npui.activeScreen);
        //     }

        //     jQuery(window)
        //         .scrollTop(scroll);

        //     return undefined;
        // }, function(args, ret) {
        //     return ret;
        // });

        // replace_widget_handlers(npui, "show_screen", npui.onShowScreen);



        function cost(resources, base, level) {
            return Math.floor(base / resources) * level;
        }

        function totalCost(resources, base, level) {
            return _.reduce(_.range(1, level + 1), function(a, b) {
                return a + cost(resources, base, b);
            }, 0);
        }


        var costScaling = {
            '1': 0.5,
            '2': 1.0,
            '3': 2.0
        };
        var baseEconomy = 500 * costScaling[NeptunesPride.gameConfig.developmentCostIndustry];
        var baseIndustry = 1000 * costScaling[NeptunesPride.gameConfig.developmentCostIndustry];
        var baseScience = 4000 * costScaling[NeptunesPride.gameConfig.developmentCostIndustry];

        universe.expandStarData = function(star) {
            star.kind = "star";
            star.fleetsInOrbit = [];
            star.player = universe.galaxy.players[star.puid];
            star.owned = (universe.galaxy.player_uid === star.puid);

            // when we use the star as template data we need these values
            if (star.player) {
                star.qualifiedAlias = star.player.qualifiedAlias;
                star.hyperlinkedAlias = star.player.hyperlinkedAlias;
                star.colourBox = star.player.colourBox;
                star.shipsPerTick = universe.calcShipsPerTick(star);
            } else {
                star.qualifiedAlias = "";
            }

            // if this star is cloaked or outside scanning range.
            // AFY: star.v probably stands for visible.
            if (star.v === "0") {
                star.st = 0;
                star.e = 0;
                star.i = 0;
                star.s = 0;

                star.uce = 0;
                star.uci = 0;
                star.ucs = 0;

                star.c = 0;
                star.g = 0;
                star.r = 0;
                star.nr = 0;
            }

            if (star.r) {
                // apply current player's terra bonus for unclaimed stars
                var bonus = !star.player ? universe.player.tech.terraforming.value * 5 : 0;
                var res = star.r + bonus;

                star.uce = star.uce || cost(res, baseEconomy, star.e + 1);
                star.uci = star.uci || cost(res, baseIndustry, star.i + 1);
                star.ucs = star.ucs || cost(res, baseScience, star.s + 1);

                star.tuce = totalCost(res, baseEconomy, star.e);
                star.tuci = totalCost(res, baseIndustry, star.i);
                star.tucs = totalCost(res, baseScience, star.s);
                star.value = star.tuce + star.tuci + star.tucs;
            }

            star.n = star.n.replace(/[^a-z0-9_]/gi, '_');
            star.hyperlinkedName = "<a onClick='Crux.crux.trigger(\"show_star_uid\", \"" + star.uid + "\")'>" + star.n + "</a>";
            universe.hyperlinkedStarNames[star.n] = star.hyperlinkedName;

            // Find sector
            var homes = _.map(_.filter(universe.galaxy.players, 'home'), function(p, i) {
                var home = p.home,
                    dist = universe.distance(star.x, star.y, home.x, home.y);
                return {
                    p: p,
                    h: home,
                    d: dist
                };
            });
            var nearest = _.min(homes, 'd');
            star.home = nearest.h;
            star.homeplayer = nearest.p;
            star.hpuid = nearest.p.uid; // to access when sorting

            star.pathCount = 0;
        };


        universe.expandFleetData = function(fleet) {
            fleet.kind = "fleet";
            fleet.warpSpeed = fleet.w;
            fleet.player = universe.galaxy.players[fleet.puid];
            fleet.orders = fleet.o;
            fleet.loop = fleet.l;

            fleet.owned = (universe.galaxy.player_uid === fleet.puid);

            if (fleet.player) {
                fleet.qualifiedAlias = fleet.player.qualifiedAlias;
                fleet.hyperlinkedAlias = fleet.player.hyperlinkedAlias;
                fleet.colourBox = fleet.player.colourBox;
            } else {
                fleet.qualifiedAlias = "";
            }
            fleet.orbiting = null;
            if (fleet.ouid) {
                fleet.orbiting = universe.galaxy.stars[fleet.ouid];
                universe.galaxy.stars[fleet.ouid].fleetsInOrbit.push(fleet);
            }

            fleet.path = [];
            var order, i, ii;
            for (i = 0, ii = fleet.orders.length; i < ii; i += 1) {
                order = fleet.orders[i];
                if (universe.galaxy.stars[order[1]]) {
                    fleet.path.push(universe.galaxy.stars[order[1]]);
                } else {
                    fleet.unScannedStarInPath = true;
                    break;
                }
            }

            fleet.lastStar = null;
            universe.calcFleetEta(fleet);

            // Find sector
            var homes = _.map(_.filter(universe.galaxy.players, 'home'), function(p, i) {
                var home = p.home,
                    dist = universe.distance(fleet.x, fleet.y, home.x, home.y);
                return {
                    p: p,
                    h: home,
                    d: dist
                };
            });
            var nearest = _.min(homes, 'd');
            fleet.home = nearest.h;
            fleet.homeplayer = nearest.p;
            fleet.hpuid = nearest.p.uid; // to access when sorting
            _.each(fleet.path, function(star) {
                star.pathCount++;
            });
        };

        npui.StarInfStatus = function(playerOwned) {
            var starInfStatus = Crux.Widget("rel  col_base")
                .size(30 * GS, (3 + 6 + 3 + 3) * GS);

            Crux.Widget("col_accent")
                .grid(0, 6, 30, 3)
                .roost(starInfStatus);

            // Section Heading
            Crux.Text("infrastructure", "section_title col_black")
                .grid(0, 0, 30, 3)
                .roost(starInfStatus);

            // Summery
            Crux.BlockValueBig("economy", "icon-dollar-inline", universe.selectedStar.e, "col_accent")
                .grid(0, 3, 10, 6)
                .roost(starInfStatus);
            Crux.BlockValueBig("industry", "icon-tools-inline", universe.selectedStar.i, "col_base")
                .grid(10, 3, 10, 6)
                .roost(starInfStatus);
            Crux.BlockValueBig("science", "icon-graduation-cap-inline", universe.selectedStar.s, "col_accent")
                .grid(20, 3, 10, 6)
                .roost(starInfStatus);

            // Upgrade Buttons
            var buttons = [{
                attr: 'uce',
                label: 'economy',
                event: 'upgrade_economy',
                pos: [0, 9, 10, 3]
            }, {
                attr: 'uci',
                label: 'industry',
                event: 'upgrade_industry',
                pos: [10, 9, 10, 3]
            }, {
                attr: 'ucs',
                label: 'science',
                event: 'upgrade_science',
                pos: [20, 9, 10, 3]
            }];
            // Background colour hack for middle button!
            Crux.Widget("col_accent")
                .grid(10, 9, 10, 3)
                .roost(starInfStatus);

            var star = universe.selectedStar;
            var b, button, btn;
            for (b in buttons) {
                button = buttons[b];
                btn = Crux.Button("upgrade_for_x", button.event)
                    .grid.apply(this, button.pos)
                    .format({
                        cost: String(star[button.attr])
                    })
                    .roost(starInfStatus);

                if (!playerOwned || universe.player.cash - star[button.attr] < 0) {
                    btn.disable();
                }

                // Display Approximate Current Investment
                var ipos = _.clone(button.pos);
                ipos[1] += 3;
                var ib = Crux.BlockValue(button.label, '$' + star['t' + button.attr]) //, "col_accent")
                .grid.apply(this, ipos)
                    .roost(starInfStatus);
            }

            return starInfStatus;
        };

        function getFutureEtas(player) {
            function applyResearch(techs, research, science) {
                var tech = techs[research],
                    goal = Number(tech.level) * Number(tech.brr),
                    needed = goal - tech.research,
                    ticks = Math.ceil(needed / science),
                    overflow = (ticks * science) - needed;

                tech.level++;
                tech.research = overflow;
                return ticks;
            }

            // make a copy so we don't screw up the user data.
            var techs = _.cloneDeep(player.tech),
                science = player.total_science,
                tech = player.researching;

            var ticks = applyResearch(techs, tech, science);

            var nextTech = player.researching_next;
            var etas = [];
            while (ticks < 24) {
                ticks += applyResearch(techs, nextTech, science);
                etas.push(ticks);
            }

            return etas;
        }

        npui.TechNextSelection = function() {
            var player = universe.player;
            var etas = getFutureEtas(player);

            var p;
            var techNow = Crux.Widget("rel  col_accent")
                .size(30 * GS, (3 + 3 * etas.length) * GS);

            Crux.Text("research_next", "pad12")
                .roost(techNow);

            var selections = {};
            for (p in player.tech) {
                if (player.tech[p].brr > 0) {
                    selections[p] = Crux.localise("tech_" + p);
                }
            }

            Crux.DropDown(player.researching_next, selections, "change_research_next")
                .grid(15, 0, 15, 3)
                .roost(techNow);

            // Display ETAs
            techNow.etaBlocks = [];

            _.each(etas, function(eta, i) {
                var t = universe.timeToTick(eta);
                var bv = Crux.BlockValue("eta", t, "col_base")
                    .grid(0, 3 + 3 * i, 30, 3)
                    .roost(techNow);
                bv.eta = eta;
                techNow.etaBlocks.push(bv);
            });

            techNow.onTick = function() {
                _.each(techNow.etaBlocks, function(bv) {
                    bv.value.rawHTML(universe.timeToTick(bv.eta));
                });
            };

            techNow.on("one_second_tick", techNow.onTick);

            return techNow;
        };

        // np.onStarDirectoryEconomy = function(event, data) {
        //     debug('onStarDirectoryEconomy');
        //     universe.selectStar(universe.galaxy.stars[data]);
        //     np.onUpgradeEconomy();
        //     //np.trigger("map_refresh");
        // };

        // np.onStarDirectoryIndustry = function(event, data) {
        //     debug('onStarDirectoryIndustry');
        //     universe.selectStar(universe.galaxy.stars[data]);
        //     np.onUpgradeIndustry();
        //     //np.trigger("map_refresh");
        // };

        // np.onStarDirectoryScience = function(event, data) {
        //     debug('onStarDirectoryScience');
        //     universe.selectStar(universe.galaxy.stars[data]);
        //     np.onUpgradeScience();
        //     //np.trigger("map_refresh");
        // };
        // np.onUpgradeEconomy = function(event, data) {
        //     if (!universe.selectedStar) return;

        //     np.trigger("server_request", {
        //         type: "batched_order",
        //         order: "upgrade_economy," + universe.selectedStar.uid + "," + universe.selectedStar.uce
        //     });
        //     universe.upgradeEconomy();
        //     np.trigger("refresh_interface");
        //     np.trigger("play_sound", "ok");
        // };
        // np.onUpgradeIndustry = function(event, data) {
        //     if (!universe.selectedStar) return;

        //     np.trigger("server_request", {
        //         type: "batched_order",
        //         order: "upgrade_industry," + universe.selectedStar.uid + "," + universe.selectedStar.uci
        //     });
        //     universe.upgradeIndustry();
        //     np.trigger("refresh_interface");
        //     np.trigger("play_sound", "ok");
        // };
        // np.onUpgradeScience = function(event, data) {
        //     if (!universe.selectedStar) return;

        //     np.trigger("server_request", {
        //         type: "batched_order",
        //         order: "upgrade_science," + universe.selectedStar.uid + "," + universe.selectedStar.ucs
        //     });
        //     universe.upgradeScience();
        //     np.trigger("refresh_interface");
        //     np.trigger("play_sound", "ok");
        // };
        // replace_widget_handlers(np, "star_dir_upgrade_e", np.onStarDirectoryEconomy);
        // replace_widget_handlers(np, "star_dir_upgrade_i", np.onStarDirectoryIndustry);
        // replace_widget_handlers(np, "star_dir_upgrade_s", np.onStarDirectoryScience);

        universe.selectFleet = function(fleet) {
            debug('SELECTED FLEET: ', fleet);
            universe.selectedPlayer = fleet.player;
            universe.selectedFleet = fleet;
            universe.selectedSpaceObject = fleet;
            universe.selectedStar = null;
        };
        universe.selectStar = function(star) {
            debug('SELECTED STAR: ', star);
            universe.selectedPlayer = star.player;
            universe.selectedStar = star;
            universe.selectedSpaceObject = star;
            universe.selectedFleet = null;
        };
        universe.selectPlayer = function(player) {
            debug('SELECTED PLAYER: ', data.star);
            universe.selectedPlayer = player;
            universe.selectedStar = null;
            universe.selectedSpaceObject = null;
            universe.selectedFleet = null;
        };
        universe.selectNone = function(star) {
            debug('SELECTED NONE: ');
            universe.selectedPlayer = null;
            universe.selectedStar = null;
            universe.selectedSpaceObject = null;
            universe.selectedFleet = null;
        };
        universe.calcUCE = function(star) {
            return Math.floor((2.5 * NeptunesPride.gameConfig.developmentCostEconomy * (star.e + 1)) / (star.r / 100));
        };
        universe.calcUCI = function(star) {
            return Math.floor((5 * NeptunesPride.gameConfig.developmentCostIndustry * (star.i + 1)) / (star.r / 100));
        };
        universe.calcUCS = function(star) {
            return Math.floor((20 * NeptunesPride.gameConfig.developmentCostScience * (star.s + 1)) / (star.r / 100));
        };
        universe.calcUCG = function(star) {
            if (NeptunesPride.gameConfig.buildGates === 0) {
                return NaN;
            }
            return Math.floor((100 * NeptunesPride.gameConfig.buildGates) / (star.r / 100));
        };

        universe.buyWarpGate = function(star) {
            if (star === undefined) {
                star = universe.selectedStar;
            }
            star.player.cash -= star.ucg;
            star.ucg = 0;
            star.ga = 1;
        };

        function buyWarpGate(star) {
            np.trigger("server_request", {
                type: "batched_order",
                order: "buy_warp_gate," + star.uid + "," + star.ucg
            });
            universe.buyWarpGate(star);
        }

        function warpGateEverything() {
            _.each(universe.galaxy.stars, function(star) {
                if (star.player === universe.player && !star.ga && star.player.cash > star.ucg) {
                    buyWarpGate(star);
                }
            });
            np.trigger("refresh_interface");
            np.trigger("map_rebuild");
        }


        uniShipTransfer = function(starStrength, fleetStrength) {
            universe.selectedFleet.st = fleetStrength;
            universe.selectedFleet.orbiting.st = starStrength;
        };

        function transferShips(fleet, amount) {
            var star = fleet.orbiting;

            star.st += fleet.st - amount;
            fleet.st = amount;

            np.trigger("server_request", {
                type: "batched_order",
                order: "ship_transfer," + fleet.uid + "," + amount
            });
        }

        function emptyStaticFleets() {
            _.each(universe.galaxy.fleets, function(fleet) {
                if (fleet.player === universe.player && fleet.orbiting && fleet.path.length === 0) {
                    transferShips(fleet, 1);
                }
            });
            np.trigger("refresh_interface");
            np.trigger("map_rebuild");
        }

        function checkPlayers(address) {
            _.each(universe.playerAchievements, function(a) {
                if (a.address === address) {
                    console.log(a, universe.galaxy.players[a.uid].alias);
                }
            });
        }

        function listPlayerAddresses() {
            var list = [];
            _.each(universe.playerAchievements, function(a) {
                list.push(a.address + ', ' + universe.galaxy.players[a.uid].alias);
            });
            return list.join('\n');
        }

        function removePath(fleet) {
            universe.selectedFleet = fleet;
            universe.clearFleetWaypoints();
            // debug(  'trying to remove paths from ', fleet, 
            //         'with path', fleet.path, 
            //         'orbiting', fleet.orbiting);

            if (fleet.orbiting) {
                np.trigger("server_request", {type: "batched_order",
                        order: "clear_fleet_orders," + fleet.uid});
            } else {
                np.trigger("server_request", {type: "batched_order",
                        order: "add_fleet_orders," + fleet.uid + "," + fleet.orders[0].join(",") + ",0"
                       });
            }
        }

        function removeFleetPaths() {
            _.each(universe.galaxy.fleets, function(fleet) {
                if (fleet.player === universe.player && fleet.path.length > 0) {
                    removePath(fleet);
                }
            });
            np.trigger("refresh_interface");
            np.trigger("map_rebuild");
        }


        unsafeWindow._ = _;
        unsafeWindow.warpGateEverything = warpGateEverything;
        unsafeWindow.emptyStaticFleets = emptyStaticFleets;
        unsafeWindow.checkPlayers = checkPlayers;
        unsafeWindow.listPlayerAddresses = listPlayerAddresses;
        unsafeWindow.removeFleetPaths = removeFleetPaths;


        // map.on("map_refresh", _.partial(debug, 'REFRESHING map'));
        npui.on("refresh_interface", _.partial(debug, 'REFRESHING interface'));

        // bug fix, default fleet action
        universe.interfaceSettings.defaultFleetAction = "1";



        var TAU_SYMBOL = 'τ';
        function formatTick (ticks) {
            var ticks   = parseInt(ticks),
                cycle   = Math.floor(ticks / 24),
                tick    = ticks % 24;
            return cycle + TAU_SYMBOL + tick;
        }

        npui.InboxRowEvent = NP2M.wrap(npui.InboxRowEvent, function(args, inboxRowEvent) {
            var message = args[0],
                tick    = message.payload.tick,
                tickText = inboxRowEvent.children[inboxRowEvent.children.length-1];
            debug(inboxRowEvent.children);
            tickText.rawHTML(formatTick(tick));
            return inboxRowEvent;
        });



    }


    NP2M.register("NP2 Layers", "1", pre_init_hook, post_init_hook);
})();