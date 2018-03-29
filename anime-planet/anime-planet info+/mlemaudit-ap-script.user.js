
// ==UserScript==
// @name        anime-planet info+ extension
// @namespace   anime-planet
// @include     http://www.anime-planet.com/users/*/anime*
// @require     https://github.com/sizzlemctwizzle/GM_config/raw/master/gm_config.js
// @version     1
// ==/UserScript==

/**
 * settings
 */
GM_config.init( 'anime-planet info+ settings', {

    // want to watch ongoing settings
    'S4UFMD': {
        'label': 'display a message label if the anime is not completed',
        'section': ['Want to watch Settings',
                    ''],
        'type': 'checkbox',
        'default': true
    },
    'S4UFML': {
        'label': 'message to be displayed',
        'type': 'text',
        'default': 'ONGOING'
    },
    'S4UFMC': {
        'label': 'message color',
        'type': 'text',
        'default': "#151ab0"
    },
    'S4URFA': {
        'label': 'fade away unreleased anime',
        'type': 'checkbox',
        'default': true
    },
    'S4ECMD': {
        'label': 'display total episode count message',
        'type': 'checkbox',
        'default': true
    },
    'S4ECMC': {
        'label': 'episode count message color',
        'type': 'text',
        'default': "#151ab0"
    }
});

/**
 * settings menu registration
 */
function settings() {
    GM_config.open();
}

GM_registerMenuCommand("Anime-Planet Info+ Settings", settings, "S");
// end of settings----------------------------------------------

// constants
var STATUS_UNMARKED = 0,
        STATUS_WATCHED = 1,
        STATUS_WATCHING = 2,
        STATUS_WANT_TO_WATCH = 4,
        STATUS_STALLED = 5,
        STATUS_DROPPED = 3,
        STATUS_WONT_WATCH = 6,
// options
        bWantToWatchOnGoingDisplay = GM_config.get('S4UFMD'),
    sWantToWatchOnGoingLabel = GM_config.get('S4UFML'),
    sWantToWatchOnGoingColor = GM_config.get('S4UFMC'),
    bWantToWatchFadeAwayUnreleased = GM_config.get('S4URFA'),
    bWantToWatchTotalEpisodeCountDisplay = GM_config.get('S4ECMD'),
    sWantToWatchTotalEpisodeCountColor = GM_config.get('S4ECMC')
;


//
// Utility Functions
//

// Create element
function e (n, contents) {
    var el = document.createElement(n);
    contents && (el.innerHTML = contents);
    return el;
}
// Single nod value at XPath
function x (p, src) {
    var res = document.evaluate(p, src||document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return res.singleNodeValue;
}
function xs (p, src) {
    var items = [],
        res = document.evaluate(p, src||document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for ( var i=0, l=res.snapshotLength; i < l; i++ ) {
        items.push( res.snapshotItem(i) );
    }
    return items;
}
function get_by_class(className, src) {
    // will also return partial matches!
    return x("descendant::*[contains(@class,'"+className+"')]", src);
}
function get_by_name(name, src) {
    return x("descendant::*[@name='"+name+"']", src);
}

//
// Some data structures
//

function anime (status, episodes) {
    return {
        status: status.value,
        episodes: episodes.children.length - 1,
        current_episode: episodes.value,
        airing: !~status.innerHTML.search("Watched"),
        unreleased: !~status.innerHTML.search("Watching")
    };
}
function change (pred, changer, reset) {
    return {
        pred: pred,
        changer: changer,
        reset: reset
    };
}

// create message node
function message (text, color,float) {
    var el = e("span");
    el.className = "apip-message";
    el.style.color = color;
    el.style.padding = 0;
    el.innerHTML = text;
    if  (float != "") {
                el.style.cssFloat = "right";
    }
    return el;
}

//
// Our predicates and format functions
//

var changes = [

    //
    // This adds the ONGOING label
    //
    change(
        function (anime) {
            // released AND want to watch
//            GM_log("released=" + !anime.unreleased);
            return (
                bWantToWatchOnGoingDisplay
                && anime.airing
                && !anime.unreleased
                anime.status == STATUS_WANT_TO_WATCH
            );
        }, function (anime, row) {
            var m = message(sWantToWatchOnGoingLabel, sWantToWatchOnGoingColor, "");
            row.children[0].appendChild(m);
        }, function (row) {
            var cp = get_by_class('apip-message', row);
            if (cp) {
                cp.parentNode.removeChild(cp);
            }
        }),
    //
    // This fades out the anime if it's currently Airing and you've watched everything
    //
    change(
        function (anime) {
            // unreleased
            return (
                bWantToWatchFadeAwayUnreleased
                && anime.unreleased
                && anime.status == STATUS_WANT_TO_WATCH
            );
        }, function (anime, row) {

            // We want to fade everything to 40%, except
            // for the percentage which we want to make 60% to increase readability

            // children of the first cell AND all other cells
            var fade40 = xs('child::td[position()!=1] | child::td[position()=1]/*', row);
            for (var i = 0, l = fade40.length; i<l; i++) {
                fade40[i].style.opacity = '0.4';
            }

       }, function (row) {
            var els = xs('descendant::*', row);
            for (var i = 0, l = els.length; i<l; i++) {
                els[i].style.opacity = '1';
            }
        }),
    //
    // This adds the [n] label for anime.
    //
    change(
        function (anime) {
            return (
                        bWantToWatchTotalEpisodeCountDisplay
                &&  anime.status == STATUS_WANT_TO_WATCH
                &&  anime.episodes > 0
            );
        }, function (anime, row) {

            var m = message("[" + anime.episodes + "]", sWantToWatchTotalEpisodeCountColor, "right");
            row.children[0].appendChild(m);
        }, function (row) {
            var cp = get_by_class('apip-message', row);
            if (cp) {
                cp.parentNode.removeChild(cp);
            }
        })
];

function change_row (row) {
    var status = get_by_name("status", row);
    var episodes = get_by_name("episodes", row);
    var current_anime = anime(status, episodes);

    for (var i=0,l=changes.length; i<l; i++) {
        var change = changes[i];
        if (change.pred(current_anime)) {
            change.changer(current_anime, row);
        }
    }
}

function reset_row (row) {
    for (var i=0,l=changes.length; i<l; i++) {
        var change = changes[i];
        if (change.reset) {
            change.reset(row);
        }
    }
}

function change_handler (e) {
    var row = x('ancestor::tr', e.target);
    reset_row(row);
    change_row(row);
}

var list = get_by_class("entryTable");

if (list != null) {
    var rows = list.lastElementChild.children;
    for (var i = 0, l=rows.length; i < l; i++) {
        change_row(rows[i]);
    }

    // add a change listener to all select inputs so we can update
    // things when changes are made
    var selects = xs("descendant::select", list);
    for (var j=0, lj=selects.length; j<lj; j++) {
        selects[j].addEventListener('change', change_handler, false);
    }
}