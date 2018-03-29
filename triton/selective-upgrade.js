var u = NeptunesPride.universe;
var stars = u.galaxy.stars;

var t = 'industry';

if (t === 'economy') {
  var upType = 'economy';
  var upTypeUpper = 'Economy';
  var costLim = 1;
  var costLim2 = 42;
  var costType = 'uce';
  var requireGate = true;
}
if (t === 'industry') {
  var upType = 'industry';
  var upTypeUpper = 'Industry';
  var costLim = 1;
  var costLim2 = 65;
  var costType = 'uci';
  var requireGate = false;
}
if (t === 'science') {
  var upType = 'science';
  var upTypeUpper = 'Science';
  var costLim = 1;
  var costLim2 = 50;
  var costType = 'ucs';
  var requireGate = false;
}


var us = _.filter(stars, function(s){
  return s.player === u.player && (!requireGate || s.ga) && s[costType] >= costLim && s[costType] <= costLim2 && s.e > 0 && s.n[0] !== '_';
});
_.each(us, function(star) {
  NeptunesPride.np.trigger("server_request", {
    type: "batched_order",
    order: "upgrade_"+upType+"," + star.uid + "," + star[costType]});
  u.selectedStar = star;
  u['upgrade'+upTypeUpper]();
});
console.log(us.length);
us


// NeptunesPride.np.trigger("server_request", {
//   // type: "batched_order",
//   type: "order",
//   order: "share_tech," +23 + "," + 'manufacturing'
// });