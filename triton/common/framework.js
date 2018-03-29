/* globals unsafeWindow */
(function () {
  "strict true";

  // another mod has already run which uses this library so we don't need to do anything
  if (unsafeWindow.NP2M) {
    return;
  }

  var NP2M = {};

  var installed = false; // to be used so hooks are only installed if a mod registers
  var pre_code = 'NP2M.pre_init(Mousetrap, Crux, NeptunesPride);';
  var post_code = 'NP2M.post_init(Mousetrap, Crux, NeptunesPride,' +
      'typeof mgi !== \'undefined\' ? mgi : undefined, ' +
      'typeof mgic !== \'undefined\' ? mgic : undefined, ' +
      'typeof mg !== \'undefined\' ? mg : undefined);\n';
  var mods = [];
  var pre_inits = [];
  var post_inits = [];


  String.splice = function (str, idx, rem, s) {
    return (str.slice(0, idx) + s + str.slice(idx + Math.abs(rem)));
  };

  // hook into script loading and append a call to pre/post handlers before and after main jQuery.ready is called.

  function insert_script(content) {
    // install pre and post init hooks
    content = String.splice(content, content.indexOf('{') + 1, 0, pre_code);
    content = String.splice(content, content.lastIndexOf('});'), 0, post_code);

    var s = document.createElement('script');
    s.innerHTML = content;
    document.head.appendChild(s);
  }

  function beforescriptexecute_handler(e) {
    var content = e.target.innerHTML;
    if (content.indexOf('$(window).ready(function () {') === -1) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    unsafeWindow.removeEventListener('beforescriptexecute', beforescriptexecute_handler);

    insert_script(content);
  }

  function install_handler() {
    unsafeWindow.addEventListener('beforescriptexecute', beforescriptexecute_handler);
  }


  NP2M.register = function register(name, version, pre_init, post_init) {
    if (!installed) {
      install_handler();
      installed = true;
    }
    var mod = {
      name: name,
      version: version,
      pre: pre_init,
      post: post_init
    };
    mods.push(mod);
    pre_inits.push(pre_init);
    post_inits.push(post_init);
  };

  NP2M.pre_init = function pre_init() {
    for (var i = pre_inits.length - 1; i >= 0; i--) {
      pre_inits[i]();
    }
  };

  NP2M.post_init = function post_init(Mousetrap, Crux, NeptunesPride, mgi, mgic, mg) {
    var data = {
      "Mousetrap": Mousetrap,
      "Crux": Crux,
      "NeptunesPride": NeptunesPride,
      "universe": NeptunesPride.universe,
      "inbox": NeptunesPride.inbox,
      "npui": NeptunesPride.npui,
      "npuis": NeptunesPride.npuis,
      "np": NeptunesPride.np,
      "si": NeptunesPride.si,
      "mgi": mgi,
      "mgic": mgic,
      "mg": mg
    };
    for (var i = post_inits.length - 1; i >= 0; i--) {
        try {
            post_inits[i](data);
        } catch (e) {
            console.error('NPM2: post init failure: ', e);
        }
    }
  };

  /* TODO:
      more efficiently handly multiple wraps.

      Maybe change syntax to something like
          NP2M.pre(f, p)
          NP2M.post(f, p)
  */
  NP2M.wrap = function wrap(f, pre, post) {
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

    return w;
  };

  unsafeWindow.NP2M = NP2M;
})();
