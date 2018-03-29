// ==UserScript==
// @name        Khan Academy Double Video Speed
// @namespace   http://annanfay.com
// @include     https://www.khanacademy.org/*
// @version     1
// ==/UserScript==


(function () {
  'use strict';

  function checkAndSetSpeed() {
    setTimeout(checkAndSetSpeed, 1000);

    var speedLinks = document.querySelectorAll('.playback-speed-link[data-rate="2"]');
    if (speedLinks.length > 0) {
      var l = speedLinks[0];
      l.click();
    }
  }
  checkAndSetSpeed();
})()
