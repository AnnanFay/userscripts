var _ = require('lodash');
var lots = require('./common-companion-lots.json');

// 'date-hour' keys
var hours = {};

function pad2(n) {
  return (n < 10 ? '0' : '') + n;
}

var rwlots = _(lots).filter(function (l) {
  return l.numbids > 0 && l.slots[0].itemdef != '@ItemDef[Pet_Dog_Skeleton]';
});

rwlots.forEach(function (lot, i) {
  var time = new Date(lot.creationtime);

  var k = pad2(time.getDate()); // + ', ' + pad2(time.getHours());
  var h = hours[k] || {
    min: Infinity,
    max: 0
  };

  h.min = Math.min(lot.currentbid, h.min);
  h.max = Math.max(lot.currentbid, h.max);

  hours[k] = h;
});

var hours = _(hours).map(function (rec, time) {
  return [time, rec.min, rec.max];
}).sortBy(0).value();

//console.log(hours);
console.log(rwlots.sortBy('currentbid').map(function (l) {
  return [l.ownerhandle, l.numbids, l.currentbid]
}).value());

// console.log(_.filter(lots, {
//   ownerhandle: 'cara9630'
// }))