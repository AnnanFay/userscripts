
mods.push(function install_npui_mods(inbox, np, npui, universe) {
  var GS = Crux.gridSize;

  over(npui, 'LeaderboardPlayer', function self(player) {
    var leaderboardPlayer = self.super(player);
    Crux.Text('', 'txt_right pad12')
      .grid(18, 0, 6, 3)
      .rawHTML(player.missed_turns)
      .roost(leaderboardPlayer);
    return leaderboardPlayer;
  });

  np.onNewFleetAndForget = function (event, data) {
    np.onNewFleet(event, data);
    universe.forgetNextFleets = (universe.forgetNextFleets || 0) + 1;
  };

  np.onNewFleetResponse = function (event, newFleet) {
    universe.expandFleetData(newFleet);
    universe.galaxy.fleets[newFleet.uid] = newFleet;
    np.trigger('map_rebuild');
    if (universe.forgetNextFleets) {
      universe.forgetNextFleets--;
    } else {
      np.trigger('refresh_interface');
      np.trigger('start_edit_waypoints', {
        fleet: newFleet
      });
    }
  };

  // given a looping fleet, acquire carriers
  // at every loop point and add to loop
  np.fleetCopyAndFollow = function (fleet) {};

  // addung clear_fleet_waypoints button to fleet selection menu
  np.onClearFleetWaypoints = function (event, data) {
    np.trigger('hide_screen');
    np.trigger('hide_selection_menu');

    universe.selectFleet(data.fleet);
    console.log('fleet selected', data.fleet);
    universe.clearFleetWaypoints();
    console.log('waypoints cleared', data.fleet.orders);
    universe.calcWaypoints();
    console.log('waypoints calculated', data.fleet.orders);
    universe.askForLooping = false;
    np.onSubmitFleetOrders();
    console.log('order submitted');

    np.trigger("play_sound", "subtract");
    np.trigger("map_rebuild");
  };

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

        Crux.Text("", "pad12 txt_ellipsis")
          .grid(0, 0, 10, 3)
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
          if (fleet.loop) {
            pl += " <span class='icon-loop'></span>";
          }
          if (fleet.path.length) {
            Crux.Text("", "pad12 txt_right")
              .rawHTML(pl)
              .grid(13.5, 0, 4, 3)
              .roost(row);
          }

          if (fleet.orbiting && fleet.orbiting.player) {
            if (fleet.orbiting.player.uid === universe.player.uid) {
              Crux.IconButton("icon-down-open", "show_ship_transfer", {
                  fleet: fleet
                })
                .grid(17, 0, 3, 3)
                .roost(row);
            }
          }

          Crux.IconButton("icon-cancel-circled", "clear_fleet_waypoints", {
              fleet: fleet
            })
            .grid(19.5, 0, 3, 3)
            .roost(row);

          Crux.IconButton("icon-plus-circled", "start_edit_waypoints", {
              fleet: fleet
            })
            .grid(22, 0, 3, 3)
            .roost(row);

        }

        Crux.Button("view")
          .grid(24.5, 0, 5.5, 3)
          .click("select_fleet", {
            fleet: fleet
          })
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

        if (universe.player === star.player && star.fleetsInOrbit.length > 0) {
          Crux.IconButton("icon-up-open", "select_gather_all_ships", star)
            .grid(17, 0, 3, 3)
            .roost(row);
        }

        if (universe.player.cash >= 25 && star.st > 0 && universe.player === star.player) {
          Crux.IconButton("icon-rocket", "show_screen", ["new_fleet", star])
            .grid(19.5, 0, 3, 3)
            .roost(row);

          Crux.IconButton("icon-rocket", "new_fleet_and_forget", {
              strength: star.st
            })
            .grid(22, 0, 3, 3)
            .roost(row);
        }

        Crux.Button("view")
          .grid(24.5, 0, 5.5, 3)
          .click("select_star", {
            star: star
          })
          .roost(row);
      }
    }

    selectionMenu.animate = function () {
      var ypos = 0;
      var row;
      for (i = selectionMenu.rows.length - 1; i >= 0; i--) {
        row = selectionMenu.rows[i];
        row.pos(0, ypos);
        ypos += 52;
      }
    };
    window.setTimeout(selectionMenu.animate, 1);

    return selectionMenu;
  };

  over(npui, 'FleetOrderConfirm', function self() {
    var foc = self.super();
    foc.size(30 * GS, 6 * GS);
    foc.bg.size(30 * GS, 6 * GS);

    foc.geta = Crux.Text('', 'pad12')
      .grid(0, 3, 30, 3)
      .roost(foc.bg);

    foc.onOneSecondTick2 = function () {
      if (universe.selectedFleet.path.length === 0) {
        foc.geta.hide();
      } else {
        foc.geta.show();
      }

      foc.geta.updateFormat('total_eta_single', {
        etaFirst: universe.timeToTick(universe.selectedFleet.geta)
      });

    };
    foc.onOneSecondTick2();
    foc.on('one_second_tick', foc.onOneSecondTick2);
    return foc;
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




  npui.InboxRowEvent = NP2M.wrap(npui.InboxRowEvent, function (args, inboxRowEvent) {
    var message = args[0],
      tick = message.payload.tick,
      tickText = inboxRowEvent.children[inboxRowEvent.children.length - 1];
    log(inboxRowEvent.children);
    tickText.rawHTML(formatTick(tick));
    return inboxRowEvent;
  });


  npui.Status = NP2M.wrap(npui.Status, function (args, status) {
    console.log('npui.Status');
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
    console.log('end npui.Status');
    return status;
  });

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

  over(npui, 'StarInspector', function self() {
    var starInspector = self.super();
    var star = universe.selectedStar;

    // we still want to show infrastructure on unclaimed stars
    var unclaimedStar = !star.player;
    if (unclaimedStar) {
      npui.StarInfStatus(false) // false = do not show buttons
        .roost(starInspector);
    }
    // add sector symbol to heading
    var home = universe.player.home;
    var dx = star.x - home.x;
    var dy = star.y - home.y;
    var pos = [Math.floor(dx * 8), Math.floor(-dy * 8)];
    var heading = star.homeplayer.colourBox + ' ' + star.n + ' (' + pos.join(',') + ')';
    starInspector.heading.rawHTML(heading);

    // highlight home stars.
    if (star === star.home) {
      starInspector.heading.ui
        .find('span')
        .css('text-shadow', '0px 0px 1px #000, 0px 0px 5px #FFD700, 0px 0px 5px #FFD700, 0px 0px 5px #FFD700');
      //.css('background', 'radial-gradient(circle, #FFF 5px, #ffd700 10px, rgba(0, 0, 0, 0) 12px)');
    }

    return starInspector;
  });

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

  // This is a single order / action row in the ship screen.
  // This code makes star names in fleet navigation clickable.
  // It also shows action and ETA at same time in the table.
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
    action.grid(14, 0, 12, 3);
    action.ui[0].innerHTML = action.ui[0].innerHTML.replace(/Ships|with/g, '');

    var eta = universe.timeToTick(order[4]);
    Crux.Text("", "pad12")
      .grid(20, 0, 8, 3)
      .rawHTML(eta)
      .roost(fno);

    return fno;
  });
  // This modifies the header to be consistent with the changes above
  npui.FLeetNavOrderHeading = NP2M.wrap(npui.FLeetNavOrderHeading, function (args, fno) {
    // remove toggle link
    fno.removeChild(fno.children[3]);

    // update first column to always be action
    fno.children[2]
      .update("action")
      .grid(14, 0, 14, 3);

    // add the third column
    Crux.Text("eta", "pad12")
      .grid(20, 0, 14, 3)
      .roost(fno);


    return fno;
  });

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

  npui.RulerToolbar = NP2M.wrap(npui.RulerToolbar, function (args) {
    universe.ruler.gate = true;
    return args;
  }, function (args, ret) {
    return ret;
  });
  // if you change fleet orders keep the current value
  // over(npui, 'EditFleetOrder', function self(screenConfig) {
  //   var efo = self.super(screenConfig);
  //   over(efo, 'onSettingsChange', function self() {
  //     self.super();
  //     if (efo.amount.ui.is(":visible")) {
  //       efo.amount.setValue(efo.amount.getValue() || 1);
  //     }
  //   });
  //   efo.onSettingsChange();
  //   replace_widget_handlers(efo, 'efo_setting_change', efo.onSettingsChange);
  //   return efo;
  // });


  replace_widget_handlers(np, 'order:new_fleet', np.onNewFleetResponse);
  np.on('clear_fleet_waypoints', np.onClearFleetWaypoints);
  np.on('fleet_copy_and_follow', np.fleetCopyAndFollow);
  np.on('new_fleet_and_forget', np.onNewFleetAndForget);

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
