/*******************/
/*     LAYERS      */
/*******************/

// new type layers and old layer configs.

var layerConfigs = [{
  hidden: false,
  name: 'Test Layer A',
  setting: 'show_testing_layer_alpha',
  hotkey: 'M A',
  constructor: testLayerA
}, {
  hidden: true,
  name: 'Scanning',
  setting: 'show_scanning_boundaries',
  hotkey: 'm s',
  constructor: scanningBoundaryLayer
}, {
  hidden: true,
  name: 'Hyper Drive',
  setting: 'show_hyperdrive_boundaries',
  hotkey: 'm h',
  constructor: hyperdriveBoundaryLayer
}, {
  hidden: false,
  name: 'Travel Paths',
  setting: 'show_paths',
  hotkey: 'm p',
  constructor: pathLayer
}, {
  hidden: false,
  name: 'Star Travel Time',
  setting: 'show_star_travel_time',
  hotkey: 'm j',
  constructor: travelTimeLayer
}, {
  hidden: true,
  name: '(!!!) Fleet Size',
  setting: 'show_fleet_size_halos',
  hotkey: 'm a',
  constructor: fleetSizeLayer
}, {
  hidden: true,
  name: '(!!!) Fleet Strength',
  setting: 'show_centre_of_strength',
  hotkey: 'm t',
  constructor: fleetStrengthLayer
}, {
  hidden: true,
  name: '(!!!) Node Net',
  setting: 'show_node_net',
  hotkey: 'm e',
  constructor: nodeNetLayer
}, {
  hidden: false,
  name: 'Voronoi Borders',
  setting: 'voronoiLayer',
  hotkey: 'm v',
  constructor: voronoiLayerBordersOnly
}, {
  hidden: false,
  name: 'Voronoi Full',
  setting: 'voronoiLayerFull',
  hotkey: 'm f',
  constructor: voronoiLayerFull
}, {
  hidden: false,
  name: 'Notes',
  setting: 'show_note_layer',
  hotkey: 'm n',
  constructor: noteLayer
}, {
  hidden: true,
  name: 'Cluster Meta Data',
  setting: 'show_clusterMetaDataLayer',
  hotkey: 'm c',
  constructor: clusterMetaDataLayer
}, {
  hidden: true,
  name: 'Development Layer',
  setting: 'show_devLayer',
  hotkey: 'm d',
  constructor: devLayer
}];
