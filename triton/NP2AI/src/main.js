function registerOptions(npui, universe, Crux) {
  npui.OptionsScreen = NP2M.wrap(npui.OptionsScreen, function (args, optionsScreen) {
    log('npui.OptionsScreen', optionsScreen);

    OptionsLayers(universe, Crux)
      .roost(optionsScreen);

    return optionsScreen;
  });
}

function notifyAgent(eventType) {
  log('notifyAgent', arguments);
}

function attachUI(npui, universe) {
  console.log('attachUI', npui.sideMenu);

  var originalSideMenu = npui.SideMenu;
  npui.SideMenu = function () {
    var sideMenu = originalSideMenu.apply(this, arguments);
    // add menu entry
    npui.SideMenuItem(
        //icon, label, event, data
        'icon-cog-1',
        'ai',
        'show_screen_ai')
      .roost(sideMenu);
    return sideMenu;
  };

  // trimmed down version of npui.OnShowScreen
  npui.onShowScreenAI = function (event) {
    var screenName = 'ai';
    var scroll = 0;
    if (npui.showingScreen === screenName) {
      scroll = jQuery(window).scrollTop();
    } else {
      jQuery(window).scrollTop(0);
      npui.trigger('play_sound', 'screen_open');
    }

    npui.onHideScreen(null, true);
    npui.onHideSelectionMenu();

    npui.trigger('hide_side_menu');
    npui.trigger('reset_edit_mode');

    npui.showingScreen = screenName;

    if (!universe.player) {
      npui.showingScreen = 'join_game';
    }

    npui.activeScreen = npui.AIScreen();

    if (npui.activeScreen) {
      npui.activeScreen.roost(npui.screenContainer);
      npui.layoutElement(npui.activeScreen);
    }

    jQuery(window).scrollTop(scroll);
  };

  // add menu event
  npui.on('show_screen_ai', npui.onShowScreenAI);

  npui.AIScreen = function () {
        var aiScreen = npui.Screen('ai');

        Crux.IconButton('icon-help', 'show_help', 'options')
            .grid(24.5, 0, 3, 3)
            .roost(aiScreen);

        npui.OptionsMap()
            .roost(aiScreen);

        // npui.OptionsMapText()
        //     .roost(aiScreen);

        // npui.OptionsFleet()
        //     .roost(aiScreen);

        // npui.OptionsGameAdmin()
        //     .roost(aiScreen);

        return aiScreen;
    };

  console.log('attachUI end');

}

function pre_init_hook() {
  log('pre_init_hook');
}

function post_init_hook(npGlobals) {
  log('post_init_hook', npGlobals);
  var universe = npGlobals.universe;
  var npui = npGlobals.npui;
  var np = npGlobals.np;

  attachUI(npui, universe);


  store.section = NeptunesPride.gameNumber;

  var originalOnFullUniverse = np.onFullUniverse;
  np.onFullUniverse = function () {
    var r = originalOnFullUniverse.apply(this, arguments);
    notifyAgent('full-universe', universe);
    return r;
  };
}

NP2M.register(MODULE_NAME, MODULE_VERSION, pre_init_hook, post_init_hook);
