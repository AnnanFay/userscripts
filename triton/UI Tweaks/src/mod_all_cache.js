// caches every full universe update into the local cache.
// REQUIRES local_settings module.
mods.push(function all_cache(universe) {
  var gn = NeptunesPride.gameNumber;
  var key = 'all_cache:' + gn;

  over(universe,'addGalaxy', function self(galaxy) {

    var all = store.get(key) || {};
    all[galaxy.tick] = galaxy;
    store.set(key, all);

    return self.super(galaxy);
  });
});
