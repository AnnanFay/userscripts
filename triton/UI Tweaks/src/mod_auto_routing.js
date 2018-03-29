
mods.push(function install_npui_mods(np, npui, universe) {

  over(np, 'onMapClicked', function self(event, data) {
    if (universe.editMode !== "edit_waypoints") {
      return self.super(event, data);
    }

    var originalEvent = data.originalEvent;
    var ignoreGates;

    if (originalEvent.ctrlKey) {
      ignoreGates = true;
    }

    var ps = universe.seekSelection(data.x, data.y);

    if (!ps.length) {
      return self.super(event, data);
    }

    var clickedWaypoints = _.intersection(ps, universe.waypoints);

    var fleet = universe.selectedFleet;
    if (clickedWaypoints[0] === fleet.orbiting) {
      return self.super(event, data);
    }

    if (!alwaysRoute && clickedWaypoints.length) {
      return self.super(event, data);
    }

    var goal = ps[0];

    routeFleet(fleet, goal, ignoreGates);
  });

  replace_widget_handlers(np, 'map_clicked', np.onMapClicked);


});
