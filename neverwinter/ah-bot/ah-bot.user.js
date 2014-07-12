// ==UserScript==
// @name ah-bot
// @description
// @namespace   https://github.com/AnnanFay
// @include     http*://gateway.playneverwinter.com*
// @version     1
// @require     http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.js
// @grant       none
// ==/UserScript==

/* globals $, unsafeWindow, _, client */
try {
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


    function str(f) {
      return f.toString()
        .replace(/^[^\/]+\/\*!?/, '')
        .replace(/\*\/[^\/]+$/, '');
    }

    function addCss(css) {
      $("<style type='text/css'></style>")
        .html(css)
        .appendTo("head");
    }
    var CSS = str(function () {
      /*!
          #gatewayTableAuctionBrowse_wrapper {
            height: 0;
          }
          #gatewayTableAuctionBrowse_paginate, #gatewayTableAuctionBrowse_info {
            display: none;
          }
          .dataTable td {
            height: 0;
          }
          .single-row-button {
            float: none;
          }
          td {
            text-overflow: ellipsis;
          }

          #gatewayTableAuctionBrowse_wrapper {
              height: auto !important;
          }

          .page-auction .dataTables_wrapper {
              height: auto !important;
          }

          .dataTables_wrapper {
              height: auto !important;
          }

          .box-footer {
            position: fixed !important;
            bottom: 0 !important;
            margin: 0 auto;
            width: 840px;
          }
          div.page-content.auctionResults {
          }
    */
    });


    function fixSearchQuery(message) {
      message.MinLevel < 0 && (message.MinLevel = 0);
      message.MaxLevel > 99 && (message.MaxLevel = 99);
      message.MinLevel > message.MaxLevel && (message.MinLevel = 0);
      message.Quality < -1 && (message.Quality = -1);
      message.Quality > 20 && (message.Quality = 20);
      message.Search = message.Search.slice(0, 50);
      message.Class = message.Class.slice(0, 50);
      message.GemType = message.GemType.slice(0, 50);
      message.NumberOfSlots < -1 && (message.NumberOfSlots = -1);
      message.NumberOfSlots > 32 && (message.NumberOfSlots = 32);
      message.Stats = message.Stats.slice(0, 127);
      message.Category = message.Category.slice(0, 127);
    }

    function requestAuctionSearch(category) {
      var message = {
        MinLevel: parseInt($('input[name=\'minlevel\']:visible').val(), 10) || 0,
        MaxLevel: parseInt($('input[name=\'maxlevel\']:visible').val(), 10) || 0,
        Quality: parseInt($('select[name=\'quality\']:visible').val(), 10) || -1,
        Search: $('input[name=\'search\']:visible').val() || '',
        Class: $('select[name=\'class\']:visible').val() || '',
        GemType: $('select[name=\'EnchantmentType\']:visible').val() || '',
        NumberOfSlots: parseInt($('select[name=\'EnchantmentSlots\']:visible').val(), 10) || 0
      }

      message.Stats = ($('select[name=\'stat1\']:visible').val() || '') //
      + '%' + ($('select[name=\'stat2\']:visible').val() || '') //
      + '%' + ($('select[name=\'stat3\']:visible').val() || '');

      message.Category = category || $('.tabValue.selected').last().attr('data-tab-value');

      fixSearchQuery(message);

      debug(1, 'message', message);

      client.dataModel.cmgr.invalidateContainer('AuctionSearch', 'search');
      client.dataModel.cmgr.requestAuctionSearch('search', message, function () {});

      client.analyticTick('User:AuctionSearch');

      return false;
    }

    function sortHandler(a) {
      var b;
      for (b in a.aaSorting) {
        $('.dT-header').removeClass('sorting_desc sorting_asc')
      }
      $('#dT-header-' + a.aaSorting[b][0]).addClass('sorting_' + a.aaSorting[b][1])
    }

    function getDataTable(language, aaData) {
      return {
        bLengthChange: false,
        iDisplayLength: 400, //400
        oLanguage: language,
        aaData: aaData,
        aoColumns: [{
          // item name
          bVisible: false,
          sType: 'string'
        }, {
          bVisible: true,
          sType: 'html'
        }, {
          // quantity
          bVisible: false,
          sType: 'numeric'
        }, {
          bVisible: true,
          sType: 'html'
        }, {
          // selelr name
          bVisible: false,
          sType: 'string'
        }, {
          bVisible: true,
          sType: 'html'
        }, {
          // expiry time
          bVisible: false,
          sType: 'date'
        }, {
          bVisible: true,
          sType: 'html'
        }, {
          // high bid
          bVisible: false,
          sType: 'numeric'
        }, {
          bVisible: true,
          sType: 'html'
        }, {
          // high bid per unit
          bVisible: false,
          sType: 'numeric'
        }, {
          bVisible: true,
          sType: 'html'
        }, {
          // buyout
          bVisible: false,
          sType: 'numeric'
        }, {
          bVisible: true,
          sType: 'html'
        }],
        aaSorting: [
          [0, 'asc']
        ],
        fnInitComplete: function fnInitComplete() {
          // n = this; ??????
          $('#dataTable-hidden-header').show();
          // var i = 0;
          // while (true) {
          //   var header = $('#dT-header-' + i);
          //   if (!header.length) {
          //     break;
          //   }
          //   this.fnSortListener(header[0], i * 2, sortHandler);
          //   i++;
          // }

          try {
            this.fnSortListener($('#dT-header-0')[0], 0, sortHandler);
            this.fnSortListener($('#dT-header-1')[0], 2, sortHandler);
            this.fnSortListener($('#dT-header-2')[0], 4, sortHandler);
            this.fnSortListener($('#dT-header-3')[0], 6, sortHandler);
            this.fnSortListener($('#dT-header-4')[0], 8, sortHandler);
            this.fnSortListener($('#dT-header-5')[0], 12, sortHandler);
          } catch (e) {
            debug(0, 'super important error', e);
          }
        }
      }
    };

    function auctionSearchDataTable() {
      debug(3, 'auctionSearchDataTable');
      // WTF?
      $(document).ready(function docReady() {
        var dataRow, datamodel = client.dataModel;

        if (!datamodel.model.auctionList || !datamodel.model.auctionList.search) {
          return;
        }

        var auctionLots = datamodel.model.auctionList.search.list.auctionlots;
        if (!auctionLots) {
          return;
        }

        var synchro = new Synchro;
        var data = [];

        debug(1, 'auctionLots', {
          auctionLots: auctionLots
        });

        function foooooob(row, item, index) {
          synchro.add(function foooob1(done) {
            datamodel.resolvePath('.slots[0].itemdef.displaynamemsg.str', item, //
              function foooob2(error, itemName) {
                row[0] = itemName;
                return done();
              });
          });

          synchro.add(function foooob3(done) {
            try {
              datamodel.render(
                Stencils['content-auctionhouse-browse-lot-desktop'],
                'content-auctionhouse-browse-lot-desktop',
                '.auctionList.search.list.auctionlots[' + index + ']', //
                function foooob4(error, d) {
                  debug(3, 'datamodel.render callback');
                  if (error) return done();

                  var html = d.join('');
                  var spans = html.slice(0, html.length - 6).replace('\n', '').split(/<span class="single-[^>]+>/);

                  var cs = '<span>'; // class="single-cell">';
                  var ce = ''; //'</span>';


                  row[1] = cs + spans[0] + spans[1] + ce;
                  row[3] = cs + spans[2] + ce;
                  row[5] = cs + spans[3] + ce;
                  row[7] = cs + spans[4] + ce;
                  row[9] = cs + spans[5] + '(' + item.numbids + ')' + ce;
                  row[11] = cs + row[10] + ce;
                  row[13] = cs + spans[6] + ce;

                  return done();
                });
            } catch (e) {
              done();
            }
          });
        }

        for (var i = 0; i < auctionLots.length; i++) {

          if (typeof auctionLots[i] == 'undefined') {
            continue;
          }
          var lot = auctionLots[i];
          dataRow = [
            '', '',
            lot.slots[0].count, '',
            lot.ownername, '',
            lot.expiretime, '',
            lot.currentbid, '',
            Math.round(lot.currentbid / lot.slots[0].count), '', // current bid per unit
            lot.price, ''
          ];

          foooooob(dataRow, auctionLots[i], i);

          data.push(dataRow)
        }

        synchro.waitForAll(function waitForAll() {
          // n = undefined; ????
          debug(1, 'table data', {
            data: data
          });

          $('table#gatewayTableAuctionBrowse').dataTable(
            getDataTable(client.dataTableLanguage, data)
          );

          var realHitCount = client.dataModel.model.auctionList.search.list.realhitcount;
          $('#auctionLotList').prepend(
            '<div id="result-info">' + (auctionLots.length) + ' of ' + realHitCount + '</div>');
          $('.box-footer').appendTo(document.body);

          client.onAfterSetStencil();
          client.startCountdowns();
        })



      })
    }

    function flog(i, f, args_) {
      var args = Array.prototype.slice.call(arguments, 2);
      debug(3, i, args);
      return f.apply(this, args);
    }

    function init() {
      window.Stencils = require('Stencils.js');
      window.Synchro = require('synchro.js');
      window.cutils = require('cutils.js');







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









      addCss(CSS);

      var client = window.client;
      debug(2, 'init, client:', client);

      var categories = _.map($('.tabValue'), function (t) {
        return $(t).attr('data-tab-value');
      });
      debug(2, 'categories:', categories);

      var wrapped = [];

      for (var i in client) {
        var f = client[i];
        if (f && !f.__bindData__ && typeof f === 'function' && i != 'offsetDateNow') {
          // && (i.indexOf('auction') === 0 || i === 'emitToProxy')) {
          wrapped.push(i);
          client[i] = _.wrap(f, _.partial(flog, i));
        }
      }

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
      // setTimeout(function () {
      //   client.scaProcessState = _.wrap(client.scaProcessState, scaProcessStateWrapper);
      // }, 2000);

      client.requestAuctionSearch = requestAuctionSearch;
      client.auctionSearchDataTable = auctionSearchDataTable;
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

    function when(pred, f) { // KISS!
      pred() ? f() : setTimeout(when, 100, pred, f);
    }

    function auctionIsLoaded() {
      return !!(window.client && window.client.auctionInit);
    }
    when(auctionIsLoaded, init);
  })();
} catch (e) {
  console.log('error:', e)
}
