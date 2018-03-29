// makes all settings game localised
// this is useful for:
//  * game-specific garrisons
//  * low graphics on huge maps / end-game
//  * mod-settings

// TODO:  force deletion of settings for old games.
//        do this by touching settings each time they are asked for
//        then force deleting of setting names not touched recently.
mods.push(function local_settings(universe) {
  var gn = NeptunesPride.gameNumber;

  function fixStorageName() {
    console.log('universe.storageName', universe.storageName);
    if (!~universe.storageName.indexOf(gn)) {
      universe.storageName += ':' + gn;
    }
    return fixStorageName.super.apply(this, arguments);
  }

  over(universe,'getInterfaceSettings', fixStorageName);
  over(universe,'setInterfaceSetting', fixStorageName);

  universe.getInterfaceSettings();
});
