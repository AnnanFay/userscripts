// ==UserScript==
// @name        nevry-logger
// @description Log client.* API commands
// @namespace   https://github.com/AnnanFay
// @include     http*://gateway.playneverwinter.com*
// @version     1
// @require     http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.js
// @grant       none
// ==/UserScript==

/* globals $, unsafeWindow, _, client */
(function module() {
  "strict true";
  var DEBUG = true;

  function _log(level) {
    if (DEBUG) {
      var now = new Date;
      var m = now.getMinutes();
      var s = now.getSeconds();
      m = (m > 9 ? '' : '0') + m;
      s = (s > 9 ? '' : '0') + s;
      var dateString = m + ':' + s + ' || ';
      var l = level;
      level = dateString; // auto-magic
      window.console[l].apply(console, arguments);
    }
  }
  var log = _.partial(_log, 'log');
  var err = _.partial(_log, 'error');


  function walk(o, f) {
    // bredth first
    // objects and arrays
    // all nodes
    // stop opening when f() != undefined
    var open = [{
      obj: o,
      path: []
    }];
    while (open.length) {
      var current = open.shift();

      for (var k in current.obj)
        if (current.obj.hasOwnProperty(k)) {
          var value = current.obj[k];
          var path = current.path.concat(k);

          if (f.call(current.obj, value, path) != undefined) continue;

          if (typeof value == "object" && value !== null || Array.isArray(value)) {
            open.push({
              obj: value,
              path: path
            });
          }
        }
    }
  }

  function walkCarefully(o, f) {
    // don't follow recursive links
    var mem = [];
    walk(o, function (value, path) {
      if (mem.indexOf(value) != -1) {
        return false;
      }
      mem.push(value);
      return f.call(this, value, path);
    });
  }

  function attachLogger(node, path) {
    if (!node || node.__bindData__ || typeof node !== 'function') {
      return;
    }

    var key = path[path.length - 1];

    // log(key, typeof node, node);

    if (!node.name) {
      node.__name = (Array(path.length - 1).join('  ')) + key;
    }
    this[key] = _.wrap(node, logger);
  }

  function logger(f, args__) {
    var name = f.name || f.__name || 'anon';
    log.apply(null, [this === window, name, arguments]);

    var args = Array.prototype.slice.call(arguments, 1);
    return f.apply(this, args);
  }

  function init() {
    var client = window.client;
    log('client: ', client);

    walkCarefully(client, attachLogger);

    // reattach every so often for new modules
    // TODO: Do this reactively.
    setInterval(walkCarefully, 20000, client, attachLogger);
  }

  function when(pred, f) { // KISS!
    pred() ? f() : setTimeout(when, 100, pred, f);
  }

  function clientIsLoaded() {
    log('is client loaded?')
    return !!window.client;
  }

  when(clientIsLoaded, init);
})();
