mods.push(function shareTechDelay (np, universe) {
  np.onShareTech = function (event, data) {
    var targetPlayer = data.targetPlayer;
    var name = data.techName;
    var price = (targetPlayer.tech[name].level + 1) * universe.galaxy.trade_cost;
    if (universe.player.cash >= price) {
      targetPlayer.tech[name].level += 1;
      universe.player.cash -= price;
      setTimeout(function () {
        np.trigger("server_request", {
          // type: "batched_order",
          type: "order",
          order: "share_tech," + targetPlayer.uid + "," + name
        });
      }, 10000);

      universe.selectPlayer(targetPlayer);
      np.trigger("refresh_interface");
    }
  };
  replace_widget_handlers(np, 'share_tech', np.onShareTech);
});
