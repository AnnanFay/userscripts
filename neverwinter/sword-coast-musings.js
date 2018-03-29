"use strict";

Function.prototype.pounce = function (pred, interval, args__) {
  if (pred.call(this)) {
    return this.apply(null, Array.prototype.splice(arguments, 2));
  }
  interval = interval || 100;
  setTimeout(this.waitFor, interval, pred, interval);
}

client.scaProcessState = _.wrap(
  client.scaProcessState, function (f, args__) {
    // 
    if () {

    } else {
      f.call(this, args__);
    }
  });

function intercept(event, callback) {
  // when sca event happens execute callback instead
}


function init() {
  // DSL
  intercept('event', function () {

  })
}

init.pounce(function () {
  return window.client != undefined;
});