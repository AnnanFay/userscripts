// ==UserScript==
// @name        GCBot
// @namespace   http://annanfay.com/
// @description
// @include     http://gc.gamestotal.com/*
// @version     1
// @grant       none
// ==/UserScript==

var DEBUG = true;

// function log(level) {
//     if (DEBUG) {
//         var now = new Date();
//         var dateString = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ' || ';
//         Array.prototype.splice.call(arguments, 0, 0, dateString);
//         console.log.apply(console, arguments);
//     }
// }

console.log('starting script');
// alert('foo');

//http://uc.gamestotal.com
var HOME = 'i.cfm?&f=com_research2&rtype=5';
// var HOME = 'i.cfm?f=com_col_find&colid=31604306&tid=23';
// var HOME = 'i.cfm?f=com_col';
var PLUNDER_LINK = 'i.cfm?f=com_col_plunder&co=1&cid=';
var EXPLORE_LINK = 'i.cfm?f=com_explore';
var PAGES = {
    COLONIES: 'i.cfm?f=com_col'
};
var MAX_COLONIES = 13;
var MIN_LAND = 750;

var AUTO_PLUNDER = false;
var AUTO_CLUSTER = false;//false;
var AUTO_BUILD_MINES = false;
var PLANETS_PER_CLUSTER = 5;

var MINE_RATIO = (1 / 60); // reciprocol of aprox number of turns to fully mine planet
var ORE_THRESHOLD = 300; // planets must have at least this starting ore
var MINING_RATE_THRESHOLD = 20; // planets must be able to provide 20 ore per turn when developed
// mining rate 20 will grab you some of the best Icy worlds. Most are below this.

// hours the bot should be acgive.
var SLEEP_CYCLE = true;
var ACTIVE_MIN = 7; // 6am
var ACTIVE_MAX = 22; // 10pm

var tick = 8 * 1000; // realtime = 8 seconds
var maxTicks = 30; // max 30
var buttonCheck;

var planetMiningRates = {
    'Barren': 2,
    'Desert': 2,
    'Rocky': 1.5,
    'Balanced': 1,
    'Forest': 0.75,
    'Marshy': 0.5,
    'Oceanic': 0.5,
    'U.Rich': 0.5,
    'Icy': 0.25,
    'U.Eden': 0,
    'U.Spaz': 0,
    'U.Large': 0,
    'Gas': 0,
    'Cluster Lvl 1': 1.1,
    'Cluster Lvl 2': 1.2,
    'Cluster Lvl 3': 1.3
};


function pointsForExploration (currentPlanets) {
  return 5000 * Math.exp(0.1823216 * (currentPlanets - 1))
}


var newPlanetRegExp = /You have discovered a new planet[\s\S]*Name[\s\S]*>&nbsp;([\s\S]*)&nbsp;<[\s\S]*Useable land[\s\S]*>&nbsp;([\s\S]*)&nbsp;<[\s\S]*Available ore[\s\S]*>&nbsp;([\s\S]*)&nbsp;<[\s\S]*Mineral[\s\S]*>&nbsp;([\s\S]*)&nbsp;<[\s\S]*Planet type[\s\S]*?>&nbsp;([\s\S]*?)&nbsp;</;

/*
listExplorations()
.map(function(x){
    return (Object
            .keys(x)
            .map(function(k){return '"' + x[k] + '"';})
            .join(','))})
.join('\n');
*/
// window.listExplorations = function listExplorations() {
//     return listLocalStorageList('explorations', 'exp');
// };
// window.clearExplorations = function clearExplorations() {
//     return clearLocalStorageList('explorations', 'exp');
// };

// function recordExploration(exp) {
//     return recordLocalStorageList('explorations', 'exp', exp);
// }

// window.listDig = function listDig() {
//     return listLocalStorageList('digs', 'dig');
// };
// window.clearDig = function clearDig() {
//     return clearLocalStorageList('digs', 'dig');
// };

// function recordDig(dig) {
//     return recordLocalStorageList('digs', 'dig', dig);
// }

// window.listLocalStorageList = function listLocalStorageList(listName, prefix) {
//     console.log('listing LSL', listName);
//     var ls = window.localStorage;
//     var countName = listName;// + '-count';
//     var dataCount = JSON.parse(ls.getItem(countName) || '0');

//     var listData = [];
//     if (dataCount) {
//         for (var i = 0; i < dataCount; i++) {
//             listData.push(JSON.parse(ls.getItem(prefix + '-' + i)));
//         }
//     }
//     return listData;
// };
// window.clearLocalStorageList = function clearLocalStorageList(listName, prefix) {
//     console.log('clearing LSL', listName);
//     var ls = window.localStorage;
//     var countName = listName;// + '-count';
//     var dataCount = JSON.parse(ls.getItem(countName) || '0');

//     if (dataCount) {
//         for (var i = 0; i < dataCount; i++) {
//             ls.removeItem(prefix + '-' + i);
//         }
//     }
//     ls.removeItem(countName);
// };

// function recordLocalStorageList(listName, prefix, data) {
//     console.log('recording LSL', listName);

//     var ls = window.localStorage;
//     var countName = listName;// + '-count';
//     var dataCount = JSON.parse(ls.getItem(countName) || '0');

//     try {
//         ls.setItem(prefix + '-' + dataCount, JSON.stringify(data));
//         ls.setItem(countName, JSON.stringify(dataCount + 1));
//     } catch (e) {
//         var err = 'LSL memory full ' + listName + ' : ' + e;
//         alert(err);
//         throw new Exception(err);
//     }
// }

  // function getLocalStorageList(listName) {
  //     var ls = window.localStorage;
  //     var countName = listName + '-count';
  //     var dataCount = JSON.parse(ls.getItem(countName) || '0');

  //     var listData = [];
  //     if (dataCount) {
  //         for (var i = 0; i < dataCount; i++) {
  //             listData.push(JSON.parse(ls.getItem(listName + '-' + i)));
  //         }
  //     }
  //     return listData;
  // }
  // function clearLocalStorageList(listName) {
  //     var ls = window.localStorage;
  //     var countName = listName + '-count';
  //     var dataCount = JSON.parse(ls.getItem(countName) || '0');

  //     if (dataCount) {
  //         for (var i = 0; i < dataCount; i++) {
  //             ls.removeItem(listName + '-' + i);
  //         }
  //     }
  //     ls.removeItem(countName);
  // }

  // function recordLocalStorageList(listName, data) {
  //     var ls = window.localStorage;
  //     var countName = listName + '-count';
  //     var dataCount = JSON.parse(ls.getItem(countName) || '0');
  //     try {
  //         ls.setItem(listName + '-' + dataCount, JSON.stringify(data));
  //         ls.setItem(countName, JSON.stringify(dataCount + 1));
  //     } catch (e) {
  //         var err = 'LSL memory full ' + listName + ' : ' + e;
  //         alert(err);
  //         throw new Exception(err);
  //     }
  // }
function toArray (something) {

    return Array.prototype.slice.call(something);
}

function caller (m) {
    return function (o) {
        return o[m]();
    };
}

function rand (min, max) {
    if (arguments.length === 0) {
        return Math.random();
    }
    if (max === undefined) {
        max = min;
        min = 0;
    }
    return min + (max - min) * Math.random();
}

function randInt (min, max) {
    return Math.floor(rand(min, max));
}

function choice (l) {
    var i = randInt(0, l.length)
    return l[i];
}

var to = maxTicks * tick; // rough time to max points
to -= Math.floor(Math.random() * (maxTicks / 4)) * tick; // minus 0 to a quarter of max ticks

function unlock (clickNumber) {
    var number = clickNumber[1];
    var selector = 'a[href*="ln=' + number + '"]';
    var link = qsa(selector);
    if (link.length) {
        setTimeout(function () {
            link[0].click();
        }, 2000);
    }
}

function upgradeSystem (id) {
    ping('i.cfm?f=sc_project2&id=6&co=1&ci=' + id);
}

var buttonCheckRe = /buttoncheck value="&([^"]+)&"/;

function requestHandler (callback) {
    return function globalRequestHandler() {
        if (!this.responseText) {
            console.log('!evt.responseText', this);
            return;
        }
        try {
            buttonCheck = extractButtonCheck(this.responseText);
            console.log('buttonCheck', buttonCheck);
        } catch (e) {
            console.log('requestHandler failed button check', e);
        }
        if (callback) {
            callback(this.responseText);
        }
    };
}

function goTo (url) {
    var a = document.createElement("a");
    a.setAttribute('href', verifyUrl(url));
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
}

function get (url, callback) {
    var r = new XMLHttpRequest();
    r.onload = requestHandler(callback);
    r.open('get', url, callback ? true : false);
    r.send();
}

function post (url, data, callback) {
    var r = new XMLHttpRequest();

    r.onload = requestHandler(callback);
    r.open('post', url, callback ? true : false);

    r.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    r.setRequestHeader("Content-length", data.length);
    r.setRequestHeader("Connection", "close");

    r.send(data);
}

// var lastVerifiedPost;

function verifyUrl (url) {
    return url.replace('cfm?f=', 'cfm?&' + buttonCheck + '&f=');
}

function verifiedPost (url, partialPostData, callback, terminateEarly) {
    // if (lastVerifiedPost === url) {
    //     var postData = partialPostData + '&buttoncheck=%26'+buttonCheck+'%26';
    //     post(url.replace('cfm?f=', 'cfm?&' + buttonCheck + '&f='), postData, callback);
    // } else {
    get(verifyUrl(url), function (data) {
        if (terminateEarly && terminateEarly(data)) {
            return;
        }
        var postData = partialPostData + '&buttoncheck=%26'+buttonCheck+'%26';
        post(verifyUrl(url), postData, callback);
    });
    // }
    // lastVerifiedPost = url;
}

function ping (url) {
    console.log('ping', url);
    get(url);
}


function hire () {
    goTo('i.cfm?f=sc_project2&id=5&co=1&co2=1');
}

function last (l) {
    return l[l.length-1];
}

function newPlanetEvent () {

}

function max_input (name, max, max_ref) {
    if (max_ref) {
        var mr = qsa('[name="'+max_ref+'"]')[0];
        var v = mr && parseInt(mr.value.replace(/[^\d]/g,''));
        if (mr && v < parseInt(max)) {
            max = v;
        }
    }
    if (max === undefined) {
        max = max || '9e9';
    }


    var inp = qsa('[name="'+name+'"]')[0];
    if (!inp) return;
    inp.maxlength = 9;
    inp.value = max;
}

function reload () {
    goTo(window.location.href);
}

function attachToButton (buttonValue, callback) {
    console.log('attachToButton', buttonValue);
    var buttons = qsa('[value="'+buttonValue+'"]');
    if (!buttons.length) {
        return;
    }
    console.log('   ::::', buttons);
    buttons[0].onClick = undefined;
    buttons[0].type = 'button';
    buttons[0].addEventListener('click', function (evt) {
        // console.log('click evt', evt);
        callback(evt);
        evt.stopPropogation();
        evt.preventDefault();
        return false;
    });
    return buttons[0];
}

function plunder (cid) {
    console.log('ping::::::::::::', PLUNDER_LINK + cid);
    ping(PLUNDER_LINK + cid);
}

function cluster (projectId, mineral, callback) {
    var url = 'i.cfm?&f=com_colupgrade&tid='+projectId+'&con=1';
    var postData = 'goodid=' + (mineral || 1);
    post(url, postData, callback);
}

function randomMineral () {
    return choice([6]);
}

function clusterC1 (callback) {
    return cluster(20, randomMineral(), callback);
    // return cluster(20, 1, callback);
}

function clusterC2 (callback) {
    return cluster(21, randomMineral(), callback);
    // return cluster(21, randInt(7), callback);
    // return cluster(21, 1, callback);
}

function clusterC3 (callback) {
    return cluster(22, randomMineral(), callback);
}

function clusterC4 (callback) {
    return cluster(23, randomMineral(), callback);
}

function chain (funcs, callback) {
    console.log('chain', funcs, callback);

    if (!funcs.length) {
        return callback();
    }

    var f = funcs.shift();
    f(function () {
        chain(funcs, callback);
    });
}

function clusterAll (clusteration, callback) {
    var clusterations = [];
    while (clusteration.c0 > 4) {
        clusterations.push(clusterC1);
        clusteration.c0 -= 5;
    }
    while (clusteration.c1 > 4) {
        clusterations.push(clusterC2);
        clusteration.c1 -= 5;
    }
    // while (clusteration.c2 > 4) {
    //     clusterations.push(clusterC3);
    // ....
    // }
    // while (clusteration.c3 > 4) {
    //     clusterations.push(clusterC4);
    // ....
    // }
    if (clusterations.length) {
        setTimeout(chain, 0, clusterations, callback);
    }
    return clusterations.length;
}


var colidLinkRe = 'colid=(\\d+)>PNAME</a';

// var HOUSING_RESEARCH_LINK = 'i.cfm?f=com_research2&rtype=1';
var MINING_RESEARCH_LINK = 'i.cfm?f=com_research2&rtype=5';
var MAIN_RESEARCH_LINK = MINING_RESEARCH_LINK;

function extractButtonCheck (rawHtml) {
    var bc;
    try {
        bc = rawHtml.match(buttonCheckRe)[1];
        // console.log('buttonCheckRe worked', bc);
    } catch(e) {
        var linkMatches = rawHtml.match(/(&amp;|&)\d+(&amp;|&)/gi);
        // bc = linkMatches[linkMatches.length - 1];
        bc = linkMatches[5];
        // console.log('linkMatches worked', bc);
    }
    return bc ? bc.replace(/(&amp;|&)/gi, '') : '';
}

function asyncLoop (f, n, finalCallback) {
    if (n < 2) {
        f(finalCallback);
    } else {
        f(function () {
            asyncLoop(f, n - 1, finalCallback);
        });
    }
}


function logExplore (next) {
    return function (data) {
        try {
            var rawValues = data.match(newPlanetRegExp);
            var name = rawValues[1];
            var land = rawValues[2];
            var ore = rawValues[3];
            var mineral = rawValues[4];
            var type = rawValues[5];

            // recordExploration({
            //     name: name,
            //     land: land,
            //     ore: ore,
            //     mineral: mineral,
            //     type: type,
            //     time: (new Date()).toUTCString()
            // });
            console.log('log explore', rawValues);
        } catch (e) {}

        return next && next();
    };
}


// function logDig (next) {
//     return function (stuffFound) {
//         try {
//             // var rawValues = data.match(newDigRegExp);
//             console.log('logDig: ', stuffFound);
//             // var name = rawValues[1];
//             // var land = rawValues[2];
//             // var ore = rawValues[3];
//             // var mineral = rawValues[4];
//             // var type = rawValues[5];

//             // recordDig({
//             //     found: stuffFound,
//             //     time: (new Date()).toUTCString()
//             // });
//         } catch (e) {}

//         return next && next();
//     };
// }

function strip(html) {
   var tmp = document.createElement('div');
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || '';
}

function clean (text) {
  return (text
    .replace(/\n+/g, '\n')
    .replace(/^\s*\n/gm, '\n')
    .replace(/\s{2,}/g, '|')
    .replace(/\s*\n\s*/g, '|'));
}

var terminateExploreNow = false;

function logExploreTurns (data) {
    var strippedData = strip(data);
    var match = strippedData.match(/Turns required\*\s*(\d+)/i);
    if (match) {
        var turns = parseInt(match[1]);
        console.log('Exploring at ', turns, ' turns per planet.');
        if (!terminateExploreNow && turns > 2) {
            terminateExploreNow = true;
        }
    } else {
        console.log('NO MATCH', strippedData, match);
    }
}

function explore (callback, n) {
    var postData = 'turn=9';
    asyncLoop(function (next) {
        if (terminateExploreNow) {
            console.log('!!!terminateExploreNow');
            terminateExploreNow = false;
            callback();
            return;
        }
        setTimeout(verifiedPost, 3000, EXPLORE_LINK, postData, logExplore(next), logExploreTurns);
    }, n, function (data) {
        console.log('finished exploration');
        terminateExploreNow = false;
        callback();
    });
}

function onceOffResearch (callback) {
    var postData = 'turns=9';
    verifiedPost(MAIN_RESEARCH_LINK, postData, function (data) {
        console.log('finished research');
        callback();
    });
}

function buyoutProduct (productId, price) {
    var data = 'buyprice='+price+'&price='+price+'&amount=9e99&amount2=&totalbuy=&totalsell=&buyflag=++Buy++&buyprice2=' + price;
    var url = 'i.cfm?&f=com_market2&gid=' + productId;

    verifiedPost(url, data, function (data) {
        var success = data.match(/You have bought/);

        console.log(success ? 'BUYOUT SUCCESS' : 'Failed to buyout');
    }, function (data) {
        return data.match(/No one selling just yet./);
    });
}

function buyoutConsumerGoods () {
    var credText = document.body.innerHTML.match(/([\d,]+) \$&nbsp;/)[1];
    var credValue = parseInt(credText.replace(/,/g, ''));

    if (credValue < 1e9) {
        console.log('credValue is less than min credits.', credValue);
        return;
    }
    buyoutProduct(24, 4);
}

function buyoutFood () {
    var foodValue = 0;
    var credValue = 0;
    try {
        var foodTextMatch = document.body.innerHTML.match(/"">&nbsp; +([\d,]+) F&nbsp;/);
        foodValue = parseInt(foodTextMatch[1].replace(/,/g, ''));
        var credText = document.body.innerHTML.match(/([\d,]+) \$&nbsp;/)[1];
        credValue = parseInt(credText.replace(/,/g, ''));
    } catch (e) {
        console.log('e', e);
        return;
    }

    if (foodValue !== 0 && foodValue < 1e8 && credValue > 1e9) {
        console.log('buying food.', foodValue);
        buyoutProduct(21, 10);
        return;
    }
    console.log('we have enough food.', foodValue, credValue);
}

function qsa (query, source) {
    return Array.prototype.slice.call((source || document).querySelectorAll(query));
}

function getPlanetID (planetName, callback) {
    console.log('planetName', planetName);
    get('i.cfm?f=com_col', function (data) {
        try {
            var reStr = colidLinkRe.replace('PNAME', planetName);
            var re = new RegExp(reStr);
            var colidMatch = data.match(re);
            var colid = colidMatch[1];
            callback(colid);
        } catch(e) {
            console.log(e, this);
            callback();
        }

    });
}

function buildMines (colid, minesNeeded) {
  if (!AUTO_BUILD_MINES) {
    return;
  }
  console.log('BUILDING MINES ON ', colid);
  console.log('buildMines', arguments);

  var postBody = 'housing=&commercial=&industry=&mining='+minesNeeded+'&build=++++Build++++';

  var url = 'i.cfm?f=com_col&colid=' + colid;

  post(url, postBody, function (data) {
      console.log('Mines built.');
  });
}

function goHome () {
    console.log('going home');
    goTo(HOME);
    // unsafeWindow.location.href = 'i.cfm?f=com_col';
}

var colonyRowValueRe = /(E[\d\.]+)\s+([ a-zA-Z\d\.]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)/;
var rawColonyRowValuesRe = /=(\d+)[\s\S]*>([A-Z][^<]+)<[\s\S]*>([A-Z][^<]+)<[\s\S]*[> ;]([\d,]+)&nbsp;<\/[\s\S]*[> ;]([\d,]+)&nbsp;<\/[\s\S]*[> ;]([\d,]+)&nbsp;<\/[\s\S]*[> ;]([\d,]+)&nbsp;<\/[\s\S]*[> ;]([\d,]+)&nbsp;<\/[\s\S]*[> ;]([\d,]+)&nbsp;<\//;
var rawColonyRowRe = /colid=[\s\S]*?<\/tr/g;

function login () {
    console.log('logging in');
    post('i.cfm?&p=login&se=4', 'nic=AnnanFay&password=Siolfor&server=4', goHome);
}

function visualOnly () {
  var tc = document.body.textContent;

  var exploring = tc.match(/EXPLORING FOR NEW PLANETS/);
  if (exploring) {
    try {
    var scanningPower = parseInt(tc.match(/Scanning power\s*([\d,]+)/)[1].replace(/,/g, ''));
    var planets = parseInt(tc.match(/Planets\s*([\d,]+)/)[1].replace(/,/g, ''));
    var currentPoints = parseInt(tc.match(/Exploration points\s*([\d,]+)/)[1].replace(/,/g, ''));

    console.log(scanningPower, planets, currentPoints);

    // next five planets will cost:
    var totalCost = 0;
    for (var i = 0; i < 5; i++){
      totalCost += pointsForExploration(planets + i);
    }
    var requiredPoints = totalCost - currentPoints;
    var requiredTurns = Math.ceil(requiredPoints / scanningPower);
    console.log('requiredTurns', requiredTurns);
  } catch (e){}
  }
}

function init () {


//     console.log('hacky ship building 0');
//     var url = 'http://gc.gamestotal.com/i.cfm?&7390&f=com_ship2&shiptype=10';
//     var postData = 'unitcost=535&amount=7000&totalcost=3%2C745%2C000';
//     if (window.location.href == url) {
//         console.log('hacky ship building 1');
//         setTimeout(function () {
//             console.log('hacky ship building 2');
//             post(url, postData, function(){

//                 console.log('hacky ship building 3');
//                 window.location.href = url;
//             });
//             // http://gc.gamestotal.com/i.cfm?&7485&f=com_ship2&shiptype=11
//         }, 1000 * 8 * 10);
//     }

//     console.log('hacky ship building 1.5');


  visualOnly();

    // terminate!
    var nowHours = new Date().getHours();
    if (SLEEP_CYCLE && (nowHours < ACTIVE_MIN || nowHours > ACTIVE_MAX)) {
        var hoursTilWake = (24 + ACTIVE_MIN - nowHours) % 24;
        console.log('going to sleep for', hoursTilWake, 'hours');
        to += hoursTilWake * 60 * 60 * 1000;
        setTimeout(goHome, hoursTilWake * 60 * 60 * 1000);
        return;
    } else {
        console.log('not going to sleep', nowHours, nowHours < ACTIVE_MIN, nowHours > ACTIVE_MAX);
    }
    buttonCheck = extractButtonCheck(document.body.innerHTML);
    console.log('initial buttonCheck: ', buttonCheck);

    var needToLogin = document.body.textContent.match(/Your login session has expired./);
    if (needToLogin) {
        console.log('needToLogin');
        setTimeout(login, 2000);
        return;
    }

    var maxColoniesExplored = document.body.textContent.match(/Maximum \d+ colonies reached !/);
    if (maxColoniesExplored) {
        console.log('maxColoniesExplored');
        setTimeout(goHome, 2000);
        return;
    }

    qsa('input').forEach(function(input){
        input.removeAttribute('maxLength');
    });


    // buyoutConsumerGoods();
    // buyoutFood();

    var managingColonies = document.body.textContent.match(/MANAGING COLONIES/);
    var href = window.location.href;
    var notReallyManagingColonies = href.indexOf('scm') != -1 || href.indexOf('colid') != -1;
    if (managingColonies && !notReallyManagingColonies) {
        console.log('managingColonies');

        var colonyRows = qsa('table.table_back table tr.table_row1');
        var colony_data = {};
        var plunderables = 0;
        var clusteration = {cz:0, c0:0, c1:0, c2:0, c3:0, c4:0};
        var xColonyFound = false;

        colonyRows.forEach(function (row) {
            // console.log('colonyRows.forEach', row.innerHTML);
            try {
                var rowValues = row.innerHTML.match(rawColonyRowValuesRe);
                if (!rowValues) {
                    return;
                }
                var colid = rowValues[1];
                var name = rowValues[2];
                var prefix = name.split('.')[0];
                var type = rowValues[3];
                var pop = parseInt(rowValues[4].replace(/,/g, ''));
                var maxPop = parseInt(rowValues[5].replace(/,/g, ''));
                var maxLand = parseInt(rowValues[8].replace(/,/g, ''));
                var ore = parseInt(rowValues[9].replace(/,/g, ''));

                // console.log('rowValues', rowValues);

                colony_data[colid]  = {
                    domRow: row,
                    name: name,
                    prefix: prefix,
                    type: type,
                    ore: ore,
                    pop:pop,
                    maxPop:maxPop,
                    maxLand:maxLand
                };
                // console.log('rowValues', colony_data[colid]);

                // console.log('rv, m, o', rowValues[1], maxLand, ore);
            } catch (e){
                console.log(e);
            }
        });

        var plunderPred = function plunderPred (cd) {
            // it's a cluster and has no ore
            if(cd.prefix === 'C2' && cd.ore === 0 && cd.maxLand < (MIN_LAND * 25)){
                return true;
            }
            if(cd.type === 'U.Eden' && cd.maxLand < 4000) {
                return true;
            }
            if(cd.type === 'U.Rich' && (cd.ore === 0 || cd.maxLand < 13)) {
                return true;
            }
            // if(cd.type === 'U.Spazial' && cd.maxLand > 2) {
            //     return true;
            // }
            if(cd.type === 'U.Large' && cd.maxLand < 7000) {
                return true;
            }
            if(cd.type === 'U.Fertile' && cd.maxLand < 2000) {
                return true;
            }
            if(cd.type === 'Dead'){
                return true;
            }
            return false;
        };

        var buildMinesPred = function buildMinesPred (cd) {
            // it's a cluster and has ore
            return (cd.name[0] === 'C' && cd.ore > 200) || cd.type === 'U.Rich';
        };

        // var isClusterable = function isClusterable (cd) {
        //     return (cd.name[0] === 'E' || cd.name[0] === 'X') && cd.type[0] !== 'U';
        // };

        var clusterRank = function clusterRank (cd) {
            if (cd.type[0] === 'U' || cd.prefix === 'H' || cd.type === 'Dead') {
                return 'cz';
            }
            if (cd.prefix === 'C1') {
                return 'c1';
            }
            if (cd.prefix === 'C2') {
                return 'c2';
            }
            if (cd.prefix === 'C3') {
                return 'c3';
            }
            if (cd.prefix === 'C4') {
                return 'c4';
            }
            return 'c0';
        };

        get('i.cfm?f=com_col&scm=2', function (data) {
            var rawRows = data.match(rawColonyRowRe);
            // console.log('infra check row count:', rawRows.length);
            rawRows.reverse().forEach(function(rawRow) {
                // console.log(rawRow);
                var rowValues = rawRow.match(rawColonyRowValuesRe);
                // console.log('infra check:', rowValues);

                var colid = rowValues[1];
                var cd = colony_data[colid];

                cd.currentHousing = parseInt(rowValues[5].replace(/,/g, ''));
                cd.currentCommercial = parseInt(rowValues[6].replace(/,/g, ''));
                cd.currentIndustry = parseInt(rowValues[7].replace(/,/g, ''));
                cd.currentAgriculture = parseInt(rowValues[8].replace(/,/g, ''));
                cd.currentMining = parseInt(rowValues[9].replace(/,/g, ''));
                cd.totalAssigned = (cd.currentHousing +
                                    cd.currentCommercial +
                                    cd.currentIndustry +
                                    cd.currentAgriculture +
                                    cd.currentMining);

                var inputs = qsa('input', cd.domRow);

                if (inputs.length) {
                    inputs[0].checked = false;
                }

                // if (cd.name[0] == 'X'){// && cd.maxLand < MIN_LAND) {
                //     xColonyFound = true;
                // }

                clusteration[clusterRank(cd)]++;

                var miningRate = 1;

                if (planetMiningRates[cd.type]) {
                    miningRate = planetMiningRates[cd.type];
                }

                ///
                /// PLUNDER ?
                ///
                // //MINING_RATE_THRESHOLD

                // var oreless = (cd.ore < 10 ||
                //     ((cd.ore * miningRate) < ORE_THRESHOLD && cd.currentMining < 10) ||
                //     (cd.maxLand * miningRate) < MINING_RATE_THRESHOLD);

                // console.log(cd.name, oreless, cd.maxLand < MIN_LAND, cd.type[0] != 'U');

                // if (oreless && cd.maxLand < MIN_LAND && cd.type[0] != 'U') {
                //     if (inputs.length) {
                //         inputs[0].checked = true;
                //         plunderables++;
                //     }
                // }

                if (plunderPred(cd)){
                    console.log('PLUNDERING', cd);
                    if (inputs.length) {
                        inputs[0].checked = true;
                        plunderables++;
                    }
                    return;
                }

                ///
                /// BUILD MINES ?
                ///

                if (buildMinesPred(cd)){
                    // console.log('building mines on:', cd);
                    var c1s = clusteration.c1;

                    // c1s
                    var ppc = PLANETS_PER_CLUSTER;
                    var scaleFactor = 0;
                    if ((ppc - c1s) > 0) {
                        // 1-0.25
                        // 2-1
                        // 3-4
                        // 4-16
                        // 5-0
                       // scaleFactor = (ppc + ppc) / (ppc * (ppc - (2 * c1s));
                        scaleFactor = 0.25 * Math.pow(4, c1s-1);
                    }
                    console.log('MINING:::scaleFactor', c1s, '=>', scaleFactor);

                    var targetMining = Math.round(scaleFactor * (cd.ore / miningRate) * MINE_RATIO);
                    var assignedNotMining = cd.totalAssigned - cd.currentMining;
                    targetMining = Math.min(
                        targetMining,
                        cd.maxPop - assignedNotMining,
                        cd.maxLand - assignedNotMining);
                    var minesNeeded = targetMining - cd.currentMining;
                    var availablePop = (cd.pop - cd.totalAssigned);

                    // console.log('targetMining', targetMining);
                    // console.log('currentMining', cd.currentMining, cd.maxLand);

                    console.log('MINING:::', cd.currentMining, '/', targetMining,
                        'pop:', cd.pop, '/', cd.maxPop, ' (', cd.type, ')',
                        'ore:', cd.ore, 'availablePop:', availablePop);

                    // if we don't have enough pop, we can still build some mines
                    if (minesNeeded > availablePop) {
                        minesNeeded = Math.max(20, availablePop);
                    }

                    if (minesNeeded > 5 && minesNeeded <= availablePop ) {
                        buildMines(colid, minesNeeded);
                    }

                }
            });

        });

        var plunderButton = attachToButton('Plunder Colony', function (evt) {
            console.log('Plunder Colony');
            var checkedClusters = qsa('[name="plunder"]:checked');
            checkedClusters.reverse();
            var cids  = [];
            for (var i = 0; i < checkedClusters.length && i < 4; i++) {
                cids.push(checkedClusters[i].value);
            }
            console.log('clusters: ', checkedClusters.length, cids);
            cids.forEach(plunder);
            reload();
        });

        var hackyLittleFunction = function(){

            if (!timeForAction()) {
                return setTimeout(hackyLittleFunction, 1000);
            }

            console.log('pondering plunderables', plunderables, xColonyFound);
            if (AUTO_PLUNDER && plunderables > 0 && !xColonyFound) {
                return plunderButton.click();
            }

            console.log('pondering exploration', colonyRows.length);
            if (colonyRows.length < MAX_COLONIES) {
                var spaceAvailable = MAX_COLONIES - colonyRows.length;
                var coloniesToExplore = Math.min(spaceAvailable, PLANETS_PER_CLUSTER - clusteration.c0);
                console.log('explore', coloniesToExplore);
                return explore(goTo.bind(null, PAGES.COLONIES), coloniesToExplore);
            }

            onceOffResearch(goTo.bind(null, PAGES.COLONIES));
        };
        setTimeout(hackyLittleFunction, 8000);



        var clusterablePondering = function clusterablePondering(){
            if (!AUTO_CLUSTER) {
              return;
            }
            console.log('pondering clusterables', clusteration);
            var clustersCreated = clusterAll(clusteration, goTo.bind(null, PAGES.COLONIES));

            if (clustersCreated > 0) {
                return;
            }
        };
        setTimeout(clusterablePondering, 3000);
    }

    // game unlocked, but still on lock screen.
    var gameUnlock = document.body.textContent.match(/Game have been unlocked !/);
    if (gameUnlock) {
        console.log('game unlocked');
        goHome();
        return;
    }

    // game locked, unlock.
    var clickNumber = document.body.textContent.match(/Click on number (\d+)/);
    if (clickNumber) {
        console.log('game locked');
        unlock(clickNumber);
        return;
    }

    // game locked, unlock.
    var canceledShipBuilding = document.body.textContent.match(/Ship building has been canceled./);
    if (canceledShipBuilding) {
        ping('i.cfm?&2072&popup=attackmsg&c=1');
        // cancelButton = qsa('a[onclick^="window.open"]');
    }


    var newPlanet = document.body.textContent.match(/You have discovered a new planet !/);
    if (newPlanet) {
        console.log('newPlanet defunct???!');
        // logExplore()(document.body.innerHTML);
        // var continueLink = qsa('[href$="com_explore"]');
        // if (continueLink.length) {
        //     continueLink[continueLink.length-1].click();
        // }

        // var newPlanetInfoRe = /Name([\s\S]*)Useable land([\s\S]*)Available ore([\s\S]*)Mineral([\s\S]*)Planet type/;//type: (.*)

        // var newPlanetInfo = document.body.textContent.match(newPlanetInfoRe);
        // newPlanetInfo = newPlanetInfo.map(caller('trim'));
        // var ore = parseInt(newPlanetInfo[3].replace(/,/g, ''));
        // console.log('ore', ore);

        // if (ore > 100) {
        //     console.log('getPlanetID', newPlanetInfo);
        //     var name = newPlanetInfo[1];
        //     getPlanetID(name, function (id) {
        //         console.log('pid', id);
        //         var continueLink = qsa('[href$="com_explore"]');
        //         newPlanetEvent();
        //         // if (continueLink.length) {
        //         //     continueLink[continueLink.length-1].click();
        //         // }
        //     });
        // }
        return;
    }


    // var digging = document.body.textContent.match(/EXCAVATION DIG SITE/);
    // Nothing found !
    // Found Pink Orb (Common)

    // var stuffFound = document.body.textContent.match(/Found ([^\(]+)\(([^\)]+)\)/gi);
    // if (digging && stuffFound) {
    //     console.log('new dig, found something');
    //     logDig()(stuffFound);
    //     return;
    // }


    // var hiring = document.body.textContent.match(/Hire New Staff/);
    // if (window.location.href.match(/&f=sc_project2&id=/)) {
    //     var tooMany = document.body.textContent.match(/You can only have 2 ministers/);
    //     if (!tooMany) {
    //         hire();
    //         return;
    //     }
    // }
    window.setTimeout(run, 1000);
}

function timeForAction () {
    var turnsMatch = document.body.textContent.match(/(\d+) Tu?/);
    var turnCount = turnsMatch ? parseInt(turnsMatch[1]) : 0;
    return !(to > 0 && turnCount < (maxTicks * 0.3));
}

function run () {
    if (to % 1e5 === 0) {
        console.log('run', to);
    }

    to -= 1000;
    if (!timeForAction()) {
        var id = window.setTimeout(run, 1000);
        // console.log('timeout id:' + id);
        return;
    }

    max_input('pcredit', 1000000000, 'lcredit');
    max_input('turns');
    // max_input('pturn', turnCount, 'lturn');

    console.log('running');
    // var turnsInput = qsa('[name="turns"]');
    // if (turnsInput.length) {
    //     console.log('turnsInput');
    //     turnsInput[0].value = 99;
    // }

    var pturnInput = qsa('[name="pturn"]');
    if (pturnInput.length) {
        var confirmButton = qsa('[value=" Confirm "]');
        if (confirmButton.length) {
            console.log('confirmButton');
            confirmButton[confirmButton.length - 1].click();
            return;
        }
    }

    var startResearch = qsa('[value="Start Research !"]');
    if (startResearch.length) {
        console.log('startResearch');
        startResearch[startResearch.length - 1].click();
        setTimeout(run, 6000);
        return;
    }

    var investButton = qsa('[value="Confirm investment"]');
    if (investButton.length) {
        console.log('investButton');
        max_input('pturn');
        setTimeout(function () {
            investButton[investButton.length - 1].click();
            setTimeout(run, 6000);
        }, 3000);
        return;
    }

    var exploreButton = qsa('[value=" Explore! "]');
    if (exploreButton.length) {
        console.log('exploreButton');
        try {
            var systemLink = qsa('font font a u')[0].parentNode.href;
            var systemId = last(systemLink.split('='));
            upgradeSystem(systemId);
        } catch (e){}

        setTimeout(function () {
            exploreButton[exploreButton.length - 1].click();
            setTimeout(run, 6000);
        }, 3000);
        return;
    }

    var waitButton = qsa('[value="Wait!"]');
    if (waitButton.length) {
        console.log('waitButton');
        // waitButton[waitButton.length - 1].click();
        goHome();
        return;
    }

    var digButton = qsa('[value=" Perform Dig "]');
    if (digButton.length) {
        console.log('digButton');
        qsa('input[name="turn"]')[0].value = 6;//randInt();
        digButton[digButton.length - 1].click();
        return;
    }

    var continueButton = qsa('[value=" Continue "]');
    if (continueButton.length) {
        console.log('continueButton');
        continueButton[continueButton.length - 1].click();
        return;
    }

    var rewardButton = qsa('[value=" Reward "]');
    if (rewardButton.length) {
        var credText = document.body.innerHTML.match(/([\d,]+) \$&nbsp;/)[1];
        var credValue = parseInt(credText.replace(/,/g, ''));
        if (credValue > 1e7) {
            console.log('rewardButton');
            rewardButton[rewardButton.length - 1].click();
        }
        return;
    }

    console.log('doing nothing');
}

try {
    init();
} catch (e) {
    console.log(e);
}
