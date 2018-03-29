mods.push(function intelImprovements (np, npui, universe, Mousetrap) {



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
        .grid(0.5 + 5 * (index % 2), 0.5 + 3 * ((index / 2) | 0), 5, 3)
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

  var gameConfig = NeptunesPride.gameConfig;
  var baseInfraCosts = {
    economy: 250 * gameConfig.developmentCostEconomy,
    industry: 500 * gameConfig.developmentCostIndustry,
    science: 2000 * gameConfig.developmentCostScience
  };

  function calcInvestment(playerSnapshot) {
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
          snapshot.players, [function safeMax(a, b) {
            return Math.max(a || 0, b || 0);
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
});
