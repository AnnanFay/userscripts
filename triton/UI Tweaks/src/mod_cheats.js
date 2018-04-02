mods.push(function avoidStarNameFilter(np) {
  np.validateFleetStarName = func(x=>x);
});

mods.push(function avoidPremiumNag(np) {
  np.testForNag = func(_=>{});
});

mods.push(function circumventAnonymity(NeptunesPride) {
  NeptunesPride.gameConfig.anonymity = 0;
});
