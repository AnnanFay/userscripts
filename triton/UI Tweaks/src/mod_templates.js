mods.push(function templateUpdates () {
  var templates = NeptunesPride.templates;
  var baseIInfo = '![[wastedCarriers]] : $[[cash]] -> $[[nextCash]] &nbsp;&nbsp;&nbsp;&nbsp; ';
  templates.inspector_info_player = baseIInfo + '[[currentProduction]]/[[ticksPerCycle]] [[nextProduction]]';
  templates.inspector_info_player_paused = baseIInfo + 'Paused';
  templates.ships_per_hour = 'This star builds [[sph]] ships [[tr]], [[sph2]] ships [[tr2]].';
  templates.ai = 'AI';
  templates.x_stars = '[[count]]★';
  templates.message_event_shared_technology_giver_new = "<em>[[creationTime]]</em><br>[[receiverColour]]<a onclick=\"Crux.crux.trigger('show_player_uid', '[[receiverUid]]' )\">[[receiverName]] --> <span class='txt_bold txt_em'>$[[price]]</span> | <b>[[level]] [[display_name]] </b></a>";
  templates.message_event_shared_technology_receiver_new = "<em>[[creationTime]]</em><br>[[giverColour]]<a onclick=\"Crux.crux.trigger('show_player_uid', '[[giverUid]]' )\">[[giverName]] <-- <span class='txt_warn_good'>$[[price]]</span> | <b>[[level]] [[display_name]]</b>.</a>";
  templates.message_event_tech_up = "<p>Breakthrough: <a onclick=\"Crux.crux.trigger('show_screen', 'tech')\"><b>[[tech_name]].</b></a></p>";
});
