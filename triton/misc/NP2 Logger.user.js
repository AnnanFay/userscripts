// ==UserScript==
// @name        NP2 Logger
// @description -----------------
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game*
// @version     1
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

/* globals unsafeWindow, GM_getValue, GM_setValue */
(function (w) {
    
    var game_log,
        debug,
        $               = w.$,
        game_id         = window.location.href.match(/\d+/)[0],
        log_name        = 'log_' + game_id,
        log_interval    = 1000 * 60 * 60,
        check_interval  = 1000 * 2,
        DEBUG           = true;

    function debug () {
        if (DEBUG) {
            console.log.apply(this, arguments);
        }
    }
    w.debug = debug;

    function date_format (date) {
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        var h = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();
        return y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d) + ' ' + h + ':' + m + ':' + s;
    }

    function get (k, d) {
        debug('GETTING >> ', k, d);
        var start = new Date();
        var v = GM_getValue(k);

        debug("get timing: ", new Date() - start);

        if (v === undefined) {
            return d;
        }
        return JSON.parse(v);
    }

    function set (k, v) {
        debug('SETTING >>', k, v);

        var s = JSON.stringify(v);
        setTimeout(function() {
            var start = new Date();
            GM_setValue(k, s);
            debug("set timing: ", Date() - start);
        }, 0);
    }

    function update_log () {
        debug('updating log');
        $.ajax({
            type: "POST",
            url: "http://triton.ironhelmet.com/grequest/order",
            data: {
                "game_number": game_id,
                "order":      "full_universe_report",
                "type":       "order",
                "version":    6
            },
            dataType: "json",
            success: function(data) {
                debug('call success', data);
                game_log.push(data);
                set(log_name, game_log);
                debug('game_log:', game_log);
            }
        });
    }
    function timeToUpdate () {
        var latest = game_log[game_log.length-1];
        var now = new Date().getTime();
        var diff = now - latest.report.now;
        return diff > log_interval;
    }
    function check () {

        if (!game_log) {
            game_log    = get(log_name, []);
            var times = [];
            for (var t in game_log) {
                times.push(date_format(new Date(game_log[t].report.now)));
            }
            debug('game_log summary -> length:', game_log.length, ', times: ', times);
            w.game_log  = game_log;
        }

        if (!game_log.length || timeToUpdate()) {
            update_log();
        }
    }

    debug('starting logger');

    window.setInterval(check, check_interval);

    check();

}) (unsafeWindow);