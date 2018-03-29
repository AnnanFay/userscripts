var MODULE_NAME = 'UI Tweaks';

var du  = (1/8); // distance unit, 1/8th of ly
var fleet_speed = du / 3; //0.041666666666666664; // oly

var debug_level = 1;
var overlaySize = 6500;
var overlayMiddle = overlaySize / 2;
var tileSize = 500; // pixels

var TAU_SYMBOL = 'τ';

var DEBUG = true;
var SYMBOLS = {
  cycle: '\u262F'
};

var CSS = '' +
  '.star_directory td {' +
  '    padding: 0px;' +
  '}' +
  '' +
  '.star_directory thead tr {' +
  '    background-color: black;' +
  '}' +
  '' +
  '.star_directory_name {' +
  '    text-align: left;' +
  '    display: block;' +
  '}' +
  '' +
  '.star_directory tbody tr:first-child {' +
  '    background-color: inherit;' +
  '}' +
  '';




var fleet_speed = 0.041666666666666664; // oly
var du  = (1/8); // distance unit, 1/8th of ly
// TODO: make this a user setting.
var alwaysRoute = true;
//fleet_speed     = universe.galaxy.fleet_speed; // 0.041666666666666664 oly
