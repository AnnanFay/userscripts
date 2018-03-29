// In dark galaxies will display stars no longer
//    in scanning range if they are in the cache.
// REQUIRES all_cache module

mods.push(function remember_stars(universe) {
  var gn = NeptunesPride.gameNumber;
  var key = 'all_cache:' + gn;

  over(universe,'addGalaxy', function self(galaxy) {
    // merge everything in the cache but only extract the stars
    var all = store.get(key) || {};
    console.log('remember_stars:all', key, all);
    console.log('remember_stars:galaxy', galaxy);

    all[galaxy.tick] = galaxy; // ensure we have current galaxy.
    console.log('remember_stars:new all', all);

    var sorted = _.sortBy(all);
    console.log('remember_stars:sorted', sorted);
    var mall = _.merge.apply(null, sorted);
    console.log('remember_stars:mall', mall);

    galaxy.stars = mall.stars;
    return self.super(galaxy);
  });
});
