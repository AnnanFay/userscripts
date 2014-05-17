// ==UserScript==
// @name        anime-planet info+
// @namespace   http://annanfay.com
// @include     http://www.anime-planet.com/users/*/anime*
// @version     2
// @grant       none
// ==/UserScript==

var NEARLY_FINISHED_THRESHOLD = 6;

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
  var res = document.evaluate(p, src||document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null);
  return res.singleNodeValue;
}
function get_by_class(className, src) {
    return x("descendant::*[@class='"+className+"']", src);
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
        airing: !~status.innerHTML.search("Watched")
    };
}
function change (pred, changer) {
    return {
        pred: pred,
        changer: changer
    };
}

// create message node
function message (text, color) {
    var el = e("span");
    el.style.color = color;
    el.style.padding = 0;
    el.innerHTML = text;
    return el;
}


//
// Our predicates and format functions
//

var changes = [
    //
    // This adds the percent complete to Stalled or Watching anime
    //
    change(
        function (anime) {
            // all stalled or watching
            return (anime.status == 2 || anime.status == 5);
        }, function (anime, row) {

            var watchedPercent = ((anime.current_episode*100)/(anime.episodes||1));

            var pDiv = e("div");
            pDiv.style.padding = 0;
            pDiv.style.cssFloat = "right";
            pDiv.innerHTML = "" + watchedPercent.toFixed(0) + "%";

            // Sort out the colour
            if (watchedPercent == 0) {
                pDiv.style.color = "#901050";
                pDiv.style.fontWeight = "bold";
            } else {
                var green = Math.round(watchedPercent * 2.55);

                pDiv.style.color = "#15" + (green < 0x10 ? '0' : '') + green.toString(16) + "b0";
            }

            row.children[0].appendChild(pDiv);

        }),
    //
    // This adds the NEW label
    //
    change(
        function (anime) {
            // Airing AND Watching AND not watched everything
            return (
                anime.airing && 
                anime.status == 2 && 
                anime.current_episode < anime.episodes);
        }, function (anime, row) {
            var m = message("NEW ", "#151ab0");
            row.children[0].appendChild(m);
        }),
    //
    // This fades out the anime if it's currently Airing and you've watched everything
    //
    change(
        function (anime) {
            // Airing AND Watching AND watched everything
            return (
                anime.airing && 
                anime.status == 2 && 
                anime.current_episode == anime.episodes);
        }, function (anime, row) {
            row.style.opacity = '0.4';
        }),
    //
    // This adds the [+n] label for anime that have less than 6 episodes remaining.
    //
    change(
        function (anime) {
            // stalled OR watching
            // AND nearly finished
            var episodesLeft = anime.episodes - anime.current_episode;
            return (
                (
                    anime.status == 2 || 
                    anime.status == 5
                ) &&
                episodesLeft <= NEARLY_FINISHED_THRESHOLD && 
                episodesLeft > 0);
        }, function (anime, row) {
            var episodesLeft = anime.episodes - anime.current_episode;
            var m = message("[+" + episodesLeft + "]", "#151ab0");
            row.children[0].appendChild(m);
        }),
    //
    // Labels anime as [UPDATE NEEDED] if you have finished them or haven't started them
    //
    change(
        function (anime) {
            var episodesLeft = anime.episodes - anime.current_episode;
            return (
                (anime.status == 2 || anime.status == 5) && 
                (episodes.value == 0 || episodesLeft == 0)  && 
                !anime.airing);

        }, function (anime, row) {
            var m = message("[UPDATE NEEDED]", "#15b01a");
            row.children[0].appendChild(m);
        })
];

var list = get_by_class("entryTable ");

if (list != null) {
    for (var i = 1, li=list.children[0].children.length; i < li; i++) {
        var tableRow = list.children[0].children[i];
        var status = get_by_name("status", tableRow);
        var episodes = get_by_name("episodes", tableRow);
        var current_anime = anime(status, episodes);

        for (var j=0,lj=changes.length; j<lj; j++) {
            var change = changes[j];
            if (change.pred(current_anime)) {
                change.changer(current_anime, tableRow);
            }
        }
    }
}
