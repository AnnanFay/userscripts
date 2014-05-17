// ==UserScript==
// @name        nyaa anime-planet
// @namespace   http://annanfay.com
// @include     http://www.nyaa.se/*
// @version     1
// @grant       none
// ==/UserScript==

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, indent:4, maxerr:50 */

(function () {
    "use strict";
    var username = 'AnnanFay'

    function get_ap_data () {
        GM_xmlhttpRequest ( {
            method:     "GET",
            url:        'http://www.anime-planet.com/users/'+username+'/anime?filter=all&per_page=500&page=1',
            onload:     function (response) {
                console.log (response.responseText);
            }
        } );
    }

    function get_anime () {
        var ws_re = "[\\s_]*?"
        var ext_re = "\\.[a-z\\d]{3}";
        var tag_re = "(?:(?:\\[|\\()([^\\]\\)]+)(?:\\]|\\)))";
        var otag_re = tag_re + "?";
        var title_re = "([^\\[\\]\\(\\)]+?)";
        var ep_re = "(?:-"+ws_re+"(\\d+(?:v\\d+)?))?";
        var anime_re = tag_re + ws_re + title_re + ws_re + ep_re + ws_re + otag_re + ws_re + otag_re + ws_re + otag_re + ws_re + ext_re;

        var anime_lre = new RegExp(anime_re);
        var anime_gre = new RegExp(anime_re, 'g');

        var matches = document.body.textContent.match(anime_gre);
        var match;
        for (var m in matches){
            match = matches[m];
            anime_info = match.match(anime_lre);
            if (anime_info) {
                title = anime_info[2];
                console.log(title);
            }
        }
        
    }

    get_ap_data()
})();