mods.push(function installMapMods(npui) {
  var data = this;
  over(npui, 'onBuildInterface', function self() {
    self.super();
    console.log('installing map mods', map_mods.length);
    data.map = npui.map;
    map_mods.forEach(installMod, data);
  });
  replace_widget_handlers(npui, 'build_interface', npui.onBuildInterface);
});
