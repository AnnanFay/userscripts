// ==UserScript==
// @name nevry-perf
// @description
// @namespace   https://github.com/AnnanFay
// @include     http*://gateway.playneverwinter.com*
// @version     1
// @require     http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.js
// @grant       none
// ==/UserScript==

/* globals $, unsafeWindow, _, client */
(function module() {
  "strict true";
  var DEBUG = false;
  window.PAUSED = false;

  function debug() {
    if (DEBUG) {
      var l = arguments[0];
      var now = new Date();
      var dateString = now.getMinutes() + ':' + now.getSeconds() + ' || V';
      Array.prototype.splice.call(arguments, 0, 0, dateString)
      console[(!l) ? 'error' : 'log'].apply(console, arguments);
    }
  }

  function flog(i, f, args_) {
    var args = Array.prototype.slice.call(arguments, 2);
    debug(3, i, args);
    return f.apply(this, args);
  }


  function getItemInfo(itemId, callback) {
    // check local storage

    var item = localStorage.getItem('item-' + itemId);
    if (item) {
      return callback(JSON.decode(item));
    }

    client.dataModel.cmgr.requestItemTooltip(
      itemId, //"Object_Skill_History_Tome",
      {},
      function (err, tooltip) {
        var item = {
          tooltip: tooltip.tip,
          //sellPrice: tooltip.tip.match(//)
        };
        var item = localStorage.setItem('item-' + itemId, JSON.encode(item));
        callback(item);
      });
  };


  function init() {
    window.Stencils = require('Stencils.js');
    window.Synchro = require('synchro.js');
    window.cutils = require('cutils.js');



    // var $anim = jQuery.fn.animate;
    // jQuery.fn.animate = function () {
    //   debug(1, '$anim', this, arguments);
    //   return $anim.apply(this, arguments);
    // }

    // var $delay = jQuery.fn.delay;
    // jQuery.fn.delay = function () {
    //   debug(1, '$delay', this, arguments);
    //   return $delay.apply(this, arguments);
    // }




    function addUpdate(a, b, c, d) {
      var s_updates = window.client.dataModel.getUpdateList();

      if (!s_updates[b]) {
        s_updates[b] = {};
      }

      var e = s_updates[b];

      e[c] = {
        item: a,
        paths: a.u.p.split(/[\s,;]/),
        excludes: a.u.x ? a.u.x.split(/[\s,;]/) : undefined,
        curPath: d
      };

      for (var f = e[c].paths.length - 1; f >= 0; f--) {
        var g = e[c].paths[f];
        g[0] == '.' && !d ? g = g.slice(1) : g[0] == '.' && (g = d + g);
        e[c].paths[f] = g
      }
    }


    //ctx, html, item, callback, undefined, stringValue
    window.client.dataModel.applyResult = function applyResult(a, b, c, callback, e, f) {
      var h = this;
      if (typeof f == "object") {
        if (Array.isArray(f) && c.c) {
          var g = 0;

          cutils.forEachSeries(f, function forCaller(item, next) {
            if (typeof item == "undefined") {
              next();
            } else {
              var si = h.makeStackItem(item, c.r + "[" + g + "]");
              h.recurseChildren(a, b, si, c.c, next);
              g++;
            }
          }, callback);

        } else {
          if (!f.obj || !f.stack) {
            f = this.makeStackItem(f, c.r);
          }


          if (c.c) {
            h.recurseChildren(a, b, f, c.c, callback)
          } else {
            a.push(f);
            callback();
          }
        }
      } else {
        typeof f != "undefined" && b.push("" + f)
        callback();
      }
    }

    cutils.forEachSeries = function forEachSeries(array, mod, callback) {
      callback = callback || function noop() {};

      if (!array.length) {
        return callback();
      }
      var d = 0;

      function forEachSeriesNext(error) {
        if (error) {
          callback(error);
          callback = function noop() {};
        } else {
          d++;
          if (d === array.length) {
            return cutils.nextTick(callback)
          }

          return mod(array[d], forEachSeriesNext);;
        }

      }

      mod(array[d], forEachSeriesNext);
    }


    window.client.dataModel.resolveArrayInternal = function resolveArrayInternal(ctx, html, arr, execDone) {
      var startTime = Date.now();
      window.raiArgs = arguments;

      // console.log('resolveArrayInternal');
      var obj;
      var self = this;
      var lastIfResult = false;

      cutils.forEachSeries(arr, function _forEachStencilArrayItem(item, eachItemDone) {
        var res;
        var id;
        var sync;
        var i;

        if (typeof item.s != "undefined") {
          self.applyResult(ctx, html, item, eachItemDone, undefined, item.s);
        } else if (item.t) {
          // BAD BOY!
          res = self.rmgr.find("Message", item.t);
          if (res) {
            self.applyResult(ctx, html, item, eachItemDone, undefined, res.value.str)
          } else {
            self.applyResult(ctx, html, item, eachItemDone, undefined, item.t);
          }
        } else if (item.r) {
          obj = ctx.slice(-1)[0].obj
          self.resolvePathInternal(ctx, item.r, obj, cutils.bind(self, self.applyResult, ctx, html, item, eachItemDone));
        } else if (item.c) {
          if (item.u) {
            id = "update-" + ctx.name + "-" + item.u.n;
            addUpdate(item, ctx.name, id, self.calcStack(ctx));
            html.push('<span id="' + id + '">');
          }
          if (item.i) {
            obj = ctx.slice(-1)[0].obj;
            sync = new Synchro;

            for (i = 0; i < item.i.t.length; i++) {
              (function valueClujure(a) {
                sync.add(function syncResPathInter(b) {
                  self.resolvePathInternal(ctx, a, obj, b)
                })
              })(item.i.t[i]);
            }

            sync.waitForAll(function _evaluatedIfParams(aErrors, r) {
              var ifResult = false;

              try {
                try {
                  ifResult = eval(item.i.e)
                } catch (e) {
                  ifResult = false
                }
              } catch (e) {}

              if (item.i.x) {
                ifResult = ifResult && !lastIfResult;
              }

              if (ifResult) {
                lastIfResult = true;
                self.recurseChildren(ctx, html, undefined, item.c, function fooooooooooo123() {
                  item.u && html.push("</span>"), eachItemDone()
                });
              } else {
                lastIfResult = false;
                item.u && html.push("</span>");
                eachItemDone();
              }
            })
          } else {
            self.recurseChildren(ctx, html, undefined, item.c, function fooooooooooo125() {
              item.u && html.push("</span>"), eachItemDone()
            })
          }
        }
      }, function finalCallback() {
        var endTime = Date.now();
        window.raiDuration = endTime - startTime;
        execDone()
      })
    };









    var client = window.client;
    debug(2, 'init, client:', client);

    var wrapped = [];

    // for (var i in client) {
    //   var f = client[i];
    //   if (f && !f.__bindData__ && typeof f === 'function' && i != 'offsetDateNow') {
    //     // && (i.indexOf('auction') === 0 || i === 'emitToProxy')) {
    //     wrapped.push(i);
    //     client[i] = _.wrap(f, _.partial(flog, i));
    //   }
    // }

    // for (var i in client.dataModel.cmgr) {
    //   var f = client.dataModel.cmgr[i];
    //   if (f && !f.__bindData__ && typeof f === 'function') {
    //     wrapped.push(i);
    //     client.dataModel.cmgr[i] = _.wrap(f, _.partial(flog, 'dataModel.cmgr.' + i));
    //   }
    // }

    // for (var i in client.dataModel.rmgr) {
    //   var f = client.dataModel.rmgr[i];
    //   if (f && !f.__bindData__ && typeof f === 'function') {
    //     wrapped.push(i);
    //     client.dataModel.rmgr[i] = _.wrap(f, _.partial(flog, 'dataModel.rmgr.' + i));
    //   }
    // }

    var avoid = {
      'resolvePathInternal': 0,
      'applyResult': 0,
      'evalIf': 0,
      'lookUpWithFilter': 0,
      'resolveArrayInternal': 0,
      'recurseChildren': 0,
      'makeStackItem': 0
    };

    for (var i in client.dataModel) {
      var f = client.dataModel[i];
      if (f && !f.__bindData__ && typeof f === 'function' && !(i in avoid)) {
        wrapped.push(i);
        client.dataModel[i] = _.wrap(f, _.partial(flog, 'dataModel.' + i));
      }
    }

    debug(2, 'wrapped', wrapped);
  }

  function when(pred, f) { // KISS!
    pred() ? f() : setTimeout(when, 100, pred, f);
  }

  function clientIsLoaded() {
    return !!(window.client && window.client.dataModel);
  }
  when(clientIsLoaded, init);
})();
