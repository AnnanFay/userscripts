

function travelTimeLayer(ctx, data, map) {
  var options = {
    alpha: 0.6,
    lineWidthMultiplier: 2,
    lineDashPattern: [1, 2],
    stroke: false,
    fill: true,
    borderCondition: function (source, target) {
      // return source.n || target.n;
      return !source.n ^ !target.n || source.player || target.player;
    },
    styleModifier: function (style, source, target) {
      style.color = d3.lab(style.color).brighter(9).toString();
      return style;
    }
  };
  return voronoiLayer(ctx, data, map, options);
}
