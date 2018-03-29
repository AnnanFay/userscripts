var baseUrl = 'http://gc.gamestotal.com/i.cfm?&f=com_ship2&shiptype=';
var shipData = shipData || {};
var processedKeys = Object.keys(shipData);
var currentId = processedKeys[processedKeys.length - 1];

function get (url, callback) {
    var r = new XMLHttpRequest();
    r.onload = function () {
        if (!this.responseText) {
            return;
        }
        callback(this.responseText);
    };
    r.open('get', url, callback ? true : false);
    r.send();
}

function strip(html) {
   var tmp = document.createElement('div');
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || '';
}

var mainChunkRe = /SHIPS - ([\s\S]+)Disable Chat/;

function cdAttr(text, attr, sep){
    sep = sep === undefined ? '\\|' : sep;
    var re = new RegExp(attr + sep + '([^\\|]+)\\|');
    var m = text.match(re);
    if (!m) {
        // console.log(re);
    }
    return m ? m[1] : null;
}

function processData (rawData) {
    var strippedHtml = strip(rawData);
    var mainChunk;

    try {
        mainChunk = strippedHtml.match(mainChunkRe)[1];
    } catch(e) {
        currentId++;
        getNext();
        return;
    }

    var cleanedData = mainChunk
    .replace(/\n+/g, '\n')
    .replace(/^\s*\n/gm, '\n')
    .replace(/\s{2,}/g, '|')
    .replace(/\s*\n\s*/g, '|');
    console.log(cleanedData);
    // var dataCells = cleanedData.split('|');
    // console.log(dataCells.length, dataCells);

    var data = {
        'id': currentId,
        'name': cdAttr(cleanedData, 'Name'),
        'desc': cleanedData.split('|')[1],
        'class': cdAttr(cleanedData, 'Class'),
        'hull': cdAttr(cleanedData, 'Hull'),
        'range': cdAttr(cleanedData, 'Range'),
        'build-rate': cdAttr(cleanedData, '1 turn produces', ''),
        'power': cdAttr(cleanedData, 'Power rating'),
        'no-defend': !!cdAttr(cleanedData, 'No defense', ''),
        'no-return-fire': !!cdAttr(cleanedData, 'No retaliation', ''),
        'damage-energy': cdAttr(cleanedData, 'Energy Damage'),
        'damage-kinetic': cdAttr(cleanedData, 'Kinetic Damage'),
        'damage-missile': cdAttr(cleanedData, 'Missile Damage'),
        'damage-chemical': cdAttr(cleanedData, 'Chemical Damage'),
        'shields-energy': cdAttr(cleanedData, 'Energy Shield', '\\|?') || 0,
        'shields-kinetic': cdAttr(cleanedData, 'Absorption Shield', '\\|?') || 0,
        'shields-missile': cdAttr(cleanedData, 'ECM', '\\|?') || 0,
        'shields-chemical': cdAttr(cleanedData, 'Ionized Hull', '\\|?') || 0,
        'cost-upkeep': cdAttr(cleanedData, 'Upkeep'),
        'cost-credits': cdAttr(cleanedData, 'Cost per unit'),
        'cost-terran-metal': cdAttr(cleanedData, 'Terran Metal'),
        'cost-red-crystal': cdAttr(cleanedData, 'Red Crystal'),
        'cost-white-crystal':cdAttr(cleanedData, 'White Crystal'),
        'cost-rutile': cdAttr(cleanedData, 'Rutile'),
        'cost-composite': cdAttr(cleanedData, 'Composite'),
        'cost-strafez-organism': cdAttr(cleanedData, 'Strafez Organism')
    };

    console.log(JSON.stringify(data, null, '    '));

    if (!data.name) {
        return;
    }

    shipData[currentId] = data;

    currentId++;
    getNext();
}

function getNext () {
    if (window.STOP === true || currentId > 300) {
        return;
    }
    var url = baseUrl + currentId;
    setTimeout(get, 300, url, processData);
}

getNext();
