// ==UserScript==
// @name        NP2 Selection Info
// @description
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game*
// @version     2
// @require     http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.3.0/lodash.js
// @require     ../NP2_Mod_Framework.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals unsafeWindow, $, _, NP2M */
(function() {
  "strict true";

  var DEBUG = true,
    box_id = 'selection-box-mod';
  var SYMBOLS = {
    cycle: '\u262F'
  };

  function debug() {
    if (DEBUG) {
      console.log.apply(console, arguments);
    }
  }

  function replace_widget_handlers(widget, name, func) {
    var handlers = widget.handlers;
    // remove all previous handlers with that event name
    for (var i = handlers.length - 1; i >= 0; i--) {
      var h = widget.handlers[i];
      if (h.name === name) {
        handlers.splice(i, 1);
        h.node.ui.off(h.name, h.func);
      }
    }
    // add the new one
    widget.on(name, func);
  }

  function pre_init_hook() {
    console.log('Selection Info: pre_init_hook');

    document.oncontextmenu = function(e) {
      if (e.target === $('canvas')[0] || e.target.id === box_id) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
  }

  function post_init_hook(data) {
    console.log('Selection Info: post_init_hook', data);
    var Crux = data.Crux,
      NeptunesPride = data.NeptunesPride,
      universe = data.universe;

    NeptunesPride.Map = NP2M.wrap(NeptunesPride.Map, function(args, map) {

      // special condition for right clicks and right click drags
      map.onMouseDown = NP2M.wrap(map.onMouseDown, function(args) {
        var event = args[0];
        if (event.button === 2) {
          debug('right mouse down', event);

          // we need to repeat this stuff for compatability with original code
          if (map.ignoreMouseEvents || event.target !== map.canvas[0]) {
            return;
          }

          var pos = {
            x: event.pageX,
            y: event.pageY
          };

          debug('right mouse down position: ', pos, map.sx, map.sy);

          map.rightDragging = true;
          if (map.selectionBox) {
            map.selectionBox.mum.removeChild(map.selectionBox);
            delete map.selectionBox;
          }
          map.selectionBox = Crux.Widget()
            .place(pos.x, pos.y, 0, 0)
            .roost(map);
          map.selectionBox.initPos = pos;
          map.selectionBox.ui.attr('id', box_id);
          map.selectionBox.ui.css('border', '2px solid #08AA22');

          // map.selectionBox.on("mousedown", map.onMouseDown);

          map.one("mouseup", map.onMouseUp);

          return undefined; // to stop original code from running
        }

        return args;
      }, function() {});

      function add(a, b) {
        return (a || 0) + (b || 0);
      }
      // filter, pluck, reduce/length is the standard pattern.
      var metrics = {
        strength: function(objects, player) {
          return _(objects).filter('st').pluck('st').reduce(add, 0);
        },
        resources: function(objects, player) {
          return _(objects).filter('r').pluck('r').reduce(add, 0);
        },
        // economy: function(objects, player) {
        //   return _(objects).filter({kind: 'star'}).pluck('e').reduce(add, 0);
        // },
        income: function(objects, player) {
          return 10 * _(objects).filter({kind: 'star'}).pluck('e').reduce(add, 0);
        },
        science: function(objects, player) {
          return _(objects).filter({kind: 'star'}).pluck('s').reduce(add, 0);
        },
        industry: function(objects, player) {
          return _(objects).filter({kind: 'star'}).pluck('i').reduce(add, 0);
        },
        production: function(objects, player) {
          var industry = _(objects).filter({kind: 'star'}).pluck('i').reduce(add, 0);
          return industry * (5 + player.tech.manufacturing.value);
        },
        stars: function(objects, player) {
          return _(objects).filter({kind: 'star'}).value().length;
        },
        fleets: function(objects, player) {
          return _(objects).filter({kind: 'fleets'}).value().length;
        },
        objects: function(objects, player) {
          return _(objects).filter({kind: 'fleets'}).value().length;
        }
      };

      var messageHeader = 'SELECTION CONTAINS: \n\n';
      var messageTemplate = '\{alias}\n';
      messageTemplate += '\t\t{objects} objects\n';
      messageTemplate += '\t\t\t{stars} stars\n';
      messageTemplate += '\t\t\t\t{resources} res.\n';
      messageTemplate += '\t\t\t\t\t${income} income\n';
      messageTemplate += '\t\t\t\t\t{industry} industry\n';
      messageTemplate += '\t\t\t\t\t\t{production} ships / {SYMBOLS.cycle}\n';
      messageTemplate += '\t\t\t\t\t{science} science\n';
      messageTemplate += '\t\t\t{fleets} fleets\n';
      messageTemplate += '\t\t{strength} total strength\n\n\n';

      function displayInfoBox() {

        var players = universe.galaxy.players;
        var message = messageHeader;
        var dim = map.selectionBox.selection;
        var objects = getObjectsIn(dim);

        for (var p in players) {
          var player = players[p];
          var pobjects = _.filter(objects, {puid: player.uid});
          if (!pobjects.length) {
            continue;
          }

          message += messageTemplate;
          message = message.replace('{alias}', player.alias);
          message = message.replace('{SYMBOLS.cycle}', SYMBOLS.cycle);

          for (var m in metrics) {
            var metric = metrics[m];
            var mvalue = metric(pobjects, player);
            message = message.replace('{' + m + '}', mvalue);
          }
          // continue;

          // var strength = _.reduce(pobjects, function(m, v) {
          //   return m + (v.st ? v.st : 0);
          // }, 0);
          // var resources = _.reduce(pobjects, function(m, v) {
          //   return m + (v.r ? v.r : 0);
          // }, 0);

          // var stars = _.filter(pobjects, function(o) {
          //   return o.kind === 'star';
          // });
          // var economy = _.reduce(stars, function(m, s) {
          //   return m + s.e;
          // }, 0);
          // var science = _.reduce(stars, function(m, s) {
          //   return m + s.s;
          // }, 0);
          // var industry = _.reduce(stars, function(m, s) {
          //   return m + s.i;
          // }, 0);
          // var ship_prod = industry * (5 + player.tech.manufacturing.value);

          // var fleets = _.filter(pobjects, function(o) {
          //   return o.kind === 'fleet';
          // });

          // if (pobjects.length > 0) {
          //   message += '\tPLAYER: ' + player.alias + '\n';
          //   message += '\t\t' + pobjects.length + ' objects\n';
          //   message += '\t\t\t' + stars.length + ' stars\n';
          //   message += '\t\t\t\t' + resources + ' res.\n';
          //   message += '\t\t\t\t$' + (economy * 10) + ' income\n';
          //   message += '\t\t\t\t' + science + ' science\n';
          //   message += '\t\t\t\t' + industry + ' industry\n';
          //   message += '\t\t\t\t\t' + ship_prod + ' ships / ' + SYMBOLS.cycle + '\n';
          //   message += '\t\t\t' + fleets.length + ' fleets\n';
          //   message += '\t\t' + strength + ' total strength\n';
          // }
        }
        alert(message);
      }

      map.onMouseUp = NP2M.wrap(map.onMouseUp, function(args) {
        var event = args[0];
        if (event.button === 2 && map.selectionBox && map.selectionBox.selection) {
          try {
            displayInfoBox();
          } catch(e){
            console.log(e);
          }

          map.selectionBox.mum.removeChild(map.selectionBox);
          delete map.selectionBox;

          map.rightDragging = false;
          return undefined;
        }
        return args;
      }, function() {});

      function toMapCoord(dim) {
        return {
          x: (dim.x - map.sx) / map.scale,
          y: (dim.y - map.sy) / map.scale,
          w: dim.w / map.scale,
          h: dim.h / map.scale
        };
      }

      function getObjectsIn(adim) {
        // translate to map coordinates
        var dim = toMapCoord(adim),
          nodes = [].concat(_.values(universe.galaxy.stars), _.values(universe.galaxy.fleets)),
          found = _.filter(nodes, function(v) {
            var x = parseFloat(v.x),
              y = parseFloat(v.y);
            return dim.x <= x &&
              dim.x + dim.w >= x &&
              dim.y <= y &&
              dim.y + dim.h >= y;
          });

        return found;
      }

      map.onMouseMove = NP2M.wrap(map.onMouseMove, function(args, ret) {
        if (map.rightDragging) {
          var event = args[0];
          var pos = {
              x: event.pageX,
              y: event.pageY
            },
            cpos = map.selectionBox.initPos,
            dim = {
              x: _.min([cpos.x, pos.x]),
              y: _.min([cpos.y, pos.y]),
              w: Math.abs(pos.x - cpos.x),
              h: Math.abs(pos.y - cpos.y)
            };

          map.selectionBox.place(dim.x, dim.y, dim.w, dim.h);
          map.selectionBox.selection = dim;
        }
        return ret;
      });

      replace_widget_handlers(map, "mousemove", map.onMouseMove);
      replace_widget_handlers(map, "mousedown", map.onMouseDown);

      return map;
    });
  }

  NP2M.register("Selection Info", "1", pre_init_hook, post_init_hook);
})();
