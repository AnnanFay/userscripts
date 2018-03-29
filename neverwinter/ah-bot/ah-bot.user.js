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
    var DEBUG = true;
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
          #dT-header-4, #dT-header-5 {
            width: 8% !important;
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
        NumberOfSlots: parseInt($('select[name=\'EnchantmentSlots\']:visible').val(), 10) || 0,
        // do these work?
        MaxPrice: 100,
        Price: 100,
        Cost: 100,
        MaxCost: 100,
        Start: 100,
        Page: 100,
        Length: 100,
        Size: 100
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
        }, {
          // buyout per unit
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
          var header4_5 = '<th class="dT-header auction-browse-bid-each" id="dT-header-4_5"><span>/unit</span></th>';
          var header5_5 = '<th class="dT-header auction-browse-buyout-each" id="dT-header-5_5"><span>/unit</span></th>';
          $('#dT-header-4').after(header4_5);
          $('#dT-header-5').after(header5_5);

          try {
            this.fnSortListener($('#dT-header-0')[0], 0, sortHandler);
            this.fnSortListener($('#dT-header-1')[0], 2, sortHandler);
            this.fnSortListener($('#dT-header-2')[0], 4, sortHandler);
            this.fnSortListener($('#dT-header-3')[0], 6, sortHandler);
            this.fnSortListener($('#dT-header-4')[0], 8, sortHandler);
            this.fnSortListener($('#dT-header-4_5')[0], 10, sortHandler);
            this.fnSortListener($('#dT-header-5')[0], 12, sortHandler);
            this.fnSortListener($('#dT-header-5_5')[0], 14, sortHandler);
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
                  row[11] = cs + Math.ceil(row[10]) + ce;
                  row[13] = cs + spans[6] + ce;
                  row[15] = cs + Math.ceil(row[14]) + ce;

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
          var units = lot.slots[0].count;
          dataRow = [
            '', '',
            units, '',
            lot.ownername, '',
            lot.expiretime, '',
            lot.currentbid, '',
            lot.currentbid / units, '', // current bid per unit
            lot.price, '',
            lot.price / units, '' // buyout per unit
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
      Stencils || (window.Stencils = require('Stencils.js'));
      Synchro || (window.Synchro = require('synchro.js'));
      cutils || (window.cutils = require('cutils.js'));

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


      debug(2, 'wrapped', wrapped);

      client.requestAuctionSearch = requestAuctionSearch;
      client.auctionSearchDataTable = auctionSearchDataTable;



    }


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
