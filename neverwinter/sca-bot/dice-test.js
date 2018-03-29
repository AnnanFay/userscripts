//
var gameSymbols = 'mptc';
var gameDice = {
  dragon: 'mptc2c3c',
  kossuthToken: 'mm3c3c',
  tempusToken: 'pp3c3c',
  lolthToken: 'tt3c3c',
  tyrToken: 'mmpp',
  oghmaToken: 'mmtt',
  sharToken: 'pptt'
};

var maxCount = 6;
//
// VECTOR ARITHMETIC
//
function vAdd(a, b) {
  var c = [];
  var l = Math.max(a.length, b.length);
  for (var i = 0; i < l; i++) {
    c[i] = (a[i] || 0) + (b[i] || 0);
  }
  return c;
}

function vDist(a, b) {
  var d = 0;
  var l = Math.max(a.length, b.length);
  for (var i = 0; i < l; i++) {
    d += Math.pow((a[i] || 0) - (b[i] || 0), 2);
  }
  return Math.sqrt(d);
}

function vLength(vec) {
  var d = 0;
  for (var i = 0; i < vec.length; i++) {
    d += Math.pow((vec[i] || 0), 2);
  }
  return Math.sqrt(d);
}

function vNorm(vec) {
  var d = vLength(vec);
  var v = [];
  for (var i = 0; i < vec.length; i++) {
    v[i] = vec[i] / d;
  }
  return v;
}

function vScale(vec, s) {
  var v = [];
  for (var i = 0; i < vec.length; i++) {
    v[i] = vec[i] * s;
  }
  return v;
}

function randomChallenge() {
  var trials = [];
  var trialCount = _.random(1, 3);

  while (trials.length < trialCount) {
    trials.push([
      _.random(0, maxCount),
      _.random(0, maxCount),
      _.random(0, maxCount),
      _.random(0, maxCount * 2)
    ]);
  }
  return trials;

}

function randomDice() {
  var dice = ['dragon', 'dragon', 'dragon', 'dragon', 'dragon', 'dragon'];
  var diceCount = _.random(1, 4);
  var dks = Object.keys(gameDice);
  var dki = _.partial(_.random, 1, dks.length - 1)
  for (var i = 0; i < diceCount; i++) {
    dice.push(dks[dki()]);
  }
  return dice;
}

var sideReg = /\d?[^\d]/ig;

function convDie(dieKey) {
  var die = gameDice[dieKey];
  var sides = die.match(sideReg);
  var v = [0, 0, 0, 0];
  for (var i in sides) {
    var side = sides[i];
    var cnt = (side.length === 1) ? 1 : parseInt(side[0]);
    var sym = side[(side.length === 1) ? 0 : 1];
    v[gameSymbols.indexOf(sym)] += (cnt / sides.length);
  }
  return v;
}

function convSide(side) {
  var v = [0, 0, 0, 0];
  var cnt = (side.length === 1) ? 1 : parseInt(side[0]);
  var sym = side[(side.length === 1) ? 0 : 1];
  v[gameSymbols.indexOf(sym)] = cnt;
  return v;
}


var challenge = randomChallenge();
var challengeD = _.reduce(challenge, vAdd, []);
console.log(challenge, 'total', challengeD);
console.log('challengeD', challengeD);

var currentDice = randomDice();
var currentDiceD = _(currentDice).map(convDie).reduce(vAdd, []);
console.log(currentDice, 'total', currentDiceD);

console.log('dist', vDist(vNorm(challengeD), vNorm(currentDiceD)));

rolls = _.map(currentDice, function (d) {
  return _.random(0, gameDice[d].match(sideReg).length - 1)
});

console.log('rolls', rolls);

for (var i = 0; i < rolls.length; i++) {
  var roll = rolls[i];
  var die = currentDice[i];
  var sides = gameDice[die].match(sideReg);
  var side = sides[roll];

  var change = convSide(side);

  console.log('change', challengeD, change);
  var challengeD = vAdd(challengeD, change);
  var currentDiceD = vAdd(currentDiceD, vScale(change, 1 / sides.length));

  console.log(currentDiceD);
  var score = vDist(vNorm(challengeD), vNorm(currentDiceD));

  console.log(
    'side', roll, 'on', sides, '-->', side,
    '--> score is ', score);

}
