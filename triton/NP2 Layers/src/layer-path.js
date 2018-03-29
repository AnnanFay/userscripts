
function pathLayer(ctx, data, map) {
  var universe = data.universe;
  var stars = universe.galaxy.stars;

  ctx.lineWidth = 1 * map.pixelRatio;

  var currentPropulsion = 3 + (universe.player ? universe.player.tech.propulsion.level : 1);
  var currentMovementRange = currentPropulsion * du;
  var next_prop_dist = currentPropulsion * du;
  // var next_prop_dist = (currentPropulsion + 1) * du;
  var ignore_prop_dist = (currentPropulsion - 2) * du;

  var scurrentPropulsion = square(currentMovementRange);
  var shalfdist = square(currentMovementRange / 2);
  var snext_prop = square(next_prop_dist);
  var signore_prop = square(ignore_prop_dist);

  var done = []; // efficiency hack because stars is an object.

  // TODO: Make more efficient. This is basically collision detection.
  var lines = [];
  for (var i in stars) {
    if (stars.hasOwnProperty(i)) {
      var starA = stars[i];
      done[i] = true;


      // for (var j in stars) {
      //   var starB = stars[j];
      //   // discard via: identity, already done and bounding box
      //   if (starA === starB || done[j] || Math.abs(starA.x - starB.x) > next_prop_dist || Math.abs(starA.y - starB.y) > next_prop_dist) {
      //     continue;
      //   }



      // // 0.7 radious internal bounding box???

      //   var dist2 = Math.pow(starA.x - starB.x, 2) + Math.pow(starA.y - starB.y, 2);
      //   // If the stars are too far apart or too close go to next star pair.
      //   // We don't want to draw short paths, doing that makes lots of noise.
      //   if (dist2 > snext_prop){// || dist2 < signore_prop) {
      //     continue;
      //   }

      //   var easy = (dist2 <= scurrentPropulsion);
      //   var warped = easy && starA.ga && starB.ga;
      //   var ss; // = "rgba(255,255,255,1)";

      //   if (warped) {
      //     ss = "rgba(100, 255, 100, 0.6)";
      //   } else if (easy) {
      //     ss = "rgba(255, 255, 255, 0.3)";
      //   } else {
      //     ss = "rgba(255, 100, 100, 0.1)";
      //   }
      //   drawLine(ctx, starA, starB, ss);
      // }

      var neighbours = getStarNeighbours(stars, starA, next_prop_dist);
      // var neighbours = getQuadtreeNeighbours(quadtree, star, next_prop_dist);
      var pow = Math.pow;
      for (var j = 0, jl = neighbours.length; j < jl; j++) {
        var starB = neighbours[j];
        var dist2 = pow(starA.x - starB.x, 2) + pow(starA.y - starB.y, 2);
        var easy = (dist2 <= scurrentPropulsion);
        var warped = easy && starA.ga && starB.ga;
        var efficient = easy &&
            dist2 > shalfdist &&
            Math.sqrt(dist2) % du > (du * 0.75);
        var ss;
        // var ss = "rgba(255,255,255,1)";

        //if (!efficient) continue;

        // var lccA = starPositionUtilityHeuristic(stars, starA, currentMovementRange);
        // var lccB = starPositionUtilityHeuristic(stars, starB, currentMovementRange);
        // var lccModifier = (lccA + lccB);
        // var alpha = lccModifier * 0.3; // max alpha is 0.6


        // if (warped) {
        //   ss = 'rgba(100, 255, 100, '+alpha+')';
        // } else if (easy) {
        //   ss = 'rgba(255, 255, 255, '+alpha+')';
        // } else {
        //   ss = 'rgba(255, 100, 100, '+alpha+')';
        // }

        // if (warped) {
        //   ss = 'rgba(100, 255, 100, ' + 0.6 + ')';
        // } else
        if (efficient) {
          ss = 'rgba(100, 200, 50, ' + 1 + ')';
        } else if (easy) {
          ss = 'rgba(255, 255, 255, ' + 0.5 + ')';
        } else {
          ss = 'rgba(255, 100, 100, ' + 0.2 + ')';
        }

        // drawLine(ctx, starA, starB, ss);
        lines.push([starA.x, starA.y, starB.x, starB.y, ss]);
      }
    }
  }
  batchDrawLines(ctx, lines);
  return ctx;
}
