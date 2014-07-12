// ==UserScript==
// @name        Nevry
// @description High level bot management API
// @namespace   https://github.com/AnnanFay
// @include     http*://gateway.playneverwinter.com*
// @version     1
// @require     http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.js
// @grant       none
// ==/UserScript==

// Scripts using this should @require lodash BEFORE this library. This library should NOT be installed by end-users.

/* globals $, unsafeWindow, _, client */
(function () {
  "strict true";

  /////////////////////
  // INTERNAL FUNCTIONS
  /////////////////////

  function str(f) {
    //usage: var foo = str(function () {/*! */ });
    return f.toString()
      .replace(/^[^\/]+\/\*!?/, '')
      .replace(/\*\/[^\/]+$/, '');
  }

  function log(level) {
    if (nevry.DEBUG) {
      var now = new Date();
      var dateString = now.getHours() + ':' //
        + now.getMinutes() + ':' //
        + now.getSeconds() + ' || ';

      Array.prototype.splice.call(arguments, 0, 1, dateString)
      console[level].apply(console, arguments);
    }
  }

  ///////////////
  // EXTERNAL API
  ///////////////
  var nevry = window.nevry = unsafeWindow.nevry = {};

  nevry.addCss = function addCss(css) {
    $("<style type='text/css'></style>")
      .html(css)
      .appendTo("head");
  }

  nevry.DEBUG = false;
  nevry.log = _.partial(log, 'log')
  nevry.err = _.partial(log, 'error')

  nevry.when = function when(pred, f) {
    // KISS!
    try {
      var v = pred();
    } catch (e) {}
    v ? f() : setTimeout(when, 200, pred, f);
  };

  /*
  what is a goal?
    Goals are processes which require multiple
      interactions with NW client API.
    Backgrond processes can continue.
    Goals should be pausable?

  what is the correct granularity?
    Probably time dependent. Goals should take 5 minutes or less.
    Should try to prevent too much switching.

  Examples:
    LOW:
      SCA - Choose die
      PRO - Finish task
      AUC - Update bid on single auction OR check bid status
    MID:
      SCA - Finish encounter
      PRO - Finish task and start new task (with resources + etc)
      AUC - Check bid status and Update bids on all auctions???
    HIGH:
      SCA - Finish quest
      PRO - Finish and start tasks for all slots
      AUC -

    Structure / format

    Goals should have priority attribute and callbacks.

  */

  /*
  Usage:

  function doSomethingElse (goal) {
    // foo, bar, baz
    nevry.done();
  }

  function doSomething (goal) {
    // foo, bar, baz
    goal.next = doSomethingElse;
    nevry.pause();
  }

  var goal = {
    priority: 1,
    next: doSomething
  };

  nevry.addGoal(goal)

  */

  var goals = nevry.goals = [];
  var currentGoal = null;

  // To change goal priority add a new goal then remove old goal.
  nevry.addGoal = function addGoal(goal) {
    var insertIndex = _.sortedIndex(goals, goal, 'priority');
    goals.splice(insertIndex, 0, goal);
    nevry.next();
  }

  // called to allow other goals to take control
  nevry.pause = function pause() {
    currentGoal = null;
    nevry.next();
  }

  // called when a goal is finished
  // or otherwise removed
  nevry.done = function done(goal) {
    goals.splice(goals.indexOf(goal), 1);
    if (goal === currentGoal) {
      currentGoal = null;
    }
    nevry.next();
  }

  // safe to call whenever
  nevry.next = function next() {
    if (!currentGoal && goals.length) {
      currentGoal = goals[0];
    }
    if (currentGoal) {
      setTimeout(currentGoal.next, 0, currentGoal);
    }
  }

  nevry.kill = function kill() {
    while (goals.length) goals.pop();
    var currentGoal = null;
  }
})();
