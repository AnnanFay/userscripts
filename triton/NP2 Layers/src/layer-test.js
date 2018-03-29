
// wrapper around new metric vis funcitonality
function testLayerA (ctx, globalData, map, options) {
  globalData.map = map;

  var metric = metrics.science;
  var vis = visualisations.voronoi;

  var universe = globalData.universe;
  var stars = _.toArray(universe.galaxy.stars);

  var points = [];
  if (~metric.scope.indexOf('star')) {
    points = [].concat(points, stars);
  }
  if (~metric.scope.indexOf('fleet')) {
    // TODO:
  }
  if (~metric.scope.indexOf('empire')) {
    // TODO:
  }

  console.log('points', points);

  var dataPoints = [];
  for (var i = 0, l = points.length; i < l; i++) {
    var dataPoint = points[i];
    var values =
    dataPoints.push({
      o: dataPoint,
      x: dataPoint.x,
      y: dataPoint.y,
      v: metric.metric(dataPoint)
    });
  }


  console.log('dataPoints', dataPoints);
  console.log('vis', vis.name);

  options = _.merge({}, vis.defaults, options || {});
  options.fill = true;

  return vis.vis(ctx, globalData, dataPoints, options);
}
