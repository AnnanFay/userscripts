

function noteLayer(ctx, data, map) {
  var universe = data.universe;
  var notes = universe.interfaceSettings.notes;
  if (!notes) {
    notes = [
      {
        x: -1,
        y: 4.24,
        text: 'Hello world!'
      }
    ];
  }

  ctx.fillStyle = 'white';
  function drawNote (note) {
    log('drawing note', arguments);
    var point = pointToScreen(ctx, note);
    ctx.fillText(note.text, point[0], point[1]);

  }

  _.forEach(notes, drawNote);
  return ctx;
}
