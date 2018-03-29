// ==UserScript==
// @name        nevry-ui
// @description
// @namespace   https://github.com/AnnanFay
// @include     http*://gateway.playneverwinter.com*
// @version     1
// @require     http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.js
// @grant       none
// ==/UserScript==

/* globals $, nevry, unsafeWindow, _, client */
(function module() {
  "strict true";
  nevry.DEBUG = true;
  var NAME = 'nevry-ui';
  window.PAUSED = false;

  var debug = nevry.log;

  var CSS = function () {
    /*!
      .inventory-container {
          clear: both;
          float: left;
          margin-bottom: 10px;
          width: 100%;
      }
    */
  };

  // // client.sendCommand('GatewayInventory_SortBag', 'Inventory', 0)
  // var pc = require('cryptic/client/proxyConnection');
  // //buildCommand = require('cryptic/commands/buildCommand');

  // var command = {
  //   cmd: 'GatewayInventory_SortBag',
  //   params: {
  //     bagid: 'Inventory',
  //     combine: 0
  //   }
  // };
  // //buildCommand('GatewayInventory_SortBag', 'Inventory', 0)

  // pc.sockProxy.emit('Client_SendCommand', command);


  function init() {
    nevry.addCss(CSS);


    window.Stencils || (window.Stencils = require('Stencils.js'));
    window.Synchro || (window.Synchro = require('synchro.js'));
    window.cutils || (window.cutils = require('cutils.js'));
    window.contentHelpers || (window.contentHelpers = require('cryptic/client/contentHelpers.js'));

    var client = window.client;
    debug('init', NAME, ', client:', client);

    contentHelpers.stencils['content-inventory-bags'] = function (a, b, c, d) {
      var e = [];
      b(a, c, e, [{
        s: '<div class="page-content">\n<div class="page-inventory-bags">\n<div class="page-body">\n<h3 class="page-title">'
      }, {
        t: 'NW.B15s.1a4fbc67'
      }, {
        s: '</h3>\n'
      }, {
        u: {
          n: '0',
          p: 'ent.main.inventory.playerbags' // .playerbags
        },
        c: [{
          s: '<ul class="inventory-group left">'
        }, {
          r: 'ent.main.inventory.playerbags', // .playerbags
          c: [{
            s: '<li class="inventory-container">\n<div class="bag-header">\n<img src="/tex/'
          }, {
            r: '.icon'
          }, {
            s: '.png" alt="">\n<h4>'
          }, {
            r: '.name', // .name
            c: []
          }, {
            s: '</h4>\n<div class="input-field button light">\n<div class="input-bg-left"></div>\n<div class="input-bg-mid"></div>\n<div class="input-bg-right"></div>\n<button onclick="client.sendCommand(\'GatewayInventory_SortBag\', \''
          }, {
            r: '.bagid'
          }, {
            s: '\', 1)">\n'
          }, {
            t: 'NW.S2t.ee9a2e4'
          }, {
            s: '\n</button>\n</div>\n</div>\n<ul>'
          }, {
            r: '.slots',
            c: [{
              i: {
                t: [
                  '.count'
                ],
                e: 'r[0]'
              },
              c: [{
                s: '<li>\n<div class="icon-slot small '
              }, {
                r: '.rarity'
              }, {
                s: ' '
              }, {
                r: '.itemdef.type.$map(UnidentifiedWrapper:disabled)'
              }, {
                s: ' '
              }, {
                r: '.hasclass.$map(0: red)'
              }, {
                s: ' '
              }, {
                r: '.meetslevel.$map(0: disabled)'
              }, {
                s: ' '
              }, {
                r: '.isnew.$map(1:new)'
              }, {
                s: '" data-tt-item="'
              }, {
                r: '.uid'
              }, {
                s: '" data-tt-menu="'
              }, {
                r: '$here()'
              }, {
                s: '">\n<img src="/tex/'
              }, {
                r: '.itemdef.icon'
              }, {
                s: '.png" alt="">\n<span class="icon-overlay"></span>\n'
              }, {
                i: {
                  t: [
                    '.itemdef.type'
                  ],
                  e: 'r[0]===\'UnidentifiedWrapper\''
                },
                c: [{
                  s: '<span class="icon-extra unidentified"></span>'
                }]
              }, {
                s: '\n'
              }, {
                i: {
                  t: [
                    '.meetslevel'
                  ],
                  e: 'r[0]===0'
                },
                c: [{
                  s: '<span class="icon-extra lock"></span>'
                }]
              }, {
                s: '\n'
              }, {
                i: {
                  t: [
                    '.isnew'
                  ],
                  e: 'r[0]===1'
                },
                c: [{
                  s: '<span class="icon-extra new"></span>'
                }]
              }, {
                s: '\n'
              }, {
                i: {
                  t: [
                    '.count'
                  ],
                  e: 'r[0]>1'
                },
                c: [{
                  s: '<span class="quantity">'
                }, {
                  r: '.count',
                  c: []
                }, {
                  s: '</span>'
                }]
              }, {
                s: '\n<span class="icon-hover"></span>\n<span class="enchant-group '
              }, {
                r: '.gemslots.$length().$map(0:hidden, 1:one, 2:two, 3:three)'
              }, {
                s: '">'
              }, {
                r: '.gemslots',
                c: [{
                  s: '<span class="enchant-slot '
                }, {
                  r: '.type[0]'
                }, {
                  s: ' '
                }, {
                  r: '.filled.$map(0:empty, 1:filled)'
                }, {
                  s: '"></span>'
                }]
              }, {
                s: '</span>\n</div>\n</li>'
              }]
            }, {
              i: {
                t: [
                  '.count'
                ],
                e: '!r[0]'
              },
              c: [{
                s: '<li>\n<div class="icon-slot small Junk empty">\n</div>\n</li>'
              }]
            }]
          }, {
            s: '</ul>\n</li>'
          }]
        }, {
          r: 'ent.main.inventory.bags', // .playerbags
          c: [{
            s: '<li class="inventory-container">\n<div class="bag-header">\n<img src="/tex/'
          }, {
            s: 'Inventory_Bag_03_Darkbrown' //r: '.icon'
          }, {
            s: '.png" alt="">\n<h4>'
          }, {
            r: '.bagid', // .name
            c: []
          }, {
            s: '</h4>\n<div class="input-field button light">\n<div class="input-bg-left"></div>\n<div class="input-bg-mid"></div>\n<div class="input-bg-right"></div>\n<button onclick="client.sendCommand(\'GatewayInventory_SortBag\', \''
          }, {
            r: '.bagid'
          }, {
            s: '\', 1)">\n'
          }, {
            t: 'NW.S2t.ee9a2e4'
          }, {
            s: '\n</button>\n</div>\n</div>\n<ul>'
          }, {
            r: '.slots',
            c: [{
              i: {
                t: [
                  '.count'
                ],
                e: 'r[0]'
              },
              c: [{
                s: '<li>\n<div class="icon-slot small '
              }, {
                r: '.rarity'
              }, {
                s: ' '
              }, {
                r: '.itemdef.type.$map(UnidentifiedWrapper:disabled)'
              }, {
                s: ' '
              }, {
                r: '.hasclass.$map(0: red)'
              }, {
                s: ' '
              }, {
                r: '.meetslevel.$map(0: disabled)'
              }, {
                s: ' '
              }, {
                r: '.isnew.$map(1:new)'
              }, {
                s: '" data-tt-item="'
              }, {
                r: '.uid'
              }, {
                s: '" data-tt-menu="'
              }, {
                r: '$here()'
              }, {
                s: '">\n<img src="/tex/'
              }, {
                r: '.itemdef.icon'
              }, {
                s: '.png" alt="">\n<span class="icon-overlay"></span>\n'
              }, {
                i: {
                  t: [
                    '.itemdef.type'
                  ],
                  e: 'r[0]===\'UnidentifiedWrapper\''
                },
                c: [{
                  s: '<span class="icon-extra unidentified"></span>'
                }]
              }, {
                s: '\n'
              }, {
                i: {
                  t: [
                    '.meetslevel'
                  ],
                  e: 'r[0]===0'
                },
                c: [{
                  s: '<span class="icon-extra lock"></span>'
                }]
              }, {
                s: '\n'
              }, {
                i: {
                  t: [
                    '.isnew'
                  ],
                  e: 'r[0]===1'
                },
                c: [{
                  s: '<span class="icon-extra new"></span>'
                }]
              }, {
                s: '\n'
              }, {
                i: {
                  t: [
                    '.count'
                  ],
                  e: 'r[0]>1'
                },
                c: [{
                  s: '<span class="quantity">'
                }, {
                  r: '.count',
                  c: []
                }, {
                  s: '</span>'
                }]
              }, {
                s: '\n<span class="icon-hover"></span>\n<span class="enchant-group '
              }, {
                r: '.gemslots.$length().$map(0:hidden, 1:one, 2:two, 3:three)'
              }, {
                s: '">'
              }, {
                r: '.gemslots',
                c: [{
                  s: '<span class="enchant-slot '
                }, {
                  r: '.type[0]'
                }, {
                  s: ' '
                }, {
                  r: '.filled.$map(0:empty, 1:filled)'
                }, {
                  s: '"></span>'
                }]
              }, {
                s: '</span>\n</div>\n</li>'
              }]
            }, {
              i: {
                t: [
                  '.count'
                ],
                e: '!r[0]'
              },
              c: [{
                s: '<li>\n<div class="icon-slot small Junk empty">\n</div>\n</li>'
              }]
            }]
          }, {
            s: '</ul>\n</li>'
          }]
        }, {
          s: '</ul>'
        }]
      }, {
        s: '\n'
      }, {
        u: {
          n: '1',
          p: 'ent.main.currencies, ent.main.inventory, loginInfo.loginentity.zen'
        },
        c: [{
          s: '<div class="inventory-group right">'
        }, {
          r: 'ent.main',
          c: [{
            s: '<div class="inventory-container numerics">\n<div class="bag-header">\n<img src="./tex/Currency_Icon_Gold.png" alt="">\n<h4>'
          }, {
            t: 'Inventory_Currency_Name'
          }, {
            s: '</h4>\n</div>\n<div class="bag-currency">\n<h5>'
          }, {
            t: 'Inventory_Resource_Name'
          }, {
            s: '</h5>\n<p>\n<img src="./tex/Currency_Icon_Tiny_Gold.png" alt=""><span>'
          }, {
            r: '.currencies.gold.$commify()',
            c: []
          }, {
            s: '</span>\n<img src="./tex/Currency_Icon_Tiny_Silver.png" alt=""><span>'
          }, {
            r: '.currencies.silver.$commify()',
            c: []
          }, {
            s: '</span>\n<img src="./tex/Currency_Icon_Tiny_Copper.png" alt=""><span>'
          }, {
            r: '.currencies.copper.$commify()',
            c: []
          }, {
            s: '</span>\n</p>\n</div>\n<div class="bag-currency">\n<h5>'
          }, {
            t: 'Inventory_MT_Name'
          }, {
            s: '</h5>\n<p><img src="./tex/Currency_Icon_Tiny_Cryptic.png" alt=""><span>'
          }, {
            r: 'loginInfo.loginentity.zen.$commify()',
            c: []
          }, {
            s: '</span></p>\n</div>\n<div class="bag-currency">\n<h5>'
          }, {
            t: 'NW.G3y.c63bea3'
          }, {
            s: '</h5>\n<p><img src="./tex/Currency_Icon_Tiny_Glory.png" alt=""><span>'
          }, {
            r: '.currencies.glory.$commify()',
            c: []
          }, {
            s: '</span></p>\n</div>\n<div class="bag-currency">\n<h5><span data-translate-id="Inventory_PetUpgradeTokens_Name">'
          }, {
            t: 'NW.C22s.2d31d1c6'
          }, {
            s: '</span>:</h5>\n<p><img src="./tex/Currency_Icon_Tiny_Companion_Upgradetoken.png" alt=""><span>'
          }, {
            r: '.currencies.petupgrades.$commify()',
            c: []
          }, {
            s: '</span></p>\n</div>\n<div class="bag-currency">\n<h5>'
          }, {
            t: 'Inventory_AD_Name'
          }, {
            s: '</h5>\n<p><img src="./tex/Currency_Icon_Tiny_Astral_Diamonds.png" alt=""><span>'
          }, {
            r: '.currencies.diamonds.$commify()',
            c: []
          }, {
            s: '</span></p>\n</div>\n'
          }, {
            i: {
              t: [
                '.currencies.foundrytips'
              ],
              e: 'r[0]>=1'
            },
            c: [{
              s: '<div class="bag-currency">\n<h5>'
            }, {
              t: 'NW.F10s.7b8a52df'
            }, {
              s: '</h5>\n<p><img src="./tex/Currency_Icon_Tiny_Astral_Diamonds.png" alt=""><span>'
            }, {
              r: '.currencies.foundrytips.$commify()',
              c: []
            }, {
              s: '</span></p>\n<span class="bag-currency-button">\n<div class="input-field button light" data-tt-stencil="tooltip-inventory-foundrytips" data-tt-path="'
            }, {
              r: '.$here()'
            }, {
              s: '">\n<div class="input-bg-left"></div>\n<div class="input-bg-mid"></div>\n<div class="input-bg-right"></div>\n<button data-url-silent="/inventory/withdrawtips">\n'
            }, {
              t: 'NW.C3m.66a8f123'
            }, {
              s: '\n</button>\n</div>\n</span>\n</div>'
            }]
          }, {
            s: '\n<div class="bag-currency">\n<h5>'
          }, {
            t: 'Inventory_ADRough_Name'
          }, {
            s: '</h5>\n<p><img src="./tex/Currency_Icon_Tiny_Rough_Astral.png" alt=""><span>'
          }, {
            r: '.currencies.roughdiamonds.$commify()',
            c: []
          }, {
            s: '</span></p>\n<span class="bag-currency-button">\n'
          }, {
            i: {
              t: [
                '.currencies.roughdiamonds'
              ],
              e: 'r[0]>=1'
            },
            c: [{
              s: '<div class="input-field button light" data-tt-stencil="tooltip-inventory-convertdiamonds" data-tt-path="'
            }, {
              r: '.$here()'
            }, {
              s: '">\n<div class="input-bg-left"></div>\n<div class="input-bg-mid"></div>\n<div class="input-bg-right"></div>\n<button onclick="client.sendCommand(\'Gateway_ConvertNumeric\', \'Astral_Diamonds\')">\n'
            }, {
              t: 'NW.R4e.3ebb7bec'
            }, {
              s: '\n</button>\n</div>'
            }]
          }, {
            s: '\n'
          }, {
            i: {
              t: [
                '.currencies.roughdiamonds'
              ],
              e: 'r[0]===0'
            },
            c: [{
              s: '<div class="input-field button light disabled" data-tt-stencil="tooltip-inventory-convertdiamonds" data-tt-path="'
            }, {
              r: '.$here()'
            }, {
              s: '">\n<div class="input-bg-left"></div>\n<div class="input-bg-mid"></div>\n<div class="input-bg-right"></div>\n<button disabled="1">\n'
            }, {
              t: 'NW.R4e.3ebb7bec'
            }, {
              s: '\n</button>\n</div>'
            }]
          }, {
            s: '\n</span>\n</div>\n<div class="bag-currency">\n<h5>'
          }, {
            t: 'NW.A9n.642d5f5c'
          }, {
            s: '</h5>\n<p><img src="./tex/Currency_Icon_Tiny_Invocation.png" alt=""><span>'
          }, {
            r: '.currencies.ardent.$commify()',
            c: []
          }, {
            s: '</span></p>\n</div>\n<div class="bag-currency">\n<h5>'
          }, {
            t: 'NW.C12n.19a8848f'
          }, {
            s: '</h5>\n<p><img src="./tex/Currency_Icon_Tiny_Synergy.png" alt=""><span>'
          }, {
            r: '.currencies.celestial.$commify()',
            c: []
          }, {
            s: '</span></p>\n</div>\n<div class="bag-currency">\n<h5>'
          }, {
            t: 'NW.B7e.4b8b30fb'
          }, {
            s: '</h5>\n<p><img src="./tex/Currency_Icon_Tiny_Black_Ice.png" alt=""><span>'
          }, {
            r: '.currencies.blackice.$commify()',
            c: []
          }, {
            s: '</span></p>\n</div>\n<div class="bag-currency">\n<h5>'
          }, {
            t: 'NW.R11e.450b35f3'
          }, {
            s: '</h5>\n<p><img src="./tex/Currency_Icon_Tiny_Black_Ice_Raw.png" alt=""><span>'
          }, {
            r: '.currencies.rawblackice.$commify()',
            c: []
          }, {
            s: '</span></p>\n</div>\n<ul>'
          }, {
            r: '.inventory.bags[bagid=Currency].slots',
            c: [{
              i: {
                t: [
                  '.count'
                ],
                e: 'r[0]'
              },
              c: [{
                s: '<li>\n<div class="icon-slot small '
              }, {
                r: '.rarity'
              }, {
                s: '" data-tt-item="'
              }, {
                r: '.uid'
              }, {
                s: '">\n<img src="/tex/'
              }, {
                r: '.itemdef.icon'
              }, {
                s: '.png" alt="">\n<span class="icon-overlay"></span>\n'
              }, {
                i: {
                  t: [
                    '.count'
                  ],
                  e: 'r[0]>1'
                },
                c: [{
                  s: '<span class="quantity">'
                }, {
                  r: '.count',
                  c: []
                }, {
                  s: '</span>'
                }]
              }, {
                s: '\n<span class="enchant-group '
              }, {
                r: '.gemslots.$length().$map(0:hidden, 1:one, 2:two, 3:three)'
              }, {
                s: '">'
              }, {
                r: '.gemslots',
                c: [{
                  s: '<span class="enchant-slot '
                }, {
                  r: '.type[0]'
                }, {
                  s: ' '
                }, {
                  r: '.filled.$map(0:empty, 1:filled)'
                }, {
                  s: '"></span>'
                }]
              }, {
                s: '</span>\n</div>\n</li>'
              }]
            }, {
              i: {
                t: [
                  '.count'
                ],
                e: '!r[0]'
              },
              c: [{
                s: '<li>\n<div class="icon-slot small Junk empty">\n</div>\n</li>'
              }]
            }]
          }, {
            s: '</ul>\n</div>'
          }]
        }, {
          s: '</div>'
        }]
      }, {
        s: '\n</div>\n</div>\n</div>\n'
      }], function (a) {
        d(a, e)
      })
    }
  }


  function when(pred, f) { // KISS!
    pred() ? f() : setTimeout(when, 100, pred, f);
  }

  function clientIsLoaded() {
    return !!(window.client && window.require);
  }
  when(clientIsLoaded, init);
})();
