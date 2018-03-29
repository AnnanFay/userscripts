// ==UserScript==
// @name        NP2 AI
// @description
// @namespace   http://annanfay.com
// @include     http*://triton.ironhelmet.com/game*
// @include     http*://np.ironhelmet.com/game*
// @version     1
// @require     http://underscorejs.org/underscore-min.js
// @require     ../NP2_Mod_Framework.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals $, _, NP2M */
(function() {
  "strict true";

  var NAME    = 'AI';
  var VERSION = '1';
  var DEBUG   = true;

  function log() {
    if (DEBUG) {
      console.log.apply(console, arguments);
    }
  }

  function pre_init_hook() {
    log(NAME + ': pre_init_hook');
  }

  function post_init_hook(data) {
    log(NAME + ': post_init_hook', data);
  }

  NP2M.register(NAME, VERSION, pre_init_hook, post_init_hook);
})();
