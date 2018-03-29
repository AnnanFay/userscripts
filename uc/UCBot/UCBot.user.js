// ==UserScript==
// @name        UCBot
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http://uc*.gamestotal.com/*
// @version     1
// @grant       None
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

var HOME = 'i.cfm?f=sc_research2&rtype=1';
var PLUNDER_LINK = 'i.cfm?f=com_col_plunder&co=1&cid=';
var EXPLORE_LINK = 'i.cfm?f=com_explore';
var MAX_COLONIES = 13;
var MIN_LAND = 880;
var MIN_MINING_LAND = 40;
var MINE_RATIO = (1 / 20);
var ORE_THRESHOLD = 300;
// hours the bot should be acgive.
var ACTIVE_MIN = 6; // 6am
var ACTIVE_MAX = 22; // 10pm

//['Tax Collector', 'Excavator'];
var GOOD_MINISTER_TRAITS = [
    'Defensive', 'Engineer', 'Fearful', // defensive hull
    'Aggressive', 'Monger', 'Suicidal', // offensive damage
    'Fear', 'Anticipation', // defensive damage
    'Insult', 'Foresight', // offensive hull
    'Mad'
];
var BAD_MINISTER_TRAITS = ['Ugly'];

var tick = 8 * 1000; // realtime = 8 seconds
var maxTicks = 30; // max 30
var buttonCheck;
var newPlanetRegExp = /You have discovered a new planet[\s\S]*Name[\s\S]*>&nbsp;([\s\S]*)&nbsp;<[\s\S]*Useable land[\s\S]*>&nbsp;([\s\S]*)&nbsp;<[\s\S]*Available ore[\s\S]*>&nbsp;([\s\S]*)&nbsp;<[\s\S]*Mineral[\s\S]*>&nbsp;([\s\S]*)&nbsp;<[\s\S]*Planet type[\s\S]*?>&nbsp;([\s\S]*?)&nbsp;</;

function toArray (something) {
    return Array.prototype.slice.call(something);
}

function caller (m) {
    return function (o) {
        return o[m]();
    };
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

function reset () {
    window.location.href = HOME;
}

function hire () {
    window.location.href = 'i.cfm?f=sc_project2&id=5&co=1&co2=1';
}

function last (l) {
    return l[l.length-1];
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
    window.location.reload();
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

var colidLinkRe = 'colid=(\\d+)>PNAME</a';

var HOUSING_RESEARCH_LINK = 'i.cfm?f=com_research2&rtype=1';

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

function onceOffResearch (callback) {
    var postData = 'turns=9';
    verifiedPost(HOUSING_RESEARCH_LINK, postData, function (data) {
        console.log('finished research');
        callback();
    });
}

function buyoutConsumerGoods () {
    var data = 'buyprice=4&price=4&amount=9e99&amount2=&totalbuy=&totalsell=&buyflag=++Buy++&buyprice2=4';
    var url = 'i.cfm?&f=com_market2&gid=24';

    var credText = document.body.innerHTML.match(/([\d,]+) \$&nbsp;/)[1];
    var credValue = parseInt(credText.replace(/,/g, ''));
    if (credValue < 1e9) {
        console.log('credValue is less than min credits.', credValue);
        return;
    }

    verifiedPost(url, data, function (data) {
        var success = data.match(/You have bought/);

        console.log(success ? 'CG BUYOUT SUCCESS' : 'Failed to buy CGs');
    }, function (data) {
        return data.match(/No one selling just yet./);
    });
}

function qsa (query, source) {
    return Array.prototype.slice.call((source || document).querySelectorAll(query));
}

function goHome () {
    console.log('going home');
    var homeURL = 'i.cfm?&f=sc_research2&rtype=1';
    unsafeWindow.location.href = homeURL;
}

var colonyRowValueRe = /(E[\d\.]+)\s+([ a-zA-Z\d\.]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)/;
var rawColonyRowValuesRe = /=(\d+)[\s\S]*>([A-Z][^<]+)<[\s\S]*>([A-Z][^<]+)<[\s\S]*[> ;]([\d,]+)&nbsp;<\/[\s\S]*[> ;]([\d,]+)&nbsp;<\/[\s\S]*[> ;]([\d,]+)&nbsp;<\/[\s\S]*[> ;]([\d,]+)&nbsp;<\/[\s\S]*[> ;]([\d,]+)&nbsp;<\/[\s\S]*[> ;]([\d,]+)&nbsp;<\//;
var rawColonyRowRe = /colid=[\s\S]*?<\/tr/g;

function login () {
    console.log('logging in');
    post('i.cfm?&p=login', 'nic=AnnanFay&password=Siolfor&server=2', function () {
        goHome();
    });
}

function init () {
    // terminate!
    var nowHours = new Date().getHours();
    if (nowHours < ACTIVE_MIN || nowHours > ACTIVE_MAX) {
        var hoursTilWake = (24 + ACTIVE_MAX - nowHours) % 24;
        console.log('going to sleep', hoursTilWake);
        to += hoursTilWake * 60 * 60 * 1000;
        // setTimeout(goHome, hoursTilWake * 60 * 60 * 1000);
        // return;
    }
    console.log('not going to sleep', nowHours, nowHours < ACTIVE_MIN, nowHours > ACTIVE_MAX);

    buttonCheck = extractButtonCheck(document.body.innerHTML);
    console.log('initial buttonCheck: ', buttonCheck);
    //getPlanetID('E.9440', function (id) {
    //    console.log('planet id is: ', id);
    //});
 
    var needToLogin = document.body.textContent.match(/Your login session has expired./);
    if (needToLogin) {
        login();
        return;
    }

    qsa('input').forEach(function(input){
        input.removeAttribute('maxLength');
    });

    // game unlocked, but still on lock screen.
    var gameUnlock = document.body.textContent.match(/Game have been unlocked !/);
    if (gameUnlock) {
        reset();
        return;
    }

    // game locked, unlock.
    var clickNumber = document.body.textContent.match(/Click on number (\d+)/);
    if (clickNumber) {
        unlock(clickNumber);
        return;
    }

    // game locked, unlock.
    var canceledShipBuilding = document.body.textContent.match(/Ship building has been canceled./);
    if (canceledShipBuilding) {
        ping('i.cfm?&2072&popup=attackmsg&c=1');
        // cancelButton = qsa('a[onclick^="window.open"]');
    }



    var sackMinister = qsa('[value=" Sack "]');
    if (sackMinister.length) {
        var goodTraitRegex = new RegExp('(' + GOOD_MINISTER_TRAITS.join('|') + ')', 'gi');
        var goodTraits = document.body.textContent.match(goodTraitRegex);
        console.log(goodTraits);
        if (goodTraits && goodTraits.length > 1) {
            console.log('good traits found', goodTraits);
            return;
        }
        setTimeout(function () {
            sackMinister[sackMinister.length - 1].click();
        }, 2000);
    }

    var hiring = document.body.textContent.match(/Hire New Staff/);
    if (hiring) {
        var tooMany = document.body.textContent.match(/You can only have 2 ministers/);
        if (!tooMany) {
            hire();
            return;
        }
    }


    var ministerTraining = document.body.textContent.match(/Projects > Minister`s Training/);
    if (ministerTraining) {

        var levelUp = qsa('a[href*="&lvu="]');
        if (levelUp.length) {
            levelUp[0].click();
            return;
        }


        var links = qsa('a[href*="f=sc_project2&id=16&"]');
        links = toArray(links);
        for (var i=0; i<links.length; i++){
            if (links[i].textContent.match(/New Skill/)) {
                console.log('New skilling');
                links[i].click();
                return;
            }
        }
        // var traitBoxes = Array.prototype.slice.call(links);
        // var goodTraitRegex = new RegExp('(' + GOOD_MINISTER_TRAITS.join('|') + ')', 'gi');
        // var goodTraits = document.body.textContent.match(goodTraitRegex);
        console.log(links);
        // if (goodTraits && goodTraits.length > 1) {
        //     console.log('good traits found', goodTraits);
        //     return;
        // }
        setTimeout(function () {

        }, 2000);
    }

    // var hiring = document.body.textContent.match(/Hire New Staff/);
    // if (window.location.href.match(/&f=sc_project2&id=/)) {
    //     var tooMany = document.body.textContent.match(/You can only have 2 ministers/);
    //     if (!tooMany) {
    //         hire();
    //         return;
    //     }
    // }
    run();

}

function timeForAction () {
    var turnsMatch = document.body.textContent.match(/(\d+) Tu?/);
    var turnCount = turnsMatch ? parseInt(turnsMatch[1]) : 0;
    return !(to > 0 && turnCount < (maxTicks * 0.3));
}

function run () {
    console.log('run', to);

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
        window.location.href = HOME;
        return;
    }

    var continueButton = qsa('[value=" Continue "]');
    if (continueButton.length) {
        console.log('continueButton');
        continueButton[continueButton.length - 1].click();
        return;
    }

    console.log('doing nothing');
}

init();