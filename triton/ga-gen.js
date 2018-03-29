var _ = require('lodash');

var width = 100;
var height = 100;
var pow = Math.pow;
var sqrt = Math.sqrt;

function randInt (min, max) {
  if (!max) {
    max = min;
    min = 0;
  }
  return Math.floor(min + (Math.random() * (max-min)));
}

function randPoint () {
  return [randInt(0, width), randInt(0, height)]
}

function range (n, f) {
  var l = [];
  while (n--) {
    l[n] = f ? f(n) : n;
  }
  return l;
}

function combinations (l, n) {
  var ls = l.length;
  var cl = Math.pow(ls, n);
  var c = Array(cl);
  for (var i = 0; i < ls; i++) {
    for (var j = 0; j < ls; j++) {
      c[i * ls + j] = [l[i], l[j]];
    }
  }
  return c;
}

function actions (paths, visited, node) {
  var as = [];
  for (var i = 0, l = paths.length; i < l; i++) {
    var p = paths[i];
    // console.log('p, node', p, node, p[0] === node,!visited[p[1]],p[1] !== node);
    if (p[0] === node && !visited[p[1]] && p[1] !== node) {
      as.push(p);
    }
  }
  return as.length ? as : undefined;
}

function distance (a, b) {
  return sqrt(
    pow(a[0] - b[0], 2),
    pow(a[1] - b[1], 2)
  );
}

function tourLength (nodes, tour) {
  if (!tour.length) {
    return 0;
  }

  var d = 0;
  for (var i = 0, l = tour.length; i + 1 < l; i++) {
    var a = nodes[tour[i]];
    var b = nodes[tour[i + 1]];
    var dist = distance(a, b);
    // console.log('abd', a, b, dist, d);
    d += dist;
  }
  return d;
}


function randomSolve (nodes, edges, start) {
  var visited = [];
  var tour = [];
  var current = start;
  var acs;

  while (acs = actions(edges, visited, current)) {
    // console.log('_solve.actions', current, acs);
    var choice = randInt(acs.length - 1);
    var action = acs[choice];
    // console.log('_solve.action', action);

    tour.push(current);
    visited[current] = true;
    current = action[1];
  }

  return tour;
}

function sum (s, key) {
  var x = 0;
  for (var i = 0, l = s.length; i < l; i++) {
    x += key !== undefined ? s[i][key] : s[i];
  }
  return x;
}

// keys "x-y", vals [fitness, accuracy]
// here fitness is a running mean
// and acuracy is number of samples
var edgeFitness = {

};

function getActionFitness (action) {
  var key = action.join('-');
  var fitness = edgeFitness[key];
  if (fitness) {
    return fitness;
  }
  return (edgeFitness[key] = [1, 0]);
}

function updateEdgeFitnesses (edges, globalFitness) {
  // console.log('updateEdgeFitness', edges, globalFitness);
  _.each(edges, function(edge) {
    var key = edge.join('-');
    var value = edgeFitness[key][0];
    var count = edgeFitness[key][1];
    var newCount = count + 1;
    var newValue;

    // running mean
    // var newValue = ((value * count) + globalFitness) / newCount;
    // min
    if (value === 1) {
      newValue = globalFitness;
      } else {
      newValue = Math.min(value, globalFitness);
    }

    edgeFitness[key] = [newValue, newCount];
  });
}

function randWeightedAction (actions) {
  var actionCount = actions.length;
  var weights = _.map(actions, getActionFitness);
  var shortWeights = _.map(weights, function(w) { return 1 / (w[0] * w[0]); })
  var weightSum = sum(shortWeights);

  // console.log('actions', actions);
  // console.log('actionCount', actionCount);
  // console.log('weights', weights);
  // console.log('weightSum', weightSum);

  var r = Math.random();
  var cw = 0;
  // console.log('r:', r);

  for (var i = 0; i < actionCount; i++) {
    cw += shortWeights[i] / weightSum;
    // console.log('looking - i, weight, ac, cw:', i, weights[i], actions[i], cw);
    if (cw > r) {
      // console.log('    !!!chose: ', i);
      return actions[i];
    }
  }
  console.log('fail - r, cw: ', r, cw);
  return undefined;
}


// action and edge are roughly synonyms
function stochasticSolve (nodes, edges, start) {
  var visited = [];
  var tour = [];
  var tourEdges = [];
  var current = start;
  var availableActions;

  // while we have possible actions
  while (availableActions = actions(edges, visited, current)) {
    visited[current] = true;

    var action = randWeightedAction(availableActions);

    tour.push(current); // also action[0]
    tourEdges.push(action);

    current = action[1];
  }

  var tl = tourLength(nodes, tour);

  updateEdgeFitnesses(tourEdges, tl);

  return tour;
}

var solve = stochasticSolve;

function solveRandom (iter, verbose, problemSize) {
  var nodes = range(problemSize, randPoint);
  verbose && console.log('problem:', nodes);

  var edges = combinations(range(problemSize), 2);
  verbose && console.log('pathes:', edges);

  // IMPORTANT!
  // references to nodes and edges will be indices!
  var start = randInt(problemSize);
  verbose && console.log('start:', start);

  var tourLens = [];
  while (iter--) {
    var tour = solve(nodes, edges, start);

    var tourLen = tourLength(nodes, tour);
    tourLens.push(tourLen);

    verbose && console.log('solution:', tour);
    verbose && console.log('solution length:', tourLen);
  }

  return tourLens;
}

function rmean (s) {
  var means = [];
  var rm = 0;
  for (var i = 0, l = s.length; i < l; i++) {
    rm = ((rm * i) + s[i]) / (i + 1);
    means.push(rm);
  }
  return means;
}

function rmin (s) {
  var means = [];
  var rm = undefined;
  for (var i = 0, l = s.length; i < l; i++) {
    rm = !rm ? s[i] : Math.min(rm, s[i]);
    means.push(rm);
  }
  return means;
}

function main () {
  var verbose = true;
  var problems = 1;//1e2;
  var problemSize = 24;
  var iterations = 10000;
  while (problems--) {
    var tourLens = solveRandom(iterations, verbose, problemSize);

    console.log('tourLens min', Math.min.apply(null, tourLens));
    console.log('tourLens mean', sum(tourLens) / tourLens.length);
    console.log('tourLens max', Math.max.apply(null, tourLens));

    console.log('edgeFitness', edgeFitness);



    console.log('rmean tourLens', rmean(tourLens));
    console.log('rmin tourLens', rmin(tourLens));

    edgeFitness = {};
  }
}

main();
