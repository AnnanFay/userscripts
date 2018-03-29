function pre_init_hook() {
  console.log('UI TWEAKS: pre_init_hook');
  addGlobalStyle(CSS);
}

function post_init_hook(data) {
  console.log('UI TWEAKS: post_init_hook', data);

  var mg = data.mg;
  if (mg) {
    unsafeWindow.NeptunesPride.mg = mg;

    var originalOnPreDelete = mg.onPreDelete;
    mg.onPreDelete = function (event, game) {
      if (game.players > 0) {
        return originalOnPreDelete.apply(this, arguments);
      }
      mg.trigger("delete_game", game);
    };
    mg.postGameDeleted = function () {
      mg.onGameDeleted.apply(this, arguments);
      setTimeout(function(){
        mg.trigger("show_screen", "load_game");
      }, 500);
    };
    replace_widget_handlers(mg, 'pre_delete_game', mg.onPreDelete);
    replace_widget_handlers(mg, 'meta:game_deleted', mg.postGameDeleted);

    // mg.onBrowseTo = function (event, url) {
    //   var b = event.which;
    //   if (b === 1) {
    //     window.location.href = url;
    //     return;
    //   } else if (b === 2) {
    //     // this is really bad
    //     // we need to convert Crux.Button into an actual link!!!!
    //     window.open(url, '_blank');
    //     return;
    //   }
    // };
    // replace_widget_handlers(mg, 'browse_to', mg.onBrowseTo);

    return;
  }

  var Crux = data.Crux;
  var GS = Crux.gridSize;
  var np = data.np;
  var universe = data.universe;
  var npui = data.npui;
  var inbox = data.inbox;
  var Mousetrap = data.Mousetrap;

  // universe.movieMode = true;


  np.testForNag = function () {};

  npui.StarInspector = NP2M.wrap(npui.StarInspector, function (args, starInspector) {
    var star = universe.selectedStar;
    console.log('npui.StarInspector -> star', star);
    // we still want to show infrastructure on unclaimed stars
    var unclaimedStar = !star.player;
    if (unclaimedStar) {
      npui.StarInfStatus(false)
        .roost(starInspector);
    }
    // add sector symbol to heading
    var home = universe.player.home;
    var dx = star.x - home.x,
      dy = star.y - home.y;
    var pos = '(' + Math.floor(dx * 8) + ',' + Math.floor(-dy * 8) + ')';
    var heading = star.homeplayer.colourBox + ' ' + star.n + ' ' + pos;
    starInspector.heading.rawHTML(heading);


    if (star === star.home) {
      starInspector.heading.ui.find('span').css('text-shadow', '0px 0px 12px #fff');
    }

    return starInspector;
  });

  // Make star names in fleet navigation clickable.
  // TODO: Show action and ETA at same time
  npui.FleetNavOrder = NP2M.wrap(npui.FleetNavOrder, function (args, fno) {
    var order = args[0];
    var star = universe.galaxy.stars[order[1]];
    var starText = fno.children[1];


    if (star === undefined) {
      return fno;
    }

    // remove current text
    fno.removeChild(starText);

    //var starLink = Crux.Clickable('select_star', {star: star});
    var starLink = Crux.Widget();

    starText
      .rawHTML(star.hyperlinkedName)
      .roost(starLink);

    var sibling = fno.children[0];
    // insert child not supported officially
    starLink.mum = fno;
    fno.children.splice(fno.children.indexOf(sibling) + 1, 0, starLink);
    sibling.ui.after(starLink.ui);

    var action = fno.children[2];
    action.grid(10, 0, 12, 3);
    action.ui[0].innerHTML = action.ui[0].innerHTML.replace(/Ships|with/g, '');

    var eta = universe.timeToTick(order[4]);
    Crux.Text("", "pad12")
      .grid(18, 0, 8, 3)
      .rawHTML(eta)
      .roost(fno);


    return fno;
  });

  // Commented out 2015!!!
  // npui.LeaderboardPlayer = NP2M.wrap(npui.LeaderboardPlayer, function(args, leaderboardPlayer) {
  //     var player = args[0];
  //     if (player.home) {
  //         var eye = Crux.IconButton('icon-eye', 'map_center_slide', player.home)
  //             .grid(27, 0, 3, 3)
  //             .roost(leaderboardPlayer);

  //         eye.ui.css('color', 'red');
  //         eye.ui.attr('title', player.home.n);
  //     }

  //     return leaderboardPlayer;
  // });

  // empire screen modifications
  npui.PlayerPanel = NP2M.wrap(npui.PlayerPanel, function (args, playerPanel) {
    var player = args[0],
      showEmpire = args[1];

    // previous next player
    var uid = player.uid;
    if (universe.galaxy.players[uid - 1]) {
      var prevButton = Crux.IconButton('icon-prev', 'select_player', uid - 1)
        .grid(10, 0, 3, 3)
        .roost(playerPanel);
    }
    if (universe.galaxy.players[uid + 1]) {
      var nextButton = Crux.IconButton('icon-next', 'select_player', uid + 1)
        .grid(20, 0, 3, 3)
        .roost(playerPanel);
    }
    // var ship_widge = find_widget(playerPanel, '4880');
    // var ship_widge = playerPanel.children[15];


    // console.log('playerPanel', playerPanel);
    // console.log('ship_widge', ship_widge, playerPanel.children.indexOf(ship_widge));
    function ofPlayer(d) {
      return d.puid === uid;
    }

    var stars = _.filter(_.values(universe.galaxy.stars), ofPlayer);
    var fleets = _.filter(_.values(universe.galaxy.fleets), ofPlayer);
    var all_nodes = [].concat(stars, fleets);

    var visibleShips = _.reduce(all_nodes, function (m, n) {
      return m + n.st;
    }, 0);
    var visibleShipsPerTick = _.reduce(all_nodes, function (m, n) {
      return m + n.st;
    }, 0);
    var visibleStars = stars.length;
    var visibleFleets = fleets.length;

    // visibleIndustry
    // visibleScience
    // visibleEconomy
    // visible.....?

    // ship_widge
    //     .grid(10-2, 13, 15 + 4, 3)
    //     .rawHTML(player.total_strength + ' (' + visible_st + ')');

    function formatPercent(s) {
      return (s * 100).toFixed(0) + '%';
    }

    var RH = 2; // row height
    Crux.Text('vis.', 'pad12 txt_center')
      .grid(16, 2 + 2 * RH, 5, RH)
      .roost(playerPanel);

    Crux.Text('', 'pad8 txt_center')
      .grid(16, 3 + 3 * RH, 5, RH)
      .rawHTML(formatPercent(visibleStars ? (visibleStars / player.total_stars) : 0))
      .roost(playerPanel);

    Crux.Text('', 'pad8 txt_center')
      .grid(16, 3 + 4 * RH, 5, RH)
      .rawHTML(formatPercent(visibleFleets ? (visibleFleets / player.total_fleets) : 0))
      .roost(playerPanel);

    Crux.Text('', 'pad8 txt_center')
      .grid(16, 3 + 5 * RH, 5, RH)
      .rawHTML(formatPercent(visibleShips ? (visibleShips / player.total_strength) : 0))
      .roost(playerPanel);



    //     .rawHTML(player.total_stars)
    //     .rawHTML(player.total_fleets)
    //     .rawHTML(player.total_strength)
    //     .rawHTML(player.shipsPerTick)

    // Crux.Text('',  'pad8 txt_center')
    //     .grid(8, 6 * RH, 5, RH)
    //     .rawHTML(player.shipsPerTick)
    //     .roost(playerPanel);



    if (!showEmpire && player.home) {
      var eye = Crux.IconButton('icon-eye', 'map_center_slide', player.home)
        .grid(5, 13, 3, 3)
        .roost(playerPanel);
      eye.ui.css('color', 'red');
      eye.ui.attr('title', player.home.n);
    }

    return playerPanel;
  });
  // npui.EmpireInf = NP2M.wrap(npui.EmpireInf, function (args, empireInf) {
  //     return empireInf;
  // });

  universe.describeTickRate = NP2M.wrap(universe.describeTickRate, function (args, ret) {
    return ret.replace('every', '/');
  });

  npui.RulerToolbar = NP2M.wrap(npui.RulerToolbar, function (args) {
    universe.ruler.gate = true;
    return args;
  }, function (args, ret) {
    return ret;
  });

  // Commented out 2015!!!
  np.onFetchPlayerAchievements = function () {
    //if (NeptunesPride.gameConfig.anonymity === 1) return;
    if (universe.playerAchievements !== null) return;
    np.trigger('server_request', {
      type: 'fetch_player_achievements',
      game_number: NeptunesPride.gameNumber
    });
  };

  universe.tickToMiliseconds = function (tick, wholeTime) {
    var ms_since_data = 0;
    var tf = universe.galaxy.tick_fragment;
    var ltc = universe.locTimeCorrection;

    if (!universe.galaxy.paused) {
      ms_since_data = new Date().valueOf() - universe.now.valueOf();
    }

    if (wholeTime || universe.galaxy.turn_based) {
      ms_since_data = 0;
      tf = 0;
      ltc = 0;
    }

    return (tick * 1000 * 60 * universe.galaxy.tick_rate) -
      (tf * 1000 * 60 * universe.galaxy.tick_rate) -
      ms_since_data - ltc;
  };
  universe.timeToTick = function (tick, wholeTime) {
    var ms_remaining = universe.tickToMiliseconds(tick, wholeTime);

    if (ms_remaining < 0) {
      return "0s";
    }

    return formatTick(tick) + '<sub>[' + Crux.formatTime(ms_remaining, true) + ']</sub>';
  };

  universe.timeToProduction = function () {
    var tr = universe.galaxy.production_rate - universe.galaxy.production_counter;
    var date = new Date((new Date())
      .valueOf() + universe.tickToMiliseconds(tr));

    var time = '<span style="font-size: 50%;"> [' + date.getHours() + ':' + date.getMinutes() + ']</span>';

    var ms_remaining = universe.tickToMiliseconds(tr);
    return '<sub>[' + Crux.formatTime(ms_remaining, true) + ']</sub>'; // + time;
  };

  // if you change fleet orders keep the current value
  npui.EditFleetOrder = NP2M.wrap(npui.EditFleetOrder, function (__a, efo) {
    efo.onSettingsChange = NP2M.wrap(efo.onSettingsChange, function (__b, __c) {
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
    var rounds;
    if (defending) {
      selfWeapon++;
      rounds = Math.ceil(enemyShips / selfWeapon) - 1;
    } else {
      enemyWeapon++;
      rounds = Math.ceil(enemyShips / selfWeapon);
    }
    var shipsLost = rounds * enemyWeapon;
    return shipsLost;
  }
  // could use find_widget(widget, needle) ?
  npui.StarDefStatus = NP2M.wrap(npui.StarDefStatus, function (args, starDefStatus) {
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
    var message = ' {' + shipsLost + ' -> ' + timeToGet + 't}';

    // console.log('appending', message, 'to', starDefStatus);

    starDefStatus.children[1].ui.append(message);

    return starDefStatus;
  });

  npui.FleetStatus = NP2M.wrap(npui.FleetStatus, function (args, fleetStatus) {
    var fleet = universe.selectedFleet;
    var shipsLost = battleCalc(
      true, // we are defending from the fleet
      fleet.st,
      fleet.player.tech.weapons.value,
      universe.player.tech.weapons.value);

    var message = ' {' + shipsLost + '}';
    // console.log('appending', message, 'to', fleetStatus);
    fleetStatus.children[1].ui.append(message);
    return fleetStatus;
  });



  // Commented out 2015!!!
  Crux.Link = function (content, event, data, style) {
    var self = Crux.Widget();

    self.ui = $('<a></a>');
    self.ui.append(content);

    self.addStyle(style);

    self.onMouseDown = function (e) {
      log('Crux.Link mouse down');
      Crux.crux.trigger(event, data);
    };

    self.ui.on("mousedown", self.onMouseDown);

    return self;
  };

  Crux.Sprite = function (sprite, style) {
    // log('Crux.Sprite(', arguments, ')');
    style = style === undefined ? 'rel' : style;
    var self = Crux.Widget(style);
    self.sprite = sprite;

    var posX = -(sprite.spriteX + (sprite.width / 4)),
      posY = -(sprite.spriteY + (sprite.height / 4));

    self.ui.css({
      'visibility': sprite.visible ? 'visible' : 'hidden',
      'transform': 'rotate(' + sprite.rotation + 'rad) scale(' + sprite.scale + ')',
      'background-image': 'url(' + sprite.image.src + ')',
      'background-position': posX + 'px ' + posY + 'px',
      'width': (sprite.width / 2) + 'px',
      'height': (sprite.height / 2) + 'px'
    });

    self.scale = function (scaler) {

      self.ui.css({
        'transform': 'rotate(' + sprite.rotation + 'rad) scale(' + scaler + ')'
      });
      return self;
    };

    return self;
  };

  Crux.SpriteStack = function (sprites, style) {
    style = style === undefined ? 'rel' : style;
    var self = Crux.Widget(style);
    self.sprites = sprites;

    var s, maxWidth = 0,
      maxHeight = 0;
    for (var i = sprites.length - 1; i >= 0; i--) {
      s = sprites[i];
      if (s) {
        maxWidth = Math.max(maxWidth, s.width);
        maxHeight = Math.max(maxHeight, s.height);

        sprites[i] = Crux.Sprite(s, '')
          .grid(0, 0)
          .roost(self);
      }
    }

    self.size(maxWidth / 2, maxHeight / 2);

    self.scale = function (scaler) {
      for (var i = sprites.length - 1; i >= 0; i--) {
        if (sprites[i]) {
          if (scaler[i]) {
            sprites[i].scale(scaler[i]);
          } else {
            sprites[i].scale(scaler);
          }
        }
      }
      return self;
    };

    return self;
  };

  Crux.TableHeader = function (head) {

    // Create initial header from string only fields
    var thStrings = [];
    var h;
    for (var i = 0, l = head.length; i < l; i++) {
      h = head[i];
      thStrings.push(_.isString(h) ? h : '');
    }
    var thead = $('<thead><tr><th>' + thStrings.join("</th><th>") + '</th></tr></thead>');

    // Deal with complex headers
    var ths = $('th', thead);
    for (i = 0, l = head.length; i < l; i++) {
      h = head[i];
      if (!_.isString(h)) {
        if (h.ui) {
          h = h.ui;
        }
        $(ths[i])
          .append(h);
      }
    }

    return thead;
  };

  Crux.TableRow = function (data) {

    // Create initial row from string only fields
    var tdStrings = [];
    var cell, i, l;
    for (i = 0, l = data.length; i < l; i++) {
      cell = data[i];
      tdStrings.push(_.isString(cell) ? cell : '');
    }
    var row = $('<tr><td>' + tdStrings.join("</td><td>") + '</td></tr>');

    // Deal with complex fields
    var tds = $('td', row);
    for (i = 0, l = data.length; i < l; i++) {
      cell = data[i];
      if (!_.isString(cell)) {
        if (cell.ui) {
          cell = cell.ui;
        }
        $(tds[i])
          .append(cell);
      }
    }

    return row;
  };

  Crux.Table = function (head, data, extractor, style) {
    log('Crux.Table', arguments);
    var self = Crux.Widget('rel');

    var table = $('<table>')
      .addClass(style);

    table.append(Crux.TableHeader(head));

    var dataRows = [];
    _.each(data, function (d) {
      var row = Crux.TableRow(extractor(d));
      dataRows.push([d, row]);
      table.append(row);
    });

    self.ui.append(table);

    self.sort = function (sorter, reverse) {
      log('sorting table', arguments);
      // $('tbody > tr', table).detach();

      dataRows = _.sortBy(dataRows, function (dr, i) {
        return dr[0][sorter];
      });

      if (reverse) {
        dataRows.reverse();
      }
      _.each(dataRows, function (dr) {
        table.append(dr[1]);
      });
    };

    return self;
  };


  Crux.InlineButton = function (id, eventKind, eventData) {
    var self = Crux.Button(id, eventKind, eventData)
      .addStyle('rel');
    self.label.addStyle('rel');
    return self;
  };

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
  np.onPlayerDirSort = function () {
    log('onPlayerDirSort');
  };
  np.on("player_dir_sort", np.onPlayerDirSort);



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

    var html = "<table class='star_directory'>";
    html += "<tr><th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'puid\')\">P</a></th>";
    html += "<th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'hpuid\')\">H</a></th>";
    html += '<th class="ic-eye">&#59146;</th>';
    html += "<th class='star_directory_name'><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'name\')\">Name</a></th>";
    html += "<th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'st\')\">Ships</a></th>";
    html += "<th><a onClick=\"Crux.crux.trigger(\'fleet_dir_sort\', \'w\')\">W</a></th>";
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

  np.OnShipFilter = function(event, val) {
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


  // np.onShowIntel = function (event, puid) {
  //     log('onShowIntel', event, puid);
  //     // if (!universe.player) return;

  //     if (!universe.intelDataFull) {
  //         np.onRequestIntelData();
  //     }

  //     universe.intelPlayerToChart = [];
  //     universe.intelPlayerToChart.push(universe.player.uid);
  //     if (puid !== universe.player.uid) {
  //         universe.intelPlayerToChart.push(puid);
  //     }

  //     np.onIntelSelectionChange(null, universe.intelDataType);
  // };
  // replace_widget_handlers(np, "show_intel", np.onShowIntel);


  // replace_widget_handlers(npui, "show_screen", npui.onShowScreen);

  // replace_widget_handlers(np, "star_dir_sort", np.onStarDirSort);

  // npui.FleetDirectory = customFleetDirectory;
  // npui.StarDirectory = customStarDirectory;
  // npui.DirectoryTabs = customDirectoryTabs;

  function cost(resources, base, level) {
    return Math.floor(base / resources) * level;
  }

  function totalCost(resources, base, level) {
    return _.reduce(_.range(1, level + 1), function (a, b) {
      return a + cost(resources, base, b);
    }, 0);
  }


  var gameConfig = NeptunesPride.gameConfig;
  var baseInfraCosts = {
    economy: 250 * gameConfig.developmentCostEconomy,
    industry: 500 * gameConfig.developmentCostIndustry,
    science: 2000 * gameConfig.developmentCostScience
  };

  universe.expandStarData = function (star) {
    star.kind = "star";
    star.fleetsInOrbit = [];
    star.alliedDefenders = [];
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
    if (star.v === "0") {
      star.st = star.e = star.i = star.s = 0;
      star.uce = star.uci = star.ucs = 0;
      star.c = star.g = star.r = star.nr = 0;
    }
    if (star.r) {
      // apply current player's terra bonus for unclaimed stars
      var bonus = !star.player ? universe.player.tech.terraforming.value * 5 : 0;
      var res = star.r + bonus;

      // star.uce = cost(res, baseInfraCosts.economy, star.e + 1);
      // star.uci = cost(res, baseInfraCosts.industry, star.i + 1);
      // star.ucs = cost(res, baseInfraCosts.science, star.s + 1);

      star.tuce = totalCost(res, baseInfraCosts.economy, star.e);
      star.tuci = totalCost(res, baseInfraCosts.industry, star.i);
      star.tucs = totalCost(res, baseInfraCosts.science, star.s);
      star.value = star.tuce + star.tuci + star.tucs;
    }

    star.n = star.n.replace(/[^a-z0-9_ ]/gi, '_');
    star.hyperlinkedName = "<a onClick='Crux.crux.trigger(\"show_star_uid\", \"" + star.uid + "\")'>" + star.n + "</a>";
    universe.hyperlinkedMessageInserts[star.n] = star.hyperlinkedName;

    // Find sector
    var stars = universe.galaxy.stars;
    // var propulsion = 1//player.tech ? player.tech.propulsion.level : 1;
    // var maxPropDist  = (propulsion + 3) * du;

    var homes = _.map(_.filter(universe.galaxy.players, 'home'), function (player, i) {
      var home = player.home;
      // var dist = universe.distance(star.x, star.y, home.x, home.y);

      // var r = route(stars, star, home, maxPropDist);
      // var dist = r ? routeLength(stars, r)[1] : 999999999999999;

      var dist = universe.distance(star.x, star.y, home.x, home.y);
      return {
        p: player,
        h: home,
        d: dist
      };
    });
    var nearest = _.min(homes, 'd');
    if (nearest.d !== 999999999999999) {
      star.home = nearest.h;
      star.homeplayer = nearest.p;
      star.hpuid = nearest.p.uid; // to access when sorting
    }

    star.pathCount = 0;
  };

  universe.current_source_____expandFleetData = function (fleet) {
    var star;
    fleet.kind = "fleet";
    fleet.warpSpeed = fleet.w;
    fleet.player = universe.galaxy.players[fleet.puid];
    fleet.orders = fleet.o;
    fleet.loop = fleet.l;

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
      if (fleet.orbiting) {
        star = universe.galaxy.stars[fleet.ouid];
        star.fleetsInOrbit.push(fleet);
        if (fleet.puid !== star.puid) {
          // the player of the fleet and star are different, must be
          // ally helping defend.
          if (star.alliedDefenders.indexOf(fleet.puid) < 0) {
            star.alliedDefenders.push(fleet.puid);
          }
        }
      }
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

    fleet.owned = false;
    if (universe.galaxy.player_uid === fleet.puid) {
      fleet.owned = true;
    }

    fleet.lastStar = null;
    universe.calcFleetEta(fleet);
  };


  // universe.expandFleetData = function(fleet) {
  //     fleet.kind = "fleet";
  //     fleet.warpSpeed = fleet.w;
  //     fleet.player = universe.galaxy.players[fleet.puid];
  //     fleet.orders = fleet.o;
  //     fleet.loop = fleet.l;

  //     fleet.owned = (universe.galaxy.player_uid === fleet.puid);

  //     if (fleet.player) {
  //         fleet.qualifiedAlias = fleet.player.qualifiedAlias;
  //         fleet.hyperlinkedAlias = fleet.player.hyperlinkedAlias;
  //         fleet.colourBox = fleet.player.colourBox;
  //     } else {
  //         fleet.qualifiedAlias = "";
  //     }
  //     fleet.orbiting = null;
  //     if (fleet.ouid) {
  //         fleet.orbiting = universe.galaxy.stars[fleet.ouid];
  //         universe.galaxy.stars[fleet.ouid].fleetsInOrbit.push(fleet);
  //     }

  //     fleet.path = [];
  //     var order, i, ii;
  //     for (i = 0, ii = fleet.orders.length; i < ii; i += 1) {
  //         order = fleet.orders[i];
  //         if (universe.galaxy.stars[order[1]]) {
  //             fleet.path.push(universe.galaxy.stars[order[1]]);
  //         } else {
  //             fleet.unScannedStarInPath = true;
  //             break;
  //         }
  //     }

  //     fleet.lastStar = null;
  //     universe.calcFleetEta(fleet);

  //     // Find sector
  //     var homes = _.map(_.filter(universe.galaxy.players, 'home'), function(p, i) {
  //         var home = p.home,
  //             dist = universe.distance(fleet.x, fleet.y, home.x, home.y);
  //         return {
  //             p: p,
  //             h: home,
  //             d: dist
  //         };
  //     });
  //     var nearest = _.min(homes, 'd');
  //     fleet.home = nearest.h;
  //     fleet.homeplayer = nearest.p;
  //     fleet.hpuid = nearest.p.uid; // to access when sorting
  //     _.each(fleet.path, function(star) {
  //         star.pathCount++;
  //     });
  // };

  npui.StarInfStatus = function (playerOwned) {
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
        .grid.apply(null, button.pos)
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
        .grid.apply(null, ipos)
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
    while (ticks < universe.galaxy.production_rate) {
      ticks += applyResearch(techs, nextTech, science);
      etas.push(ticks);
    }

    return etas;
  }

  npui.TechNextSelection = function () {
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

    _.each(etas, function (eta, i) {
      var t = universe.timeToTick(eta);
      var bv = Crux.BlockValue("eta", t, "col_base")
        .grid(0, 3 + 3 * i, 30, 3)
        .roost(techNow);
      bv.eta = eta;
      techNow.etaBlocks.push(bv);
    });

    techNow.onTick = function () {
      _.each(techNow.etaBlocks, function (bv) {
        bv.value.rawHTML(universe.timeToTick(bv.eta));
      });
    };

    techNow.on("one_second_tick", techNow.onTick);

    return techNow;
  };

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

  // universe.selectFleet = function (fleet) {
  //   // log('SELECTED FLEET: ', fleet);
  //   universe.selectedPlayer = fleet.player;
  //   universe.selectedFleet = fleet;
  //   universe.selectedSpaceObject = fleet;
  //   universe.selectedStar = null;
  // };
  // universe.selectStar = function (star) {
  //   // log('SELECTED STAR: ', star);
  //   universe.selectedPlayer = star.player;
  //   universe.selectedStar = star;
  //   universe.selectedSpaceObject = star;
  //   universe.selectedFleet = null;
  // };
  // universe.selectPlayer = function (player) {
  //   // log('SELECTED PLAYER: ', data.star);
  //   universe.selectedPlayer = player;
  //   universe.selectedStar = null;
  //   universe.selectedSpaceObject = null;
  //   universe.selectedFleet = null;
  // };
  // universe.selectNone = function (star) {
  //   // log('SELECTED NONE: ');
  //   universe.selectedPlayer = null;
  //   universe.selectedStar = null;
  //   universe.selectedSpaceObject = null;
  //   universe.selectedFleet = null;
  // };
  universe.calcUCE = function (star) {
      var bonus = !star.player ? universe.player.tech.terraforming.value * 5 : 0;
      var res = star.r + bonus;
    return Math.floor((2.5 * NeptunesPride.gameConfig.developmentCostEconomy * (star.e + 1)) / (res / 100));
  };
  universe.calcUCI = function (star) {
      var bonus = !star.player ? universe.player.tech.terraforming.value * 5 : 0;
      var res = star.r + bonus;
    return Math.floor((5 * NeptunesPride.gameConfig.developmentCostIndustry * (star.i + 1)) / (res / 100));
  };
  universe.calcUCS = function (star) {
      var bonus = !star.player ? universe.player.tech.terraforming.value * 5 : 0;
      var res = star.r + bonus;
    return Math.floor((20 * NeptunesPride.gameConfig.developmentCostScience * (star.s + 1)) / (res / 100));
  };
  universe.calcUCG = function (star) {
    var bonus = !star.player ? universe.player.tech.terraforming.value * 5 : 0;
    var res = star.r + bonus;
    if (NeptunesPride.gameConfig.buildGates === 0) {
      return NaN;
    }
    return Math.floor((100 * NeptunesPride.gameConfig.buildGates) / (res / 100));
  };

  universe.buyWarpGate = function (star) {
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
    var stars = _(universe.galaxy.stars).sortBy('r').reverse().value();
    _.each(stars, function (star) {
      if (star.player === universe.player && !star.ga && star.player.cash > star.ucg) {
        // console.log('gating', star.r, star.n);
        buyWarpGate(star);
      }
    });
    np.trigger("refresh_interface");
    np.trigger("map_rebuild");
  }


  uniShipTransfer = function (starStrength, fleetStrength) {
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
    _.each(universe.galaxy.fleets, function (fleet) {
      if (fleet.player === universe.player && fleet.orbiting && fleet.path.length === 0) {
        transferShips(fleet, 1);
      }
    });
    np.trigger("refresh_interface");
    np.trigger("map_rebuild");
  }

  function checkPlayers(address) {
    _.each(universe.playerAchievements, function (a) {
      if (a.address === address) {
        console.log(a, universe.galaxy.players[a.uid].alias);
      }
    });
  }

  function listPlayerAddresses() {
    var list = [];
    _.each(universe.playerAchievements, function (a) {
      list.push(a.address + ', ' + universe.galaxy.players[a.uid].alias);
    });
    return list.join('\n');
  }

  function removePath(fleet) {
    universe.selectedFleet = fleet;
    universe.clearFleetWaypoints();
    // log(  'trying to remove paths from ', fleet,
    //         'with path', fleet.path,
    //         'orbiting', fleet.orbiting);

    if (fleet.orbiting) {
      np.trigger("server_request", {
        type: "batched_order",
        order: "clear_fleet_orders," + fleet.uid
      });
    } else {
      np.trigger("server_request", {
        type: "batched_order",
        order: "add_fleet_orders," + fleet.uid + "," + fleet.orders[0].join(",") + ",0"
      });
    }
  }

  function removeFleetPaths() {
    _.each(universe.galaxy.fleets, function (fleet) {
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



  function formatTick(tickString) {
    var ticks = parseInt(tickString);
    var cycle = Math.floor(ticks / universe.galaxy.production_rate);
    var tick = ticks % universe.galaxy.production_rate;
    return cycle + TAU_SYMBOL + tick;
  }

  npui.InboxRowEvent = NP2M.wrap(npui.InboxRowEvent, function (args, inboxRowEvent) {
    var message = args[0],
      tick = message.payload.tick,
      tickText = inboxRowEvent.children[inboxRowEvent.children.length - 1];
    log(inboxRowEvent.children);
    tickText.rawHTML(formatTick(tick));
    return inboxRowEvent;
  });

  function cumulativeTechCost(level, baseCost) {
    return level * (level - 1) * baseCost / 2;
  }

  var intelJumpGap = 6; // ticks

  var intelDataTypeMap = {
    "ts": "Total Stars",
    "e": "Infra: Total Economy",
    "i": "Infra: Total Industry",
    "s": "Infra: Total Science",
    "inc": "~Infra: Income (Economy + Banking)",
    "shp": "~Infra: Total Ship Production",
    "sce": "~Infra: Science + Exp.",
    "iv": "Infra: Investment",
    "ivs": "Infra: Investment per Star",
    "ivsh": "Infra: Investment per Ship",
    "ivi": "Infra: Investment per Income",

    "fl": "Military: Total Carriers",
    "fls": "Military: Stars per Carrier",
    "flsh": "Military: Ships per Carrier",


    "sh": "Military: Total Ships",
    "pr": "Military: Power (Ships * Weapons)",
    "prd": "Military: Power Delta",
    "shd": "Military: Ships Delta",
    "shl": "Military: Ships Loss",
    "shr": "Military: Ship Reserves",

    "wt": "Tech: Weapons",
    "bt": "Tech: Banking",
    "mt": "Tech: Manufacturing",
    "ht": "Tech: Hyperspace",
    "st": "Tech: Scanning",
    "gt": "Tech: Experimentation",
    "tt": "Tech: Terraforming",
    "ttl": "Tech: Total Levels",
    "ttp": "Tech: Total SP (lower)",
    "ttpu": "Tech: Total SP (upper)",
    "tda": "Tech: Disadvantage"
  };
  var carrierCost = 25;
  var gc = NeptunesPride.gameConfig;

  function calcInvestment (playerSnapshot) {
    var flInvestment = (playerSnapshot.fl - (gc.startingShips ? 1 : 0)) * carrierCost;
    var eInvestment = (playerSnapshot.e - gc.startingInfEconomy) * baseInfraCosts.economy;
    var iInvestment = (playerSnapshot.i - gc.startingInfIndustry) * baseInfraCosts.industry;
    var sInvestment = (playerSnapshot.s - gc.startingInfScience) * baseInfraCosts.science;
    return flInvestment + eInvestment + iInvestment + sInvestment;
  }

  var customIntel = {
    'shd': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];
      var currentStrength = player.sh;

      var previousSnapshot = _.findWhere(data, {
        'tick': snapTick - intelJumpGap
      });

      var previousStrength = previousSnapshot ? previousSnapshot.players[puid].sh : currentStrength;

      return currentStrength - previousStrength;
    },
    'shp': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];
      var shipsPerCycle = player.i * (5 + player.mt);
      var shipsPerTick = shipsPerCycle / universe.galaxy.production_rate;
      return shipsPerTick * intelJumpGap;
    },
    // Ship reserves in turns spent to produce (roughly)
    // In other words, ticks to get current strength at current production
    'shr': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];

      var currentStrength = player.sh;
      var shipsPerCycle = player.i * (5 + player.mt);

      return currentStrength / shipsPerCycle;
    },
    'shl': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];
      // var currentStrength = player.sh;

      // var previousSnapshot = _.findWhere(data, {
      //   'tick': snapTick - intelJumpGap
      // });

      // var previousStrength = previousSnapshot ? previousSnapshot.players[puid].sh : currentStrength;

      // var currentStrength = player.sh;
      return player.shd - player.shp;
    },
    'iv': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];
      return calcInvestment(player);
    },
    'ivs': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];

      var currentStars = player.ts;
      var investment = calcInvestment(player);
      return investment / currentStars;
    },
    'ivsh': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];

      var currentShips = player.sh;
      var investment = calcInvestment(player);

      return investment / currentShips;
    },
    'ivi': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];

      var investment = calcInvestment(player);
      var income = (player.e * 10) + (player.bt * 75);

      return investment / income;
    },
    'fls': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];

      return player.ts / player.fl;
    },
    'flsh': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];

      return player.sh / player.fl;
    },
    'inc': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];

      return (player.e * 10) + (player.bt * 75);
    },
    'sce': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];

      return player.s + (player.gt * 72 / universe.galaxy.production_rate);
    },
    'pr': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];

      var currentShips = player.sh;
      var weaponsTech = player.wt;

      return weaponsTech * currentShips;
    },
    'prd': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];

      var previousSnapshot = _.findWhere(data, {
        'tick': snapTick - intelJumpGap
      });

      var currentPower = player.wt * player.sh;
      if (!previousSnapshot) {
        return 0;
      }
      var prevPlayer = previousSnapshot.players[puid];
      var previousPower = prevPlayer.wt * prevPlayer.sh;

      return currentPower - previousPower;
    },
    'ttl': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];
      var totalTechLevels = player.wt + player.bt + player.mt + player.ht + player.st + player.gt + player.tt;

      return totalTechLevels;
    },
    'ttp': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];
      var tech = universe.player.tech;
      var totalPoints = (
        cumulativeTechCost(player.wt, tech.weapons.brr) +
        cumulativeTechCost(player.bt, tech.banking.brr) +
        cumulativeTechCost(player.mt, tech.manufacturing.brr) +
        cumulativeTechCost(player.ht, tech.propulsion.brr) +
        cumulativeTechCost(player.st, tech.scanning.brr) +
        cumulativeTechCost(player.gt, tech.research.brr) +
        cumulativeTechCost(player.tt, tech.terraforming.brr)
      );
      return totalPoints;
    },
    'tda': function (data, sid, puid) {
      var snapshot = data[sid];
      var snapTick = snapshot.tick;
      var player = snapshot.players[puid];

      var maxes = _.merge.apply(
        null,
        _.union(
          [{}],
          snapshot.players,
          [function safeMax(a, b) {
            return Math.max(a || 0, b || 0)
          }]));

      var techDiffs = [
        maxes.wt - player.wt,
        maxes.bt - player.bt,
        maxes.mt - player.mt,
        maxes.ht - player.ht,
        maxes.st - player.st,
        maxes.gt - player.gt,
        maxes.tt - player.tt
      ];

      return _.sum(techDiffs);
    }
  };

  np.onIntelSelectionChange = NP2M.wrap(np.onIntelSelectionChange, function (args) {
    log('onIntelSelectionChange pre');
    var dk = args[1].replace('-d', '');
    var delta = (universe.intelDataChartType === 'd');
    var dataKey = dk + (delta ? '-d' : '');

    // ..... do we do this?
    args[1] = dataKey;

    var data = universe.intelDataFull;

    log('dataKey', dataKey, 'delta', delta);
    if (!data) return args;

    // if we have a custom function use it, otherwise fallback to default accessor
    var intelFunction;
    if (customIntel[dk]) {
      intelFunction = customIntel[dk];
    } else {
      intelFunction = function (d, i, j) {
        return d[i].players[j][dk];
      };
    }
    var snapshots = _.sortBy(data, 'tick');
    // update the data structure
    var previousSnapshot;
    for (var i = 0; i < snapshots.length; i++) {
      var snapshot = snapshots[i];
      var ov = 0;
      for (j = 0; j < snapshot.players.length; j++) {
        var v = intelFunction(snapshots, i, j);

        if (delta) {
          if (i > 0) {
            var oldv = intelFunction(snapshots, i - 1, j);
            v -= oldv;
          } else {
            v = 0;
          }
        }

        snapshot.players[j][dataKey] = v;
      }
    }
    return args;
  }, function (_, ret) {
    return ret;
  });
  np.onIntelChartTypeChange = function (event, data) {
    log('onIntelChartTypeChange', event, data);
    universe.intelDataChartType = data.replace('-d', '');
    np.trigger("intel_selection_change", universe.intelDataType);
  };

  np.on("intel_selection_change", np.onIntelSelectionChange);
  np.on("intel_chart_type_change", np.onIntelChartTypeChange);

  universe.IntelChartOptions.width = 30 * 16;
  universe.IntelChartOptions.height = 32 * 16;
  universe.IntelChartOptions.chartArea.width = 30 * 16;
  universe.IntelChartOptions.chartArea.height = 32 * 16;
  npui.IntelChart = function () {
      var intelChart = Crux.Widget("rel")
          .size(30 * 16, 32 * 16);

      var chart = new google.visualization.LineChart(intelChart.ui[0]);
      chart.draw(universe.intelData, universe.IntelChartOptions);

      return intelChart;
  };
  var intelDataSelectionDataTypeDropDown;
  npui.IntelDataSelection = function () {

    var intelDataSelection = Crux.Widget("rel col_accent")
      .size(480, 48);

    var chartTypes = {
      'n': 'Normal',
      'd': 'Delta'
    };
    intelDataSelection.dataType = Crux.DropDown(
        (universe.intelDataChartType || '').replace('-d', ''),
        chartTypes,
        "intel_chart_type_change")
      .grid(0, 0, 10, 3)
      .roost(intelDataSelection);


    intelDataSelection.dataType = Crux.DropDown(
        (universe.intelDataType || '').replace('-d', ''),
        intelDataTypeMap,
        "intel_selection_change")
      .grid(10, 0, 20, 3)
      .roost(intelDataSelection);


    // GLOBAL!!!! ? :S :(
    intelDataSelectionDataTypeDropDown = intelDataSelection.dataType;

    return intelDataSelection;
  };

  function changeSelection(down) {
    console.log('changeSelection', intelDataSelectionDataTypeDropDown);
    if (intelDataSelectionDataTypeDropDown) {
      var element = intelDataSelectionDataTypeDropDown.select;
      var current = $('option:selected', element).prop("selected", false);
      var newOption;
      if (down) {
        newOption = current.next();
      } else {
        newOption = current.prev();
      }
      newOption.prop('selected', 'selected');
      element.change();
    }
  }

  // Mousetrap.bind("down", function (e) {
  //   changeSelection(true);
  // });
  // Mousetrap.bind("up", function (e) {
  //   changeSelection(false);
  // });

  npui.Status = NP2M.wrap(npui.Status, function (args, status) {
    // return status;
    status.onOneSecondTick = function () {
      if (npui.sideMenu) {
        if (npui.sideMenu.pinned) {
          status.menuBtn.disable();
        } else {
          status.menuBtn.enable();
        }
      }

      status.tickCount += 1;
      var tc = Number(inbox.unreadDiplomacy) +
        Number(inbox.unreadEvents);
      if (tc > 0 && status.tickCount % 2) {
        status.inboxButton.show();
        status.inboxButton.rawHTML(tc);
      } else {
        status.inboxButton.hide();
        status.inboxButton.rawHTML("");
      }

      if (universe.loading) {
        status.info.update("loading");
        return;
      }
      var player, nextTurnCash, wastedCarriers;
      if (universe.galaxy.paused) {
        if (universe.player) {
          player = universe.player;
          nextTurnCash = player.cash + (player.total_economy * 10) + (player.tech.banking.value * 75);
          wastedCarriers = _.where(NeptunesPride.universe.galaxy.fleets, {
            player: NeptunesPride.universe.player,
            path: []
          });
          status.info.update("inspector_info_player_paused");
          status.info.format({
            wastedCarriers: wastedCarriers.length,
            nextCash: nextTurnCash,
            cash: player.cash
          });
          return;
        } else {
          status.info.update("paused");
          return;
        }

      }

      if (universe.player) {
        player = universe.player;
        nextTurnCash = player.cash + (player.total_economy * 10) + (player.tech.banking.value * 75);
        wastedCarriers = _.where(NeptunesPride.universe.galaxy.fleets, {
          player: NeptunesPride.universe.player,
          // path: []
          eta: 0
        });

        status.info.update("inspector_info_player");
        status.info.format({
          nextProduction: universe.timeToProduction,
          currentProduction: formatTick(universe.galaxy.tick),
          ticksPerCycle: universe.galaxy.production_rate,
          wastedCarriers: wastedCarriers.length,
          nextCash: nextTurnCash,
          cash: player.cash
        });
      } else {
        status.info.update("inspector_info");
        status.info.format({
          nextProduction: universe.timeToProduction
        });

      }

    };
    try {
      status.onOneSecondTick();
    } catch (e) {
      console.error(e);
    }

    status.on("one_second_tick", status.onOneSecondTick);
    status.on("update_status", status.onOneSecondTick);

    return status;
  });

  // Add alt/title text for each badge.
  //??? rat, conquest and honour don't have descriptions
  var badgeNameRegex = /\>(.*?) - \d/;
  npui.BadgeIcon = function (filename, count, small) {
    var ebi = Crux.Widget();
    if (small === undefined) small = false;

    var desc = NeptunesPride.templates['gift_desc_' + filename] || '';
    var name = (desc.match(badgeNameRegex) || [undefined, '~' + filename])[1];
    var filepath = '/images/badges' + (small ? '_small' : '') + '/' + filename + '.png';

    if (small) {
      Crux.Image(filepath, 'abs')
        .alt(name)
        .grid(0.25, 0.25, 2.5, 2.5)
        .roost(ebi);
    } else {
      Crux.Image(filepath, 'abs')
        .alt(name)
        .grid(0, 0, 6, 6)
        .roost(ebi);

      if (count > 1) {
        Crux.Image('/images/badges/counter.png', 'abs')
          .alt(name)
          .grid(0, 0, 6, 6)
          .roost(ebi);

        Crux.Text('', 'txt_center txt_tiny', 'abs')
          .rawHTML(count)
          .pos(51, 64)
          .size(32, 32)
          .roost(ebi);
      }
    }

    return ebi;
  };
  Crux.Image = function (src, style) {
    var image = Crux.Widget();
    var alt;

    image.alt = function (altText) {
      alt = altText;
      altText = altText || 'You are a bad, bad, person!';
      image.ui.attr('alt', altText);
      image.ui.attr('title', altText);
      return image;
    };

    image.ui = jQuery(document.createElement('img'));
    if (style) {
      image.ui.addClass('widget ' + style);
    }
    image.ui.attr('src', src);

    return image;
  };

  var baseIInfo = '![[wastedCarriers]] : $[[cash]] -> $[[nextCash]] &nbsp;&nbsp;&nbsp;&nbsp; ';
  NeptunesPride.templates.inspector_info_player =
    baseIInfo + '[[currentProduction]]/[[ticksPerCycle]] [[nextProduction]]';
  NeptunesPride.templates.inspector_info_player_paused = baseIInfo + 'Paused';
  NeptunesPride.templates.ships_per_hour = 'This star builds [[sph]] ships [[tr]], [[sph2]] ships [[tr2]].';
  NeptunesPride.templates.ai = 'AI';
  NeptunesPride.templates.x_stars = '[[count]]★';

  npui.ShipConstructionRate = function () {
    var scr = Crux.Widget("rel col_base")
      .size(480, 48);
    Crux.Text("ships_per_hour", "txt_center pad12")
      .format({
        sph: universe.selectedStar.shipsPerTick,
        tr: universe.describeTickRate(),
        sph2: universe.selectedStar.shipsPerTick * universe.galaxy.production_rate,
        tr2: universe.describeProductionRate()
      })
      .grid(0, 0, 30, 3)
      .roost(scr);

    return scr;
  };



  universe.updateRuler = function (star) {
    // If the "star" is a fleet and it is orbiting a star, use the orbited star.
    if (star === universe.ruler.stars[universe.ruler.stars.length - 1]) return;

    if (star.kind === "fleet" && star.orbiting) {
      universe.ruler.stars.push(star.orbiting);
    } else {
      universe.ruler.stars.push(star);
    }

    var numStars = universe.ruler.stars.length;
    if (numStars < 2) return;

    var starA = universe.ruler.stars[numStars - 2];
    var starB = universe.ruler.stars[numStars - 1];

    var dist = universe.distance(starA.x, starA.y, starB.x, starB.y);
    var speed = universe.galaxy.fleet_speed;

    // var epsilon = Number.MIN_VALUE;
    var epsilon = 0.0008;
    var baseEta = Math.ceil(-epsilon + (dist / speed));
    var gateEta = Math.ceil(-epsilon + (dist / (3 * speed)));

    universe.ruler.baseEta += baseEta;

    // Check whether the distance should be gated. This is the case if starA and starB are gated
    // or if one of the stars is a fleet travelling at warp to the other star.
    var eta = baseEta;
    var gated = false;
    if (universe.starsGated(starA, starB) || universe.isGatedFlight(starA, starB) || universe.isGatedFlight(starB, starA)) {
      gated = true;
      eta = gateEta;
    }

    universe.ruler.eta += eta;

    // Add up the gatedEta. This will now always represent the time if the stars are gated
    // regardless of whether they actually are. The only caveat is if one of the stars is a
    // fleet and we haven't decided it's a gated case. In that case, we have to add the ungated
    // eta, since you can't build a warp gate on a carrier.
    // if (!gated && (starA.kind === "fleet" || starB.kind === "fleet")) {
    // universe.ruler.gateEta += eta;
    // } else {
    universe.ruler.gateEta += gateEta;
    // }

    universe.ruler.totalDist += dist;

    var ly = (8 * universe.ruler.totalDist);
    universe.ruler.ly = (Math.round(ly * 1000) / 1000).toFixed(3);

    // Hyperspace required will be the max hyperspace required along the entire route.
    universe.ruler.hsRequired = Math.max(universe.ruler.hsRequired, Math.floor(8 * dist) - 2, 1);
  };

  var intelFilterPredicates = {
    all: function (p) {
      return true;
    },
    active: function (p) {
      return !p.conceded;
    },
    ai: function (p) {
      return p.conceded;
    },
    you: function (p) {
      return p === universe.player;
    },
    none: function (p) {
      return false;
    },
  };

  np.onIntelPlayerFilterUpdate = function (event, data) {
    log('onIntelPlayerFilterUpdate', arguments);

    var pred = intelFilterPredicates[data.type];
    var players = _.filter(universe.galaxy.players, pred);

    universe.intelPlayerToChart = _.pluck(players, 'uid');

    np.onIntelSelectionChange(null, universe.intelDataType);
  };

  np.on("intel_player_filter_update", np.onIntelPlayerFilterUpdate);

  npui.IntelFooter = function () {
    var intelFooter = Crux.Widget("rel")
      .size(480, 92);

    _.each(['all', 'you', 'active', 'ai', 'none'], function (key, index) {
      Crux.Button(key, 'intel_player_filter_update', {
          type: key
        })
        .grid(0.5 + 5 * (index % 2), 0.5 + 3 * (index / 2 | 0), 5, 3)
        .roost(intelFooter);
    });

    var bg = Crux.Widget("rel")
      .size(256)
      .pos(196, 2)
      .roost(intelFooter);

    var xPos = -2,
      yPos = 1;
    var index = 0;


    if (universe.playerCount < 8) {
      xPos += (16 - (universe.playerCount * 2)) / 2;
    }

    while (index < universe.playerCount) {
      xPos += 2;
      if (xPos >= 16) {
        xPos = 0;
        yPos += 2;
        if (universe.playerCount - index < 8) {
          xPos += (16 - ((universe.playerCount - index) * 2)) / 2;
        }

      }
      var player = universe.galaxy.players[index];
      var c = Crux.Clickable("intel_player_filter_change", player.uid)
        .grid(xPos, yPos, 2, 2)
        .roost(bg);

      if (universe.intelPlayerToChart.indexOf(player.uid) >= 0) {
        Crux.Widget("col_accent rad4")
          .grid(0, 0, 2, 2)
          .roost(c);
      }

      var icon = Crux.Widget("pci_32_" + player.uid)
        .grid(0, 0, 2, 2)
        .roost(c);

      icon.ui.attr('title', player.alias + ' [[' + player.uid + ']]');

      if (player.conceded === 1) {
        icon.ui.css('filter', 'grayscale(100%) contrast(30%)');
      } else if (player.conceded === 2) {
        icon.ui.css('filter', 'grayscale(100%) blur(3px)');
      }

      index += 1;
    }

    var larger = 0;

    intelFooter.size(480, (yPos * 16) + 48);
    return intelFooter;
  };

  universe.calcFleetEta = function (fleet) {
    var dist, i, node, origin, useWarpSpeed;
    var speed = universe.galaxy.fleet_speed;
    var warpSpeed = universe.galaxy.fleet_speed * 3;

    fleet.eta = 0;
    fleet.geta = 0;
    fleet.etaFirst = 0;
    if (fleet.path.length > 0) {
      fleet.eta += 1;

      origin = fleet;
      useWarpSpeed = false;
      if (fleet.orbiting) {
        origin = fleet.orbiting;
        fleet.eta += fleet.orders[0][0];
      }
      dist = universe.distance(origin.x, origin.y, fleet.path[0].x, fleet.path[0].y);

      if (origin.kind === "star") {
        if (universe.starsGated(origin, fleet.path[0])) {
          useWarpSpeed = true;
        }
      }

      fleet.geta = fleet.eta;
      fleet.geta += Math.floor(dist / warpSpeed);

      if (fleet.warpSpeed || useWarpSpeed) {
        fleet.eta += Math.floor(dist / warpSpeed);
      } else {
        fleet.eta += Math.floor(dist / speed);
      }

      fleet.etaFirst = fleet.eta;
      fleet.orders[0][4] = fleet.eta;

      if (fleet.path.length > 1) {
        for (i = 0; i < fleet.path.length - 1; i += 1) {
          dist = universe.distance(fleet.path[i].x, fleet.path[i].y, fleet.path[i + 1].x, fleet.path[i + 1].y);

          if (universe.starsGated(fleet.path[i], fleet.path[i + 1])) {
            fleet.eta += Math.floor(dist / warpSpeed);
          } else {
            fleet.eta += Math.floor(dist / speed);
          }
          fleet.eta += 1;
          fleet.eta += fleet.orders[i + 1][0]; // delay
          fleet.orders[i + 1][4] = fleet.eta;
          // assume warp
          fleet.geta += Math.floor(dist / warpSpeed);
          fleet.geta += 1;
          fleet.geta += fleet.orders[i + 1][0]; // delay
        }
      }
    }
  };

  npui.FleetOrderConfirm = NP2M.wrap(npui.FleetOrderConfirm, function (args, fleetOrderConfirm) {
    log('npui.FleetOrderConfirm');

    fleetOrderConfirm.size(30 * GS, 6 * GS);
    fleetOrderConfirm.bg.size(30 * GS, 6 * GS);

    fleetOrderConfirm.geta = Crux.Text("", "pad12")
      .grid(0, 3, 30, 3)
      .roost(fleetOrderConfirm.bg);

    fleetOrderConfirm.onOneSecondTick2 = function () {
      if (universe.selectedFleet.path.length === 0) {
        fleetOrderConfirm.geta.hide();
      } else {
        fleetOrderConfirm.geta.show();
      }

      fleetOrderConfirm.geta.updateFormat("total_eta_single", {
        etaFirst: universe.timeToTick(universe.selectedFleet.geta)
      });

    };
    fleetOrderConfirm.onOneSecondTick2();
    fleetOrderConfirm.on("one_second_tick", fleetOrderConfirm.onOneSecondTick2);

    return fleetOrderConfirm;
  });



  var eventSubtypes = {
    'c': 'Combat',
    'o': 'Other'
  };
  var filter = 'o';

  var originalHeader = npui.InboxEventHeader;
  npui.InboxEventHeader = function () {
    var header = originalHeader.apply(this, arguments);
    Crux.DropDown(filter, eventSubtypes, 'change_event_subtype')
      .grid(10, 0, 10, 3)
      .roost(header);
    return header;
  };

  np.on('change_event_subtype', function (e, d) {
    filter = d;
    np.trigger('show_screen', 'inbox');
  });

  var originalInboxRowEvent = npui.InboxRowEvent;
  npui.InboxRowEvent = function (message, _args) {
    var row = originalInboxRowEvent.apply(this, arguments);
    var subtype = message.payload.template.indexOf('combat') === -1 ? 'o' : 'c';

    if (filter != subtype) {
      row.hide();
    }
    return row;
  };

  function routeFleet(fleet, goal, ignoreGates) {
    console.log('routing fleet', fleet, 'to', goal);

    var propulsion = fleet.player ? fleet.player.tech.propulsion.level : 1;
    var maxPropDist = (propulsion + 3) * du;

    var stars = universe.galaxy.stars;
    var start = _.last(fleet.path) || fleet.orbiting;

    var new_path = route(stars, start, goal, maxPropDist, ignoreGates);

    if (!new_path) {
      log('Goal is unreachable!');
      return;
    }
    _.each(new_path, function (uid) {
      universe.selectedFleet = fleet;
      universe.addFleetWaypoint(stars[uid]);
      universe.calcWaypoints();
      //np.trigger('add_waypoint', stars[uid]);
    });
    np.trigger("map_rebuild");
    np.trigger("show_fleet_order_confirm");
  }
  unsafeWindow.routeFleet = routeFleet;

  function routeFleets (predicate) {
    var u = universe;
    var goal = u.selectedStar;
    if (!goal) return;
    var playerFleets = _.filter(u.galaxy.fleets, {player: u.player});
    var fleets = _.filter(playerFleets, predicate);
    console.log('routing fleets', fleets);
    _.each(fleets, function(f) {
      // clear previous
      universe.selectedFleet = f;
      universe.clearFleetWaypoints();
      universe.calcWaypoints();
      // route
      routeFleet(f, goal);
      // save
      // universe.askForLooping = false;
      // np.onSubmitFleetOrders();
    });
    batchedSubmitFleetOrders(fleets);
    np.trigger("map_rebuild");
  }

  function clearFleets (predicate) {
    var u = universe;
    var playerFleets = _.filter(u.galaxy.fleets, {player: u.player});
    var fleets = _.filter(playerFleets, predicate);
    console.log('clearing fleets', fleets);
    _.each(fleets, function(f) {
      f.orders = [];
    });
    batchedSubmitFleetOrders(fleets);
    np.trigger("map_rebuild");
  }
  function clearNoLoopFleets () {
    clearFleets(function(fleet) {
      return !fleet.loop;
    });
  }

  function routeBigFleets (limit) {
    return routeFleets(function(f) {
        return f.st > limit;
    });
  }
  function routeStaticFleets () {
    return routeFleets(function(f){
      return !f.path.length;
    });
  }

  unsafeWindow.routeFleets = routeFleets;
  unsafeWindow.routeBigFleets = routeBigFleets;
  unsafeWindow.routeStaticFleets = routeStaticFleets;
  unsafeWindow.clearFleets = clearFleets;
  unsafeWindow.clearNoLoopFleets = clearNoLoopFleets;


  var batchedSubmitFleetOrders = function (fleets) {
    _.each(fleets, function(fleet) {
      var orderDelays = [];
      var orderTarget = [];
      var orderAction = [];
      var orderAmount = [];

      var loop = 0;
      if (fleet.loop) {
          loop = 1;
      }

      var i = 0, ii = 0;
      for (i = 0, ii = fleet.orders.length; i < ii; i += 1) {
          orderDelays.push(fleet.orders[i][0]);
          orderTarget.push(fleet.orders[i][1]);
          orderAction.push(fleet.orders[i][2]);
          orderAmount.push(fleet.orders[i][3]);
      }
      if (orderDelays.length) {
          np.trigger("server_request", {type: "batched_order",
                  order: "add_fleet_orders," +
                      fleet.uid + "," +
                      orderDelays.join("_") + "," +
                      orderTarget.join("_") + "," +
                      orderAction.join("_") + "," +
                      orderAmount.join("_") + "," +
                      loop
                 });

      } else {
          fleet.loop = false;
          np.trigger("server_request", {type: "batched_order",
                  order: "clear_fleet_orders," + fleet.uid});
      }
    });

    universe.waypoints = [];
    universe.editMode = "normal";
    fleet.oldOrders = null;
    fleet.oldPath = null;
    universe.interfaceSettings.showWaypointChoices = false;
    np.trigger("hide_fleet_order_confirm");

    if (!npui.showingScreen) {
        np.trigger("show_selection_menu");
    }

    np.trigger("map_rebuild");
    np.trigger("play_sound", "ok");
  };

  np.onMapClicked = NP2M.wrap(np.onMapClicked, function pre(args) {
    if (universe.editMode !== "edit_waypoints") {
      return args;
    }

    var evt = args[0];
    var data = args[1];
    var originalEvent = data.originalEvent;
    var ignoreGates;

    if (originalEvent.ctrlKey) {
      ignoreGates = true;
    }

    var ps = universe.seekSelection(data.x, data.y);

    if (!ps.length) {
      return args;
    }

    var clickedWaypoints = _.intersection(ps, universe.waypoints);

    var fleet = universe.selectedFleet;
    if (clickedWaypoints[0] === fleet.orbiting) {
      return args;
    }

    if (!alwaysRoute && clickedWaypoints.length) {
      return args;
    }

    var goal = ps[0];

    routeFleet(fleet, goal, ignoreGates);
    return; // do not call normal click code
  }, function post(args, ret) {
    return ret;
  });

  replace_widget_handlers(np, 'map_clicked', np.onMapClicked);



  var originalExpandPlayerData = universe.expandPlayerData;
  universe.expandPlayerData = function(player) {
    originalExpandPlayerData(player);
    if (!player.alias) return;
    player.alias += ' #' + player.uid;
    player.qualifiedAlias += ' #' + player.uid;

        //         if (player.conceded === 1) {
        //             player.alias += " (QUIT)";
        //         }
        //         if (player.conceded === 2) {
        //             player.alias += " (AFK)";
        //         }
        //         if (player.conceded === 3) {
        //             player.alias += " (KO)";
        //         }
        //         if (player.conceded > 0) {
        //             player.avatar = 0;
        //         }
        // player.color = universe.playerColors[player.colorIndex];

  };


  //★


    var originalLeaderboardPlayer = npui.LeaderboardPlayer;
    npui.LeaderboardPlayer = function (player) {
        var leaderboardPlayer = originalLeaderboardPlayer(player);
        // if (player.missed_turns) {

          Crux.Text("", "txt_right pad12")
              .grid(18,0,6,3)
              .rawHTML(player.missed_turns)
              .roost(leaderboardPlayer);
        // }
        return leaderboardPlayer;
    };

    // fleet selection menu
    npui.SelectionMenu = function () {
        var el, i, row;
        var selectionMenu = Crux.Widget();
        selectionMenu.yOffset = npui.screenTop;

        selectionMenu.size(480, (universe.possibleSelections.length * 3.5 * Crux.gridSize) + 8);

        if (!universe.player) {
            return selectionMenu;
        }

        selectionMenu.rows = [];
        for (i = universe.possibleSelections.length - 1; i >= 0; i--) {
            row = Crux.Widget("col_base selmenu_cell anim_fast")
                .size(480, 48)
                .roost(selectionMenu);

            selectionMenu.rows.push(row);

            if (universe.possibleSelections[i].player) {
                Crux.Widget("bgpc_" + universe.possibleSelections[i].player.colorIndex)
                    .grid(0, 0, 0.5, 3)
                    .roost(row);
            }

            if (universe.possibleSelections[i].kind === "fleet") {
                var fleet = universe.possibleSelections[i];

                var btn = Crux.Clickable("show_fleet_path", fleet)
                    .grid(7.5, 0, 12.5, 3)
                    .roost(row);

                Crux.Text("", "pad12")
                    .grid(0, 0, 12.5, 3)
                    .rawHTML(fleet.n)
                    .roost(btn);

                Crux.Text("", "pad12 txt_center col_accent")
                    .grid(3.75, 0, 3.75, 3)
                    .rawHTML(fleet.st)
                    .roost(row);

                Crux.Text("", "pad12 icon_button icon-rocket")
                    .grid(0.5, 0, 3, 3)
                    .rawHTML("")
                    .roost(row);

                if (fleet.player === universe.player) {
                    var pl = fleet.path.length;
                    if (fleet.loop){
                        pl += " <span class='icon-loop'></span>";
                    }
                    if (fleet.path.length){
                        Crux.Text("", "pad12 txt_right")
                            .rawHTML(pl)
                            .grid(16, 0, 4, 3)
                            .roost(row);
                    }

                    if (fleet.orbiting && fleet.orbiting.player){
                        if (fleet.orbiting.player.uid === universe.player.uid) {
                            Crux.IconButton("icon-down-open", "show_ship_transfer", {fleet: fleet})
                                .grid(19.5, 0, 3, 3)
                                .roost(row);
                        }
                    }

                    Crux.IconButton("icon-plus-circled", "start_edit_waypoints", {fleet: fleet})
                        .grid(22, 0, 3, 3)
                        .roost(row);

                    // THIS IS THE ONLY ADDITION!!!
                    // Crux.IconButton("icon-cancel-circled", "clear_fleet_waypoints")
                    //     .grid(17.5-2.5,0,3,3)
                    //     .roost(row);

                }

                Crux.Button("view")
                    .grid(24.5, 0, 5.5, 3)
                    .click("select_fleet", {fleet: fleet})
                    .roost(row);

            }

            if (universe.possibleSelections[i].kind === "star") {
                var star = universe.possibleSelections[i];
                Crux.Text("", "pad12")
                    .grid(7.5, 0, 12.5, 3)
                    .rawHTML(star.n)
                    .roost(row);

                Crux.Text("", "pad12 txt_center col_accent")
                    .grid(3.75, 0, 3.75, 3)
                    .rawHTML(star.st)
                    .roost(row);

                Crux.Text("", "pad12 icon_button icon-star-1")
                    .grid(0.5, 0, 18, 3)
                    .rawHTML("")
                    .roost(row);

                if (universe.player.cash >= 25 && star.st > 0 && universe.player === star.player) {
                    Crux.IconButton("icon-rocket", "show_screen", ["new_fleet", star])
                        .grid(22, 0, 3, 3)
                        .roost(row);
                }

                if (universe.player === star.player && star.fleetsInOrbit.length > 0) {
                    Crux.IconButton("icon-up-open", "select_gather_all_ships", star)
                        .grid(19.5, 0, 3, 3)
                        .roost(row);
                }

                Crux.Button("view")
                    .grid(24.5, 0, 5.5, 3)
                    .click("select_star", {star: star})
                    .roost(row);
            }
        }

        selectionMenu.animate = function () {
            var ypos = 0;
            var row;
            for (i = selectionMenu.rows.length - 1; i >= 0; i--) {
                row = selectionMenu. rows[i];
                row.pos(0, ypos);
                ypos += 52;
            }
        };
        window.setTimeout(selectionMenu.animate, 1);

        return selectionMenu;
    };
}


NP2M.register('NP2 Layers', '1', pre_init_hook, post_init_hook);
