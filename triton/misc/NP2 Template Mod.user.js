// ==UserScript==
// @name        NP2 XXXXXXXXXXXXXXX
// @description 
// @namespace   http://userscripts.org/users/XXXXXXXXXXXXXXX
// @include     http*://triton.ironhelmet.com/game*
// @version     1
// @require     http://underscorejs.org/underscore-min.js
// @require     file:///D:/Dropbox/Projects/NP/userscripts/NP2_Mod_Framework.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals $, _, NP2M */
(function () {
    "strict true";

    var DEBUG   = true,
        NAME    = 'XXXXXXXXXXXXXXX';

    function debug () {
        if (DEBUG) {
            console.log.apply(this, arguments);
        }
    }
    
    function pre_init_hook () {
        console.log(NAME + ': pre_init_hook');
    }
    function post_init_hook (data) {
        console.log(NAME + ': post_init_hook', data);
    }

    NP2M.register(NAME, "1", pre_init_hook, post_init_hook);
})();