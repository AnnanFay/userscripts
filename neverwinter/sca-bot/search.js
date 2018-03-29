/*
how many possible states?
challenge = Sum(trials, (c+1) * (p+1) * (t+1) * (m+1))
[2t+2p+2m] => 9
dice = 2^count
[d,d,d,d,d,d,f,t] => 2^8
rolls = .....
challenges+dice+ =


*/

log = console.log;

Object.values = function (obj) {
  return Object.keys(obj).map(function (k) {
    return obj[k];
  });
}

function I(x) {
  return x;
}

// MDC
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var dragonDie = [
  ['c', 1],
  ['c', 2],
  ['c', 3],
  ['t', 1],
  ['p', 1],
  ['m', 1]
];

var tokenOghma = [
  ['m', 1],
  ['m', 1],
  ['t', 1],
  ['t', 1]
];

var favorOghma = [
  ['m', 1],
  ['m', 1],
  ['m', 2],
  ['t', 1],
  ['t', 1],
  ['t', 2],
];

var tokenLolth = [
  ['t', 1],
  ['t', 1],
  ['c', 3],
  ['c', 3]
];

var startState = {
  challenge: [{
    m: 2,
    t: 2
  }, {
    t: 2
  }],
  dice: [
    dragonDie, dragonDie, dragonDie,
    dragonDie, dragonDie, dragonDie,
    tokenLolth, favorOghma
  ],
  //  rolls: [0, 0, 0, 0, 0, 0],
  canRoll: false
};

startState.rolls = startState.dice.map(function (die) {
  return randInt(0, die.length - 1);
});

function randomStart() {
  var state = {
    challenge: [],
    dice: [
      dragonDie, dragonDie, dragonDie, dragonDie, dragonDie, dragonDie
    ],
    canRoll: false
  };
  state.rolls = startState.dice.map(function (die) {
    return randInt(0, die.length - 1);
  });

  // TODO: Balance overall difficulty
  // or USE ACTUAL DATA!!!
  var trialNumber = randInt(0, 3);
  for (var i = 0; i < trialNumber; i++) {
    state.challenge.push({
      m: randInt(1, 2),
      t: randInt(1, 2),
      p: randInt(1, 2),
      c: randInt(1, 6)
    });
  }
  return state;
}

function goalTest(state) {
  return !state.challenge.length;
}

function deadTest(state) {
  return !state.dice.length;
}

function getActions(state) {
  var actions = [];
  var trial = state.challenge[0];

  for (var i = state.dice.length - 1; i >= 0; i--) {
    var die = state.dice[i];
    var roll = die[state.rolls[i]];
    if (trial[roll[0]]) {
      actions.push(i);
    }
  }
  if (state.canRoll) {
    actions.push(-1);
  }
  if (!actions.length) {
    // discarding
    return Object.keys(state.dice);
  }
  return actions;
}

// MUTATES CURRENT STATE!
// ^ not a bug, yet.
// TODO: multiple actions per turn..... important!
function getNextState(currentState, action) {
  // when invalid
  var actions = getActions(currentState);
  if (!~actions.indexOf(action)) {
    return currentState;
  }
  var dice = currentState.dice;
  var trial = currentState.challenge[0];

  // if we can play all dice, and the first dice doesn't match trial
  // really ugly.... only needed for debugging. Better way?
  var discarding = (dice.length === actions.length) //
    && !trial[dice[0][currentState.rolls[0]][0]] //
    && !~actions.indexOf(-1);

  // log('challenge: ', currentState.challenge);
  // log('roll sides: ', currentState.rolls);
  // log('actions: ', discarding ? 'DISCARD' : 'PLAY', actions);

  if (action === -1) {
    currentState.canRoll = false;
    // log('action: rolling');

    // is current trial complete?
    if (!Object.values(trial).some(I)) {
      currentState.challenge.shift();
    }

    // roll remaining dice
    currentState.rolls = dice.map(function (die) {
      return randInt(0, die.length - 1);
    });

    // console.log(dice.map(function (die) {
    //   return die.length;
    // }));
    // console.log(currentState.rolls);

  } else {
    currentState.canRoll = true;

    var die = dice[action];
    var roll = die[currentState.rolls[action]];
    var rollSymbol = roll[0];
    var rollValue = roll[1];

    // log('action: ', action, '=>', roll);

    trial[rollSymbol] = Math.max((trial[rollSymbol] || 0) - rollValue, 0);
    // remove used dice
    if (dice.length > 1) {
      dice[action] = dice.pop();
      currentState.rolls[action] = currentState.rolls.pop();
    } else {
      dice.pop();
    }
  }

  // log();
  return currentState;
}

// random play

function randomAction(state) {
  var actions = getActions(state);
  return getNextState(state, actions[randInt(0, actions.length - 1)]);
}


function randomPlay(state) {
  // console.log('START PLAY');

  while (!goalTest(state) && !deadTest(state)) {
    var state = randomAction(state);
  }

  var end = goalTest(state);
  // log('END: ', end ? 'win' : 'loss');
  return end
}

function testAlgorithm(algorithm, startState, iterations) {
  var wins = 0;
  var losses = 0;

  while (iterations--) {
    // JSON 'clone' is actually quite fast
    var state = JSON.parse(JSON.stringify(startState));
    var result = algorithm(state);
    if (result) {
      wins++;
    } else {
      losses++;
    }
  }
  console.log('WINS:', wins);
  console.log('LOSSES:', losses);
}

function rawTrialToObj(trial) {
  return {};
}

function startStateFromRaw(rawEnc) {
  var trials = (rawEnc.challenge || rawEnc).trials;
}

var rawEncData = require('./losses-vai-new.json');

//startState = randomStart();
//startState = startStateFromRaw(rawEncData[0]);

// console.log('startState', startState);

testAlgorithm(randomPlay, startState, 1000000);
