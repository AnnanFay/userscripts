// ==UserScript==
// @name        GCInterface
// @namespace   http://annanfay.com/
// @description
// @include     http://gc.gamestotal.com/*
// @version     1
// @grant       none
// @run-at      document-start
// @require     http://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.8.0/lodash.js
// ==/UserScript==


(function (w) {
  'use strict';
  if (w.location.hash !== '#gcinterface'){
    return;
  }




  _.templateSettings.interpolate = /\{\{([\s\S]+?)\}\}/g; // mustache style template syntax

  var template = {
    page: _.template('<!DOCTYPE html>\n<html><head><title>{{title}}</title></head><body>TEST</body></html>')
  }

  function stopEvent (e) {
    console.log('stopEvent', e.target);
    e.stopPropagation();
    e.preventDefault();
  }

  function blankPage () {
    console.log('blankPage', document.body);
    document.documentElement.innerHTML = '';
  }

  function unsafeWrite (html) {
    location.replace('javascript:document.open();document.write("'+encodeURI(html.replace('\n', '\\n'))+'");document.close();void(0)');
  }

  unsafeWindow.newDoctype = function newDoctype () {
    console.log('newDoctype', document.compatMode);
    var pageTitle = 'GC Interface';

    if (document.compatMode === 'BackCompat'){
      var html = template.page({title: pageTitle});
      console.log(html)
      // document.open();
      console.log('writting')
      unsafeWrite(html);
    }
  };

  w.addEventListener('beforescriptexecute', stopEvent, true);
  w.addEventListener('DOMContentLoaded', blankPage, true);
  w.addEventListener('load', unsafeWindow.newDoctype, false);
})(window)
