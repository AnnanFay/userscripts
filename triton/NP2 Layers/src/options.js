
function OptionsLayers(universe, Crux) {
  var GS = Crux.gridSize;
  var optionsLayers = Crux.Widget('rel')
    .size(30 * GS, 32 * GS);

  // FIXME: This sets raw HTML of elements. We should really be using content IDs
  // and pushing our labels into the translation framwork

  var title = Crux.Text('layers', 'section_title col_black')
    .grid(0, 0, 30, 3)
    .roost(optionsLayers);

  title.rawHTML('Layers');

  // image must be 160x240
  Crux.Image(optionsImageSource, 'abs')
    .grid(0, 3, 10, 15)
    .roost(optionsLayers);

  // conf attributes: setting,hotkey,constructor
  optionsLayers.buttons = {};
  var previous = 0;
  layerConfigs.forEach(function (layerConf, index) {
    if (layerConf.hidden) return;

    var enabled = !!universe.interfaceSettings[layerConf.setting];
    var label = Crux.Text(layerConf.name, 'pad12 col_base')
      .grid(10, 3 + 3 * previous, 24, 3)
      .roost(optionsLayers);

    label.rawHTML(layerConf.name + ' <em>[' + layerConf.hotkey + ']</em>');

    var button = Crux.Button('', 'toggle_layer_setting', {
        settingName: layerConf.setting
      })
      .grid(24, 3 + 3 * previous, 6, 3)
      .roost(optionsLayers);

    button.rawHTML(enabled ? 'Disable' : 'Enable');

    optionsLayers.buttons[layerConf.setting] = button;
    previous++;
  });

  optionsLayers.size(30 * GS, Math.max(3 * previous, 16) * GS);

  optionsLayers.onToggleLayoutSetting = function (event, data) {
    var settingName = data.settingName;
    var enabled = !universe.interfaceSettings[settingName];
    log('optionsLayers.onToggleLayoutSetting', arguments, enabled);

    var button = optionsLayers.buttons[settingName];
    button.rawHTML(enabled ? 'Disable' : 'Enable');
  };

  optionsLayers.on('toggle_layer_setting', optionsLayers.onToggleLayoutSetting);
  return optionsLayers;
};
