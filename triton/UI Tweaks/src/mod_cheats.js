mods.push(function avoidStarNameFilter(np) {
  np.validateFleetStarName = function (x) {
    return x;
  };
});

mods.push(function avoidPremiumNag(np) {
  np.testForNag = function () {};
});

mods.push(function circumventAnonymity() {
  NeptunesPride.gameConfig.anonymity = 0;
});
