// variables we can use in visualisations
// each variable is specific to stars, fleets, clusters or empires.

var metrics = {
  // 'key': {
  //   name: 'Long Name',
  //   desc: 'Help text if not obvious.',
  //   scope: 'empire/star/fleet/cluster',
  //   metric: function(empire/star/fleet/cluster){
  //     return 0;
  //   }
  // },
  'science': {
    name: 'Science',
    desc: '',
    scope: 'star',
    metric: function (star, data) {
      return star.s;
    }
  },
  'borderish': {
    name: 'Borderish',
    desc: 'How close to border',
    scope: 'star',
    metric: function (star, data) {
      // distance to nearest enemy star
      // calculate travel time taking into account warp and pathing

      var stars = data.all_stars;
      var enemy_stars = filter(stars);
      var nearest_enemy = nearest_neighbour(star, enemy_stars);
      // var distance_to = distance(nearest_enemy, star);
      var route = routing(nearest_enemy, star);
      var distance = route_length(route);
      return distance;
    }
  },
  'ship-latency': {
    name: 'Ship Latency',
    desc: '',
    scope: 'star',
    metric: function (star, data) {
      // for star in stars:
      //     paths = filter(carriers, pickup-this-star)
      //     latencies = []
      //     for path in paths:
      //         our-path-segment = current-star to first drop off after star
      //         path-latency = distance(our-path-segment)
      //         latencies.push(path-latency)

      //     latency = average(latencies)


    }
  }
};
