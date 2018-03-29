var _ = require('lodash');
var encs = require('./encs-vai-new.json');

var log = console.log;

var freqs = {};
var detail = {};

//SO: Tim Down
function arraysIdentical(a, b) {
  var i = a.length;
  if (i != b.length) return false;
  while (i--) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

function trialsPowerVector(trials) {
  return _(_(trials)
      .map('needs')
      .reduce(function (acc, trial) {
        return _.merge(acc, trial, function (a, b) {
          return b.count + (a && a.count || 0);
        });
      }, {
        c: 0,
        m: 0,
        p: 0,
        t: 0
      }))
    .pairs()
    .sortBy(0)
    .map(1)
    .value();
}


_.forEach(encs, function (res, i) {
  var char = res.character;
  var outcome = res.result;
  var enc = res.encounter;
  // var dice = res.dice;
  var trials = (enc.challenge || enc).trials;
  var encDef = _.map(trials, 'def');

  var tpv = trialsPowerVector(trials);

  // group by
  // var code = encDef.join('|');
  // var code = tpv.join(',');
  // var code = encDef.join('|') + char + i;
  var code = char.id + '@L' + char.level;
  //var code = 'all';

  freqs[code] = (freqs[code] || 0) + 1;

  if (!detail[code]) {
    detail[code] = {
      //pow: tpv,
      //spe: tpv[1] + tpv[2] + tpv[3],
      //def: encDef.join('|'),
      char: char.name + '@L' + char.level
    };
  }

  detail[code].freq = (detail[code].freq || 0) + 1;
  if (outcome === 'win') {
    detail[code].wins = (detail[code].wins || 0) + 1;
  } else {
    detail[code].losses = (detail[code].losses || 0) + 1;
  }
  detail[code].wRatio = (detail[code].wins || 0) / (detail[code].freq || 1);
});

var sortedFreqs = _(freqs).pairs().sortBy(1).value();
var sortedDetails = _.sortBy(detail, 'wRatio');

// var sig = [0, 2, 2, 2];
// var sd222 = _.filter(sortedDetails, function (d) {
//   return arraysIdentical(d.pow, sig);
// });

// var sig2 = '2t|2m,2p';

// var sd2g22 = _.filter(sortedDetails, function (d) {
//   return d.def === sig2;
// });


log(_(sortedDetails).map.pick('char', 'wRatio'));
// log(sd222);
// log(sd2g22);
