mods.push(function install_other () {
  var data = this;
  var Crux = data.Crux;
  var GS = Crux.gridSize;
  var np = data.np;
  var universe = data.universe;
  var npui = data.npui;
  var inbox = data.inbox;
  var Mousetrap = data.Mousetrap;


  // this should allow people to navigate the intel buttons
  // when viewing a game they are not part of
  over(np, 'onShowIntel', function self(event, puid) {
    if (!universe.player) {
      universe.player = universe.galaxy.players[puid];
      self.super(event, puid);
      universe.player = undefined;
      return;
    }
    self.super(event, puid);
  });
  replace_widget_handlers(np, 'show_intel', np.onShowIntel);



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



  // map.on("map_refresh", _.partial(debug, 'REFRESHING map'));
  npui.on("refresh_interface", _.partial(debug, 'REFRESHING interface'));

  // bug fix, default fleet action
  universe.interfaceSettings.defaultFleetAction = "1";

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

  function routeFleets(predicate) {
    var u = universe;
    var goal = u.selectedStar;
    if (!goal) return;
    var playerFleets = _.filter(u.galaxy.fleets, {
      player: u.player
    });
    var fleets = _.filter(playerFleets, predicate);
    console.log('routing fleets', fleets);
    _.each(fleets, function (f) {
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

  function clearFleets(predicate) {
    var u = universe;
    var playerFleets = _.filter(u.galaxy.fleets, {
      player: u.player
    });
    var fleets = _.filter(playerFleets, predicate);
    console.log('clearing fleets', fleets);
    _.each(fleets, function (f) {
      f.orders = [];
    });
    batchedSubmitFleetOrders(fleets);
    np.trigger("map_rebuild");
  }

  function clearNoLoopFleets() {
    clearFleets(function (fleet) {
      return !fleet.loop;
    });
  }

  function routeBigFleets(limit) {
    return routeFleets(function (f) {
      return f.st > limit;
    });
  }

  function routeStaticFleets() {
    return routeFleets(function (f) {
      return !f.path.length;
    });
  }

  unsafeWindow.routeFleets = routeFleets;
  unsafeWindow.routeBigFleets = routeBigFleets;
  unsafeWindow.routeStaticFleets = routeStaticFleets;
  unsafeWindow.clearFleets = clearFleets;
  unsafeWindow.clearNoLoopFleets = clearNoLoopFleets;


  var batchedSubmitFleetOrders = function (fleets) {
    _.each(fleets, function (fleet) {
      var orderDelays = [];
      var orderTarget = [];
      var orderAction = [];
      var orderAmount = [];

      var loop = 0;
      if (fleet.loop) {
        loop = 1;
      }

      var i = 0,
        ii = 0;
      for (i = 0, ii = fleet.orders.length; i < ii; i += 1) {
        orderDelays.push(fleet.orders[i][0]);
        orderTarget.push(fleet.orders[i][1]);
        orderAction.push(fleet.orders[i][2]);
        orderAmount.push(fleet.orders[i][3]);
      }
      if (orderDelays.length) {
        np.trigger("server_request", {
          type: "batched_order",
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
        np.trigger("server_request", {
          type: "batched_order",
          order: "clear_fleet_orders," + fleet.uid
        });
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


  //★


  var originalLeaderboardPlayer = npui.LeaderboardPlayer;
  npui.LeaderboardPlayer = function (player) {
    var leaderboardPlayer = originalLeaderboardPlayer(player);
    // if (player.missed_turns) {

    Crux.Text("", "txt_right pad12")
      .grid(18, 0, 6, 3)
      .rawHTML(player.missed_turns)
      .roost(leaderboardPlayer);
    // }
    return leaderboardPlayer;
  };

  np.onNewFleetAndForget = function onNewFleetAndForget(event, data) {
    np.onNewFleet(event, data);
    universe.forgetNextFleets = (universe.forgetNextFleets || 0) + 1;
  };

  np.on("new_fleet_and_forget", np.onNewFleetAndForget);

  np.onNewFleetResponse = function (event, newFleet) {
    universe.expandFleetData(newFleet);
    universe.galaxy.fleets[newFleet.uid] = newFleet;
    np.trigger("map_rebuild");
    if (universe.forgetNextFleets) {
      universe.forgetNextFleets--;
    } else {
      np.trigger("refresh_interface");
      np.trigger("start_edit_waypoints", {
        fleet: newFleet
      });
    }
  };
  replace_widget_handlers(np, "order:new_fleet", np.onNewFleetResponse);



  // given a looping fleet, acquire carriers
  // at every loop point and add to loop
  np.fleetCopyAndFollow = function (fleet) {};
  np.on("fleet_copy_and_follow", np.fleetCopyAndFollow);

  // addung clear_fleet_waypoints button to fleet selection menu
  np.onClearFleetWaypoints = function (event, data) {
    np.trigger("hide_screen");
    np.trigger("hide_selection_menu");

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
  np.on("clear_fleet_waypoints", np.onClearFleetWaypoints);
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

  np.onShareTech = function (event, data) {
    var targetPlayer = data.targetPlayer;
    var name = data.techName;
    var price = (targetPlayer.tech[name].level + 1) * universe.galaxy.trade_cost;
    if (universe.player.cash >= price) {
      targetPlayer.tech[name].level += 1;
      universe.player.cash -= price;
      setTimeout(function () {
        np.trigger("server_request", {
          // type: "batched_order",
          type: "order",
          order: "share_tech," + targetPlayer.uid + "," + name
        });
      }, 10000);

      universe.selectPlayer(targetPlayer);
      np.trigger("refresh_interface");
    }
  };
  replace_widget_handlers(np, 'share_tech', np.onShareTech);
});
