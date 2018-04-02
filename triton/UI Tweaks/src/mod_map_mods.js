//TODO: remove this shite

mods.push(function installMapMods(npui) {
  var data = this;
  var self;
  over(npui, 'onBuildInterface', function self() {
    console.log('onBuildInterface', this, arguments, self.super);
    self.super.apply(this, arguments);
    console.log('installing map mods', map_mods.length);
    data.map = npui.map;
    map_mods.forEach(installMod, data);
  });
  replace_widget_handlers(npui, 'build_interface', npui.onBuildInterface);
});
