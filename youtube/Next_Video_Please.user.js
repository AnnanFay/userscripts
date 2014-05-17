// ==UserScript==
// @name        Next Video Please
// @description Automatically plays a new related video when the current video ends
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://www.youtube.com/watch*
// @version     2
// @grant       none
// ==/UserScript==

if(window.self !== window.top) {
    throw Exception();
}

// compatabiltity fixes for opera and chrome, not tested
if (!!window.opera) {
    unsafeWindow = window;
} else if (!!window.navigator.vendor.match(/Google/)) {
    var div = document.createElement('div');
    div.setAttribute('onclick','return window;');
    unsafeWindow = div.onclick();
}

function array (something) {
    return Array.prototype.slice.apply(something, [0]);
}

function alias (scope, fun) {
    // TODO: Anyway to get rid of scope parameter?
    return function () {
        return fun.apply(scope, arguments);
    }
}

function get (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                callback(xhr.responseText);
            }
        }
    };
    xhr.onerror = function (e) {
        callback(undefined);
    };
    xhr.send(null);
}
// from http://stackoverflow.com/questions/6274339/
function shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter--) {
        // Pick a random index
        index = (Math.random() * counter) | 0;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

(function (w) {
    var d = w.document;
    var gid = alias(d, d.getElementById);
    var nop = function(){};
    var player = null;
    var _onYouTubePlayerReady = w.onYouTubePlayerReady || nop;
    var _ytPlayerOnYouTubePlayerReady = w.ytPlayerOnYouTubePlayerReady || nop;

    w.onYouTubePlayerReady = w.ytPlayerOnYouTubePlayerReady = function() {
        if (!!w.videoPlayer) {
            for (var i in w.videoPlayer) {
                if (!!w.videoPlayer[i] && !!w.videoPlayer[i].setPlaybackQuality) {
                    player = w.videoPlayer[i];
                    break;
                }
            }
        } else {
            player = gid('movie_player') ||
                gid('movie_player-flash') ||
                gid('movie_player-html5') ||
                gid('movie_player-html5-flash');
        }

        if (!!player) {
            if (typeof XPCNativeWrapper === 'function') {
                player = XPCNativeWrapper.unwrap(player);
            }
            player.addEventListener('onStateChange','onPlayerStateChange');
        }

        _ytPlayerOnYouTubePlayerReady();
        _onYouTubePlayerReady();
    };

    var r = /eow-category"><a href="\/([^"]+)"/;
    function predicate (url, callback) {
        // don't go to lists
        if (url.indexOf('list') != -1) {
            return callback(false);
        }
        // 

        // Get metadata
        get(url, function (data) {
            if (!data) {
                callback(false);
            }
            var match = data.match(r);

            if (match && match[1] === 'music') {
                callback(true);
            } else {
                callback(false);
            }
        });
    }

    function choose (related, callback) {
        console.log('choosing vid', related);
        if (!related) {
            console.err('No good vids found.');
            return;
        }

        var choice = related.pop();
        var url = choice.firstElementChild.href;

        predicate(url, function (res) {
            if (res) {
                callback(choice);
            } else {
                choose(related, callback);
            }
        });
    }


    // Decide what video to play next
    var related = shuffle(array(gid('watch-related').children));

    choose(related, function (choice) {
        // Event handler to forward to new video
        console.log('playing next: ', choice.firstElementChild.textContent)
        w.onPlayerStateChange = function(state) {
            console.log('state change: ', state)
            if (state == 0) {
                console.log('end of video. Attempting to play next video')
                // choice.firstElementChild.click();
                //  new iframes breaks clicking, workaround:
                w.location.href = choice.firstElementChild.href;
            }
        };
    })

}) (unsafeWindow);

//<p id="eow-category"><a href="/music">Music</a></p>