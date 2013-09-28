// ==UserScript==
// @name        NP2 Roads
// @description -----------------
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game/*
// @version     1
// @run-at document-start
// @grant       none
// ==/UserScript==
try {
    (function (w) {
        console.log('Starting NP2 Roads');

        window.addEventListener('beforescriptexecute', function(e) {
            src = e.target.src;
            console.log('caught script', src, e)
        }



    }) (unsafeWindow);
} catch (e) {
    console.log(e);
}


