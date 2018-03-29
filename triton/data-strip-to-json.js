function strip(depth, o) {

  if (!_.isObject(o)) {
    return o;
  }

  // console.log(depth, o.n, o.kind);

  if (depth > 1 && 'uid' in o) {
    return o.uid;
  }
  if (depth > 1 && 'puid' in o) {
    return o.puid;
  }

  try {
    for (var k in o) {
      o[k] = strip(depth+1, o[k]);
    }
  } catch(e) {
    console.log(e);
  }
  return o;

}
var stars = _.toArray(NeptunesPride.universe.galaxy.stars);
var strippedStars = stars.map(_.partial(strip, 1));

var reducedData = strippedStars.map(function (s) {
  return {x:s.x, y:s.y, ih:s.home, h:s.homeplayer};
})






JSON.stringify(reducedData, null, 4);



var stars = NeptunesPride.universe.galaxy.stars;


for (var s in stars) {
  var star = stars[s];
  star.player = star.homeplayer;
  star.puid = star.homeplayer.uid;
  star.ga = (star.home === star);

}




NeptunesPride.npui.map.createSprites();
