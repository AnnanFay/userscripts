
mods.push(function install_npui_mods(np, npui) {


  var eventSubtypes = {
    'c': 'Combat',
    'o': 'Other'
  };
  var filter = 'o';

  var originalHeader = npui.InboxEventHeader;
  npui.InboxEventHeader = function () {
    var header = originalHeader.apply(this, arguments);
    Crux.DropDown(filter, eventSubtypes, 'change_event_subtype')
      .grid(10, 0, 10, 3)
      .roost(header);
    return header;
  };

  np.on('change_event_subtype', function (e, d) {
    filter = d;
    np.trigger('show_screen', 'inbox');
  });

  var originalInboxRowEvent = npui.InboxRowEvent;
  npui.InboxRowEvent = function (message, _args) {
    var row = originalInboxRowEvent.apply(this, arguments);
    var subtype = message.payload.template.indexOf('combat') === -1 ? 'o' : 'c';

    if (filter != subtype) {
      row.hide();
    }
    return row;
  };
});
