//TODO: modualarise the fuck out of this!!!!

function formatTick(tickString) {
  var ticks = parseInt(tickString);
  var cycle = Math.floor(ticks / NeptunesPride.universe.galaxy.production_rate);
  var tick = ticks % NeptunesPride.universe.galaxy.production_rate;
  return cycle + TAU_SYMBOL + tick;
}

function pre_init_hook() {
  console.log('UI TWEAKS: pre_init_hook');
  addGlobalStyle(CSS);
}

// this is code which only triggers when in the management screens.
function handleManagementUI(data) {
  var mg = data.mg;
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
    setTimeout(function () {
      mg.trigger("show_screen", "load_game");
    }, 500);
  };
  replace_widget_handlers(mg, 'pre_delete_game', mg.onPreDelete);
  replace_widget_handlers(mg, 'meta:game_deleted', mg.postGameDeleted);

  // This was an attempt to make it possible to middle
  // click the UI buttons to open in new tabs

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
}

function installMod (mod) {
  var data = this;
  var params = getParamNames(mod);
  var args = params.map(function(x){return data[x];});
  try {
    mod.apply(this, args);
  } catch (e) {
    console.error('Mod Installation FAILED!:', mod.name, e);
  }
  console.log('Mod Installed:', mod.name, params);
}

function post_init_hook(data) {
  console.log('UI TWEAKS: post_init_hook', data);
  if (data.mg) {
    handleManagementUI(data);
    return;
  }

  mods.forEach(installMod, data);

  // very useful for debugging!
  // logCalls(data.np, 'trigger');
  logCalls(data.universe, 'addGalaxy');
  // logAll(data.universe);
  // logAll(data.npui);

  logCalls(data.npui, 'onRefreshInterface');
  // logCalls(map, 'onMapRefresh');
}

NP2M.register('NP2 Layers', '1', pre_init_hook, post_init_hook);
