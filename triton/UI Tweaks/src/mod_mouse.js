map_mods.push(function mouse_changes(npui, map) {
    map.onMouseUp = function (event) {
      map.dragging = false;

      // get the global position of the map
      var gx = map.ui.offset().left;
      var gy = map.ui.offset().top;

      var event_kind = "map_clicked";
      if (event.which === 2) {
        event_kind = "map_middle_clicked";
      }

      npui.ui.trigger(event_kind, {
        x: (event.pageX - map.sx - gx) / map.scale,
        y: (event.pageY - map.sy - gy) / map.scale,
        originalEvent: event,
      });
    };

    map.onMouseDown = function (event) {
      if (map.ignoreMouseEvents) return;

      if (event.target !== map.canvas[0]) {
        return;
      }

      // get the global position of the map
      var gx = map.ui.offset().left;
      var gy = map.ui.offset().top;

      var event_kind;
      if (event.which === 1) {
        event_kind = "map_clicked";
      } else if (event.which === 2) {
        event_kind = "map_middle_clicked";
      } else {
        event_kind = "map_clicked";
        map.dragging = true;
        map.oldX = event.pageX - map.x;
        map.oldY = event.pageY - map.y;
        map.one("mouseup", map.onMouseUp);
      }

      npui.ui.trigger(event_kind, {
        x: (event.pageX - map.sx - gx) / map.scale,
        y: (event.pageY - map.sy - gy) / map.scale,
        originalEvent: event,
      });
      event.preventDefault();
      return false;
    };

    // map.on("mousedown", map.onMouseDown);
    replaceWidgetHandlers(map, 'mousedown', map.onMouseDown);

    map.canvas[0].addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });
});
