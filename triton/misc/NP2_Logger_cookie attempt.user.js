// ==UserScript==
// @name        NP2 Logger
// @description -----------------
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game/*
// @version     1
// @grant       none
// ==/UserScript==


try {

function set_cookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
}

function get_cookie(name) {
    var nameEQ = escape(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length, c.length));
    }
    return undefined;
}

function remove_cookie(name) {
    set_cookie(name, "", -1);
}

function get (k, d) {
    // console.log('getting', k, d);
    // var v = GM_getValue(k);
    // console.log('got', v);
    // if (v === undefined) {
    //     return d;
    // }
    // return JSON.parse(v);

    console.log('getting', k, d);
    var v = get_cookie(k);
    console.log('got', v);
    if (v === undefined) {
        return d;
    }
    return JSON.parse(v);
}

function set (k, v) {
    // var s = JSON.stringify(v);
    // console.log('setting', k, v);
    // GM_setValue(k, s);
    // console.log('sanity checking', GM_getValue(k));
    var s = JSON.stringify(v);
    console.log('setting', k, v);
    set_cookie(k, s, 666);
}


game_id = 4883684637278208;
interval = 20000;//20 * 60 * 1000;
log_name = 'log_' + game_id;

(function (w) {

    var $ = w.$;

    function update_log (log) {
        console.log('updating log');
        $.ajax({
            type: "POST",
            url: "http://triton.ironhelmet.com/grequest/order",
            data: {
                game_number: game_id,
                order:      "full_universe_report",
                type:       "order",
                version:    6
            },
            dataType: "json",
            success: function(data) {
                console.log('success', data);
                log.push(data);
                set(log_name, log);
            }
        });
    }

    function timeToUpdate () {
        var latest = game_log[game_log.length-1];
        console.log('ttu - latest', latest);
        console.log('ttu - l.now', latest.report.now);
        
        var now = new Date().getTime();
        console.log('ttu - now', now);

        var diff = now - latest.report.now;
        console.log('ttu - diff', diff);

        return diff > interval;
    }
    var game_log;
    function check () {
        console.log('checking');

        game_log = get(log_name, []);
        console.log('game_log', game_log);
        console.log('log length', game_log.length);

        if (!game_log.length || timeToUpdate()) {
            update_log(game_log);
        }
    }

    console.log('starting logger');

    setInterval(check, 6000);

}) (unsafeWindow);
} catch (e) {
    console.log(e);
}