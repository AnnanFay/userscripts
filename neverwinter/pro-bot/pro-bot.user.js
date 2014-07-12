// ==UserScript==
// @name        pro-bot
// @description
// @namespace   https://github.com/AnnanFay
// @include     http*://gateway.playneverwinter.com*
// @version     1
// @require     http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.js
// @grant       none
// ==/UserScript==

/* globals $, unsafeWindow, _, client */
try {
  (function () {
    "strict true";
    var DEBUG = true;
    window.PAUSED = false;

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
       
       */
    });

    function debug() {
      if (DEBUG) {
        var l = arguments[0];
        var now = new Date();
        var dateString = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ' || V';
        Array.prototype.splice.call(arguments, 0, 0, dateString)
        console[(!l) ? 'error' : 'log'].apply(console, arguments);
      }
    }

    function init() {
      addCss(CSS);

      var client = window.client;
      debug(2, 'init, client:', client);

      var wrapped = [];

      for (var i in client) {
        var f = client[i];
        if (f //
          && !f.__bindData__ //
          && typeof f === 'function' //
          && i.indexOf('profession') != -1) {
          wrapped.push(i);
          client[i] = _.wrap(f, _.partial(flog, i));
        }
      }
      debug(2, 'wrapped', wrapped);

    }

    function when(pred, f) {
      // KISS!
      try {
        var v = pred();
      } catch (e) {}
      v ? f() : setTimeout(when, 200, pred, f);
    }

    function proIsLoaded() {
      return !!(window.client && window.client.professionLoadPrefs);
    }

    when(proIsLoaded, init);
  })();
} catch (e) {
  console.log('error:', e)
}
