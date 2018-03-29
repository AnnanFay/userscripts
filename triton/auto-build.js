// every full universe event check the current
// production and build if it's a new one
javascript:void(NeptunesPride.np.on('order:full_universe', (function(tech) {
  var u = NeptunesPride.universe;
  var pr = u.galaxy.production_rate;
  var initProd = Math.floor(u.galaxy.tick / pr);
  var s = u.selectedStar;

  // better to fail sooner than later
  if (!s || !u.player || s.player !== u.player) {
    throw Exception('input error');
  }
  var finished = false;

  return function check(){
    if (finished) return;
    var p = u.player;
    var prod = Math.floor(u.galaxy.tick / pr);
    // if next production and star is still owned by player
    if (prod === initProd + 1 && p === s.player) {
      Crux.crux.trigger('star_dir_upgrade_'+ tech, s.uid)
    }
    finished = true;
  };
})('s'))); // tech is 'i', 's' or 'e'
