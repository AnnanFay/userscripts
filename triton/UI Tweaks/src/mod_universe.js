mods.push(function install_universe_mods(universe) {

  // what does this do?
  // universe.movieMode = true;

  // bug fix, default fleet action
  universe.interfaceSettings.defaultFleetAction = "1";

  universe.describeTickRate = NP2M.wrap(universe.describeTickRate, function (args, ret) {
    return ret.replace('every', '/');
  });

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
    var bonus = 0;
    if (!star.player && universe.player) {
      bonus = universe.player.tech.terraforming.value * 5;
    }
    var res = star.r + bonus;
    return Math.floor((baseInfraCosts.economy * (star.e + 1)) / (res));
  };
  universe.calcUCI = function (star) {
    var bonus = 0;
    if (!star.player && universe.player) {
      bonus = universe.player.tech.terraforming.value * 5;
    }
    var res = star.r + bonus;
    return Math.floor((baseInfraCosts.industry * (star.i + 1)) / (res));
  };
  universe.calcUCS = function (star) {
    var bonus = 0;
    if (!star.player && universe.player) {
      bonus = universe.player.tech.terraforming.value * 5;
    }
    var res = star.r + bonus;
    return Math.floor((baseInfraCosts.science * (star.s + 1)) / (res));
  };
  universe.calcUCG = function (star) {
    var bonus = 0;
    if (!star.player && universe.player) {
      bonus = universe.player.tech.terraforming.value * 5;
    }
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



  var originalExpandPlayerData = universe.expandPlayerData;
  universe.expandPlayerData = function (player) {
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

});


function cost(resources, base, level) {
  return Math.floor(base / resources) * level;
}

function totalCost(resources, base, level) {
  return _.reduce(_.range(1, level + 1), function (a, b) {
    return a + cost(resources, base, b);
  }, 0);
}
