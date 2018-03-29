//random snippits


function getPath(o, path) {
  var os = [o];
  for (var i = 0; i < path.length; i++) {
    o = o[path[i]];
    os.push(o);
  }
  return os;
}

function wrap(f, pre, post) {
  if (!post) {
    post = pre;
    pre = undefined;
  }
  var w = function wrapped_function() {
    var args = arguments;
    if (pre) {
      args = pre(args);
      if (args === undefined) {
        return;
      }
    }
    var result = f.apply(this, args);
    if (!post) {
      return result;
    }
    return post(args, result);
  };
  w.prototype = f;

  return w;
}



function logFunctions(o) {
  walkCarefully(o, function (value, path) {
    if (path.length && typeof value == "function") {
      var os = getPath(this, path);
      debug(value, path, os)
      try {
        os[os.length - 2][path.length - 1] = wrap(value,
          function (args) {
            debug(path, args);
            return args
          }, nop);
      } catch (e) {}
    }
  });
}



function walk(o, f) {
  // bredth first
  // objects and arrays
  // all nodes
  // stop opening when f() != undefined
  var open = [{
    obj: o,
    path: []
  }];
  while (open.length) {
    var current = open.shift();

    for (var k in current.obj) {
      var value = current.obj[k];
      var path = current.path.concat(k);

      if (f.call(o, value, path) != undefined) continue;

      if (typeof value == "object" && value !== null || Array.isArray(value)) {
        open.push({
          obj: value,
          path: path
        });
      }
    }
  }
}

function walkCarefully(o, f) {
  // don't follow recursive links
  // FIXME: call f() on copies? only check objects?
  var mem = [];
  walk(o, function (value, path) {
    if (mem.indexOf(value) != -1) {
      return false;
    }
    mem.push(value);
    return f.call(this, value, path);
  });
}

function walkLeaves(o, f) {
  // only call on leaves
  walk(o, function (value, path) {
    if (!(typeof value == "object" && value !== null || Array.isArray(value))) {
      var r = f.call(this, value, path);
    }
  });
}



var contentHelpers = require("cryptic/client/contentHelpers");

contentHelpers.stencils["content-tt-sca-chooseparty-buttons"] = function (a, b, c, d) {
  var e = [];
  b(a, c, e, [{
    s: '\n<span class="chooseparty-buttons-hover-only">\n'
  }, {
    i: {
      t: ["cantrain"],
      e: "r[0]===1"
    },
    c: [{
      s: '<span>\n<span class="mobileOnly message alert-green">'
    }, {
      t: "SCA.R12n.38f1a558"
    }, {
      s: '</span>\n<div class="input-field button light">\n<div class="input-bg-left"></div>\n<div class="input-bg-mid"></div>\n<div class="input-bg-right"></div>\n<button data-url-silent="/adventures/starttraining/'
    }, {
      r: "id"
    }, {
      s: '">'
    }, {
      t: "SCA.B12g.117a8f3c"
    }, {
      s: "</button>\n</div>\n</span>"
    }]
  }, {
    s: "\n"
  }, {
    i: {
      t: ["cantrain", "level", "lastlevel", "istraining"],
      e: "r[0]===0 && r[1]<r[2] && r[3]===0"
    },
    c: [{
      s: '<span>\n<span class="mobileOnly message alert-disabled">'
    }, {
      t: "SCA.N29t.1442dfea"
    }, {
      s: '</span>\n<div class="input-field button light disabled" data-tt-text="Companion is not in an Active Companion Slot.">\n<div class="input-bg-left"></div>\n<div class="input-bg-mid"></div>\n<div class="input-bg-right"></div>\n<button>'
    }, {
      t: "SCA.B12g.117a8f3c"
    }, {
      s: "</button>\n</div>\n</span>"
    }]
  }, {
    s: "\n"
  }, {
    i: {
      t: ["canupgradequality"],
      e: "r[0]===1"
    },
    c: [{
      s: '<span>\n<span class="mobileOnly message alert-green">'
    }, {
      t: "SCA.U15e.5f277448"
    }, {
      s: '</span>\n<div class="input-field button light upgrade-quality">\n<div class="input-bg-left"></div>\n<div class="input-bg-mid"></div>\n<div class="input-bg-right"></div>\n<button data-url-silent="/adventures/upgradepet/'
    }, {
      r: ".id"
    }, {
      s: '" tt-text="'
    }, {
      r: ".upgradetext"
    }, {
      s: '"><img alt="" src="/tex/Currency_Icon_Tiny_Astral_Diamonds.png">'
    }, {
      t: "SCA.U13y.4c1b7035"
    }, {
      s: "</button>\n</div>\n</span>"
    }]
  }, {
    s: '\n</span>\n<span class="chooseparty-buttons-disabled-only">\n'
  }, {
    i: {
      t: ["istraining", "trainingrushcost"],
      e: "r[0]===1 && r[1]>0"
    },
    c: [{
      s: '<span>\n<span class="mobileOnly message alert-disabled">'
    }, {
      t: "SCA.I23n.216f895"
    }, {
      s: ' <span data-timer="'
    }, {
      r: ".trainingendtime"
    }, {
      s: '">'
    }, {
      t: "SCA.h8m.52308f60"
    }, {
      s: '</span></span>\n<div class="input-field button light">\n<div class="input-bg-left"></div>\n<div class="input-bg-mid"></div>\n<div class="input-bg-right"></div>\n<button data-url-silent="/adventures/rushtraining/'
    }, {
      r: "id"
    }, {
      s: '"><img alt="" src="/tex/Currency_Icon_Tiny_Astral_Diamonds.png">'
    }, {
      t: "SCA.R11g.4bf308c7"
    }, {
      s: "</button>\n</div>\n</span>"
    }]
  }, {
    s: "\n"
  }, {
    i: {
      t: ["stamina", "$root().gatewaygamedata.quest.stamina", "selected", "istraining"],
      e: "r[0]<r[1] && !r[2] && !r[3]"
    },
    c: [{
      s: "<span>\n"
    }, {
      i: {
        t: ["maxstamina", "$root().gatewaygamedata.quest.stamina"],
        e: "r[0]>=r[1]"
      },
      c: [{
        s: '<span>\n<span class="mobileOnly message alert-red">'
      }, {
        t: "SCA.N16a.24eb49a9"
      }, {
        s: '</span>\n<div class="input-field button light">\n<div class="input-bg-left"></div>\n<div class="input-bg-mid"></div>\n<div class="input-bg-right"></div>\n'
      }, {
        i: {
          t: ["$root().gatewaygamedata.currencies.staminafill"],
          e: "r[0]>0"
        },
        c: [{
          s: '<button data-url-silent="/adventures/usestamina/'
        }, {
          r: "id"
        }, {
          s: '">'
        }, {
          t: "SCA.U16l.4c90967a"
        }, {
          s: "</button>"
        }]
      }, {
        s: "\n"
      }, {
        i: {
          t: ["999999"],
          //t: ["$root().gatewaygamedata.currencies.staminafill"],
          e: "r[0]<=0"
        },
        c: [{
          s: '<button data-url-silent="/adventures/buystamina/'
        }, {
          r: "id"
        }, {
          s: '"><img alt="" src="/tex/Currency_Icon_Tiny_Cryptic.png"> '
        }, {
          t: "SCA.R12a.953a061"
        }, {
          s: "</button>"
        }]
      }, {
        s: "\n</div>\n</span>"
      }]
    }, {
      s: "\n"
    }, {
      i: {
        t: ["maxstamina", "$root().gatewaygamedata.quest.stamina"],
        e: "r[0]<r[1]"
      },
      c: [{
        s: '<span>\n<span class="mobileOnly message alert-disabled">'
      }, {
        t: "SCA.M25h.d323c89"
      }, {
        s: '</span>\n<div class="input-field button light disabled" data-tt-text="Max stamina not high enough.">\n<div class="input-bg-left"></div>\n<div class="input-bg-mid"></div>\n<div class="input-bg-right"></div>\n<button><img alt="" src="/tex/Currency_Icon_Tiny_Cryptic_Disabled.png"> '
      }, {
        t: "SCA.R12a.953a061"
      }, {
        s: "</button>\n</div>\n</span>"
      }]
    }, {
      s: "\n</span>"
    }]
  }, {
    s: "\n</span>\n"
  }], function (a) {
    d(a, e)
  })
}
