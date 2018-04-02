/* globals unsafeWindow */
(function () {
  "strict true";

  // another mod has already run which uses this library so we don't need to do anything
  if (unsafeWindow.NP2M) {
    return;
  }

  var NP2M = {};
  var installed = false; // to be used so hooks are only installed if a mod registers
  var mods = [];
  var pre_inits = [];
  var post_inits = [];


  String.splice = function (str, idx, rem, s) {
    return (str.slice(0, idx) + s + str.slice(idx + Math.abs(rem)));
  };

  // hook into script loading and append a call to pre/post handlers before and after main jQuery.ready is called.
  function beforescriptexecute_handler(e) {
    console.log('beforescriptexecute_handler', e.target);
    var content = e.target.innerHTML;
    if (content.indexOf('$(window).ready(function () {') === -1) {
      return;
    }
    console.log('Found main closure. Running mods');
    window.removeEventListener('beforescriptexecute', beforescriptexecute_handler);
    window.addEventListener('afterscriptexecute', afterscriptexecute_handler);

    NPM2.pre_init(Mousetrap, Crux, NeptunesPride);
  }
  function afterscriptexecute_handler(e) {
    // mgi, mgic and mg are all undefined
    console.log('afterscriptexecute', e.target);

    window.removeEventListener('afterscriptexecute', afterscriptexecute_handler);

    try {
      unsafeWindow.jQuery(unsafeWindow.document).ready(func(NP2M.post_init));

    } catch(ee) {
      console.error('fuck', ee);
    }

    console.log('NP2M.post_init');
  }

  function install_handler() {
    window.addEventListener('beforescriptexecute', beforescriptexecute_handler);
  }


  NP2M.register = function register(name, version, pre_init, post_init) {
    console.log('Registering', name, version, pre_init, post_init);

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

  NP2M.post_init = function post_init() {
    console.log('post_init()');

    var data = unsafeWindow.NeptunesPride;

    data['Mousetrap'] = unsafeWindow.Mousetrap;
    data['Crux'] = unsafeWindow.Crux;
    data['NeptunesPride'] = unsafeWindow.NeptunesPride;
    data['mgi'] = undefined;
    data['mgic'] = undefined;
    data['mg'] = undefined;

    console.log('post_init data', data, Object.keys(data));

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

  // root = Function('return this')()
  this.NP2M = unsafeWindow.NP2M = NP2M;
})();
