// ==UserScript==
// @name        anime-planet info+
// @namespace   http://annanfay.com
// @include     http://www.anime-planet.com/users/*/anime*
// @include     http://www.anime-planet.com/users/*/manga*
// @version     7
// @grant       none
// ==/UserScript==

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, indent:4, maxerr:50 */

(function () {
  "use strict";

  var NEARLY_FINISHED_THRESHOLD = 6;
  var NAME_CUTOFF = 24;

  //
  // Utility Functions
  //

  // Create element
  function e(n, contents) {
    var ns = n.split('.');
    if (ns.length > 1) {
      n = ns[0];
      var cn = ns[1];
    }
    var el = document.createElement(n);
    if (contents) {
      el.innerHTML = contents;
    }
    if (cn) {
      el.className = cn;
    }
    return el;
  }
  // Single nod value at XPath
  function x(p, src) {
    var res = document.evaluate(p, src || document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return res.singleNodeValue;
  }

  function xs(p, src) {
    var items = [],
      res = document.evaluate(p, src || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, l = res.snapshotLength; i < l; i++) {
      items.push(res.snapshotItem(i));
    }
    return items;
  }

  function get_by_class(className, src) {
    // will also return partial matches!
    return x("descendant::*[contains(@class,'" + className + "')]", src);
  }

  function get_by_name(name, src) {
    return x("descendant::*[@name='" + name + "']", src);
  }

  function get_by_tag(name, src) {
    return (src || document).getElementsByTagName(name);
  }

  //
  // CSS Styling
  //

  var CSS = '\
/*.myListBar > form > * {\
  float: left;\
}*/\
div.starrating {\
  float: none;\
  position: absolute;\
  right: 0;\
}\
\
';

  function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) {
      return;
    }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
  }
  //
  // Some data structures
  //

  function anime(name, status, episodes) {
    return {
      title: name,
      status: parseInt(status.value),
      episodes: episodes.children.length - 1,
      current_episode: parseInt(episodes.value),
      airing: status.innerHTML.search("Watched") === -1
    };
  }

  function change(desc, pred, changer, reset) {
    return {
      desc: desc,
      pred: pred,
      changer: changer,
      reset: reset
    };
  }

  // create message node
  function message(text, color) {
    var el = e("span");
    el.className = "apip-message";
    el.style.color = color;
    el.style.padding = 0;
    el.innerHTML = text;
    return el;
  }


  function shortenContent(el, limit) {
    el.dataset.origContent = el.innerHTML;
    el.innerHTML = el.innerHTML.substr(0, limit - 0) + '\u2026';
  }

  function lengthenContent(el) {
    if (el.dataset.origContent) {
      el.innerHTML = el.dataset.origContent;
    }
  }

  function sortTable(table, col) {
    // Rob W
    var store = [];
    for (var i = 0, len = table.rows.length; i < len; i++) {
      var row = table.rows[i];
      var sortnr = parseFloat(row.cells[col].textContent || row.cells[col].innerText);
      if (!isNaN(sortnr)) {
        store.push([sortnr, row]);
      }
    }
    store.sort(function (x, y) {
      return x[0] - y[0];
    });
    for (var i = 0, len = store.length; i < len; i++) {
      table.appendChild(store[i][1]);
    }
    store = null;
  }


  //
  // Our predicates and format functions
  //
  var HACK_HeaderExists;
  var changes = [
    change(
      "This adds the percent complete to Stalled or Watching anime",
      function (anime) {
        // all stalled or watching
        return (anime.status === 2 || anime.status === 5);
      }, function (anime, row) {

        var watchedPercent = ((anime.current_episode * 100) / (anime.episodes || 1));

        var pDiv = e("div");
        pDiv.className = "colored-percent";
        pDiv.style.padding = 0;
        pDiv.style.cssFloat = "right";
        pDiv.innerHTML = "" + watchedPercent.toFixed(0) + "%";

        // Sort out the colour
        if (watchedPercent === 0) {
          pDiv.style.color = "#901050";
          pDiv.style.fontWeight = "bold";
        } else {
          var green = Math.round(watchedPercent * 2.55);

          pDiv.style.color = "#15" + (green < 0x10 ? '0' : '') + green.toString(16) + "b0";
        }

        row.children[0].appendChild(pDiv);

      }, function (row) {
        var cp = get_by_class('colored-percent', row);
        if (cp) {
          cp.parentNode.removeChild(cp);
        }
      }), change(
      "This adds the NEW label",
      function (anime) {
        // Airing AND Watching AND not watched everything
        return (
          anime.airing &&
          anime.status === 2 &&
          anime.current_episode < anime.episodes);
      }, function (anime, row) {
        var m = message("NEW ", "#151ab0");
        row.children[0].appendChild(m);
      }, function (row) {
        var cp = get_by_class('apip-message', row);
        if (cp) {
          cp.parentNode.removeChild(cp);
        }
      }), change(
      "This fades out the anime if it's currently Airing and you've watched everything",
      function (anime) {
        // Airing AND Watching AND watched everything
        return (
          anime.airing &&
          anime.status === 2 &&
          anime.current_episode === anime.episodes);
      }, function (anime, row) {

        // We want to fade everything to 30%, except
        // for the percentage which we want to make 60% to increase readability

        // children of the first cell AND all other cells
        var fade40 = xs('child::td[position()!=1] | child::td[position()=1]/*', row);
        for (var i = 0, l = fade40.length; i < l; i++) {
          fade40[i].style.opacity = '0.3';
        }

        var fade60 = get_by_class('colored-percent', row);
        if (fade60) {
          fade60.style.opacity = '0.6';
        }
      }, function (row) {
        var els = xs('descendant::*', row);
        for (var i = 0, l = els.length; i < l; i++) {
          els[i].style.opacity = '1';
        }
      }), change(
      "This adds the [+n] label for anime that have less than 6 episodes remaining.",
      function (anime) {
        // stalled OR watching
        // AND nearly finished
        var episodesLeft = anime.episodes - anime.current_episode;
        return (
          (
            anime.status === 2 ||
            anime.status === 5
          ) &&
          episodesLeft <= NEARLY_FINISHED_THRESHOLD &&
          episodesLeft > 0);
      }, function (anime, row) {
        var episodesLeft = anime.episodes - anime.current_episode;
        var m = message("[+" + episodesLeft + "]", "#151ab0");
        row.children[0].appendChild(m);
      }, function (row) {
        var cp = get_by_class('apip-message', row);
        if (cp) {
          cp.parentNode.removeChild(cp);
        }
      }), change(
      "Labels anime as [UPDATE NEEDED] if you have finished them or haven't started them",
      function (anime) {
        var episodesLeft = anime.episodes - anime.current_episode;
        return (
          (anime.status === 2 || anime.status === 5) &&
          (anime.episodes === 0 || episodesLeft === 0) &&
          !anime.airing);
      }, function (anime, row) {
        var m = message("[UPDATE NEEDED]", "#15b01a");
        row.children[0].appendChild(m);
      }, function (row) {
        var cp = get_by_class('apip-message', row);
        if (cp) {
          cp.parentNode.removeChild(cp);
        }
      }), change("Shorten the anime title to save space",
      function (anime) {
        return anime.title.length > NAME_CUTOFF;
      }, function (anime, row) {
        shortenContent(get_by_tag('a', row)[0], NAME_CUTOFF);
      }, function (row) {
        lengthenContent(get_by_tag('a', row)[0]);
      }), change(
      "Swap out xTimes or episodes inputs when one is not needed (you never use both)",
      function (anime) {
        return true; // not watched
      }, function (anime, row) {
        var target = (anime.status != 1) ? 'timeswatched' : 'episodes';
        get_by_name(target, row).style.display = 'none';
        if (!anime.airing) {
          x("descendant::*[@value='1']", get_by_name('status', row)).innerHTML += ' | ' + anime.episodes;
        }
      }, function (row) {
        delete get_by_class('timeswatched', row).style.display;
        delete get_by_class('episodes', row).style.display;
        // if (!anime.airing) {
        //     x("descendant::*[@value='1']", get_by_name('status', row)).innerHTML = 'Watched';
        // }
      }), change(
      "Mini-status",
      function (anime) {
        return true;
      }, function (anime, row) {

      }, function (row) {

      }), change(
      "Test change - new column",
      function (anime) {
        return true;
      }, function (anime, row) {
        // Warning: Very hacky
        if (!HACK_HeaderExists) {
          HACK_HeaderExists = e('th.veryhacky', 'EPR');

          var table = get_by_class("pure-table");
          var col = 2;

          HACK_HeaderExists.onclick = function hackySort() {
            sortTable(table, col);
          };

          var tr = table.tHead.children[0];
          tr.insertBefore(HACK_HeaderExists, tr.children[col]);
        }

        var cell2 = row.children[2];
        var insert = e('td.test-cell', '' + (anime.episodes - anime.current_episode));
        row.insertBefore(insert, cell2);

      }, function (row) {
        if (HACK_HeaderExists) {
          HACK_HeaderExists.parentNode.removeChild(HACK_HeaderExists);
          HACK_HeaderExists = undefined;
        }

        var cell = get_by_class('test-cell', row);
        row.removeChild(cell);
      })
  ];


  function change_row(row) {
    try {
      var name = get_by_tag("a", row)[0].innerHTML.trim(),
        status = get_by_name("status", row),
        episodes = get_by_name("episodes", row),
        current_anime = anime(name, status, episodes);

      console.log(status, episodes, current_anime);

      for (var i = 0, l = changes.length; i < l; i++) {

        var change = changes[i];
        console.log("\t CHANGING", change, change.pred(current_anime));

        if (change.pred(current_anime)) {
          change.changer(current_anime, row);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  function reset_row(row) {
    for (var i = 0, l = changes.length; i < l; i++) {
      var change = changes[i];
      console.log("\tRESETTING ", change, row);

      if (change.reset) {
        change.reset(row);
      }
    }
  }

  function change_handler(e) {
    var row = x('ancestor::tr', e.target);
    reset_row(row);
    change_row(row);
  }

  function init() {
    addGlobalStyle(CSS);
    var list = get_by_class("pure-table");

    if (list !== null) {
      var rows = list.lastElementChild.children;

      for (var i = 0, l = rows.length; i < l; i++) {
        change_row(rows[i]);
      }

      // add a change listener to all select inputs so we can update
      // things when changes are made
      var selects = xs("descendant::select", list);
      for (var j = 0, lj = selects.length; j < lj; j++) {
        selects[j].addEventListener('change', change_handler, false);
      }
    }
  }

  init();
})();
