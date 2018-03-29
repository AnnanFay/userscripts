mods.push(function cruxMods(Crux) {

  Crux.Image = function (src, style) {
    var image = Crux.Widget();
    var alt;

    image.alt = function (altText) {
      alt = altText;
      altText = altText || 'You are a bad, bad, person!';
      image.ui.attr('alt', altText);
      image.ui.attr('title', altText);
      return image;
    };

    image.ui = jQuery(document.createElement('img'));
    if (style) {
      image.ui.addClass('widget ' + style);
    }
    image.ui.attr('src', src);

    return image;
  };


  Crux.Link = function (content, event, data, style) {
    var self = Crux.Widget();

    self.ui = $('<a></a>');
    self.ui.append(content);

    self.addStyle(style);

    self.onMouseDown = function (e) {
      log('Crux.Link mouse down');
      Crux.crux.trigger(event, data);
    };

    self.ui.on("mousedown", self.onMouseDown);

    return self;
  };

  Crux.Sprite = function (sprite, style) {
    // log('Crux.Sprite(', arguments, ')');
    style = style === undefined ? 'rel' : style;
    var self = Crux.Widget(style);
    self.sprite = sprite;

    var posX = -(sprite.spriteX + (sprite.width / 4)),
      posY = -(sprite.spriteY + (sprite.height / 4));

    self.ui.css({
      'visibility': sprite.visible ? 'visible' : 'hidden',
      'transform': 'rotate(' + sprite.rotation + 'rad) scale(' + sprite.scale + ')',
      'background-image': 'url(' + sprite.image.src + ')',
      'background-position': posX + 'px ' + posY + 'px',
      'width': (sprite.width / 2) + 'px',
      'height': (sprite.height / 2) + 'px'
    });

    self.scale = function (scaler) {

      self.ui.css({
        'transform': 'rotate(' + sprite.rotation + 'rad) scale(' + scaler + ')'
      });
      return self;
    };

    return self;
  };

  Crux.SpriteStack = function (sprites, style) {
    style = style === undefined ? 'rel' : style;
    var self = Crux.Widget(style);
    self.sprites = sprites;

    var s, maxWidth = 0,
      maxHeight = 0;
    for (var i = sprites.length - 1; i >= 0; i--) {
      s = sprites[i];
      if (s) {
        maxWidth = Math.max(maxWidth, s.width);
        maxHeight = Math.max(maxHeight, s.height);

        sprites[i] = Crux.Sprite(s, '')
          .grid(0, 0)
          .roost(self);
      }
    }

    self.size(maxWidth / 2, maxHeight / 2);

    self.scale = function (scaler) {
      for (var i = sprites.length - 1; i >= 0; i--) {
        if (sprites[i]) {
          if (scaler[i]) {
            sprites[i].scale(scaler[i]);
          } else {
            sprites[i].scale(scaler);
          }
        }
      }
      return self;
    };

    return self;
  };

  Crux.TableHeader = function (head) {

    // Create initial header from string only fields
    var thStrings = [];
    var h;
    for (var i = 0, l = head.length; i < l; i++) {
      h = head[i];
      thStrings.push(_.isString(h) ? h : '');
    }
    var thead = $('<thead><tr><th>' + thStrings.join("</th><th>") + '</th></tr></thead>');

    // Deal with complex headers
    var ths = $('th', thead);
    for (i = 0, l = head.length; i < l; i++) {
      h = head[i];
      if (!_.isString(h)) {
        if (h.ui) {
          h = h.ui;
        }
        $(ths[i])
          .append(h);
      }
    }

    return thead;
  };

  Crux.TableRow = function (data) {

    // Create initial row from string only fields
    var tdStrings = [];
    var cell, i, l;
    for (i = 0, l = data.length; i < l; i++) {
      cell = data[i];
      tdStrings.push(_.isString(cell) ? cell : '');
    }
    var row = $('<tr><td>' + tdStrings.join("</td><td>") + '</td></tr>');

    // Deal with complex fields
    var tds = $('td', row);
    for (i = 0, l = data.length; i < l; i++) {
      cell = data[i];
      if (!_.isString(cell)) {
        if (cell.ui) {
          cell = cell.ui;
        }
        $(tds[i])
          .append(cell);
      }
    }

    return row;
  };

  Crux.Table = function (head, data, extractor, style) {
    log('Crux.Table', arguments);
    var self = Crux.Widget('rel');

    var table = $('<table>')
      .addClass(style);

    table.append(Crux.TableHeader(head));

    var dataRows = [];
    _.each(data, function (d) {
      var row = Crux.TableRow(extractor(d));
      dataRows.push([d, row]);
      table.append(row);
    });

    self.ui.append(table);

    self.sort = function (sorter, reverse) {
      log('sorting table', arguments);
      // $('tbody > tr', table).detach();

      dataRows = _.sortBy(dataRows, function (dr, i) {
        return dr[0][sorter];
      });

      if (reverse) {
        dataRows.reverse();
      }
      _.each(dataRows, function (dr) {
        table.append(dr[1]);
      });
    };

    return self;
  };

  Crux.InlineButton = function (id, eventKind, eventData) {
    var self = Crux.Button(id, eventKind, eventData)
      .addStyle('rel');
    self.label.addStyle('rel');
    return self;
  };

});
