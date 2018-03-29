mods.push(function customDirectories(np, npui, universe) {
  var GS = Crux.gridSize;


  np.onPlayerDirSort = function () {
    log('onPlayerDirSort');
  };
  np.on("player_dir_sort", np.onPlayerDirSort);

  npui.PlayerDirectory = function () {
    var playerDir = npui.Screen("galaxy")
      .size(480);

    npui.DirectoryTabs("player")
      .roost(playerDir);

    var name = Crux.Link('Name', 'player_dir_sort', 'alias'),
      stars = Crux.Link('Stars', 'player_dir_sort', 'total_stars'),
      ships = Crux.Link('Ships', 'player_dir_sort', 'total_strength');

    var head = [name, stars, ships];
    var data = universe.galaxy.players;

    function extractor(player) {
      return [
        player.alias,
        player.total_stars,
        player.total_strength
      ];
    }

    var table = Crux.Table(head, data, extractor, 'star_directory')
      .roost(playerDir);

    return playerDir;
  };

  var customDirectoryTabs = function (active) {
    var dir = Crux.Widget("rel")
      .size(480, 48);

    Crux.Widget("col_accent_light")
      .grid(0, 2.5, 30, 0.5)
      .roost(dir);

    dir.starTab = Crux.Tab("stars", "show_screen", "star_dir")
      .grid(0, -0.5, 10, 3)
      .roost(dir);

    dir.fleetTab = Crux.Tab("fleets", "show_screen", "fleet_dir")
      .grid(10, -0.5, 10, 3)
      .roost(dir);

    dir.playerTab = Crux.Tab("players", "show_screen", "player_dir")
      .grid(20, -0.5, 10, 3)
      .roost(dir);

    if (active === "fleet") {
      dir.fleetTab.activate();
    }
    if (active === "star") {
      dir.starTab.activate();
    }
    if (active === "players") {
      dir.playerTab.activate();
    }

    return dir;
  };

  var _sde = function starDirectoryExtractor(star) {
    var conceded = (universe.player.conceded > 0);
    var playerCash = universe.player.cash;

    var colorBox = star.player ? Crux.Link(star.player.colourBox, 'map_center_slide', star.player.home) : '',
      sector = star.homeplayer ? Crux.Link(star.homeplayer.colourBox, 'map_center_slide', star.homeplayer.home) : '',
      icon = Crux.SpriteStack([star.sprite, star.spriteGate])
      .scale([0.5, 1]),
      iconLink = Crux.Link(icon.ui, 'map_center_slide', star),
      name = Crux.Link(star.n, 'show_star_screen_uid', star.uid, 'star_directory_name'),
      be = '$' + star.uce,
      bi = '$' + star.uci,
      bs = '$' + star.ucs;

    // iconLink.ui.on('click', function (e) {
    //     universe.selectStar(star);
    // })

    var activePlayer = (star.player === universe.player);
    var canBuy = activePlayer && !conceded;

    if (canBuy) {
      if (playerCash >= star.uce) {
        be = Crux.InlineButton('', 'star_dir_upgrade_e', star.uid)
          .rawHTML(be);
      }
      if (playerCash >= star.uce) {
        bi = Crux.InlineButton('', 'star_dir_upgrade_i', star.uid)
          .rawHTML(bi);
      }
      if (playerCash >= star.uce) {
        bs = Crux.InlineButton('', 'star_dir_upgrade_s', star.uid)
          .rawHTML(bs);
      }
    }

    var shipsPerCycle = 0;
    if (star.player) {
      shipsPerCycle = star.i * (5 + star.player.tech.manufacturing.level);
    }
    if (!shipsPerCycle || !star.st) {
      star.spr = 0;
    } else {
      star.spr = universe.galaxy.production_rate * (star.st / shipsPerCycle);
    }
    star.terraDiscount = ((5 / star.r) * 100);

    var tempR = star.r;
    star.r += 5;
    star.ucen = universe.calcUCE(star);
    star.ucin = universe.calcUCI(star);
    star.ucsn = universe.calcUCS(star);
    star.r = tempR;

    return [
      colorBox,
      sector,
      iconLink,
      name,
      star.st,
      star.spr.toFixed(1),
      star.pathCount,
      star.e,
      star.i,
      star.s,
      be,
      bi,
      bs,
      star.nr + ':' + star.r,
      star.terraDiscount.toFixed(1) + '%',
      '$' + star.ucen,
      '$' + star.ucin,
      '$' + star.ucsn
    ];
  };
  var starDirectoryExtractor = _.memoize(_sde, function (star) {
    return [star.uid, star.e, star.i, star.s, star.ga, star.st, star.uce].toSource();
  });
  // var starDirectoryExtractor = _sde;

  var customStarDirectory = function () {
    console.profile('StarDirectory');
    var prop, star, i;
    var starDir = npui.Screen("galaxy")
      .size(60 * GS);

    npui.DirectoryTabs("star")
      .roost(starDir);

    var filterText = "filter_show_mine";
    if (universe.starDirectory.filter === "my_stars") {
      filterText = "filter_show_all";
    }

    Crux.Text(filterText, "rel pad12 col_accent")
      .roost(starDir);

    var head = [
      Crux.Link('P', 'star_dir_sort', 'puid'),
      Crux.Link('S', 'star_dir_sort', 'hpuid'),
      Crux.Link('&#59146;', 'star_dir_sort', ['ga', 'v'])
      .addStyle('ic-eye'),
      Crux.Link('Name', 'star_dir_sort', 'n'),
      Crux.Link('Ships', 'star_dir_sort', 'st'),
      Crux.Link('SPR', 'star_dir_sort', 'spr'),
      Crux.Link('Ps', 'star_dir_sort', 'pathCount'),
      Crux.Link('E', 'star_dir_sort', 'e'),
      Crux.Link('I', 'star_dir_sort', 'i'),
      Crux.Link('S', 'star_dir_sort', 's'),
      Crux.Link('$E', 'star_dir_sort', 'uce'),
      Crux.Link('$I', 'star_dir_sort', 'uci'),
      Crux.Link('$S', 'star_dir_sort', 'ucs'),
      Crux.Link('Res.', 'star_dir_sort', 'r'),
      Crux.Link('TD', 'star_dir_sort', 'terraDiscount'),
      Crux.Link('N$E', 'star_dir_sort', 'ucen'),
      Crux.Link('N$I', 'star_dir_sort', 'ucin'),
      Crux.Link('N$S', 'star_dir_sort', 'ucsn')
    ];
    var data = universe.galaxy.stars;

    if (universe.starDirectory.filter !== "my_stars") {
      data = _.where(universe.galaxy.stars, {
        player: universe.player
      });
    }

    var table = Crux.Table(head, data, starDirectoryExtractor, 'star_directory')
      .roost(starDir);

    universe.starDirectoryTable = table;

    console.profileEnd();
    return starDir;
  };

  np.onStarDirSort = function (event, name) {
    log('onStarDirSort', arguments, universe.starDirectory, universe.starDirectory.sortBy === name);
    if (universe.starDirectory.sortBy === name) {
      universe.starDirectory.invert = !universe.starDirectory.invert;
    } else {
      universe.starDirectory.invert = false;
    }

    if (universe.starDirectory.invert) {
      np.trigger("play_sound", "add");
    } else {
      np.trigger("play_sound", "subtract");
    }

    universe.StarDirRowHilight = undefined;
    universe.starDirectory.sortBy = name;

    var reverse = false;
    if (!universe.starDirectory.invert) {
      reverse = true;
    }

    // desc by default
    if (name === "name") {
      reverse = !reverse;
    }

    universe.starDirectoryTable.sort(name, reverse);

  };


  function dropOrder(fleetOrder) {
    // delay, star, orderID, amount
    var oid = fleetOrder[2];
    return (oid === 4 || oid === 6 || oid === 2);
  }
  var customFleetDirectory = function () {
    var prop, star, i;
    var starDir = npui.Screen("galaxy")
      .size(480);

    npui.DirectoryTabs("fleet")
      .roost(starDir);

    var filterText = "filter_show_mine_fleets";
    if (universe.fleetDirectory.filter === "my_fleets") {
      filterText = "filter_show_all_fleets";
    }

    Crux.Text(filterText, "rel pad12 col_accent")
      .roost(starDir);

    var sortedFleets = [];
    for (prop in universe.galaxy.fleets) {
      if (universe.fleetDirectory.filter === "my_fleets") {
        if (universe.galaxy.fleets[prop].player === universe.player) {
          sortedFleets.push(universe.galaxy.fleets[prop]);
        }
      } else {
        sortedFleets.push(universe.galaxy.fleets[prop]);
      }
    }

    if (universe.fleetDirectory.sortBy === "name") {
      sortedFleets.sort(function (a, b) {
        var result = -1;
        if (a.n < b.n) {
          result = 1;
        }
        result *= universe.fleetDirectory.invert;
        return result;
      });
    }

    if (universe.fleetDirectory.sortBy === "st" ||
      universe.fleetDirectory.sortBy === "puid" ||
      universe.fleetDirectory.sortBy === "hpuid" ||
      universe.fleetDirectory.sortBy === "etaFirst" ||
      universe.fleetDirectory.sortBy === "eta") {
      sortedFleets.sort(function (a, b) {
        var result = b[universe.fleetDirectory.sortBy] - a[universe.fleetDirectory.sortBy];
        if (result === 0) {
          result = 1;
          if (a.n < b.n) {
            result = -1;
          }
        }
        result *= universe.fleetDirectory.invert;
        return result;
      });
    }

    if (universe.fleetDirectory.sortBy === "w") {
      sortedFleets.sort(function (a, b) {
        var result = b.path.length - a.path.length;
        if (result === 0) {
          result = 1;
          if (a.n < b.n) {
            result = -1;
          }
        }
        result *= universe.fleetDirectory.invert;
        return result;
      });
    }

    if (universe.fleetDirectory.sortBy === "drops") {
      sortedFleets.sort(function (a, b) {
        var result = _.filter(b.orders, dropOrder).length - _.filter(a.orders, dropOrder).length;
        if (result === 0) {
          result = 1;
          if (a.n < b.n) {
            result = -1;
          }
        }
        result *= universe.fleetDirectory.invert;
        return result;
      });
    }

    var html = "<table class='star_directory'>";
    html += "<tr><th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'puid\')\">P</a></th>";
    html += "<th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'hpuid\')\">H</a></th>";
    html += '<th class="ic-eye">&#59146;</th>';
    html += "<th class='star_directory_name'><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'name\')\">Name</a></th>";
    html += "<th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'st\')\">Ships</a></th>";
    html += "<th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'w\')\">W</a></th>";
    html += "<th><a class=\"icon-down-open\" onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'drops\')\"></a></th>";
    html += "<th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'etaFirst\')\">ETA</a></th>";
    html += "<th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'eta\')\">&Sigma;ETA</a></th>";
    html += "</tr>";

    var clickEvent, icon, rotation, name, fleet;
    for (i = sortedFleets.length - 1; i >= 0; i--) {
      fleet = sortedFleets[i];
      html += "<tr>";
      html += "<td>";

      if (fleet.player) {
        html += fleet.player.colourBox;
      }
      html += "</td>";


      html += "<td>";
      if (fleet.home) {
        html += fleet.homeplayer.colourBox;
      }
      html += "</td>";

      rotation = npui.map.calcFleetAngle(fleet);

      var iconStyle = '' +
        'display: inline-block;' +
        'transform: rotate(' + rotation + 'rad) scale(0.5);' +
        'background-image: url(/images/map/stars.png);' +
        'background-position: 432px 560px;' +
        'width: 32px;' +
        'height: 32px;'.replace(/\n/g, '');
      var ci = fleet.player.colorIndex;
      var iconStyle2 = '' +
        'position: absolute;' +
        'display: inline-block;' +
        'background-image: url(/images/map/stars.png);' +
        'background-position: 48px ' + (64 * (8 - ci) - 16) + 'px;' +
        'width: 32px;' +
        'height: 32px;'.replace(/\n/g, '');

      clickEvent = 'Crux.crux.trigger(\'show_fleet_uid\' , \'' + fleet.uid + '\' )';

      icon = '<a onclick="' + clickEvent + '">';
      if (fleet.warpSpeed) {
        icon += '<span style="' + iconStyle2 + '" ></span>';
      }
      icon += '<span style="' + iconStyle + '" ></span>';
      icon += '</a>';
      html += '<td style="">' + icon + '</td>';



      name = fleet.n;
      clickEvent = 'Crux.crux.trigger(\'show_fleet_screen_uid\' , \'' + fleet.uid + '\' )';
      html += '<td class="star_directory_name" style="text-align: left;"> <a onclick=\"' + clickEvent + '\"> ' + name + ' </a> </td>';

      html += "<td> " + fleet.st + "</td>";

      html += "<td> " + fleet.path.length;
      if (fleet.loop) {
        html += " <span class='icon-loop'></span>";
      }
      html += "</td>";

      html += "<td> " + _.filter(fleet.orders, dropOrder).length + "</td>";

      html += "<td> " + universe.timeToTick(fleet.etaFirst, true) + "</td>";
      html += "<td> " + universe.timeToTick(fleet.eta, true) + "</td>";

      html += "</tr>";
    }
    html += "</table>";

    Crux.Text("", "rel")
      .rawHTML(html)
      .roost(starDir);

    return starDir;
  };

  // Straight copy from source
  var shipDirectoryFilters = [{
    name: 'Owner',
    attr: 'player',
    vals: [] // ????
  }, {
    name: 'Type',
    attr: 'kind',
    vals: ['star', 'ship']
  }];

  // generate a sorter function that sorts
  // based on multiple attributes
  function multisort() {
    var attrs = arguments;
    console.log('multisort init: ', attrs);
    return function (a, b) {
      for (var i = 0, l = attrs.length; i < l; i++) {
        var attr = attrs[i];
        var k = attr[0];
        var asc = attr[1];

        var a_ = a[k];
        var b_ = b[k];
        // a_ && console.log('ms', a, b, a_, b_, a_ < b_, a_ > b_);
        if (a_ < b_) return asc * -1;
        if (b_ > a_) return asc * 1;
      }
      return 0;
    };

  }

  np.OnShipFilter = function (event, val) {
    console.log('OnShipFilter', arguments);
    // shipDirectory.filter =
  };

  np.on('change_ship_filter', np.OnShipFilter);

  npui.ShipDirectory = function () {
    var prop, star;
    var stars = universe.galaxy.stars;
    var fleets = universe.galaxy.fleets;
    var starDir = npui.Screen("galaxy")
      .size(480);

    npui.DirectoryTabs("ship")
      .roost(starDir);

    var shipDirectory = universe.shipDirectory;

    // var filterText = "filter_show_mine_ships";
    // if (shipDirectory.filter === "my_ships") {
    //   filterText = "filter_show_all_ships";
    // }

    // Crux.Text(filterText, "rel pad12 col_accent")
    //   .roost(starDir);

    for (var i in shipDirectoryFilters) {
      var filter = shipDirectoryFilters[i];
      var options = filter.attr;

      Crux.DropDown(filter.name, filter.vals, 'change_ship_filter')
        .grid(10, 0, 10, 3)
        .roost(starDir);
    }

    var sortedShips = [];
    for (prop in fleets) {
      var fleet = fleets[prop];
      if (shipDirectory.filter === "my_ships") {
        if (fleet.player === universe.player) {
          sortedShips.push(fleet);
        }
      } else {
        sortedShips.push(fleet);
      }
    }

    for (prop in stars) {
      star = stars[prop];
      if (shipDirectory.filter === "my_ships") {
        if (star.player === universe.player) {
          sortedShips.push(star);
        }
      } else {
        sortedShips.push(star);
      }
    }

    var sorter = multisort([shipDirectory.sortBy, -1], ['n', 1]);
    sortedShips.sort(sorter);

    if (universe.shipDirectory.invert === -1) {
      sortedShips.reverse();
    }

    var html = "<table class='star_directory'>";
    html += "<tr><td><a onClick=\"Crux.crux.trigger(\'ship_dir_sort\', \'puid\')\">P</a></td>";

    html += "<td class='star_directory_name'><a onClick=\"Crux.crux.trigger(\'ship_dir_sort\', \'name\')\">Name</a></td>";
    html += "<td></td>";
    html += "<td></td>";
    html += "<td><a onClick=\"Crux.crux.trigger(\'ship_dir_sort\', \'st\')\">Ships</a></td>";
    html += "</tr>";

    for (i = sortedShips.length - 1; i >= 0; i--) {
      var clickEvent = "";
      html += "<tr>";
      html += "<td>";

      if (sortedShips[i].player) {
        html += sortedShips[i].player.colourBox;
      }
      html += "</td>";

      if (sortedShips[i].kind === "fleet") {
        clickEvent = 'Crux.crux.trigger(\'show_fleet_screen_uid\' , \'' + sortedShips[i].uid + '\' )';
        html += '<td class="star_directory_name"> <a onClick=\"' + clickEvent + '\"> ' + sortedShips[i].n + ' </a> </td>';

        clickEvent = 'Crux.crux.trigger(\'show_fleet_uid\' , \'' + sortedShips[i].uid + '\' )';
        html += '<td> <a onClick=\"' + clickEvent + '\" class="ic-eye">&#59146;</a> </td>';
        html += "<td> <span class=icon-rocket></span></td>";

        html += "<td> " + sortedShips[i].st + "</td>";
      } else {
        clickEvent = 'Crux.crux.trigger(\'show_star_screen_uid\' , \'' + sortedShips[i].uid + '\' )';
        html += '<td class="star_directory_name"> <a onClick=\"' + clickEvent + '\"> ' + sortedShips[i].n + ' </a> </td>';

        clickEvent = 'Crux.crux.trigger(\'show_star_uid\' , \'' + sortedShips[i].uid + '\' )';
        html += '<td> <a onClick=\"' + clickEvent + '\" class="ic-eye">&#59146;</a> </td>';

        html += "<td> <span class=icon-star-1></span></td>";
        html += "<td> " + sortedShips[i].st + "</td>";

      }


      html += "</tr>";
    }
    html += "</table>";

    Crux.Text("", "rel")
      .rawHTML(html)
      .roost(starDir);

    return starDir;
  };

  var customScreens = {
    "player_dir": npui.PlayerDirectory
  };

  npui.onShowScreen = NP2M.wrap(npui.onShowScreen, function (args) {
    log('onShowScreen', arguments);
    //event, screenName, screenConfig, screenConfig2
    var screenName = args[1];


    // if (!universe.player &&
    //         screenName !== "confirm" &&
    //         screenName !== "game_password" &&
    //         screenName !== "custom_settings" &&
    //         screenName !== "empire" &&
    //         screenName !== "help") {
    //   universe.player = universe.galaxy.players[0];
    //   // npui.showingScreen = "join_game";
    // }



    if (!customScreens[screenName]) {
      return args;
    }

    var scroll = 0;
    if (npui.showingScreen === screenName) {
      scroll = jQuery(window)
        .scrollTop();
    } else {
      npui.trigger("play_sound", "screen_open");
    }

    npui.onHideScreen(null, true);
    npui.onHideSelectionMenu();

    npui.trigger("hide_side_menu");
    npui.trigger("reset_edit_mode");

    npui.showingScreen = screenName;
    var screenConfig = args[2];

    npui.activeScreen = customScreens[npui.showingScreen](screenConfig);

    if (npui.activeScreen) {
      npui.activeScreen.roost(npui.screenContainer);
      npui.layoutElement(npui.activeScreen);
    }

    jQuery(window)
      .scrollTop(scroll);

    return undefined;
  }, function (args, ret) {
    return ret;
  });

  // TEMPORARY FIX ONLY!!!!!!!!!!!!!!
  npui.StarDirectory = function () {
    var prop, star, i;
    var starDir = npui.Screen("galaxy")
      .size(480);

    universe.rawExportStar = [];
    universe.rawExportStars = "";

    npui.DirectoryTabs("star")
      .roost(starDir);

    // ---------------------------------------------------------------------
    var ugh = Crux.Widget("rel pad12 col_base")
      .size(480, 48)
      .roost(starDir);

    Crux.IconButton("icon-dollar", "show_screen", "bulk_upgrade")
      .grid(27, 0, 3, 3)
      .roost(ugh);

    var bgsSelections = {
      "off": "Disable Upgrades",
      "on": "Enable Upgrades"
    };

    var bgsChoice = "on";
    if (!universe.interfaceSettings.allowBuyGalaxyScreen) {
      bgsChoice = "off";
    }

    starDir.allowBuyGalaxyScreen = Crux.DropDown(bgsChoice, bgsSelections, "setting_change")
      .grid(15.5, 0, 12, 3)
      .roost(ugh);

    starDir.onSettingChange = function () {
      if (starDir.allowBuyGalaxyScreen.getValue() === "on") {
        universe.setInterfaceSetting("allowBuyGalaxyScreen", true);
      } else {
        universe.setInterfaceSetting("allowBuyGalaxyScreen", false);
      }
      starDir.trigger("refresh_interface");
    };
    starDir.on("setting_change", starDir.onSettingChange);
    // ---------------------------------------------------------------------


    var filterText = "filter_show_mine";
    if (universe.starDirectory.filter === "my_stars") {
      filterText = "filter_show_all";
    }

    Crux.Text(filterText, "rel pad12 col_accent")
      .roost(starDir);

    var sortedStars = [];
    for (prop in universe.galaxy.stars) {
      if (universe.starDirectory.filter === "my_stars") {
        if (universe.galaxy.stars[prop].player === universe.player) {
          sortedStars.push(universe.galaxy.stars[prop]);
        }
      } else {
        sortedStars.push(universe.galaxy.stars[prop]);
      }
    }

    var sortBy = universe.starDirectory.sortBy;
    if (sortBy === "name") {
      sortedStars.sort(function (a, b) {
        var result = -1;
        if (a.n < b.n) {
          result = 1;
        }
        result *= universe.starDirectory.invert;
        return result;
      });
      // if (universe.starDirectory.sortBy === "uce" ||
      //   universe.starDirectory.sortBy === "uci" ||
      //   universe.starDirectory.sortBy === "ucs" ||
      //   universe.starDirectory.sortBy === "puid" ||
      //   universe.starDirectory.sortBy === "e" ||
      //   universe.starDirectory.sortBy === "i" ||
      //   universe.starDirectory.sortBy === "s"
      // ) {
    } else if (sortBy in sortedStars[0]) {

      sortedStars.sort(function (a, b) {
        var result = b[universe.starDirectory.sortBy] - a[universe.starDirectory.sortBy];
        if (result === 0) {
          result = 1;
          if (a.n < b.n) {
            result = -1;
          }
        }
        result *= universe.starDirectory.invert;
        return result;
      });
    }

    var html = "<table class='star_directory'>";
    html += "<tr><td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'puid\')\">P</a></td>";
    html += "<td class='star_directory_name'><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'name\')\">Name</a></td>";
    html += "<td></td>";
    html += "<td><abbr title=\"Warpgate\">W</abbr></td>";
    html += "<td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'r\')\"><abbr title=\"Resources\">R</abbr></a></td>";
    html += "<td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'e\')\">E</a></td>";
    html += "<td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'i\')\">I</a></td>";
    html += "<td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'s\')\">S</a></td>";
    html += "<td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'uce\')\">$ E</a></td>";
    html += "<td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'uci\')\">$ I</a></td>";
    html += "<td><a onClick=\"Crux.crux.trigger(\'star_dir_sort\', \'ucs\')\">$ S</a></td>";
    html += "</tr>";
    for (i = sortedStars.length - 1; i >= 0; i--) {
      star = sortedStars[i];

      // a very quick way to provide the star data to a player who
      // wanted CVS export of the star data.
      // data can be accessed from console via
      // window.NeptunesPride.universe.rawExportStars
      universe.rawExportStar = [];
      universe.rawExportStar.push(star.r);
      universe.rawExportStar.push(star.n);
      universe.rawExportStar.push(star.e);
      universe.rawExportStar.push(star.i);
      universe.rawExportStar.push(star.s);
      universe.rawExportStar.push(star.uce);
      universe.rawExportStar.push(star.uci);
      universe.rawExportStar.push(star.ucs);
      universe.rawExportStar.push(star.st);
      universe.rawExportStar.push(star.totalDefenses);
      universe.rawExportStars += universe.rawExportStar.join(",") + "\n";

      var clickEvent = "";

      html += "<tr>";

      html += "<td>";

      if (sortedStars[i].player) {
        html += sortedStars[i].player.colourBox;
      }
      html += "</td>";

      clickEvent = 'Crux.crux.trigger(\'show_star_screen_uid\' , \'' + sortedStars[i].uid + '\' )';
      html += '<td class="star_directory_name"> <a onClick=\"' + clickEvent + '\"> ' + sortedStars[i].n + ' </a> </td>';

      clickEvent = 'Crux.crux.trigger(\'show_star_uid\' , \'' + sortedStars[i].uid + '\' ); Crux.crux.trigger(\'star_dir_row_hilight\' , \'' + i + '\' )';
      if (universe.StarDirRowHilight === i) {
        html += '<td> <a onClick=\"' + clickEvent + '\" class="ic-eye txt_warn_bad">&#59146;</a> </td>';
      } else {
        html += '<td> <a onClick=\"' + clickEvent + '\" class="ic-eye">&#59146;</a> </td>';
      }

      html += "<td> " + (sortedStars[i].ga ? '*' : '') + "</td>";
      html += "<td> " + sortedStars[i].r + "</td>";
      html += "<td> " + sortedStars[i].e + "</td>";
      html += "<td> " + sortedStars[i].i + "</td>";
      html += "<td> " + sortedStars[i].s + "</td>";

      if (universe.player.conceded > 0) {
        universe.interfaceSettings.allowBuyGalaxyScreen = false;
      }

      if (sortedStars[i].player === universe.player && universe.player.cash >= sortedStars[i].uce && universe.interfaceSettings.allowBuyGalaxyScreen) {
        html += "<td> <a  onClick=\"event.preventDefault();Crux.crux.trigger(\'star_dir_upgrade_e\', \'" + sortedStars[i].uid + "\')\"  >$" + sortedStars[i].uce + "</a></td>";
      } else {
        html += "<td> $" + sortedStars[i].uce + "</td>";
      }

      if (sortedStars[i].player === universe.player && universe.player.cash >= sortedStars[i].uci && universe.interfaceSettings.allowBuyGalaxyScreen) {
        html += "<td> <a  onClick=\"event.preventDefault();Crux.crux.trigger(\'star_dir_upgrade_i\', \'" + sortedStars[i].uid + "\')\"  >$" + sortedStars[i].uci + "</a></td>";
      } else {
        html += "<td> $" + sortedStars[i].uci + "</td>";
      }

      if (sortedStars[i].player === universe.player && universe.player.cash >= sortedStars[i].ucs && universe.interfaceSettings.allowBuyGalaxyScreen) {
        html += "<td> <a  onClick=\"event.preventDefault();Crux.crux.trigger(\'star_dir_upgrade_s\', \'" + sortedStars[i].uid + "\')\"  >$" + sortedStars[i].ucs + "</a></td>";
      } else {
        html += "<td> $" + sortedStars[i].ucs + "</td>";
      }

      html += "</tr>";
    }
    html += "</table>";

    Crux.Text("", "rel")
      .rawHTML(html)
      .roost(starDir);


    return starDir;
  };


  // replace_widget_handlers(np, "star_dir_sort", np.onStarDirSort);
  // replace_widget_handlers(npui, "show_screen", npui.onShowScreen);
  npui.FleetDirectory = customFleetDirectory;
  // npui.StarDirectory = customStarDirectory;
  // npui.DirectoryTabs = customDirectoryTabs;




  // np.onStarDirectoryEconomy = function(event, data) {
  //     log('onStarDirectoryEconomy');
  //     universe.selectStar(universe.galaxy.stars[data]);
  //     np.onUpgradeEconomy();
  //     //np.trigger("map_refresh");
  // };

  // np.onStarDirectoryIndustry = function(event, data) {
  //     log('onStarDirectoryIndustry');
  //     universe.selectStar(universe.galaxy.stars[data]);
  //     np.onUpgradeIndustry();
  //     //np.trigger("map_refresh");
  // };

  // np.onStarDirectoryScience = function(event, data) {
  //     log('onStarDirectoryScience');
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








});
