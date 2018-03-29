mods.push(function utilities(np, npui, universe) {
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

  function uniShipTransfer(starStrength, fleetStrength) {
    universe.selectedFleet.st = fleetStrength;
    universe.selectedFleet.orbiting.st = starStrength;
  }

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
      np.trigger("server_request", {
        type: "batched_order",
        order: "loop_fleet_orders," + fleet.uid + ",0"
      });
    }
  }

  function setGarrison(fleet, garrison, gateScale) {
    gateScale = gateScale || 1;

    console.log('setGarrison', arguments);
    for (var i = 0, l = fleet.orders.length; i < l; i++) {
      var order = fleet.orders[i];
      if (order[2] === 1) {
        order[2] = 7;
      }
      var star = universe.galaxy.stars[order[1]];
      var garrisonValue = star.ga ? garrison * gateScale : garrison;
      if (order[2] === 7 && order[3] % 100 === 0) { // && order[3] < garrisonValue) {
        order[3] = garrisonValue;
      }
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

  function setGarrisonAll(garrison, gateScale) {
    var fleets = _.filter(universe.galaxy.fleets, function (fleet) {
      if (fleet.player === universe.player && fleet.path.length > 0) {
        setGarrison(fleet, garrison, gateScale);
        return true;
      }
      return false;
    });
    //console.log(_.map(fleets, function(f){return f.orders.join('-')}));
    batchedSubmitFleetOrders(fleets);
    np.trigger("refresh_interface");
    np.trigger("map_rebuild");
  }

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


  unsafeWindow._ = _;
  unsafeWindow.uniShipTransfer = uniShipTransfer;
  unsafeWindow.warpGateEverything = warpGateEverything;
  unsafeWindow.emptyStaticFleets = emptyStaticFleets;
  unsafeWindow.checkPlayers = checkPlayers;
  unsafeWindow.listPlayerAddresses = listPlayerAddresses;
  unsafeWindow.removeFleetPaths = removeFleetPaths;
  unsafeWindow.setGarrisonAll = setGarrisonAll;

  unsafeWindow.routeFleets = routeFleets;
  unsafeWindow.routeBigFleets = routeBigFleets;
  unsafeWindow.routeStaticFleets = routeStaticFleets;
  unsafeWindow.clearFleets = clearFleets;
  unsafeWindow.clearNoLoopFleets = clearNoLoopFleets;
});
