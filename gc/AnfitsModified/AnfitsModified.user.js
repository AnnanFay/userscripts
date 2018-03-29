// ==UserScript==
// @name        GC Mods
// @namespace   http://annanfay.com/
// @description Extra features for SFGC (http://gc.gamestotal.com/)
// @include     http://gc.gamestotal.com/*
// @icon
// @author      Annan 'AnnanFay' Yearian, Jan 'anfit' Chimiak
// @version     5.0.30
// @license     Mixed Licences.
// @grant       GM_xmlhttpRequest
// @grant       GM_openInTab
// ==/UserScript==
/*!
 * jQuery JavaScript Library v1.6.4
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon Sep 12 18:54:48 2011 -0400
 */
(function( window, undefined ) {

// Use the correct document accordingly with window argument (sandbox)
var document = window.document,
	navigator = window.navigator,
	location = window.location;
var jQuery = (function() {

// Define a local copy of jQuery
var jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// A simple way to check for HTML strings or ID strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Check if a string has a non-whitespace character in it
	rnotwhite = /\S/,

	// Used for trimming whitespace
	trimLeft = /^\s+/,
	trimRight = /\s+$/,

	// Check for digits
	rdigit = /\d/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

	// Useragent RegExp
	rwebkit = /(webkit)[ \/]([\w.]+)/,
	ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
	rmsie = /(msie) ([\w.]+)/,
	rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

	// Matches dashed string for camelizing
	rdashAlpha = /-([a-z]|[0-9])/ig,
	rmsPrefix = /^-ms-/,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return ( letter + "" ).toUpperCase();
	},

	// Keep a UserAgent string for use with jQuery.browser
	userAgent = navigator.userAgent,

	// For matching the engine and version of the browser
	browserMatch,

	// The deferred used on DOM ready
	readyList,

	// The ready event handler
	DOMContentLoaded,

	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	trim = String.prototype.trim,
	indexOf = Array.prototype.indexOf,

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), or $(undefined)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// The body element only exists once, optimize finding it
		if ( selector === "body" && !context && document.body ) {
			this.context = document;
			this[0] = document.body;
			this.selector = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			// Are we dealing with HTML string or an ID?
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = quickExpr.exec( selector );
			}

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = (context ? context.ownerDocument || context : document);

					// If a single string is passed in and it's a single tag
					// just do a createElement and skip the rest
					ret = rsingleTag.exec( selector );

					if ( ret ) {
						if ( jQuery.isPlainObject( context ) ) {
							selector = [ document.createElement( ret[1] ) ];
							jQuery.fn.attr.call( selector, context, true );

						} else {
							selector = [ doc.createElement( ret[1] ) ];
						}

					} else {
						ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
						selector = (ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment).childNodes;
					}

					return jQuery.merge( this, selector );

				// HANDLE: $("#id")
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return (context || rootjQuery).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if (selector.selector !== undefined) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.6.4",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {
		// Build a new jQuery matched element set
		var ret = this.constructor();

		if ( jQuery.isArray( elems ) ) {
			push.apply( ret, elems );

		} else {
			jQuery.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + (this.selector ? " " : "") + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Attach the listeners
		jQuery.bindReady();

		// Add the callback
		readyList.done( fn );

		return this;
	},

	eq: function( i ) {
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, +i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ),
			"slice", slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {
		// Either a released hold or an DOMready/load event and not yet ready
		if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !document.body ) {
				return setTimeout( jQuery.ready, 1 );
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.trigger ) {
				jQuery( document ).trigger( "ready" ).unbind( "ready" );
			}
		}
	},

	bindReady: function() {
		if ( readyList ) {
			return;
		}

		readyList = jQuery._Deferred();

		// Catch cases where $(document).ready() is called after the
		// browser event has already occurred.
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			return setTimeout( jQuery.ready, 1 );
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var toplevel = false;

			try {
				toplevel = window.frameElement == null;
			} catch(e) {}

			if ( document.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	// A crude way of determining if an object is a window
	isWindow: function( obj ) {
		return obj && typeof obj === "object" && "setInterval" in obj;
	},

	isNaN: function( obj ) {
		return obj == null || !rdigit.test( obj ) || isNaN( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw msg;
	},

	parseJSON: function( data ) {
		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return (new Function( "return " + data ))();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
	each: function( object, callback, args ) {
		var name, i = 0,
			length = object.length,
			isObj = length === undefined || jQuery.isFunction( object );

		if ( args ) {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return object;
	},

	// Use native String.trim function wherever possible
	trim: trim ?
		function( text ) {
			return text == null ?
				"" :
				trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
		},

	// results is for internal usage only
	makeArray: function( array, results ) {
		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// The extra typeof function check is to prevent crashes
			// in Safari 2 (See: #3039)
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = jQuery.type( array );

			if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
				push.call( ret, array );
			} else {
				jQuery.merge( ret, array );
			}
		}

		return ret;
	},

	inArray: function( elem, array ) {
		if ( !array ) {
			return -1;
		}

		if ( indexOf ) {
			return indexOf.call( array, elem );
		}

		for ( var i = 0, length = array.length; i < length; i++ ) {
			if ( array[ i ] === elem ) {
				return i;
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var i = first.length,
			j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var ret = [], retVal;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value, key, ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		if ( typeof context === "string" ) {
			var tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		var args = slice.call( arguments, 2 ),
			proxy = function() {
				return fn.apply( context, args.concat( slice.call( arguments ) ) );
			};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

		return proxy;
	},

	// Mutifunctional method to get and set values to a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, key, value, exec, fn, pass ) {
		var length = elems.length;

		// Setting many attributes
		if ( typeof key === "object" ) {
			for ( var k in key ) {
				jQuery.access( elems, k, key[k], exec, fn, value );
			}
			return elems;
		}

		// Setting one attribute
		if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = !pass && exec && jQuery.isFunction(value);

			for ( var i = 0; i < length; i++ ) {
				fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
			}

			return elems;
		}

		// Getting an attribute
		return length ? fn( elems[0], key ) : undefined;
	},

	now: function() {
		return (new Date()).getTime();
	},

	// Use of jQuery.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
			[];

		return { browser: match[1] || "", version: match[2] || "0" };
	},

	sub: function() {
		function jQuerySub( selector, context ) {
			return new jQuerySub.fn.init( selector, context );
		}
		jQuery.extend( true, jQuerySub, this );
		jQuerySub.superclass = this;
		jQuerySub.fn = jQuerySub.prototype = this();
		jQuerySub.fn.constructor = jQuerySub;
		jQuerySub.sub = this.sub;
		jQuerySub.fn.init = function init( selector, context ) {
			if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
				context = jQuerySub( context );
			}

			return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
		};
		jQuerySub.fn.init.prototype = jQuerySub.fn;
		var rootjQuerySub = jQuerySub(document);
		return jQuerySub;
	},

	browser: {}
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

browserMatch = jQuery.uaMatch( userAgent );
if ( browserMatch.browser ) {
	jQuery.browser[ browserMatch.browser ] = true;
	jQuery.browser.version = browserMatch.version;
}

// Deprecated, use jQuery.browser.webkit instead
if ( jQuery.browser.webkit ) {
	jQuery.browser.safari = true;
}

// IE doesn't match non-breaking spaces with \s
if ( rnotwhite.test( "\xA0" ) ) {
	trimLeft = /^[\s\xA0]+/;
	trimRight = /[\s\xA0]+$/;
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		jQuery.ready();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	};
}

// The DOM ready check for Internet Explorer
function doScrollCheck() {
	if ( jQuery.isReady ) {
		return;
	}

	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch(e) {
		setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	jQuery.ready();
}

return jQuery;

})();


var // Promise methods
	promiseMethods = "done fail isResolved isRejected promise then always pipe".split( " " ),
	// Static reference to slice
	sliceDeferred = [].slice;

jQuery.extend({
	// Create a simple deferred (one callbacks list)
	_Deferred: function() {
		var // callbacks list
			callbacks = [],
			// stored [ context , args ]
			fired,
			// to avoid firing when already doing so
			firing,
			// flag to know if the deferred has been cancelled
			cancelled,
			// the deferred itself
			deferred  = {

				// done( f1, f2, ...)
				done: function() {
					if ( !cancelled ) {
						var args = arguments,
							i,
							length,
							elem,
							type,
							_fired;
						if ( fired ) {
							_fired = fired;
							fired = 0;
						}
						for ( i = 0, length = args.length; i < length; i++ ) {
							elem = args[ i ];
							type = jQuery.type( elem );
							if ( type === "array" ) {
								deferred.done.apply( deferred, elem );
							} else if ( type === "function" ) {
								callbacks.push( elem );
							}
						}
						if ( _fired ) {
							deferred.resolveWith( _fired[ 0 ], _fired[ 1 ] );
						}
					}
					return this;
				},

				// resolve with given context and args
				resolveWith: function( context, args ) {
					if ( !cancelled && !fired && !firing ) {
						// make sure args are available (#8421)
						args = args || [];
						firing = 1;
						try {
							while( callbacks[ 0 ] ) {
								callbacks.shift().apply( context, args );
							}
						}
						finally {
							fired = [ context, args ];
							firing = 0;
						}
					}
					return this;
				},

				// resolve with this as context and given arguments
				resolve: function() {
					deferred.resolveWith( this, arguments );
					return this;
				},

				// Has this deferred been resolved?
				isResolved: function() {
					return !!( firing || fired );
				},

				// Cancel
				cancel: function() {
					cancelled = 1;
					callbacks = [];
					return this;
				}
			};

		return deferred;
	},

	// Full fledged deferred (two callbacks list)
	Deferred: function( func ) {
		var deferred = jQuery._Deferred(),
			failDeferred = jQuery._Deferred(),
			promise;
		// Add errorDeferred methods, then and promise
		jQuery.extend( deferred, {
			then: function( doneCallbacks, failCallbacks ) {
				deferred.done( doneCallbacks ).fail( failCallbacks );
				return this;
			},
			always: function() {
				return deferred.done.apply( deferred, arguments ).fail.apply( this, arguments );
			},
			fail: failDeferred.done,
			rejectWith: failDeferred.resolveWith,
			reject: failDeferred.resolve,
			isRejected: failDeferred.isResolved,
			pipe: function( fnDone, fnFail ) {
				return jQuery.Deferred(function( newDefer ) {
					jQuery.each( {
						done: [ fnDone, "resolve" ],
						fail: [ fnFail, "reject" ]
					}, function( handler, data ) {
						var fn = data[ 0 ],
							action = data[ 1 ],
							returned;
						if ( jQuery.isFunction( fn ) ) {
							deferred[ handler ](function() {
								returned = fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise().then( newDefer.resolve, newDefer.reject );
								} else {
									newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
								}
							});
						} else {
							deferred[ handler ]( newDefer[ action ] );
						}
					});
				}).promise();
			},
			// Get a promise for this deferred
			// If obj is provided, the promise aspect is added to the object
			promise: function( obj ) {
				if ( obj == null ) {
					if ( promise ) {
						return promise;
					}
					promise = obj = {};
				}
				var i = promiseMethods.length;
				while( i-- ) {
					obj[ promiseMethods[i] ] = deferred[ promiseMethods[i] ];
				}
				return obj;
			}
		});
		// Make sure only one callback list will be used
		deferred.done( failDeferred.cancel ).fail( deferred.cancel );
		// Unexpose cancel
		delete deferred.cancel;
		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}
		return deferred;
	},

	// Deferred helper
	when: function( firstParam ) {
		var args = arguments,
			i = 0,
			length = args.length,
			count = length,
			deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ?
				firstParam :
				jQuery.Deferred();
		function resolveFunc( i ) {
			return function( value ) {
				args[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				if ( !( --count ) ) {
					// Strange bug in FF4:
					// Values changed onto the arguments object sometimes end up as undefined values
					// outside the $.when method. Cloning the object into a fresh array solves the issue
					deferred.resolveWith( deferred, sliceDeferred.call( args, 0 ) );
				}
			};
		}
		if ( length > 1 ) {
			for( ; i < length; i++ ) {
				if ( args[ i ] && jQuery.isFunction( args[ i ].promise ) ) {
					args[ i ].promise().then( resolveFunc(i), deferred.reject );
				} else {
					--count;
				}
			}
			if ( !count ) {
				deferred.resolveWith( deferred, args );
			}
		} else if ( deferred !== firstParam ) {
			deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
		}
		return deferred.promise();
	}
});



jQuery.support = (function() {

	var div = document.createElement( "div" ),
		documentElement = document.documentElement,
		all,
		a,
		select,
		opt,
		input,
		marginDiv,
		support,
		fragment,
		body,
		testElementParent,
		testElement,
		testElementStyle,
		tds,
		events,
		eventName,
		i,
		isSupported;

	// Preliminary tests
	div.setAttribute("className", "t");
	div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";


	all = div.getElementsByTagName( "*" );
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Can't get basic test support
	if ( !all || !all.length || !a ) {
		return {};
	}

	// First batch of supports tests
	select = document.createElement( "select" );
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName( "input" )[ 0 ];

	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName( "tbody" ).length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName( "link" ).length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute( "href" ) === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.55$/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent( "onclick" );
	}

	// Check if a radio maintains it's value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute("type", "radio");
	support.radioValue = input.value === "t";

	input.setAttribute("checked", "checked");
	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.firstChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	div.innerHTML = "";

	// Figure out if the W3C box model works as expected
	div.style.width = div.style.paddingLeft = "1px";

	body = document.getElementsByTagName( "body" )[ 0 ];
	// We use our own, invisible, body unless the body is already present
	// in which case we use a div (#9239)
	testElement = document.createElement( body ? "div" : "body" );
	testElementStyle = {
		visibility: "hidden",
		width: 0,
		height: 0,
		border: 0,
		margin: 0,
		background: "none"
	};
	if ( body ) {
		jQuery.extend( testElementStyle, {
			position: "absolute",
			left: "-1000px",
			top: "-1000px"
		});
	}
	for ( i in testElementStyle ) {
		testElement.style[ i ] = testElementStyle[ i ];
	}
	testElement.appendChild( div );
	testElementParent = body || documentElement;
	testElementParent.insertBefore( testElement, testElementParent.firstChild );

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	support.boxModel = div.offsetWidth === 2;

	if ( "zoom" in div.style ) {
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		// (IE < 8 does this)
		div.style.display = "inline";
		div.style.zoom = 1;
		support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

		// Check if elements with layout shrink-wrap their children
		// (IE 6 does this)
		div.style.display = "";
		div.innerHTML = "<div style='width:4px;'></div>";
		support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
	}

	div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
	tds = div.getElementsByTagName( "td" );

	// Check if table cells still have offsetWidth/Height when they are set
	// to display:none and there are still other visible table cells in a
	// table row; if so, offsetWidth/Height are not reliable for use when
	// determining if an element has been hidden directly using
	// display:none (it is still safe to use offsets if a parent element is
	// hidden; don safety goggles and see bug #4512 for more information).
	// (only IE 8 fails this test)
	isSupported = ( tds[ 0 ].offsetHeight === 0 );

	tds[ 0 ].style.display = "";
	tds[ 1 ].style.display = "none";

	// Check if empty table cells still have offsetWidth/Height
	// (IE < 8 fail this test)
	support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );
	div.innerHTML = "";

	// Check if div with explicit width and no margin-right incorrectly
	// gets computed margin-right based on width of container. For more
	// info see bug #3333
	// Fails in WebKit before Feb 2011 nightlies
	// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
	if ( document.defaultView && document.defaultView.getComputedStyle ) {
		marginDiv = document.createElement( "div" );
		marginDiv.style.width = "0";
		marginDiv.style.marginRight = "0";
		div.appendChild( marginDiv );
		support.reliableMarginRight =
			( parseInt( ( document.defaultView.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0;
	}

	// Remove the body element we added
	testElement.innerHTML = "";
	testElementParent.removeChild( testElement );

	// Technique from Juriy Zaytsev
	// http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for( i in {
			submit: 1,
			change: 1,
			focusin: 1
		} ) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	// Null connected elements to avoid leaks in IE
	testElement = fragment = select = opt = body = marginDiv = div = input = null;

	return support;
})();

// Keep track of boxModel
jQuery.boxModel = jQuery.support.boxModel;




var rbrace = /^(?:\{.*\}|\[.*\])$/,
	rmultiDash = /([A-Z])/g;

jQuery.extend({
	cache: {},

	// Please use with caution
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];

		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, ret,
			internalKey = jQuery.expando,
			getByName = typeof name === "string",

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ jQuery.expando ] : elem[ jQuery.expando ] && jQuery.expando;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || (pvt && id && (cache[ id ] && !cache[ id ][ internalKey ]))) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ jQuery.expando ] = id = ++jQuery.uuid;
			} else {
				id = jQuery.expando;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// TODO: This is a hack for 1.5 ONLY. Avoids exposing jQuery
			// metadata on plain JS objects when the object is serialized using
			// JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ][ internalKey ] = jQuery.extend(cache[ id ][ internalKey ], name);
			} else {
				cache[ id ] = jQuery.extend(cache[ id ], name);
			}
		}

		thisCache = cache[ id ];

		// Internal jQuery data is stored in a separate object inside the object's data
		// cache in order to avoid key collisions between internal data and user-defined
		// data
		if ( pvt ) {
			if ( !thisCache[ internalKey ] ) {
				thisCache[ internalKey ] = {};
			}

			thisCache = thisCache[ internalKey ];
		}

		if ( data !== undefined ) {
			thisCache[ jQuery.camelCase( name ) ] = data;
		}

		// TODO: This is a hack for 1.5 ONLY. It will be removed in 1.6. Users should
		// not attempt to inspect the internal events object using jQuery.data, as this
		// internal data object is undocumented and subject to change.
		if ( name === "events" && !thisCache[name] ) {
			return thisCache[ internalKey ] && thisCache[ internalKey ].events;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if ( getByName ) {

			// First Try to find as-is property data
			ret = thisCache[ name ];

			// Test for null|undefined property data
			if ( ret == null ) {

				// Try to find the camelCased property
				ret = thisCache[ jQuery.camelCase( name ) ];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache,

			// Reference to internal data cache key
			internalKey = jQuery.expando,

			isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,

			// See jQuery.data for more information
			id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {

			thisCache = pvt ? cache[ id ][ internalKey ] : cache[ id ];

			if ( thisCache ) {

				// Support interoperable removal of hyphenated or camelcased keys
				if ( !thisCache[ name ] ) {
					name = jQuery.camelCase( name );
				}

				delete thisCache[ name ];

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !isEmptyDataObject(thisCache) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( pvt ) {
			delete cache[ id ][ internalKey ];

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject(cache[ id ]) ) {
				return;
			}
		}

		var internalCache = cache[ id ][ internalKey ];

		// Browsers that fail expando deletion also refuse to delete expandos on
		// the window, but it will allow it on all other JS objects; other browsers
		// don't care
		// Ensure that `cache` is not a window object #10080
		if ( jQuery.support.deleteExpando || !cache.setInterval ) {
			delete cache[ id ];
		} else {
			cache[ id ] = null;
		}

		// We destroyed the entire user cache at once because it's faster than
		// iterating through each key, but we need to continue to persist internal
		// data if it existed
		if ( internalCache ) {
			cache[ id ] = {};
			// TODO: This is a hack for 1.5 ONLY. Avoids exposing jQuery
			// metadata on plain JS objects when the object is serialized using
			// JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}

			cache[ id ][ internalKey ] = internalCache;

		// Otherwise, we need to eliminate the expando on the node to avoid
		// false lookups in the cache for entries that no longer exist
		} else if ( isNode ) {
			// IE does not allow us to delete expando properties from nodes,
			// nor does it have a removeAttribute function on Document nodes;
			// we must handle all of these cases
			if ( jQuery.support.deleteExpando ) {
				delete elem[ jQuery.expando ];
			} else if ( elem.removeAttribute ) {
				elem.removeAttribute( jQuery.expando );
			} else {
				elem[ jQuery.expando ] = null;
			}
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		if ( elem.nodeName ) {
			var match = jQuery.noData[ elem.nodeName.toLowerCase() ];

			if ( match ) {
				return !(match === true || elem.getAttribute("classid") !== match);
			}
		}

		return true;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var data = null;

		if ( typeof key === "undefined" ) {
			if ( this.length ) {
				data = jQuery.data( this[0] );

				if ( this[0].nodeType === 1 ) {
			    var attr = this[0].attributes, name;
					for ( var i = 0, l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = jQuery.camelCase( name.substring(5) );

							dataAttr( this[0], name, data[ name ] );
						}
					}
				}
			}

			return data;

		} else if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		var parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			// Try to fetch any internally stored data first
			if ( data === undefined && this.length ) {
				data = jQuery.data( this[0], key );
				data = dataAttr( this[0], key, data );
			}

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;

		} else {
			return this.each(function() {
				var $this = jQuery( this ),
					args = [ parts[0], value ];

				$this.triggerHandler( "setData" + parts[1] + "!", args );
				jQuery.data( this, key, value );
				$this.triggerHandler( "changeData" + parts[1] + "!", args );
			});
		}
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				!jQuery.isNaN( data ) ? parseFloat( data ) :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// TODO: This is a hack for 1.5 ONLY to allow objects with a single toJSON
// property to be considered empty objects; this property always exists in
// order to make sure JSON.stringify does not expose internal metadata
function isEmptyDataObject( obj ) {
	for ( var name in obj ) {
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}




function handleQueueMarkDefer( elem, type, src ) {
	var deferDataKey = type + "defer",
		queueDataKey = type + "queue",
		markDataKey = type + "mark",
		defer = jQuery.data( elem, deferDataKey, undefined, true );
	if ( defer &&
		( src === "queue" || !jQuery.data( elem, queueDataKey, undefined, true ) ) &&
		( src === "mark" || !jQuery.data( elem, markDataKey, undefined, true ) ) ) {
		// Give room for hard-coded callbacks to fire first
		// and eventually mark/queue something else on the element
		setTimeout( function() {
			if ( !jQuery.data( elem, queueDataKey, undefined, true ) &&
				!jQuery.data( elem, markDataKey, undefined, true ) ) {
				jQuery.removeData( elem, deferDataKey, true );
				defer.resolve();
			}
		}, 0 );
	}
}

jQuery.extend({

	_mark: function( elem, type ) {
		if ( elem ) {
			type = (type || "fx") + "mark";
			jQuery.data( elem, type, (jQuery.data(elem,type,undefined,true) || 0) + 1, true );
		}
	},

	_unmark: function( force, elem, type ) {
		if ( force !== true ) {
			type = elem;
			elem = force;
			force = false;
		}
		if ( elem ) {
			type = type || "fx";
			var key = type + "mark",
				count = force ? 0 : ( (jQuery.data( elem, key, undefined, true) || 1 ) - 1 );
			if ( count ) {
				jQuery.data( elem, key, count, true );
			} else {
				jQuery.removeData( elem, key, true );
				handleQueueMarkDefer( elem, type, "mark" );
			}
		}
	},

	queue: function( elem, type, data ) {
		if ( elem ) {
			type = (type || "fx") + "queue";
			var q = jQuery.data( elem, type, undefined, true );
			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !q || jQuery.isArray(data) ) {
					q = jQuery.data( elem, type, jQuery.makeArray(data), true );
				} else {
					q.push( data );
				}
			}
			return q || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			fn = queue.shift(),
			defer;

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
		}

		if ( fn ) {
			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift("inprogress");
			}

			fn.call(elem, function() {
				jQuery.dequeue(elem, type);
			});
		}

		if ( !queue.length ) {
			jQuery.removeData( elem, type + "queue", true );
			handleQueueMarkDefer( elem, type, "queue" );
		}
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
		}

		if ( data === undefined ) {
			return jQuery.queue( this[0], type );
		}
		return this.each(function() {
			var queue = jQuery.queue( this, type, data );

			if ( type === "fx" && queue[0] !== "inprogress" ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
		type = type || "fx";

		return this.queue( type, function() {
			var elem = this;
			setTimeout(function() {
				jQuery.dequeue( elem, type );
			}, time );
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, object ) {
		if ( typeof type !== "string" ) {
			object = type;
			type = undefined;
		}
		type = type || "fx";
		var defer = jQuery.Deferred(),
			elements = this,
			i = elements.length,
			count = 1,
			deferDataKey = type + "defer",
			queueDataKey = type + "queue",
			markDataKey = type + "mark",
			tmp;
		function resolve() {
			if ( !( --count ) ) {
				defer.resolveWith( elements, [ elements ] );
			}
		}
		while( i-- ) {
			if (( tmp = jQuery.data( elements[ i ], deferDataKey, undefined, true ) ||
					( jQuery.data( elements[ i ], queueDataKey, undefined, true ) ||
						jQuery.data( elements[ i ], markDataKey, undefined, true ) ) &&
					jQuery.data( elements[ i ], deferDataKey, jQuery._Deferred(), true ) )) {
				count++;
				tmp.done( resolve );
			}
		}
		resolve();
		return defer.promise();
	}
});




var rclass = /[\n\t\r]/g,
	rspace = /\s+/,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea)?$/i,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	nodeHook, boolHook;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.attr );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},
	
	prop: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.prop );
	},
	
	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classNames, i, l, elem, className, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call(this, j, this.className) );
			});
		}

		if ( (value && typeof value === "string") || value === undefined ) {
			classNames = (value || "").split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 && elem.className ) {
					if ( value ) {
						className = (" " + elem.className + " ").replace( rclass, " " );
						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							className = className.replace(" " + classNames[ c ] + " ", " ");
						}
						elem.className = jQuery.trim( className );

					} else {
						elem.className = "";
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space seperated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ";
		for ( var i = 0, l = this.length; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret,
			elem = this[0];
		
		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.nodeName.toLowerCase() ] || jQuery.valHooks[ elem.type ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ? 
					// handle most common string cases
					ret.replace(rreturn, "") : 
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return undefined;
		}

		var isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var self = jQuery(this), val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.nodeName.toLowerCase() ] || jQuery.valHooks[ this.type ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value,
					index = elem.selectedIndex,
					values = [],
					options = elem.options,
					one = elem.type === "select-one";

				// Nothing was selected
				if ( index < 0 ) {
					return null;
				}

				// Loop through all the selected options
				for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
					var option = options[ i ];

					// Don't return options that are disabled or in a disabled optgroup
					if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
							(!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
				if ( one && !values.length && options.length ) {
					return jQuery( options[ index ] ).val();
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attrFn: {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true
	},
	
	attrFix: {
		// Always normalize to ensure hook usage
		tabindex: "tabIndex"
	},
	
	attr: function( elem, name, value, pass ) {
		var nType = elem.nodeType;
		
		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return undefined;
		}

		if ( pass && name in jQuery.attrFn ) {
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( !("getAttribute" in elem) ) {
			return jQuery.prop( elem, name, value );
		}

		var ret, hooks,
			notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// Normalize the name if needed
		if ( notxml ) {
			name = jQuery.attrFix[ name ] || name;

			hooks = jQuery.attrHooks[ name ];

			if ( !hooks ) {
				// Use boolHook for boolean attributes
				if ( rboolean.test( name ) ) {
					hooks = boolHook;

				// Use nodeHook if available( IE6/7 )
				} else if ( nodeHook ) {
					hooks = nodeHook;
				}
			}
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return undefined;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, "" + value );
				return value;
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			ret = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, name ) {
		var propName;
		if ( elem.nodeType === 1 ) {
			name = jQuery.attrFix[ name ] || name;

			jQuery.attr( elem, name, "" );
			elem.removeAttribute( name );

			// Set corresponding property to false for boolean attributes
			if ( rboolean.test( name ) && (propName = jQuery.propFix[ name ] || name) in elem ) {
				elem[ propName ] = false;
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		// Use the value property for back compat
		// Use the nodeHook for button elements in IE6/7 (#1954)
		value: {
			get: function( elem, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},
	
	prop: function( elem, name, value ) {
		var nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return undefined;
		}

		var ret, hooks,
			notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return (elem[ name ] = value);
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},
	
	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Add the tabindex propHook to attrHooks for back-compat
jQuery.attrHooks.tabIndex = jQuery.propHooks.tabIndex;

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		// Align boolean attributes with corresponding properties
		// Fall back to attribute presence where some booleans are not supported
		var attrNode;
		return jQuery.prop( elem, name ) === true || ( attrNode = elem.getAttributeNode( name ) ) && attrNode.nodeValue !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			// value is true since we know at this point it's type boolean and not false
			// Set boolean attributes to the same name and set the DOM property
			propName = jQuery.propFix[ name ] || name;
			if ( propName in elem ) {
				// Only set the IDL specifically if it already exists on the element
				elem[ propName ] = true;
			}

			elem.setAttribute( name, name.toLowerCase() );
		}
		return name;
	}
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !jQuery.support.getSetAttribute ) {
	
	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			// Return undefined if nodeValue is empty string
			return ret && ret.nodeValue !== "" ?
				ret.nodeValue :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				ret = document.createAttribute( name );
				elem.setAttributeNode( ret );
			}
			return (ret.nodeValue = value + "");
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return (elem.style.cssText = "" + value);
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return (elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0);
			}
		}
	});
});




var rnamespaces = /\.(.*)$/,
	rformElems = /^(?:textarea|input|select)$/i,
	rperiod = /\./g,
	rspaces = / /g,
	rescape = /[^\w\s.|`]/g,
	fcleanup = function( nm ) {
		return nm.replace(rescape, "\\$&");
	};

/*
 * A number of helper functions used for managing events.
 * Many of the ideas behind this code originated from
 * Dean Edwards' addEvent library.
 */
jQuery.event = {

	// Bind an event to an element
	// Original by Dean Edwards
	add: function( elem, types, handler, data ) {
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		if ( handler === false ) {
			handler = returnFalse;
		} else if ( !handler ) {
			// Fixes bug #7229. Fix recommended by jdalton
			return;
		}

		var handleObjIn, handleObj;

		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
		}

		// Make sure that the function being executed has a unique ID
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure
		var elemData = jQuery._data( elem );

		// If no elemData is found then we must be trying to bind to one of the
		// banned noData elements
		if ( !elemData ) {
			return;
		}

		var events = elemData.events,
			eventHandle = elemData.handle;

		if ( !events ) {
			elemData.events = events = {};
		}

		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.handle.apply( eventHandle.elem, arguments ) :
					undefined;
			};
		}

		// Add elem as a property of the handle function
		// This is to prevent a memory leak with non-native events in IE.
		eventHandle.elem = elem;

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = types.split(" ");

		var type, i = 0, namespaces;

		while ( (type = types[ i++ ]) ) {
			handleObj = handleObjIn ?
				jQuery.extend({}, handleObjIn) :
				{ handler: handler, data: data };

			// Namespaced event handlers
			if ( type.indexOf(".") > -1 ) {
				namespaces = type.split(".");
				type = namespaces.shift();
				handleObj.namespace = namespaces.slice(0).sort().join(".");

			} else {
				namespaces = [];
				handleObj.namespace = "";
			}

			handleObj.type = type;
			if ( !handleObj.guid ) {
				handleObj.guid = handler.guid;
			}

			// Get the current list of functions bound to this event
			var handlers = events[ type ],
				special = jQuery.event.special[ type ] || {};

			// Init the event handler queue
			if ( !handlers ) {
				handlers = events[ type ] = [];

				// Check for a special event handler
				// Only use addEventListener/attachEvent if the special
				// events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add the function to the element's handler list
			handlers.push( handleObj );

			// Keep track of which events have been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, pos ) {
		// don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		if ( handler === false ) {
			handler = returnFalse;
		}

		var ret, type, fn, j, i = 0, all, namespaces, namespace, special, eventType, handleObj, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem ),
			events = elemData && elemData.events;

		if ( !elemData || !events ) {
			return;
		}

		// types is actually an event object here
		if ( types && types.type ) {
			handler = types.handler;
			types = types.type;
		}

		// Unbind all events for the element
		if ( !types || typeof types === "string" && types.charAt(0) === "." ) {
			types = types || "";

			for ( type in events ) {
				jQuery.event.remove( elem, type + types );
			}

			return;
		}

		// Handle multiple events separated by a space
		// jQuery(...).unbind("mouseover mouseout", fn);
		types = types.split(" ");

		while ( (type = types[ i++ ]) ) {
			origType = type;
			handleObj = null;
			all = type.indexOf(".") < 0;
			namespaces = [];

			if ( !all ) {
				// Namespaced event handlers
				namespaces = type.split(".");
				type = namespaces.shift();

				namespace = new RegExp("(^|\\.)" +
					jQuery.map( namespaces.slice(0).sort(), fcleanup ).join("\\.(?:.*\\.)?") + "(\\.|$)");
			}

			eventType = events[ type ];

			if ( !eventType ) {
				continue;
			}

			if ( !handler ) {
				for ( j = 0; j < eventType.length; j++ ) {
					handleObj = eventType[ j ];

					if ( all || namespace.test( handleObj.namespace ) ) {
						jQuery.event.remove( elem, origType, handleObj.handler, j );
						eventType.splice( j--, 1 );
					}
				}

				continue;
			}

			special = jQuery.event.special[ type ] || {};

			for ( j = pos || 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( handler.guid === handleObj.guid ) {
					// remove the given handler for the given type
					if ( all || namespace.test( handleObj.namespace ) ) {
						if ( pos == null ) {
							eventType.splice( j--, 1 );
						}

						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}

					if ( pos != null ) {
						break;
					}
				}
			}

			// remove generic event handler if no more handlers exist
			if ( eventType.length === 0 || pos != null && eventType.length === 1 ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				ret = null;
				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			var handle = elemData.handle;
			if ( handle ) {
				handle.elem = null;
			}

			delete elemData.events;
			delete elemData.handle;

			if ( jQuery.isEmptyObject( elemData ) ) {
				jQuery.removeData( elem, undefined, true );
			}
		}
	},
	
	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		// Event object or event type
		var type = event.type || event,
			namespaces = [],
			exclusive;

		if ( type.indexOf("!") >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces)
			type = type.slice(0, -1);
			exclusive = true;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event :
			// Object literal
			new jQuery.Event( type, event ) :
			// Just the event type (string)
			new jQuery.Event( type );

		event.type = type;
		event.exclusive = exclusive;
		event.namespace = namespaces.join(".");
		event.namespace_re = new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)");
		
		// triggerHandler() and global events don't bubble or run the default action
		if ( onlyHandlers || !elem ) {
			event.preventDefault();
			event.stopPropagation();
		}

		// Handle a global trigger
		if ( !elem ) {
			// TODO: Stop taunting the data cache; remove global events and always attach to document
			jQuery.each( jQuery.cache, function() {
				// internalKey variable is just used to make it easier to find
				// and potentially change this stuff later; currently it just
				// points to jQuery.expando
				var internalKey = jQuery.expando,
					internalCache = this[ internalKey ];
				if ( internalCache && internalCache.events && internalCache.events[ type ] ) {
					jQuery.event.trigger( event, data, internalCache.handle.elem );
				}
			});
			return;
		}

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// Clean up the event in case it is being reused
		event.result = undefined;
		event.target = elem;

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );

		var cur = elem,
			// IE doesn't like method names with a colon (#3533, #8272)
			ontype = type.indexOf(":") < 0 ? "on" + type : "";

		// Fire event on the current element, then bubble up the DOM tree
		do {
			var handle = jQuery._data( cur, "handle" );

			event.currentTarget = cur;
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Trigger an inline bound script
			if ( ontype && jQuery.acceptData( cur ) && cur[ ontype ] && cur[ ontype ].apply( cur, data ) === false ) {
				event.result = false;
				event.preventDefault();
			}

			// Bubble up to document, then to window
			cur = cur.parentNode || cur.ownerDocument || cur === event.target.ownerDocument && window;
		} while ( cur && !event.isPropagationStopped() );

		// If nobody prevented the default action, do it now
		if ( !event.isDefaultPrevented() ) {
			var old,
				special = jQuery.event.special[ type ] || {};

			if ( (!special._default || special._default.call( elem.ownerDocument, event ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction)() check here because IE6/7 fails that test.
				// IE<9 dies on focus to hidden element (#1486), may want to revisit a try/catch.
				try {
					if ( ontype && elem[ type ] ) {
						// Don't re-trigger an onFOO event when we call its FOO() method
						old = elem[ ontype ];

						if ( old ) {
							elem[ ontype ] = null;
						}

						jQuery.event.triggered = type;
						elem[ type ]();
					}
				} catch ( ieError ) {}

				if ( old ) {
					elem[ ontype ] = old;
				}

				jQuery.event.triggered = undefined;
			}
		}
		
		return event.result;
	},

	handle: function( event ) {
		event = jQuery.event.fix( event || window.event );
		// Snapshot the handlers list since a called handler may add/remove events.
		var handlers = ((jQuery._data( this, "events" ) || {})[ event.type ] || []).slice(0),
			run_all = !event.exclusive && !event.namespace,
			args = Array.prototype.slice.call( arguments, 0 );

		// Use the fix-ed Event rather than the (read-only) native event
		args[0] = event;
		event.currentTarget = this;

		for ( var j = 0, l = handlers.length; j < l; j++ ) {
			var handleObj = handlers[ j ];

			// Triggered event must 1) be non-exclusive and have no namespace, or
			// 2) have namespace(s) a subset or equal to those in the bound event.
			if ( run_all || event.namespace_re.test( handleObj.namespace ) ) {
				// Pass in a reference to the handler function itself
				// So that we can later remove it
				event.handler = handleObj.handler;
				event.data = handleObj.data;
				event.handleObj = handleObj;

				var ret = handleObj.handler.apply( this, args );

				if ( ret !== undefined ) {
					event.result = ret;
					if ( ret === false ) {
						event.preventDefault();
						event.stopPropagation();
					}
				}

				if ( event.isImmediatePropagationStopped() ) {
					break;
				}
			}
		}
		return event.result;
	},

	props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// store a copy of the original event object
		// and "clone" to set read-only properties
		var originalEvent = event;
		event = jQuery.Event( originalEvent );

		for ( var i = this.props.length, prop; i; ) {
			prop = this.props[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary
		if ( !event.target ) {
			// Fixes #1925 where srcElement might not be defined either
			event.target = event.srcElement || document;
		}

		// check if target is a textnode (safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Add relatedTarget, if necessary
		if ( !event.relatedTarget && event.fromElement ) {
			event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
		}

		// Calculate pageX/Y if missing and clientX/Y available
		if ( event.pageX == null && event.clientX != null ) {
			var eventDocument = event.target.ownerDocument || document,
				doc = eventDocument.documentElement,
				body = eventDocument.body;

			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
		}

		// Add which for key events
		if ( event.which == null && (event.charCode != null || event.keyCode != null) ) {
			event.which = event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
		if ( !event.metaKey && event.ctrlKey ) {
			event.metaKey = event.ctrlKey;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		// Note: button is not normalized, so don't use it
		if ( !event.which && event.button !== undefined ) {
			event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
		}

		return event;
	},

	// Deprecated, use jQuery.guid instead
	guid: 1E8,

	// Deprecated, use jQuery.proxy instead
	proxy: jQuery.proxy,

	special: {
		ready: {
			// Make sure the ready event is setup
			setup: jQuery.bindReady,
			teardown: jQuery.noop
		},

		live: {
			add: function( handleObj ) {
				jQuery.event.add( this,
					liveConvert( handleObj.origType, handleObj.selector ),
					jQuery.extend({}, handleObj, {handler: liveHandler, guid: handleObj.handler.guid}) );
			},

			remove: function( handleObj ) {
				jQuery.event.remove( this, liveConvert( handleObj.origType, handleObj.selector ), handleObj );
			}
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		if ( elem.detachEvent ) {
			elem.detachEvent( "on" + type, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !this.preventDefault ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// timeStamp is buggy for some events on Firefox(#3843)
	// So we won't rely on the native value
	this.timeStamp = jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Checks if an event happened on an element within another element
// Used in jQuery.event.special.mouseenter and mouseleave handlers
var withinElement = function( event ) {

	// Check if mouse(over|out) are still within the same parent element
	var related = event.relatedTarget,
		inside = false,
		eventType = event.type;

	event.type = event.data;

	if ( related !== this ) {

		if ( related ) {
			inside = jQuery.contains( this, related );
		}

		if ( !inside ) {

			jQuery.event.handle.apply( this, arguments );

			event.type = eventType;
		}
	}
},

// In case of event delegation, we only need to rename the event.type,
// liveHandler will take care of the rest.
delegate = function( event ) {
	event.type = event.data;
	jQuery.event.handle.apply( this, arguments );
};

// Create mouseenter and mouseleave events
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		setup: function( data ) {
			jQuery.event.add( this, fix, data && data.selector ? delegate : withinElement, orig );
		},
		teardown: function( data ) {
			jQuery.event.remove( this, fix, data && data.selector ? delegate : withinElement );
		}
	};
});

// submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function( data, namespaces ) {
			if ( !jQuery.nodeName( this, "form" ) ) {
				jQuery.event.add(this, "click.specialSubmit", function( e ) {
					// Avoid triggering error on non-existent type attribute in IE VML (#7071)
					var elem = e.target,
						type = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.type : "";

					if ( (type === "submit" || type === "image") && jQuery( elem ).closest("form").length ) {
						trigger( "submit", this, arguments );
					}
				});

				jQuery.event.add(this, "keypress.specialSubmit", function( e ) {
					var elem = e.target,
						type = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.type : "";

					if ( (type === "text" || type === "password") && jQuery( elem ).closest("form").length && e.keyCode === 13 ) {
						trigger( "submit", this, arguments );
					}
				});

			} else {
				return false;
			}
		},

		teardown: function( namespaces ) {
			jQuery.event.remove( this, ".specialSubmit" );
		}
	};

}

// change delegation, happens here so we have bind.
if ( !jQuery.support.changeBubbles ) {

	var changeFilters,

	getVal = function( elem ) {
		var type = jQuery.nodeName( elem, "input" ) ? elem.type : "",
			val = elem.value;

		if ( type === "radio" || type === "checkbox" ) {
			val = elem.checked;

		} else if ( type === "select-multiple" ) {
			val = elem.selectedIndex > -1 ?
				jQuery.map( elem.options, function( elem ) {
					return elem.selected;
				}).join("-") :
				"";

		} else if ( jQuery.nodeName( elem, "select" ) ) {
			val = elem.selectedIndex;
		}

		return val;
	},

	testChange = function testChange( e ) {
		var elem = e.target, data, val;

		if ( !rformElems.test( elem.nodeName ) || elem.readOnly ) {
			return;
		}

		data = jQuery._data( elem, "_change_data" );
		val = getVal(elem);

		// the current data will be also retrieved by beforeactivate
		if ( e.type !== "focusout" || elem.type !== "radio" ) {
			jQuery._data( elem, "_change_data", val );
		}

		if ( data === undefined || val === data ) {
			return;
		}

		if ( data != null || val ) {
			e.type = "change";
			e.liveFired = undefined;
			jQuery.event.trigger( e, arguments[1], elem );
		}
	};

	jQuery.event.special.change = {
		filters: {
			focusout: testChange,

			beforedeactivate: testChange,

			click: function( e ) {
				var elem = e.target, type = jQuery.nodeName( elem, "input" ) ? elem.type : "";

				if ( type === "radio" || type === "checkbox" || jQuery.nodeName( elem, "select" ) ) {
					testChange.call( this, e );
				}
			},

			// Change has to be called before submit
			// Keydown will be called before keypress, which is used in submit-event delegation
			keydown: function( e ) {
				var elem = e.target, type = jQuery.nodeName( elem, "input" ) ? elem.type : "";

				if ( (e.keyCode === 13 && !jQuery.nodeName( elem, "textarea" ) ) ||
					(e.keyCode === 32 && (type === "checkbox" || type === "radio")) ||
					type === "select-multiple" ) {
					testChange.call( this, e );
				}
			},

			// Beforeactivate happens also before the previous element is blurred
			// with this event you can't trigger a change event, but you can store
			// information
			beforeactivate: function( e ) {
				var elem = e.target;
				jQuery._data( elem, "_change_data", getVal(elem) );
			}
		},

		setup: function( data, namespaces ) {
			if ( this.type === "file" ) {
				return false;
			}

			for ( var type in changeFilters ) {
				jQuery.event.add( this, type + ".specialChange", changeFilters[type] );
			}

			return rformElems.test( this.nodeName );
		},

		teardown: function( namespaces ) {
			jQuery.event.remove( this, ".specialChange" );

			return rformElems.test( this.nodeName );
		}
	};

	changeFilters = jQuery.event.special.change.filters;

	// Handle when the input is .focus()'d
	changeFilters.focus = changeFilters.beforeactivate;
}

function trigger( type, elem, args ) {
	// Piggyback on a donor event to simulate a different one.
	// Fake originalEvent to avoid donor's stopPropagation, but if the
	// simulated event prevents default then we do the same on the donor.
	// Don't pass args or remember liveFired; they apply to the donor event.
	var event = jQuery.extend( {}, args[ 0 ] );
	event.type = type;
	event.originalEvent = {};
	event.liveFired = undefined;
	jQuery.event.handle.call( elem, event );
	if ( event.isDefaultPrevented() ) {
		args[ 0 ].preventDefault();
	}
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0;

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};

		function handler( donor ) {
			// Donor event is always a native one; fix it and switch its type.
			// Let focusin/out handler cancel the donor focus/blur event.
			var e = jQuery.event.fix( donor );
			e.type = fix;
			e.originalEvent = {};
			jQuery.event.trigger( e, null, e.target );
			if ( e.isDefaultPrevented() ) {
				donor.preventDefault();
			}
		}
	});
}

jQuery.each(["bind", "one"], function( i, name ) {
	jQuery.fn[ name ] = function( type, data, fn ) {
		var handler;

		// Handle object literals
		if ( typeof type === "object" ) {
			for ( var key in type ) {
				this[ name ](key, data, type[key], fn);
			}
			return this;
		}

		if ( arguments.length === 2 || data === false ) {
			fn = data;
			data = undefined;
		}

		if ( name === "one" ) {
			handler = function( event ) {
				jQuery( this ).unbind( event, handler );
				return fn.apply( this, arguments );
			};
			handler.guid = fn.guid || jQuery.guid++;
		} else {
			handler = fn;
		}

		if ( type === "unload" && name !== "one" ) {
			this.one( type, data, fn );

		} else {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				jQuery.event.add( this[i], type, handler, data );
			}
		}

		return this;
	};
});

jQuery.fn.extend({
	unbind: function( type, fn ) {
		// Handle object literals
		if ( typeof type === "object" && !type.preventDefault ) {
			for ( var key in type ) {
				this.unbind(key, type[key]);
			}

		} else {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				jQuery.event.remove( this[i], type, fn );
			}
		}

		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.live( types, data, fn, selector );
	},

	undelegate: function( selector, types, fn ) {
		if ( arguments.length === 0 ) {
			return this.unbind( "live" );

		} else {
			return this.die( types, null, fn, selector );
		}
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},

	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery.data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery.data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

var liveMap = {
	focus: "focusin",
	blur: "focusout",
	mouseenter: "mouseover",
	mouseleave: "mouseout"
};

jQuery.each(["live", "die"], function( i, name ) {
	jQuery.fn[ name ] = function( types, data, fn, origSelector /* Internal Use Only */ ) {
		var type, i = 0, match, namespaces, preType,
			selector = origSelector || this.selector,
			context = origSelector ? this : jQuery( this.context );

		if ( typeof types === "object" && !types.preventDefault ) {
			for ( var key in types ) {
				context[ name ]( key, data, types[key], selector );
			}

			return this;
		}

		if ( name === "die" && !types &&
					origSelector && origSelector.charAt(0) === "." ) {

			context.unbind( origSelector );

			return this;
		}

		if ( data === false || jQuery.isFunction( data ) ) {
			fn = data || returnFalse;
			data = undefined;
		}

		types = (types || "").split(" ");

		while ( (type = types[ i++ ]) != null ) {
			match = rnamespaces.exec( type );
			namespaces = "";

			if ( match )  {
				namespaces = match[0];
				type = type.replace( rnamespaces, "" );
			}

			if ( type === "hover" ) {
				types.push( "mouseenter" + namespaces, "mouseleave" + namespaces );
				continue;
			}

			preType = type;

			if ( liveMap[ type ] ) {
				types.push( liveMap[ type ] + namespaces );
				type = type + namespaces;

			} else {
				type = (liveMap[ type ] || type) + namespaces;
			}

			if ( name === "live" ) {
				// bind live handler
				for ( var j = 0, l = context.length; j < l; j++ ) {
					jQuery.event.add( context[j], "live." + liveConvert( type, selector ),
						{ data: data, selector: selector, handler: fn, origType: type, origHandler: fn, preType: preType } );
				}

			} else {
				// unbind live handler
				context.unbind( "live." + liveConvert( type, selector ), fn );
			}
		}

		return this;
	};
});

function liveHandler( event ) {
	var stop, maxLevel, related, match, handleObj, elem, j, i, l, data, close, namespace, ret,
		elems = [],
		selectors = [],
		events = jQuery._data( this, "events" );

	// Make sure we avoid non-left-click bubbling in Firefox (#3861) and disabled elements in IE (#6911)
	if ( event.liveFired === this || !events || !events.live || event.target.disabled || event.button && event.type === "click" ) {
		return;
	}

	if ( event.namespace ) {
		namespace = new RegExp("(^|\\.)" + event.namespace.split(".").join("\\.(?:.*\\.)?") + "(\\.|$)");
	}

	event.liveFired = this;

	var live = events.live.slice(0);

	for ( j = 0; j < live.length; j++ ) {
		handleObj = live[j];

		if ( handleObj.origType.replace( rnamespaces, "" ) === event.type ) {
			selectors.push( handleObj.selector );

		} else {
			live.splice( j--, 1 );
		}
	}

	match = jQuery( event.target ).closest( selectors, event.currentTarget );

	for ( i = 0, l = match.length; i < l; i++ ) {
		close = match[i];

		for ( j = 0; j < live.length; j++ ) {
			handleObj = live[j];

			if ( close.selector === handleObj.selector && (!namespace || namespace.test( handleObj.namespace )) && !close.elem.disabled ) {
				elem = close.elem;
				related = null;

				// Those two events require additional checking
				if ( handleObj.preType === "mouseenter" || handleObj.preType === "mouseleave" ) {
					event.type = handleObj.preType;
					related = jQuery( event.relatedTarget ).closest( handleObj.selector )[0];

					// Make sure not to accidentally match a child element with the same selector
					if ( related && jQuery.contains( elem, related ) ) {
						related = elem;
					}
				}

				if ( !related || related !== elem ) {
					elems.push({ elem: elem, handleObj: handleObj, level: close.level });
				}
			}
		}
	}

	for ( i = 0, l = elems.length; i < l; i++ ) {
		match = elems[i];

		if ( maxLevel && match.level > maxLevel ) {
			break;
		}

		event.currentTarget = match.elem;
		event.data = match.handleObj.data;
		event.handleObj = match.handleObj;

		ret = match.handleObj.origHandler.apply( match.elem, arguments );

		if ( ret === false || event.isPropagationStopped() ) {
			maxLevel = match.level;

			if ( ret === false ) {
				stop = false;
			}
			if ( event.isImmediatePropagationStopped() ) {
				break;
			}
		}
	}

	return stop;
}

function liveConvert( type, selector ) {
	return (type && type !== "*" ? type + "." : "") + selector.replace(rperiod, "`").replace(rspaces, "&");
}

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.bind( name, data, fn ) :
			this.trigger( name );
	};

	if ( jQuery.attrFn ) {
		jQuery.attrFn[ name ] = true;
	}
});



/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var match,
			type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var found, item,
					filter = Expr.filter[ type ],
					left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
		ID: function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			}
		}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

		focus: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

				case "nth":
					var first = match[2],
						last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

	return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";

	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
				
				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );
					
					// Speed-up: Sizzle(".CLASS")
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}
				
				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );
						
					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}
							
						} else {
							return makeArray( [], extra );
						}
					}
					
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

	if ( matches ) {
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node (IE 9 fails this)
		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
			pseudoWorks = false;

		try {
			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( document.documentElement, "[test!='']:sizzle" );
	
		} catch( pseudoError ) {
			pseudoWorks = true;
		}

		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						var ret = matches.call( node, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || !disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11 ) {
							return ret;
						}
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})();


var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	rmultiselector = /,/,
	isSimple = /^.[^:#\[\.,]*$/,
	slice = Array.prototype.slice,
	POS = jQuery.expr.match.POS,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var self = this,
			i, l;

		if ( typeof selector !== "string" ) {
			return jQuery( selector ).filter(function() {
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		var ret = this.pushStack( "", "find", selector ),
			length, n, r;

		for ( i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var targets = jQuery( target );
		return this.filter(function() {
			for ( var i = 0, l = targets.length; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && ( typeof selector === "string" ?
			jQuery.filter( selector, this ).length > 0 :
			this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var ret = [], i, l, cur = this[0];
		
		// Array
		if ( jQuery.isArray( selectors ) ) {
			var match, selector,
				matches = {},
				level = 1;

			if ( cur && selectors.length ) {
				for ( i = 0, l = selectors.length; i < l; i++ ) {
					selector = selectors[i];

					if ( !matches[ selector ] ) {
						matches[ selector ] = POS.test( selector ) ?
							jQuery( selector, context || this.context ) :
							selector;
					}
				}

				while ( cur && cur.ownerDocument && cur !== context ) {
					for ( selector in matches ) {
						match = matches[ selector ];

						if ( match.jquery ? match.index( cur ) > -1 : jQuery( cur ).is( match ) ) {
							ret.push({ selector: selector, elem: cur, level: level });
						}
					}

					cur = cur.parentNode;
					level++;
				}
			}

			return ret;
		}

		// String
		var pos = POS.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( i = 0, l = this.length; i < l; i++ ) {
			cur = this[i];

			while ( cur ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;

				} else {
					cur = cur.parentNode;
					if ( !cur || !cur.ownerDocument || cur === context || cur.nodeType === 11 ) {
						break;
					}
				}
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	andSelf: function() {
		return this.add( this.prevObject );
	}
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return jQuery.nth( elem, 2, "nextSibling" );
	},
	prev: function( elem ) {
		return jQuery.nth( elem, 2, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( elem.parentNode.firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.makeArray( elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until ),
			// The variable 'args' was introduced in
			// https://github.com/jquery/jquery/commit/52a0238
			// to work around a bug in Chrome 10 (Dev) and should be removed when the bug is fixed.
			// http://code.google.com/p/v8/issues/detail?id=1050
			args = slice.call(arguments);

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, args.join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	nth: function( cur, result, dir, elem ) {
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] ) {
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return (elem === qualifier) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return (jQuery.inArray( elem, qualifier ) >= 0) === keep;
	});
}




var rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnocache = /<(?:script|object|embed|option|style)/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /\/(java|ecma)script/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	};

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "div<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( text ) {
		if ( jQuery.isFunction(text) ) {
			return this.each(function(i) {
				var self = jQuery( this );

				self.text( text.call(this, i, self.text()) );
			});
		}

		if ( typeof text !== "object" && text !== undefined ) {
			return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
		}

		return jQuery.text( this );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		return this.each(function() {
			jQuery( this ).wrapAll( html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		} else if ( arguments.length ) {
			var set = jQuery(arguments[0]);
			set.push.apply( set, this.toArray() );
			return this.pushStack( set, "before", arguments );
		}
	},

	after: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		} else if ( arguments.length ) {
			var set = this.pushStack( this, "after", arguments );
			set.push.apply( set, jQuery(arguments[0]).toArray() );
			return set;
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		if ( value === undefined ) {
			return this[0] && this[0].nodeType === 1 ?
				this[0].innerHTML.replace(rinlinejQuery, "") :
				null;

		// See if we can take a shortcut and just use innerHTML
		} else if ( typeof value === "string" && !rnocache.test( value ) &&
			(jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
			!wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {

			value = value.replace(rxhtmlTag, "<$1></$2>");

			try {
				for ( var i = 0, l = this.length; i < l; i++ ) {
					// Remove element nodes and prevent memory leaks
					if ( this[i].nodeType === 1 ) {
						jQuery.cleanData( this[i].getElementsByTagName("*") );
						this[i].innerHTML = value;
					}
				}

			// If using innerHTML throws an exception, use the fallback method
			} catch(e) {
				this.empty().append( value );
			}

		} else if ( jQuery.isFunction( value ) ) {
			this.each(function(i){
				var self = jQuery( this );

				self.html( value.call(this, i, self.html()) );
			});

		} else {
			this.empty().append( value );
		}

		return this;
	},

	replaceWith: function( value ) {
		if ( this[0] && this[0].parentNode ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery( value ).detach();
			}

			return this.each(function() {
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		} else {
			return this.length ?
				this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
				this;
		}
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {
		var results, first, fragment, parent,
			value = args[0],
			scripts = [];

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback, true );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call(this, i, table ? self.html() : undefined);
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			parent = value && value.parentNode;

			// If we're in a fragment, just use that instead of building a new one
			if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
				results = { fragment: parent };

			} else {
				results = jQuery.buildFragment( args, this, scripts );
			}

			fragment = results.fragment;

			if ( fragment.childNodes.length === 1 ) {
				first = fragment = fragment.firstChild;
			} else {
				first = fragment.firstChild;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ ) {
					callback.call(
						table ?
							root(this[i], first) :
							this[i],
						// Make sure that we do not leak memory by inadvertently discarding
						// the original fragment (which might have attached data) instead of
						// using it; in addition, use the original fragment object for the last
						// item instead of first because it can end up being emptied incorrectly
						// in certain situations (Bug #8070).
						// Fragments from the fragment cache must always be cloned and never used
						// in place.
						results.cacheable || (l > 1 && i < lastIndex) ?
							jQuery.clone( fragment, true, true ) :
							fragment
					);
				}
			}

			if ( scripts.length ) {
				jQuery.each( scripts, evalScript );
			}
		}

		return this;
	}
});

function root( elem, cur ) {
	return jQuery.nodeName(elem, "table") ?
		(elem.getElementsByTagName("tbody")[0] ||
		elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
		elem;
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var internalKey = jQuery.expando,
		oldData = jQuery.data( src ),
		curData = jQuery.data( dest, oldData );

	// Switch to use the internal data object, if it exists, for the next
	// stage of data copying
	if ( (oldData = oldData[ internalKey ]) ) {
		var events = oldData.events;
				curData = curData[ internalKey ] = jQuery.extend({}, oldData);

		if ( events ) {
			delete curData.handle;
			curData.events = {};

			for ( var type in events ) {
				for ( var i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type + ( events[ type ][ i ].namespace ? "." : "" ) + events[ type ][ i ].namespace, events[ type ][ i ], events[ type ][ i ].data );
				}
			}
		}
	}
}

function cloneFixAttributes( src, dest ) {
	var nodeName;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	if ( dest.clearAttributes ) {
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	if ( dest.mergeAttributes ) {
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 fail to clone children inside object elements that use
	// the proprietary classid attribute value (rather than the type
	// attribute) to identify the type of content to display
	if ( nodeName === "object" ) {
		dest.outerHTML = src.outerHTML;

	} else if ( nodeName === "input" && (src.type === "checkbox" || src.type === "radio") ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set
		if ( src.checked ) {
			dest.defaultChecked = dest.checked = src.checked;
		}

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, nodes, scripts ) {
	var fragment, cacheable, cacheresults, doc;

  // nodes may contain either an explicit document object,
  // a jQuery collection or context object.
  // If nodes[0] contains a valid object to assign to doc
  if ( nodes && nodes[0] ) {
    doc = nodes[0].ownerDocument || nodes[0];
  }

  // Ensure that an attr object doesn't incorrectly stand in as a document object
	// Chrome and Firefox seem to allow this to occur and will throw exception
	// Fixes #8950
	if ( !doc.createDocumentFragment ) {
		doc = document;
	}

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	if ( args.length === 1 && typeof args[0] === "string" && args[0].length < 512 && doc === document &&
		args[0].charAt(0) === "<" && !rnocache.test( args[0] ) && (jQuery.support.checkClone || !rchecked.test( args[0] )) ) {

		cacheable = true;

		cacheresults = jQuery.fragments[ args[0] ];
		if ( cacheresults && cacheresults !== 1 ) {
			fragment = cacheresults;
		}
	}

	if ( !fragment ) {
		fragment = doc.createDocumentFragment();
		jQuery.clean( args, doc, fragment, scripts );
	}

	if ( cacheable ) {
		jQuery.fragments[ args[0] ] = cacheresults ? fragment : 1;
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var ret = [],
			insert = jQuery( selector ),
			parent = this.length === 1 && this[0].parentNode;

		if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
			insert[ original ]( this[0] );
			return this;

		} else {
			for ( var i = 0, l = insert.length; i < l; i++ ) {
				var elems = (i > 0 ? this.clone(true) : this).get();
				jQuery( insert[i] )[ original ]( elems );
				ret = ret.concat( elems );
			}

			return this.pushStack( ret, name, insert.selector );
		}
	};
});

function getAll( elem ) {
	if ( "getElementsByTagName" in elem ) {
		return elem.getElementsByTagName( "*" );

	} else if ( "querySelectorAll" in elem ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( elem.type === "checkbox" || elem.type === "radio" ) {
		elem.defaultChecked = elem.checked;
	}
}
// Finds all inputs and passes them to fixDefaultChecked
function findInputs( elem ) {
	if ( jQuery.nodeName( elem, "input" ) ) {
		fixDefaultChecked( elem );
	} else if ( "getElementsByTagName" in elem ) {
		jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var clone = elem.cloneNode(true),
				srcElements,
				destElements,
				i;

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName
			// instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		srcElements = destElements = null;

		// Return the cloned set
		return clone;
	},

	clean: function( elems, context, fragment, scripts ) {
		var checkScriptType;

		context = context || document;

		// !context.createElement fails in IE with an error but returns typeof 'object'
		if ( typeof context.createElement === "undefined" ) {
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
		}

		var ret = [], j;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Trim whitespace, otherwise indexOf won't work as expected
					var tag = (rtagName.exec( elem ) || ["", ""])[1].toLowerCase(),
						wrap = wrapMap[ tag ] || wrapMap._default,
						depth = wrap[0],
						div = context.createElement("div");

					// Go to html and back, then peel off extra wrappers
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						var hasBody = rtbody.test(elem),
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;
				}
			}

			// Resets defaultChecked for any radios and checkboxes
			// about to be appended to the DOM in IE 6/7 (#8060)
			var len;
			if ( !jQuery.support.appendChecked ) {
				if ( elem[0] && typeof (len = elem.length) === "number" ) {
					for ( j = 0; j < len; j++ ) {
						findInputs( elem[j] );
					}
				} else {
					findInputs( elem );
				}
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				ret = jQuery.merge( ret, elem );
			}
		}

		if ( fragment ) {
			checkScriptType = function( elem ) {
				return !elem.type || rscriptType.test( elem.type );
			};
			for ( i = 0; ret[i]; i++ ) {
				if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
					scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );

				} else {
					if ( ret[i].nodeType === 1 ) {
						var jsTags = jQuery.grep( ret[i].getElementsByTagName( "script" ), checkScriptType );

						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
					}
					fragment.appendChild( ret[i] );
				}
			}
		}

		return ret;
	},

	cleanData: function( elems ) {
		var data, id, cache = jQuery.cache, internalKey = jQuery.expando, special = jQuery.event.special,
			deleteExpando = jQuery.support.deleteExpando;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
				continue;
			}

			id = elem[ jQuery.expando ];

			if ( id ) {
				data = cache[ id ] && cache[ id ][ internalKey ];

				if ( data && data.events ) {
					for ( var type in data.events ) {
						if ( special[ type ] ) {
							jQuery.event.remove( elem, type );

						// This is a shortcut to avoid jQuery.event.remove's overhead
						} else {
							jQuery.removeEvent( elem, type, data.handle );
						}
					}

					// Null the DOM reference to avoid IE6/7/8 leak (#7054)
					if ( data.handle ) {
						data.handle.elem = null;
					}
				}

				if ( deleteExpando ) {
					delete elem[ jQuery.expando ];

				} else if ( elem.removeAttribute ) {
					elem.removeAttribute( jQuery.expando );
				}

				delete cache[ id ];
			}
		}
	}
});

function evalScript( i, elem ) {
	if ( elem.src ) {
		jQuery.ajax({
			url: elem.src,
			async: false,
			dataType: "script"
		});
	} else {
		jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "/*$0*/" ) );
	}

	if ( elem.parentNode ) {
		elem.parentNode.removeChild( elem );
	}
}




var ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	// fixed for IE9, see #8346
	rupper = /([A-Z]|^ms)/g,
	rnumpx = /^-?\d+(?:px)?$/i,
	rnum = /^-?\d/,
	rrelNum = /^([\-+])=([\-+.\de]+)/,

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssWidth = [ "Left", "Right" ],
	cssHeight = [ "Top", "Bottom" ],
	curCSS,

	getComputedStyle,
	currentStyle;

jQuery.fn.css = function( name, value ) {
	// Setting 'undefined' is a no-op
	if ( arguments.length === 2 && value === undefined ) {
		return this;
	}

	return jQuery.access( this, name, value, true, function( elem, name, value ) {
		return value !== undefined ?
			jQuery.style( elem, name, value ) :
			jQuery.css( elem, name );
	});
};

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity", "opacity" );
					return ret === "" ? "1" : ret;

				} else {
					return elem.style.opacity;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, origName = jQuery.camelCase( name ),
			style = elem.style, hooks = jQuery.cssHooks[ origName ];

		name = jQuery.cssProps[ origName ] || origName;

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( +( ret[1] + 1) * +ret[2] ) + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra ) {
		var ret, hooks;

		// Make sure that we're working with the right name
		name = jQuery.camelCase( name );
		hooks = jQuery.cssHooks[ name ];
		name = jQuery.cssProps[ name ] || name;

		// cssFloat needs a special treatment
		if ( name === "cssFloat" ) {
			name = "float";
		}

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) {
			return ret;

		// Otherwise, if a way to get the computed value exists, use that
		} else if ( curCSS ) {
			return curCSS( elem, name );
		}
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var old = {};

		// Remember the old values, and insert the new ones
		for ( var name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
	}
});

// DEPRECATED, Use jQuery.css() instead
jQuery.curCSS = jQuery.css;

jQuery.each(["height", "width"], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			var val;

			if ( computed ) {
				if ( elem.offsetWidth !== 0 ) {
					return getWH( elem, name, extra );
				} else {
					jQuery.swap( elem, cssShow, function() {
						val = getWH( elem, name, extra );
					});
				}

				return val;
			}
		},

		set: function( elem, value ) {
			if ( rnumpx.test( value ) ) {
				// ignore negative width and height values #1599
				value = parseFloat( value );

				if ( value >= 0 ) {
					return value + "px";
				}

			} else {
				return value;
			}
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( parseFloat( RegExp.$1 ) / 100 ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNaN( value ) ? "" : "alpha(opacity=" + value * 100 + ")",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there there is no filter style applied in a css rule, we are done
				if ( currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery(function() {
	// This hook cannot be added until DOM ready because the support test
	// for it is not run until after DOM ready
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				var ret;
				jQuery.swap( elem, { "display": "inline-block" }, function() {
					if ( computed ) {
						ret = curCSS( elem, "margin-right", "marginRight" );
					} else {
						ret = elem.style.marginRight;
					}
				});
				return ret;
			}
		};
	}
});

if ( document.defaultView && document.defaultView.getComputedStyle ) {
	getComputedStyle = function( elem, name ) {
		var ret, defaultView, computedStyle;

		name = name.replace( rupper, "-$1" ).toLowerCase();

		if ( !(defaultView = elem.ownerDocument.defaultView) ) {
			return undefined;
		}

		if ( (computedStyle = defaultView.getComputedStyle( elem, null )) ) {
			ret = computedStyle.getPropertyValue( name );
			if ( ret === "" && !jQuery.contains( elem.ownerDocument.documentElement, elem ) ) {
				ret = jQuery.style( elem, name );
			}
		}

		return ret;
	};
}

if ( document.documentElement.currentStyle ) {
	currentStyle = function( elem, name ) {
		var left,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			rsLeft = elem.runtimeStyle && elem.runtimeStyle[ name ],
			style = elem.style;

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {
			// Remember the original values
			left = style.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : (ret || 0);
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

curCSS = getComputedStyle || currentStyle;

function getWH( elem, name, extra ) {

	// Start with offset property
	var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		which = name === "width" ? cssWidth : cssHeight;

	if ( val > 0 ) {
		if ( extra !== "border" ) {
			jQuery.each( which, function() {
				if ( !extra ) {
					val -= parseFloat( jQuery.css( elem, "padding" + this ) ) || 0;
				}
				if ( extra === "margin" ) {
					val += parseFloat( jQuery.css( elem, extra + this ) ) || 0;
				} else {
					val -= parseFloat( jQuery.css( elem, "border" + this + "Width" ) ) || 0;
				}
			});
		}

		return val + "px";
	}

	// Fall back to computed then uncomputed css if necessary
	val = curCSS( elem, name, name );
	if ( val < 0 || val == null ) {
		val = elem.style[ name ] || 0;
	}
	// Normalize "", auto, and prepare for extra
	val = parseFloat( val ) || 0;

	// Add padding, border, margin
	if ( extra ) {
		jQuery.each( which, function() {
			val += parseFloat( jQuery.css( elem, "padding" + this ) ) || 0;
			if ( extra !== "padding" ) {
				val += parseFloat( jQuery.css( elem, "border" + this + "Width" ) ) || 0;
			}
			if ( extra === "margin" ) {
				val += parseFloat( jQuery.css( elem, extra + this ) ) || 0;
			}
		});
	}

	return val + "px";
}

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		var width = elem.offsetWidth,
			height = elem.offsetHeight;

		return (width === 0 && height === 0) || (!jQuery.support.reliableHiddenOffsets && (elem.style.display || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rselectTextarea = /^(?:select|textarea)/i,
	rspacesAjax = /\s+/,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Document location
	ajaxLocation,

	// Document location segments
	ajaxLocParts,
	
	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		if ( jQuery.isFunction( func ) ) {
			var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
				i = 0,
				length = dataTypes.length,
				dataType,
				list,
				placeBefore;

			// For each dataType in the dataTypeExpression
			for(; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters ),
		selection;

	for(; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};
	for( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}
}

jQuery.fn.extend({
	load: function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );

		// Don't do a request if no elements are being requested
		} else if ( !this.length ) {
			return this;
		}

		var off = url.indexOf( " " );
		if ( off >= 0 ) {
			var selector = url.slice( off, url.length );
			url = url.slice( 0, off );
		}

		// Default to a GET request
		var type = "GET";

		// If the second parameter was provided
		if ( params ) {
			// If it's a function
			if ( jQuery.isFunction( params ) ) {
				// We assume that it's the callback
				callback = params;
				params = undefined;

			// Otherwise, build a param string
			} else if ( typeof params === "object" ) {
				params = jQuery.param( params, jQuery.ajaxSettings.traditional );
				type = "POST";
			}
		}

		var self = this;

		// Request the remote document
		jQuery.ajax({
			url: url,
			type: type,
			dataType: "html",
			data: params,
			// Complete callback (responseText is used internally)
			complete: function( jqXHR, status, responseText ) {
				// Store the response as specified by the jqXHR object
				responseText = jqXHR.responseText;
				// If successful, inject the HTML into all the matched elements
				if ( jqXHR.isResolved() ) {
					// #4825: Get the actual response in case
					// a dataFilter is present in ajaxSettings
					jqXHR.done(function( r ) {
						responseText = r;
					});
					// See if a selector was specified
					self.html( selector ?
						// Create a dummy div to hold the results
						jQuery("<div>")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(responseText.replace(rscript, ""))

							// Locate the specified elements
							.find(selector) :

						// If not, just inject the full result
						responseText );
				}

				if ( callback ) {
					self.each( callback, [ responseText, status, jqXHR ] );
				}
			}
		});

		return this;
	},

	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},

	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.bind( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		if ( settings ) {
			// Building a settings object
			ajaxExtend( target, jQuery.ajaxSettings );
		} else {
			// Extending ajaxSettings
			settings = target;
			target = jQuery.ajaxSettings;
		}
		ajaxExtend( target, settings );
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": allTypes
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			context: true,
			url: true
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery._Deferred(),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// ifModified key
			ifModifiedKey,
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// The jqXHR state
			state = 0,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || "abort";
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, nativeStatusText, responses, headers ) {

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			var isSuccess,
				success,
				error,
				statusText = nativeStatusText,
				response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
				lastModified,
				etag;

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
						jQuery.lastModified[ ifModifiedKey ] = lastModified;
					}
					if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
						jQuery.etag[ ifModifiedKey ] = etag;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					try {
						success = ajaxConvert( s, response );
						statusText = "success";
						isSuccess = true;
					} catch(e) {
						// We have a parsererror
						statusText = "parsererror";
						error = e;
					}
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = "" + ( nativeStatusText || statusText );

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.resolveWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.done;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.then( tmp, tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );

		// Determine if a cross-domain request is in order
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefiler, stop there
		if ( state === 2 ) {
			return false;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( (ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already
				jqXHR.abort();
				return false;

		}

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					jQuery.error( e );
				}
			}
		}

		return jqXHR;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a, traditional ) {
		var s = [],
			add = function( key, value ) {
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : value;
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			});

		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( var prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	}
});

function buildParams( prefix, obj, traditional, add ) {
	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && obj != null && typeof obj === "object" ) {
		// Serialize object item.
		for ( var name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// This is still on the jQuery object... for now
// Want to move this to jQuery.ajax some day
jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields,
		ct,
		type,
		finalDataType,
		firstDataType;

	// Fill responseXXX fields
	for( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	var dataTypes = s.dataTypes,
		converters = {},
		i,
		key,
		length = dataTypes.length,
		tmp,
		// Current and previous dataTypes
		current = dataTypes[ 0 ],
		prev,
		// Conversion expression
		conversion,
		// Conversion function
		conv,
		// Conversion functions (transitive conversion)
		conv1,
		conv2;

	// For each dataType in the chain
	for( i = 1; i < length; i++ ) {

		// Create converters map
		// with lowercased keys
		if ( i === 1 ) {
			for( key in s.converters ) {
				if( typeof key === "string" ) {
					converters[ key.toLowerCase() ] = s.converters[ key ];
				}
			}
		}

		// Get the dataTypes
		prev = current;
		current = dataTypes[ i ];

		// If current is auto dataType, update it to prev
		if( current === "*" ) {
			current = prev;
		// If no auto and dataTypes are actually different
		} else if ( prev !== "*" && prev !== current ) {

			// Get the converter
			conversion = prev + " " + current;
			conv = converters[ conversion ] || converters[ "* " + current ];

			// If there is no direct converter, search transitively
			if ( !conv ) {
				conv2 = undefined;
				for( conv1 in converters ) {
					tmp = conv1.split( " " );
					if ( tmp[ 0 ] === prev || tmp[ 0 ] === "*" ) {
						conv2 = converters[ tmp[1] + " " + current ];
						if ( conv2 ) {
							conv1 = converters[ conv1 ];
							if ( conv1 === true ) {
								conv = conv2;
							} else if ( conv2 === true ) {
								conv = conv1;
							}
							break;
						}
					}
				}
			}
			// If we found no converter, dispatch an error
			if ( !( conv || conv2 ) ) {
				jQuery.error( "No conversion from " + conversion.replace(" "," to ") );
			}
			// If found converter is not an equivalence
			if ( conv !== true ) {
				// Convert with 1 or 2 converters accordingly
				response = conv ? conv( response ) : conv2( conv1(response) );
			}
		}
	}
	return response;
}




var jsc = jQuery.now(),
	jsre = /(\=)\?(&|$)|\?\?/i;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		return jQuery.expando + "_" + ( jsc++ );
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var inspectData = s.contentType === "application/x-www-form-urlencoded" &&
		( typeof s.data === "string" );

	if ( s.dataTypes[ 0 ] === "jsonp" ||
		s.jsonp !== false && ( jsre.test( s.url ) ||
				inspectData && jsre.test( s.data ) ) ) {

		var responseContainer,
			jsonpCallback = s.jsonpCallback =
				jQuery.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
			previous = window[ jsonpCallback ],
			url = s.url,
			data = s.data,
			replace = "$1" + jsonpCallback + "$2";

		if ( s.jsonp !== false ) {
			url = url.replace( jsre, replace );
			if ( s.url === url ) {
				if ( inspectData ) {
					data = data.replace( jsre, replace );
				}
				if ( s.data === data ) {
					// Add callback manually
					url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
				}
			}
		}

		s.url = url;
		s.data = data;

		// Install callback
		window[ jsonpCallback ] = function( response ) {
			responseContainer = [ response ];
		};

		// Clean-up function
		jqXHR.always(function() {
			// Set callback back to previous value
			window[ jsonpCallback ] = previous;
			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( previous ) ) {
				window[ jsonpCallback ]( responseContainer[ 0 ] );
			}
		});

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( jsonpCallback + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Delegate to script
		return "script";
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});




var // #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0,
	xhrCallbacks;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,
		cors: !!xhr && ( "withCredentials" in xhr )
	});
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var xhr = s.xhr(),
						handle,
						i;

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occured
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}
									responses.text = xhr.responseText;

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					// if we're in sync mode or it's in cache
					// and has been retrieved directly (IE6 & IE7)
					// we need to manually fire the callback
					if ( !s.async || xhr.readyState === 4 ) {
						callback();
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}




var elemdisplay = {},
	iframe, iframeDoc,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
	timerId,
	fxAttrs = [
		// height animations
		[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
		// width animations
		[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
		// opacity animations
		[ "opacity" ]
	],
	fxNow;

jQuery.fn.extend({
	show: function( speed, easing, callback ) {
		var elem, display;

		if ( speed || speed === 0 ) {
			return this.animate( genFx("show", 3), speed, easing, callback);

		} else {
			for ( var i = 0, j = this.length; i < j; i++ ) {
				elem = this[i];

				if ( elem.style ) {
					display = elem.style.display;

					// Reset the inline display of this element to learn if it is
					// being hidden by cascaded rules or not
					if ( !jQuery._data(elem, "olddisplay") && display === "none" ) {
						display = elem.style.display = "";
					}

					// Set elements which have been overridden with display: none
					// in a stylesheet to whatever the default browser style is
					// for such an element
					if ( display === "" && jQuery.css( elem, "display" ) === "none" ) {
						jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
					}
				}
			}

			// Set the display of most of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				elem = this[i];

				if ( elem.style ) {
					display = elem.style.display;

					if ( display === "" || display === "none" ) {
						elem.style.display = jQuery._data(elem, "olddisplay") || "";
					}
				}
			}

			return this;
		}
	},

	hide: function( speed, easing, callback ) {
		if ( speed || speed === 0 ) {
			return this.animate( genFx("hide", 3), speed, easing, callback);

		} else {
			for ( var i = 0, j = this.length; i < j; i++ ) {
				if ( this[i].style ) {
					var display = jQuery.css( this[i], "display" );

					if ( display !== "none" && !jQuery._data( this[i], "olddisplay" ) ) {
						jQuery._data( this[i], "olddisplay", display );
					}
				}
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				if ( this[i].style ) {
					this[i].style.display = "none";
				}
			}

			return this;
		}
	},

	// Save the old toggle function
	_toggle: jQuery.fn.toggle,

	toggle: function( fn, fn2, callback ) {
		var bool = typeof fn === "boolean";

		if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
			this._toggle.apply( this, arguments );

		} else if ( fn == null || bool ) {
			this.each(function() {
				var state = bool ? fn : jQuery(this).is(":hidden");
				jQuery(this)[ state ? "show" : "hide" ]();
			});

		} else {
			this.animate(genFx("toggle", 3), fn, fn2, callback);
		}

		return this;
	},

	fadeTo: function( speed, to, easing, callback ) {
		return this.filter(":hidden").css("opacity", 0).show().end()
					.animate({opacity: to}, speed, easing, callback);
	},

	animate: function( prop, speed, easing, callback ) {
		var optall = jQuery.speed(speed, easing, callback);

		if ( jQuery.isEmptyObject( prop ) ) {
			return this.each( optall.complete, [ false ] );
		}

		// Do not change referenced properties as per-property easing will be lost
		prop = jQuery.extend( {}, prop );

		return this[ optall.queue === false ? "each" : "queue" ](function() {
			// XXX 'this' does not always have a nodeName when running the
			// test suite

			if ( optall.queue === false ) {
				jQuery._mark( this );
			}

			var opt = jQuery.extend( {}, optall ),
				isElement = this.nodeType === 1,
				hidden = isElement && jQuery(this).is(":hidden"),
				name, val, p,
				display, e,
				parts, start, end, unit;

			// will store per property easing and be used to determine when an animation is complete
			opt.animatedProperties = {};

			for ( p in prop ) {

				// property name normalization
				name = jQuery.camelCase( p );
				if ( p !== name ) {
					prop[ name ] = prop[ p ];
					delete prop[ p ];
				}

				val = prop[ name ];

				// easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
				if ( jQuery.isArray( val ) ) {
					opt.animatedProperties[ name ] = val[ 1 ];
					val = prop[ name ] = val[ 0 ];
				} else {
					opt.animatedProperties[ name ] = opt.specialEasing && opt.specialEasing[ name ] || opt.easing || 'swing';
				}

				if ( val === "hide" && hidden || val === "show" && !hidden ) {
					return opt.complete.call( this );
				}

				if ( isElement && ( name === "height" || name === "width" ) ) {
					// Make sure that nothing sneaks out
					// Record all 3 overflow attributes because IE does not
					// change the overflow attribute when overflowX and
					// overflowY are set to the same value
					opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];

					// Set display property to inline-block for height/width
					// animations on inline elements that are having width/height
					// animated
					if ( jQuery.css( this, "display" ) === "inline" &&
							jQuery.css( this, "float" ) === "none" ) {
						if ( !jQuery.support.inlineBlockNeedsLayout ) {
							this.style.display = "inline-block";

						} else {
							display = defaultDisplay( this.nodeName );

							// inline-level elements accept inline-block;
							// block-level elements need to be inline with layout
							if ( display === "inline" ) {
								this.style.display = "inline-block";

							} else {
								this.style.display = "inline";
								this.style.zoom = 1;
							}
						}
					}
				}
			}

			if ( opt.overflow != null ) {
				this.style.overflow = "hidden";
			}

			for ( p in prop ) {
				e = new jQuery.fx( this, opt, p );
				val = prop[ p ];

				if ( rfxtypes.test(val) ) {
					e[ val === "toggle" ? hidden ? "show" : "hide" : val ]();

				} else {
					parts = rfxnum.exec( val );
					start = e.cur();

					if ( parts ) {
						end = parseFloat( parts[2] );
						unit = parts[3] || ( jQuery.cssNumber[ p ] ? "" : "px" );

						// We need to compute starting value
						if ( unit !== "px" ) {
							jQuery.style( this, p, (end || 1) + unit);
							start = ((end || 1) / e.cur()) * start;
							jQuery.style( this, p, start + unit);
						}

						// If a +=/-= token was provided, we're doing a relative animation
						if ( parts[1] ) {
							end = ( (parts[ 1 ] === "-=" ? -1 : 1) * end ) + start;
						}

						e.custom( start, end, unit );

					} else {
						e.custom( start, val, "" );
					}
				}
			}

			// For JS strict compliance
			return true;
		});
	},

	stop: function( clearQueue, gotoEnd ) {
		if ( clearQueue ) {
			this.queue([]);
		}

		this.each(function() {
			var timers = jQuery.timers,
				i = timers.length;
			// clear marker counters if we know they won't be
			if ( !gotoEnd ) {
				jQuery._unmark( true, this );
			}
			while ( i-- ) {
				if ( timers[i].elem === this ) {
					if (gotoEnd) {
						// force the next step to be the last
						timers[i](true);
					}

					timers.splice(i, 1);
				}
			}
		});

		// start the next in the queue if the last step wasn't forced
		if ( !gotoEnd ) {
			this.dequeue();
		}

		return this;
	}

});

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout( clearFxNow, 0 );
	return ( fxNow = jQuery.now() );
}

function clearFxNow() {
	fxNow = undefined;
}

// Generate parameters to create a standard animation
function genFx( type, num ) {
	var obj = {};

	jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice(0,num)), function() {
		obj[ this ] = type;
	});

	return obj;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show", 1),
	slideUp: genFx("hide", 1),
	slideToggle: genFx("toggle", 1),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.extend({
	speed: function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
			opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

		// Queueing
		opt.old = opt.complete;
		opt.complete = function( noUnmark ) {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue !== false ) {
				jQuery.dequeue( this );
			} else if ( noUnmark !== false ) {
				jQuery._unmark( this );
			}
		};

		return opt;
	},

	easing: {
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff ) {
			return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
		}
	},

	timers: [],

	fx: function( elem, options, prop ) {
		this.options = options;
		this.elem = elem;
		this.prop = prop;

		options.orig = options.orig || {};
	}

});

jQuery.fx.prototype = {
	// Simple function for setting a style value
	update: function() {
		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		(jQuery.fx.step[this.prop] || jQuery.fx.step._default)( this );
	},

	// Get the current size
	cur: function() {
		if ( this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null) ) {
			return this.elem[ this.prop ];
		}

		var parsed,
			r = jQuery.css( this.elem, this.prop );
		// Empty strings, null, undefined and "auto" are converted to 0,
		// complex values such as "rotate(1rad)" are returned as is,
		// simple values such as "10px" are parsed to Float.
		return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;
	},

	// Start an animation from one number to another
	custom: function( from, to, unit ) {
		var self = this,
			fx = jQuery.fx;

		this.startTime = fxNow || createFxNow();
		this.start = from;
		this.end = to;
		this.unit = unit || this.unit || ( jQuery.cssNumber[ this.prop ] ? "" : "px" );
		this.now = this.start;
		this.pos = this.state = 0;

		function t( gotoEnd ) {
			return self.step(gotoEnd);
		}

		t.elem = this.elem;

		if ( t() && jQuery.timers.push(t) && !timerId ) {
			timerId = setInterval( fx.tick, fx.interval );
		}
	},

	// Simple 'show' function
	show: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
		this.options.show = true;

		// Begin the animation
		// Make sure that we start at a small width/height to avoid any
		// flash of content
		this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());

		// Start by showing the element
		jQuery( this.elem ).show();
	},

	// Simple 'hide' function
	hide: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
		this.options.hide = true;

		// Begin the animation
		this.custom(this.cur(), 0);
	},

	// Each step of an animation
	step: function( gotoEnd ) {
		var t = fxNow || createFxNow(),
			done = true,
			elem = this.elem,
			options = this.options,
			i, n;

		if ( gotoEnd || t >= options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			options.animatedProperties[ this.prop ] = true;

			for ( i in options.animatedProperties ) {
				if ( options.animatedProperties[i] !== true ) {
					done = false;
				}
			}

			if ( done ) {
				// Reset the overflow
				if ( options.overflow != null && !jQuery.support.shrinkWrapBlocks ) {

					jQuery.each( [ "", "X", "Y" ], function (index, value) {
						elem.style[ "overflow" + value ] = options.overflow[index];
					});
				}

				// Hide the element if the "hide" operation was done
				if ( options.hide ) {
					jQuery(elem).hide();
				}

				// Reset the properties, if the item has been hidden or shown
				if ( options.hide || options.show ) {
					for ( var p in options.animatedProperties ) {
						jQuery.style( elem, p, options.orig[p] );
					}
				}

				// Execute the complete function
				options.complete.call( elem );
			}

			return false;

		} else {
			// classical easing cannot be used with an Infinity duration
			if ( options.duration == Infinity ) {
				this.now = t;
			} else {
				n = t - this.startTime;
				this.state = n / options.duration;

				// Perform the easing function, defaults to swing
				this.pos = jQuery.easing[ options.animatedProperties[ this.prop ] ]( this.state, n, 0, 1, options.duration );
				this.now = this.start + ((this.end - this.start) * this.pos);
			}
			// Perform the next step of the animation
			this.update();
		}

		return true;
	}
};

jQuery.extend( jQuery.fx, {
	tick: function() {
		for ( var timers = jQuery.timers, i = 0 ; i < timers.length ; ++i ) {
			if ( !timers[i]() ) {
				timers.splice(i--, 1);
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
	},

	interval: 13,

	stop: function() {
		clearInterval( timerId );
		timerId = null;
	},

	speeds: {
		slow: 600,
		fast: 200,
		// Default speed
		_default: 400
	},

	step: {
		opacity: function( fx ) {
			jQuery.style( fx.elem, "opacity", fx.now );
		},

		_default: function( fx ) {
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
				fx.elem.style[ fx.prop ] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
			} else {
				fx.elem[ fx.prop ] = fx.now;
			}
		}
	}
});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}

// Try to restore the default display value of an element
function defaultDisplay( nodeName ) {

	if ( !elemdisplay[ nodeName ] ) {

		var body = document.body,
			elem = jQuery( "<" + nodeName + ">" ).appendTo( body ),
			display = elem.css( "display" );

		elem.remove();

		// If the simple way fails,
		// get element's real default display by attaching it to a temp iframe
		if ( display === "none" || display === "" ) {
			// No iframe to use yet, so create it
			if ( !iframe ) {
				iframe = document.createElement( "iframe" );
				iframe.frameBorder = iframe.width = iframe.height = 0;
			}

			body.appendChild( iframe );

			// Create a cacheable copy of the iframe document on first call.
			// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
			// document to it; WebKit & Firefox won't allow reusing the iframe document.
			if ( !iframeDoc || !iframe.createElement ) {
				iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
				iframeDoc.write( ( document.compatMode === "CSS1Compat" ? "<!doctype html>" : "" ) + "<html><body>" );
				iframeDoc.close();
			}

			elem = iframeDoc.createElement( nodeName );

			iframeDoc.body.appendChild( elem );

			display = jQuery.css( elem, "display" );

			body.removeChild( iframe );
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return elemdisplay[ nodeName ];
}




var rtable = /^t(?:able|d|h)$/i,
	rroot = /^(?:body|html)$/i;

if ( "getBoundingClientRect" in document.documentElement ) {
	jQuery.fn.offset = function( options ) {
		var elem = this[0], box;

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		try {
			box = elem.getBoundingClientRect();
		} catch(e) {}

		var doc = elem.ownerDocument,
			docElem = doc.documentElement;

		// Make sure we're not dealing with a disconnected DOM node
		if ( !box || !jQuery.contains( docElem, elem ) ) {
			return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
		}

		var body = doc.body,
			win = getWindow(doc),
			clientTop  = docElem.clientTop  || body.clientTop  || 0,
			clientLeft = docElem.clientLeft || body.clientLeft || 0,
			scrollTop  = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop,
			scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
			top  = box.top  + scrollTop  - clientTop,
			left = box.left + scrollLeft - clientLeft;

		return { top: top, left: left };
	};

} else {
	jQuery.fn.offset = function( options ) {
		var elem = this[0];

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		jQuery.offset.initialize();

		var computedStyle,
			offsetParent = elem.offsetParent,
			prevOffsetParent = elem,
			doc = elem.ownerDocument,
			docElem = doc.documentElement,
			body = doc.body,
			defaultView = doc.defaultView,
			prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
			top = elem.offsetTop,
			left = elem.offsetLeft;

		while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
			if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
				break;
			}

			computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
			top  -= elem.scrollTop;
			left -= elem.scrollLeft;

			if ( elem === offsetParent ) {
				top  += elem.offsetTop;
				left += elem.offsetLeft;

				if ( jQuery.offset.doesNotAddBorder && !(jQuery.offset.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)) ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevOffsetParent = offsetParent;
				offsetParent = elem.offsetParent;
			}

			if ( jQuery.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
				top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
				left += parseFloat( computedStyle.borderLeftWidth ) || 0;
			}

			prevComputedStyle = computedStyle;
		}

		if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
			top  += body.offsetTop;
			left += body.offsetLeft;
		}

		if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
			top  += Math.max( docElem.scrollTop, body.scrollTop );
			left += Math.max( docElem.scrollLeft, body.scrollLeft );
		}

		return { top: top, left: left };
	};
}

jQuery.offset = {
	initialize: function() {
		var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( jQuery.css(body, "marginTop") ) || 0,
			html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

		jQuery.extend( container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" } );

		container.innerHTML = html;
		body.insertBefore( container, body.firstChild );
		innerDiv = container.firstChild;
		checkDiv = innerDiv.firstChild;
		td = innerDiv.nextSibling.firstChild.firstChild;

		this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
		this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

		checkDiv.style.position = "fixed";
		checkDiv.style.top = "20px";

		// safari subtracts parent border width here which is 5px
		this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
		checkDiv.style.position = checkDiv.style.top = "";

		innerDiv.style.overflow = "hidden";
		innerDiv.style.position = "relative";

		this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

		this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

		body.removeChild( container );
		jQuery.offset.initialize = jQuery.noop;
	},

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		jQuery.offset.initialize();

		if ( jQuery.offset.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = (position === "absolute" || position === "fixed") && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if (options.top != null) {
			props.top = (options.top - curOffset.top) + curTop;
		}
		if (options.left != null) {
			props.left = (options.left - curOffset.left) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({
	position: function() {
		if ( !this[0] ) {
			return null;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( ["Left", "Top"], function( i, name ) {
	var method = "scroll" + name;

	jQuery.fn[ method ] = function( val ) {
		var elem, win;

		if ( val === undefined ) {
			elem = this[ 0 ];

			if ( !elem ) {
				return null;
			}

			win = getWindow( elem );

			// Return the scroll offset
			return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
				jQuery.support.boxModel && win.document.documentElement[ method ] ||
					win.document.body[ method ] :
				elem[ method ];
		}

		// Set the scroll offset
		return this.each(function() {
			win = getWindow( this );

			if ( win ) {
				win.scrollTo(
					!i ? val : jQuery( win ).scrollLeft(),
					 i ? val : jQuery( win ).scrollTop()
				);

			} else {
				this[ method ] = val;
			}
		});
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}




// Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function( i, name ) {

	var type = name.toLowerCase();

	// innerHeight and innerWidth
	jQuery.fn[ "inner" + name ] = function() {
		var elem = this[0];
		return elem && elem.style ?
			parseFloat( jQuery.css( elem, type, "padding" ) ) :
			null;
	};

	// outerHeight and outerWidth
	jQuery.fn[ "outer" + name ] = function( margin ) {
		var elem = this[0];
		return elem && elem.style ?
			parseFloat( jQuery.css( elem, type, margin ? "margin" : "border" ) ) :
			null;
	};

	jQuery.fn[ type ] = function( size ) {
		// Get window width or height
		var elem = this[0];
		if ( !elem ) {
			return size == null ? null : this;
		}

		if ( jQuery.isFunction( size ) ) {
			return this.each(function( i ) {
				var self = jQuery( this );
				self[ type ]( size.call( this, i, self[ type ]() ) );
			});
		}

		if ( jQuery.isWindow( elem ) ) {
			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			// 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
			var docElemProp = elem.document.documentElement[ "client" + name ],
				body = elem.document.body;
			return elem.document.compatMode === "CSS1Compat" && docElemProp ||
				body && body[ "client" + name ] || docElemProp;

		// Get document width or height
		} else if ( elem.nodeType === 9 ) {
			// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
			return Math.max(
				elem.documentElement["client" + name],
				elem.body["scroll" + name], elem.documentElement["scroll" + name],
				elem.body["offset" + name], elem.documentElement["offset" + name]
			);

		// Get or set width or height on the element
		} else if ( size === undefined ) {
			var orig = jQuery.css( elem, type ),
				ret = parseFloat( orig );

			return jQuery.isNaN( ret ) ? orig : ret;

		// Set the width or height on the element (default to pixels if value is unitless)
		} else {
			return this.css( type, typeof size === "string" ? size : size + "px" );
		}
	};

});


// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;
})(window);
/*!
 * jQuery Templates Plugin 1.0.0pre
 * http://github.com/jquery/jquery-tmpl
 * Requires jQuery 1.4.2
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */
(function( jQuery, undefined ){
	var oldManip = jQuery.fn.domManip, tmplItmAtt = "_tmplitem", htmlExpr = /^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,
		newTmplItems = {}, wrappedItems = {}, appendToTmplItems, topTmplItem = { key: 0, data: {} }, itemKey = 0, cloneIndex = 0, stack = [];

	function newTmplItem( options, parentItem, fn, data ) {
		// Returns a template item data structure for a new rendered instance of a template (a 'template item').
		// The content field is a hierarchical array of strings and nested items (to be
		// removed and replaced by nodes field of dom elements, once inserted in DOM).
		var newItem = {
			data: data || (data === 0 || data === false) ? data : (parentItem ? parentItem.data : {}),
			_wrap: parentItem ? parentItem._wrap : null,
			tmpl: null,
			parent: parentItem || null,
			nodes: [],
			calls: tiCalls,
			nest: tiNest,
			wrap: tiWrap,
			html: tiHtml,
			update: tiUpdate
		};
		if ( options ) {
			jQuery.extend( newItem, options, { nodes: [], parent: parentItem });
		}
		if ( fn ) {
			// Build the hierarchical content to be used during insertion into DOM
			newItem.tmpl = fn;
			newItem._ctnt = newItem._ctnt || newItem.tmpl( jQuery, newItem );
			newItem.key = ++itemKey;
			// Keep track of new template item, until it is stored as jQuery Data on DOM element
			(stack.length ? wrappedItems : newTmplItems)[itemKey] = newItem;
		}
		return newItem;
	}

	// Override appendTo etc., in order to provide support for targeting multiple elements. (This code would disappear if integrated in jquery core).
	jQuery.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var ret = [], insert = jQuery( selector ), elems, i, l, tmplItems,
				parent = this.length === 1 && this[0].parentNode;

			appendToTmplItems = newTmplItems || {};
			if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
				insert[ original ]( this[0] );
				ret = this;
			} else {
				for ( i = 0, l = insert.length; i < l; i++ ) {
					cloneIndex = i;
					elems = (i > 0 ? this.clone(true) : this).get();
					jQuery( insert[i] )[ original ]( elems );
					ret = ret.concat( elems );
				}
				cloneIndex = 0;
				ret = this.pushStack( ret, name, insert.selector );
			}
			tmplItems = appendToTmplItems;
			appendToTmplItems = null;
			jQuery.tmpl.complete( tmplItems );
			return ret;
		};
	});

	jQuery.fn.extend({
		// Use first wrapped element as template markup.
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( data, options, parentItem ) {
			return jQuery.tmpl( this[0], data, options, parentItem );
		},

		// Find which rendered template item the first wrapped DOM element belongs to
		tmplItem: function() {
			return jQuery.tmplItem( this[0] );
		},

		// Consider the first wrapped element as a template declaration, and get the compiled template or store it as a named template.
		template: function( name ) {
			return jQuery.template( name, this[0] );
		},

		domManip: function( args, table, callback, options ) {
			if ( args[0] && jQuery.isArray( args[0] )) {
				var dmArgs = jQuery.makeArray( arguments ), elems = args[0], elemsLength = elems.length, i = 0, tmplItem;
				while ( i < elemsLength && !(tmplItem = jQuery.data( elems[i++], "tmplItem" ))) {}
				if ( tmplItem && cloneIndex ) {
					dmArgs[2] = function( fragClone ) {
						// Handler called by oldManip when rendered template has been inserted into DOM.
						jQuery.tmpl.afterManip( this, fragClone, callback );
					};
				}
				oldManip.apply( this, dmArgs );
			} else {
				oldManip.apply( this, arguments );
			}
			cloneIndex = 0;
			if ( !appendToTmplItems ) {
				jQuery.tmpl.complete( newTmplItems );
			}
			return this;
		}
	});

	jQuery.extend({
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( tmpl, data, options, parentItem ) {
			var ret, topLevel = !parentItem;
			if ( topLevel ) {
				// This is a top-level tmpl call (not from a nested template using {{tmpl}})
				parentItem = topTmplItem;
				tmpl = jQuery.template[tmpl] || jQuery.template( null, tmpl );
				wrappedItems = {}; // Any wrapped items will be rebuilt, since this is top level
			} else if ( !tmpl ) {
				// The template item is already associated with DOM - this is a refresh.
				// Re-evaluate rendered template for the parentItem
				tmpl = parentItem.tmpl;
				newTmplItems[parentItem.key] = parentItem;
				parentItem.nodes = [];
				if ( parentItem.wrapped ) {
					updateWrapped( parentItem, parentItem.wrapped );
				}
				// Rebuild, without creating a new template item
				return jQuery( build( parentItem, null, parentItem.tmpl( jQuery, parentItem ) ));
			}
			if ( !tmpl ) {
				return []; // Could throw...
			}
			if ( typeof data === "function" ) {
				data = data.call( parentItem || {} );
			}
			if ( options && options.wrapped ) {
				updateWrapped( options, options.wrapped );
			}
			ret = jQuery.isArray( data ) ?
				jQuery.map( data, function( dataItem ) {
					return dataItem ? newTmplItem( options, parentItem, tmpl, dataItem ) : null;
				}) :
				[ newTmplItem( options, parentItem, tmpl, data ) ];
			return topLevel ? jQuery( build( parentItem, null, ret ) ) : ret;
		},

		// Return rendered template item for an element.
		tmplItem: function( elem ) {
			var tmplItem;
			if ( elem instanceof jQuery ) {
				elem = elem[0];
			}
			while ( elem && elem.nodeType === 1 && !(tmplItem = jQuery.data( elem, "tmplItem" )) && (elem = elem.parentNode) ) {}
			return tmplItem || topTmplItem;
		},

		// Set:
		// Use $.template( name, tmpl ) to cache a named template,
		// where tmpl is a template string, a script element or a jQuery instance wrapping a script element, etc.
		// Use $( "selector" ).template( name ) to provide access by name to a script block template declaration.

		// Get:
		// Use $.template( name ) to access a cached template.
		// Also $( selectorToScriptBlock ).template(), or $.template( null, templateString )
		// will return the compiled template, without adding a name reference.
		// If templateString includes at least one HTML tag, $.template( templateString ) is equivalent
		// to $.template( null, templateString )
		template: function( name, tmpl ) {
			if (tmpl) {
				// Compile template and associate with name
				if ( typeof tmpl === "string" ) {
					// This is an HTML string being passed directly in.
					tmpl = buildTmplFn( tmpl );
				} else if ( tmpl instanceof jQuery ) {
					tmpl = tmpl[0] || {};
				}
				if ( tmpl.nodeType ) {
					// If this is a template block, use cached copy, or generate tmpl function and cache.
					tmpl = jQuery.data( tmpl, "tmpl" ) || jQuery.data( tmpl, "tmpl", buildTmplFn( tmpl.innerHTML ));
					// Issue: In IE, if the container element is not a script block, the innerHTML will remove quotes from attribute values whenever the value does not include white space.
					// This means that foo="${x}" will not work if the value of x includes white space: foo="${x}" -> foo=value of x.
					// To correct this, include space in tag: foo="${ x }" -> foo="value of x"
				}
				return typeof name === "string" ? (jQuery.template[name] = tmpl) : tmpl;
			}
			// Return named compiled template
			return name ? (typeof name !== "string" ? jQuery.template( null, name ):
				(jQuery.template[name] ||
					// If not in map, and not containing at least on HTML tag, treat as a selector.
					// (If integrated with core, use quickExpr.exec)
					jQuery.template( null, htmlExpr.test( name ) ? name : jQuery( name )))) : null;
		},

		encode: function( text ) {
			// Do HTML encoding replacing < > & and ' and " by corresponding entities.
			return ("" + text).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;");
		}
	});

	jQuery.extend( jQuery.tmpl, {
		tag: {
			"tmpl": {
				_default: { $2: "null" },
				open: "if($notnull_1){__=__.concat($item.nest($1,$2));}"
				// tmpl target parameter can be of type function, so use $1, not $1a (so not auto detection of functions)
				// This means that {{tmpl foo}} treats foo as a template (which IS a function).
				// Explicit parens can be used if foo is a function that returns a template: {{tmpl foo()}}.
			},
			"wrap": {
				_default: { $2: "null" },
				open: "$item.calls(__,$1,$2);__=[];",
				close: "call=$item.calls();__=call._.concat($item.wrap(call,__));"
			},
			"each": {
				_default: { $2: "$index, $value" },
				open: "if($notnull_1){$.each($1a,function($2){with(this){",
				close: "}});}"
			},
			"if": {
				open: "if(($notnull_1) && $1a){",
				close: "}"
			},
			"else": {
				_default: { $1: "true" },
				open: "}else if(($notnull_1) && $1a){"
			},
			"html": {
				// Unecoded expression evaluation.
				open: "if($notnull_1){__.push($1a);}"
			},
			"=": {
				// Encoded expression evaluation. Abbreviated form is ${}.
				_default: { $1: "$data" },
				open: "if($notnull_1){__.push($.encode($1a));}"
			},
			"!": {
				// Comment tag. Skipped by parser
				open: ""
			}
		},

		// This stub can be overridden, e.g. in jquery.tmplPlus for providing rendered events
		complete: function( items ) {
			newTmplItems = {};
		},

		// Call this from code which overrides domManip, or equivalent
		// Manage cloning/storing template items etc.
		afterManip: function afterManip( elem, fragClone, callback ) {
			// Provides cloned fragment ready for fixup prior to and after insertion into DOM
			var content = fragClone.nodeType === 11 ?
				jQuery.makeArray(fragClone.childNodes) :
				fragClone.nodeType === 1 ? [fragClone] : [];

			// Return fragment to original caller (e.g. append) for DOM insertion
			callback.call( elem, fragClone );

			// Fragment has been inserted:- Add inserted nodes to tmplItem data structure. Replace inserted element annotations by jQuery.data.
			storeTmplItems( content );
			cloneIndex++;
		}
	});

	//========================== Private helper functions, used by code above ==========================

	function build( tmplItem, nested, content ) {
		// Convert hierarchical content into flat string array
		// and finally return array of fragments ready for DOM insertion
		var frag, ret = content ? jQuery.map( content, function( item ) {
			return (typeof item === "string") ?
				// Insert template item annotations, to be converted to jQuery.data( "tmplItem" ) when elems are inserted into DOM.
				(tmplItem.key ? item.replace( /(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g, "$1 " + tmplItmAtt + "=\"" + tmplItem.key + "\" $2" ) : item) :
				// This is a child template item. Build nested template.
				build( item, tmplItem, item._ctnt );
		}) :
		// If content is not defined, insert tmplItem directly. Not a template item. May be a string, or a string array, e.g. from {{html $item.html()}}.
		tmplItem;
		if ( nested ) {
			return ret;
		}

		// top-level template
		ret = ret.join("");

		// Support templates which have initial or final text nodes, or consist only of text
		// Also support HTML entities within the HTML markup.
		ret.replace( /^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/, function( all, before, middle, after) {
			frag = jQuery( middle ).get();

			storeTmplItems( frag );
			if ( before ) {
				frag = unencode( before ).concat(frag);
			}
			if ( after ) {
				frag = frag.concat(unencode( after ));
			}
		});
		return frag ? frag : unencode( ret );
	}

	function unencode( text ) {
		// Use createElement, since createTextNode will not render HTML entities correctly
		var el = document.createElement( "div" );
		el.innerHTML = text;
		return jQuery.makeArray(el.childNodes);
	}

	// Generate a reusable function that will serve to render a template against data
	function buildTmplFn( markup ) {
		return new Function("jQuery","$item",
			// Use the variable __ to hold a string array while building the compiled template. (See https://github.com/jquery/jquery-tmpl/issues#issue/10).
			"var $=jQuery,call,__=[],$data=$item.data;" +

			// Introduce the data as local variables using with(){}
			"with($data){__.push('" +

			// Convert the template into pure JavaScript
			jQuery.trim(markup)
				.replace( /([\\'])/g, "\\$1" )
				.replace( /[\r\t\n]/g, " " )
				.replace( /\$\{([^\}]*)\}/g, "{{= $1}}" )
				.replace( /\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,
				function( all, slash, type, fnargs, target, parens, args ) {
					var tag = jQuery.tmpl.tag[ type ], def, expr, exprAutoFnDetect;
					if ( !tag ) {
						throw "Unknown template tag: " + type;
					}
					def = tag._default || [];
					if ( parens && !/\w$/.test(target)) {
						target += parens;
						parens = "";
					}
					if ( target ) {
						target = unescape( target );
						args = args ? ("," + unescape( args ) + ")") : (parens ? ")" : "");
						// Support for target being things like a.toLowerCase();
						// In that case don't call with template item as 'this' pointer. Just evaluate...
						expr = parens ? (target.indexOf(".") > -1 ? target + unescape( parens ) : ("(" + target + ").call($item" + args)) : target;
						exprAutoFnDetect = parens ? expr : "(typeof(" + target + ")==='function'?(" + target + ").call($item):(" + target + "))";
					} else {
						exprAutoFnDetect = expr = def.$1 || "null";
					}
					fnargs = unescape( fnargs );
					return "');" +
						tag[ slash ? "close" : "open" ]
							.split( "$notnull_1" ).join( target ? "typeof(" + target + ")!=='undefined' && (" + target + ")!=null" : "true" )
							.split( "$1a" ).join( exprAutoFnDetect )
							.split( "$1" ).join( expr )
							.split( "$2" ).join( fnargs || def.$2 || "" ) +
						"__.push('";
				}) +
			"');}return __;"
		);
	}
	function updateWrapped( options, wrapped ) {
		// Build the wrapped content.
		options._wrap = build( options, true,
			// Suport imperative scenario in which options.wrapped can be set to a selector or an HTML string.
			jQuery.isArray( wrapped ) ? wrapped : [htmlExpr.test( wrapped ) ? wrapped : jQuery( wrapped ).html()]
		).join("");
	}

	function unescape( args ) {
		return args ? args.replace( /\\'/g, "'").replace(/\\\\/g, "\\" ) : null;
	}
	function outerHtml( elem ) {
		var div = document.createElement("div");
		div.appendChild( elem.cloneNode(true) );
		return div.innerHTML;
	}

	// Store template items in jQuery.data(), ensuring a unique tmplItem data data structure for each rendered template instance.
	function storeTmplItems( content ) {
		var keySuffix = "_" + cloneIndex, elem, elems, newClonedItems = {}, i, l, m;
		for ( i = 0, l = content.length; i < l; i++ ) {
			if ( (elem = content[i]).nodeType !== 1 ) {
				continue;
			}
			elems = elem.getElementsByTagName("*");
			for ( m = elems.length - 1; m >= 0; m-- ) {
				processItemKey( elems[m] );
			}
			processItemKey( elem );
		}
		function processItemKey( el ) {
			var pntKey, pntNode = el, pntItem, tmplItem, key;
			// Ensure that each rendered template inserted into the DOM has its own template item,
			if ( (key = el.getAttribute( tmplItmAtt ))) {
				while ( pntNode.parentNode && (pntNode = pntNode.parentNode).nodeType === 1 && !(pntKey = pntNode.getAttribute( tmplItmAtt ))) { }
				if ( pntKey !== key ) {
					// The next ancestor with a _tmplitem expando is on a different key than this one.
					// So this is a top-level element within this template item
					// Set pntNode to the key of the parentNode, or to 0 if pntNode.parentNode is null, or pntNode is a fragment.
					pntNode = pntNode.parentNode ? (pntNode.nodeType === 11 ? 0 : (pntNode.getAttribute( tmplItmAtt ) || 0)) : 0;
					if ( !(tmplItem = newTmplItems[key]) ) {
						// The item is for wrapped content, and was copied from the temporary parent wrappedItem.
						tmplItem = wrappedItems[key];
						tmplItem = newTmplItem( tmplItem, newTmplItems[pntNode]||wrappedItems[pntNode] );
						tmplItem.key = ++itemKey;
						newTmplItems[itemKey] = tmplItem;
					}
					if ( cloneIndex ) {
						cloneTmplItem( key );
					}
				}
				el.removeAttribute( tmplItmAtt );
			} else if ( cloneIndex && (tmplItem = jQuery.data( el, "tmplItem" )) ) {
				// This was a rendered element, cloned during append or appendTo etc.
				// TmplItem stored in jQuery data has already been cloned in cloneCopyEvent. We must replace it with a fresh cloned tmplItem.
				cloneTmplItem( tmplItem.key );
				newTmplItems[tmplItem.key] = tmplItem;
				pntNode = jQuery.data( el.parentNode, "tmplItem" );
				pntNode = pntNode ? pntNode.key : 0;
			}
			if ( tmplItem ) {
				pntItem = tmplItem;
				// Find the template item of the parent element.
				// (Using !=, not !==, since pntItem.key is number, and pntNode may be a string)
				while ( pntItem && pntItem.key != pntNode ) {
					// Add this element as a top-level node for this rendered template item, as well as for any
					// ancestor items between this item and the item of its parent element
					pntItem.nodes.push( el );
					pntItem = pntItem.parent;
				}
				// Delete content built during rendering - reduce API surface area and memory use, and avoid exposing of stale data after rendering...
				delete tmplItem._ctnt;
				delete tmplItem._wrap;
				// Store template item as jQuery data on the element
				jQuery.data( el, "tmplItem", tmplItem );
			}
			function cloneTmplItem( key ) {
				key = key + keySuffix;
				tmplItem = newClonedItems[key] =
					(newClonedItems[key] || newTmplItem( tmplItem, newTmplItems[tmplItem.parent.key + keySuffix] || tmplItem.parent ));
			}
		}
	}

	//---- Helper functions for template item ----

	function tiCalls( content, tmpl, data, options ) {
		if ( !content ) {
			return stack.pop();
		}
		stack.push({ _: content, tmpl: tmpl, item:this, data: data, options: options });
	}

	function tiNest( tmpl, data, options ) {
		// nested template, using {{tmpl}} tag
		return jQuery.tmpl( jQuery.template( tmpl ), data, options, this );
	}

	function tiWrap( call, wrapped ) {
		// nested template, using {{wrap}} tag
		var options = call.options || {};
		options.wrapped = wrapped;
		// Apply the template, which may incorporate wrapped content,
		return jQuery.tmpl( jQuery.template( call.tmpl ), call.data, options, call.item );
	}

	function tiHtml( filter, textOnly ) {
		var wrapped = this._wrap;
		return jQuery.map(
			jQuery( jQuery.isArray( wrapped ) ? wrapped.join("") : wrapped ).filter( filter || "*" ),
			function(e) {
				return textOnly ?
					e.innerText || e.textContent :
					e.outerHTML || outerHtml(e);
			});
	}

	function tiUpdate() {
		var coll = this.nodes;
		jQuery.tmpl( null, null, null, this).insertBefore( coll[0] );
		jQuery( coll ).remove();
	}
})( jQuery );
/*!
 * Anfit's GC Mods
 * (c) 2015 Jan 'anfit' Chimiak
 * http://gc.mmanir.net/
 *
 * This document is licensed as free software under the terms of the
 * Creative Commons Attribution + Noncommercial 3.0 Unported (CC BY-NC 3.0).
 * If you want to use this in an commercial product, contact the author.
 */
var app = {};
app.version = '5.0.30';
app.releaseNotes = '(2015-06-18): This release fixes some minor bugs, mainly makes the removal of the ugly blue background (from previous version) optional.';
app.gameServer = 'http://gc.gamestotal.com/';
app.modsServer = 'NO_SERVER_AVAILABLE';
/**
 * mods namespace
 */
app.mod = {};
/**
 * utils namespace
 */
app.util = {};
/**
 * @param {Object} a Compared object
 * @param {Object} a.power Compared property
 * @param {Object} b Compared object
 * @param {Object} b.power Compared property
 */
app.util.sortByPowerDesc = function (a, b) {
	return ((a.power > b.power) ? -1 : ((a.power < b.power) ? 1 : 0));
};
/**
 * Enables dragging within Greasemonkey (the core jQuery dragging does not work)
 *
 * @param {Object} e Event object from mousedown
 */
app.util.startDragging = function (e) {
	var dragObj = {
		zIndex: 0
	};
	dragObj.elNode = e.target;
	if (dragObj.elNode.nodeType === 3) {
		dragObj.elNode = dragObj.elNode.parentNode;
	}
	if (dragObj.elNode.nodeName === 'INPUT' || dragObj.elNode.nodeName === 'SPAN') {
		return;
	}
	while (!dragObj.elNode.className.match('draggable')) {
		dragObj.elNode = dragObj.elNode.parentNode;
	}
	var targetId = dragObj.elNode.id;
	dragObj.cursorStartX = e.clientX + window.scrollX;
	dragObj.cursorStartY = e.clientY + window.scrollY;
	dragObj.elStartLeft = parseInt(dragObj.elNode.style.left, 10);
	dragObj.elStartTop = parseInt(dragObj.elNode.style.top, 10);
	dragObj.elStartRight = dragObj.elStartLeft + parseInt(dragObj.elNode.clientWidth, 10);
	dragObj.elStartBottom = dragObj.elStartTop + parseInt(dragObj.elNode.clientHeight, 10);
	dragObj.elNode.style.zIndex = dragObj.zIndex + 1;

	function dragGo(e) {
		var x = e.clientX + window.scrollX;
		var y = e.clientY + window.scrollY;
		var top, left, bottom, right;
		top = dragObj.elStartTop + y - dragObj.cursorStartY;
		left = dragObj.elStartLeft + x - dragObj.cursorStartX;
		bottom = dragObj.elStartBottom + y - dragObj.cursorStartY;
		right = dragObj.elStartRight + x - dragObj.cursorStartX;
		if (top > 0 && left > 0 && bottom + 5 < window.innerHeight && right + 5 < window.innerWidth) {
			dragObj.elNode.style.left = left + "px";
			dragObj.elNode.style.top = top + "px";
		}
	}

	function dragStop(e) {
		var x = e.clientX + window.scrollX;
		var y = e.clientY + window.scrollY;
		var top;
		var left;
		top = dragObj.elStartTop + y - dragObj.cursorStartY;
		left = dragObj.elStartLeft + x - dragObj.cursorStartX;
		$(document).unbind("mousemove." + targetId, dragGo);
		$(document).unbind("mouseup." + targetId, dragStop);
		$(document).trigger('dragStop', [targetId, top, left]);
	}
	$(document).bind("mousemove." + targetId, dragGo);
	$(document).bind("mouseup." + targetId, dragStop);
};
/**
 * @param mixed
 * @param array
 */
app.util.countInArray = function (value, array) {
	var c = 0;
	for (var i = 0, l = array.length; i < l; i++) {
		if (array[i] === value) {
			c++;
		}
	}
	return c;
};
/**
 * @param number
 */
app.util.formatCurrency = function (value) {
	var string = value + '';
	for (var i = 0; i < Math.round(string.length / 3 - 0.5); i = i + 1) {
		string = string.replace(/(\d)(\d{3})($|,)/g, '$1,$2$3');
	}
	return string;
};
/**
 * @param number
 * @param number
 */
app.util.getRandomNumber = function (min, max) {
	return Math.random() * (max - min) + min;
};


app.util.storageGet = function (key, def) {
  var v = localStorage.getItem('GCM.' + key);
  if (v === null) {
    return def;
  }
  return JSON.parse(v);
};

app.util.storageSet = function (key, value) {
  localStorage.setItem('GCM.' + key, JSON.stringify(value));
};

app.util.storageDelete = function (key) {
  localStorage.removeItem('GCM.' + key);
};
/**
 * Write-only accessor for property dom element
 * 
 * @param {number} min lowest value (lower values are allowed, but will be highlighted)
 * @param {number} max highest value (higher values are allowed, but will be highlighted) 
 * @param {Node} el accessor's dom node
 * @constructor
 */
app.PropertyDomNode = function (min, max, el) {
	/**
	 * accessor's dom node
	 * @type {Node}
	 */
	this.el = el;
	/**
	 * lowest value (lower values are allowed, but will be highlighted)
	 * @type {number}
	 */
	this.min = min;
	/**
	 * highest value (higher values are allowed, but will be highlighted) 
	 * @type {number}
	 */
	this.max = max;
	/**
	 * true if there is any dom el connected to this DAO
	 * @type {boolean}
	 */
	this.connected = false;
};

/**
 * Set value
 * @param {number} value 
 */
app.PropertyDomNode.prototype.setValue = function (value) {
	if (this.connected !== true) {
		return;
	}
	this.el.html(this.prefix + app.util.formatCurrency(value) + this.suffix);
	this.refreshEl();
};
/**
 * Set max value
 * @param {number} value 
 */
app.PropertyDomNode.prototype.setMax = function (value) {
	if (this.connected !== true) {
		return;
	}
	this.max = 1 * value;
	this.refreshEl();
};
/**
 * Set min value
 * @param {number} value 
 */
app.PropertyDomNode.prototype.setMin = function (value) {
	if (this.connected !== true) {
		return;
	}
	this.min = 1 * value;
	this.refreshEl();
};
/**
 * Set backgrounds and other style settings, to be changed whenever value or minimum/maximum threshold is changed
 * @private
 */
app.PropertyDomNode.prototype.refreshEl = function () {
	var value = this.el.text().replace(/\D/g, '') * 1;
	if (value > this.max || value < this.min) {
		this.el.removeClass('bodybox', 'a-bodybox-yellow').addClass('a-bodybox-red');
	} else if (value === this.max) {
		this.el.removeClass('bodybox', 'a-bodybox-red').addClass('a-bodybox-yellow');
	} else {
		this.el.removeClass('a-bodybox-yellow');
		this.el.removeClass('a-bodybox-red');
		this.el.addClass('bodybox');
	}
};
/**
 * Assigns a dom node to this DAO
 * @param {Node} el accessor's dom node
 */
app.PropertyDomNode.prototype.connect = function (el) {
	this.el = el;
	this.connected = true;
	this.prefix = this.el.html().replace(/-{0,1}\d.*/, '');
	this.suffix = this.el.html().replace(/.*\d/, '');
	this.refreshEl();
};/**
 * A numeric property
 *
 * @param {string} id name/label of the property
 * @param {number} min lowest value (lower values are allowed, but will be highlighted)
 * @param {number} max highest value (higher values are allowed, but will be highlighted)
 * @param {app.ModControl} context property's execution scope
 * @constructor
 */
app.Property = function (id, min, max, context) {
	/**
	 * default highest value (higher values are allowed, but will be highlighted)
	 * @type {number}
	 */
	this.defaultMax = max;
	/**
	 * default lowest value (lower values are allowed, but will be highlighted)
	 * @type {number}
	 */
	this.defaultMin = min;
	/**
	 * context property's execution scope
	 * @type {app.ModControl}
	 */
	this.parent = context;
	/**
	 * name/label of the property
	 * @type {string}
	 */
	this.id = id;
	/**
	 * current highest value (higher values are allowed, but will be highlighted)
	 * @type {number}
	 */
	this.max = this.parent.getValue(this.id + ".max") ? this.parent.getValue(this.id + ".max") : this.defaultMax;
	/**
	 * current lowest value (lower values are allowed, but will be highlighted)
	 * @type {number}
	 */
	this.min = this.parent.getValue(this.id + ".min") ? this.parent.getValue(this.id + ".min") : this.defaultMin;

	/**
	 * Write-only accessor for property dom element
	 * @type {app.PropertyDomNode}
	 */
	this.domDao = new app.PropertyDomNode(this.min, this.max);
};

/**
 * @param {Node} el accessor's dom node
 */
app.Property.prototype.setEl = function (el) {

	this.dom = el;
	if (this.parent.isNewest()) {
		this.domDao.connect(el);
	}

	var prop = this;
	$(this.dom).click(function (e) {
		var left, top, max, min;
		e.stopPropagation();
		left = $(this).position().left - ($(this).outerWidth()) / 2;
		top = $(this).position().top + $(this).outerHeight();
		var id = prop.id;
		max = prop.max;
		min = prop.min;
		$("body").append('<table id="change-property-' + id + '" class="a-property" style="top: ' + top + '; left: ' + left + ';"><tr><td><b>Limits for ' + id + ':</b></td><td><button id="close-' + id + '" class="a-property-close">x</input></td></tr><tr><td>max:</td><td><input type="text" id="max-' + id + '" value="' + max + '"></td></tr><tr><td>min:</td><td><input type="text" id="min-' + id + '" value="' + min + '"/></td></tr><tr><td colspan="2"><button id="restore-default-' + id + '"  class="a-property-restore">restore default values</button></td></tr></table>');
		$('#max-' + id).change(function () {
			prop.setMax($(this).val());
		});
		$('#min-' + id).change(function () {
			prop.setMin($(this).val());
		});
		$('#restore-default-' + id).click(function () {
			prop.setMin(prop.defaultMin);
			$('#min-' + id).val(prop.defaultMin);
			prop.setMax(prop.defaultMax);
			$('#max-' + id).val(prop.defaultMax);
		});
		$("body").click(function () {
			$('#change-property-' + id).remove();
		});
		$('#close-' + id).click(function () {
			$('#change-property-' + id).remove();
		});
		$('#change-property-' + id).click(function (e) {
			e.stopPropagation();
		});
	});
};

/**
 * @param {number} value Value for this property
 */
app.Property.prototype.setValue = function (value) {
	this.parent.setValue(this.id, value);
	this.domDao.setValue(value);
};

/**
 * @param {number} value Maximum value for this property
 * @param {boolean=} asDefault True if this value should be assigned as default threshold
 */
app.Property.prototype.setMax = function (value, asDefault) {
	if (asDefault === true) {
		this.defaultMax = value;
	}
	this.domDao.setMax(value);
	this.parent.setValue(this.id + '.max', value);
	this.max = value;
};

/**
 * @param {number} value Minimum value for this property
 * @param {boolean=} asDefault True if this value should be assigned as default threshold
 */
app.Property.prototype.setMin = function (value, asDefault) {
	if (asDefault === true) {
		this.defaultMin = value;
	}
	this.domDao.setMin(value);
	this.parent.setValue(this.id + '.min', value);
	this.min = value;
};

/**
 * @return {number} Value of this property
 */
app.Property.prototype.getValue = function () {
	return this.parent.getValue(this.id);
};

/**
 * @param {number} value Value to be added to this property
 */
app.Property.prototype.addValue = function (value) {
	this.setValue(1 * value + this.getValue());
};

/**
 * @param {number} value Value to be removed from this property
 */
app.Property.prototype.subtractValue = function (value) {
	this.setValue(-1 * value + this.getValue());
};

/**
 * Forces underlying dom node to update its value
 * @param {number=} value optional: value for this property
 */
app.Property.prototype.updateEl = function (value) {
	if (value !== undefined) {
		this.domDao.setValue(value);
	}
	else {
		this.domDao.setValue(this.getValue());
	}
};
/**
 * Core mod component
 * @param {Object} config Data passed to this mod
 * @param {Array} config.mods An array of mod configurational objects
 * @constructor
 */
app.ModControl = function (config) {

	/**
	 * list of mods
	 * @type {Array}
	 */
	this.mods = config.mods;

	/**
	 * local url of the page
	 * @type {string}
	 */
	this.location = document.location.href.replace(new RegExp(".*\/"), '').replace(/&\d\d\d\d&/, '');

	/**
	 * time in miliseconds
	 * @type {number}
	 */
	this.timestamp = (new Date()).getTime();

	/**
	 * cash property accessor
	 * @type {app.Property}
	 */
	this.cash = new app.Property('cash', 0, 999999999999, this);

	/**
	 * food property accessor
	 * @type {app.Property}
	 */
	this.food = new app.Property('food', 0, 2000000000, this);

	/**
	 * turns property accessor
	 * @type {app.Property}
	 */
	this.turns = new app.Property('turns', 0, 0, this);

	/**
	 * power property accessor
	 * @type {app.Property}
	 */
	this.power = new app.Property('power', 0, 1199999999, this);

	var properties;

	if (this.isPropertyPage() && this.isNewest()) {
		properties = this.readProperties();
		this.assignAccessorEls();
		properties = this.setServer(properties, properties.serverName);
		this.serializeProperties(properties);

		this.setGlobalValue('a-propertycheck-timestamp', this.timestamp);
		this.setValue('a-propertycheck-timestamp', this.timestamp);
	}
	else if (this.isPropertyPage() && !this.isNewest()) {
		properties = this.readProperties();
		this.assignAccessorEls();
		properties = this.deserializeProperties();
		properties = this.setServer(properties, properties.serverName);
	}
	else {
		properties = this.deserializeProperties();
		properties = this.setServer(properties, properties.serverName);
	}

	/**
	 * name of the empire (GC login), e.g. Anfit
	 * @type {string}
	 */
	this.empireName = properties.empireName;

	/**
	 * mods' username for this empire (server + . + empire), e.g. Normal.Anfit
	 * @type {string}
	 */
	this.userName = properties.userName;

	/**
	 * name of the server, e.g. Normal
	 * @type {string}
	 */
	this.server = properties.server;

	/**
	 * Whether this is a paid or a non-paid account
	 * @type {boolean}
	 */
	this.isPaid = properties.paid;

	/**
	 * An antireload value (used by GC pages to determine if a page is fresh or not)
	 * @type {numeric}
	 */
	this.antiReload = properties.antiReload;

	/**
	 * Whether empire is authenticated against the mod server or not
	 * @type {boolean}
	 */
	this.authenticated = properties.authenticated;

	/**
	 * Text of the authentication token, as entered in options
	 * @type {string}
	 */
	this.authToken = properties.authToken;

	/**
	 * TODO remove this check
	 */
	if (!this.empireName) {
		this.loaded = false;
		return;
	} else {
		this.loaded = true;
	}

	//default values
	this.forceDefaultSettings();

	this.showMessage("Anfit GC Mods " + app.version, app.releaseNotes, "a-release-" + app.version);

	//message on after update installed
	if (this.getValue('a-last-successful-update') !== app.version) {

		var self = this;
		this.xhr({
			method: 'GET',
			url: app.modsServer + '?action=report&empire=' + this.userName + '&version=' + app.version,
			onSuccess: function (response) {
				self.setValue('a-last-successful-update', app.version);
			}
		});
	}

	//message on new update available
	if (!this.getValue('a-last-update-check')) {
		this.setValue('a-last-update-check', this.timestamp);
	}
	if (this.timestamp - 86400000 > this.getValue('a-last-update-check')) {
		this.xhr({
			method: 'GET',
			url: app.modsServer + '?action=get_current_version',
			onFailure: function (response) {
				console.error("[Mod control] Query to " + app.modsServer + " failed");
			},
			onSuccess: function (response) {
				var version = $.trim(response);
				if (version !== app.version) {
					if (confirm('There is an update available for Anfit\'s GC Mods (' + version + ') available.\nWould you like to go to the install page now?')) {
						gc.openInTab(app.modsServer);
					}
				}
				gc.setValue('a-last-update-check', gc.timestamp);
			}
		});
	}
};

/**
 * Whether this page shows property values or not
 *
 * @param {Node=} scope Dom node within which property nodes should be looked for
 * @return {boolean} Whether props are on the page or not
 */
app.ModControl.prototype.isPropertyPage = function (scope) {

	if (scope === undefined) {
		scope = $("body");
	}

	var pmEl = $("table.smallfont td.bodybox:has(a:contains('Private Messages')), table.smallfont td:has(a > font:contains('Private Messages'))", scope);
	if (pmEl.length) {
		pmEl.attr('id', 'a-privatemessages');
		return true;
	}
	return false;
};


/**
 * Read empire property from dom
 *
 * @param {Node=} scope Dom node within which property nodes should be looked for
 * @return {Object} Properties read from dom nodes on this page
 */
app.ModControl.prototype.readProperties = function (scope) {

	if (scope === undefined) {
		scope = $("body");
	}

	var propertyElems = $("td.bodybox:contains('$'),td.bodybox:contains('$') ~ td.bodybox", scope);

	//empty properties
	var properties = {
		cash: -1,
		food : -1,
		power : -1,
		turns : -1,
		serverName : "",
		empireName : "",
		userName : "",
		antireload: -1,
		paid: false
	};

	properties.cash = propertyElems.eq(0).text().replace(/\D/g, '') * 1;
	properties.food = propertyElems.eq(1).text().replace(/\D/g, '') * 1;
	properties.power = propertyElems.eq(2).text().replace(/\D/g, '') * 1;
	properties.turns = propertyElems.eq(3).text().replace(/\D/g, '') * 1;
	properties.serverName = $.trim(propertyElems.eq(4).text());
	properties.empireName = $.trim(propertyElems.eq(5).text());

	properties.userName = properties.serverName + "." + properties.empireName;

	properties.antiReload = $("a:contains('Private Messages')", scope).attr('href').replace(/.*\&(\d*)\&.*/, "$1") * 1;

	//paid
	if ($("img[src*='logo_gc2']").length) {
		properties.paid = true;
	}

	properties.authToken = this.getGlobalValue(properties.userName + '.a-authentication-token');
	properties.authenticated = properties.authToken ?  true : false;

	return properties;
};

/**
 * Assign dom els to accessors
 *
 * @private
 * @return {Object} Properties read from dom nodes on this page
 */
app.ModControl.prototype.assignAccessorEls = function () {
	var propertyElems = $("td.bodybox:contains('$'),td.bodybox:contains('$') ~ td.bodybox");

	//assign dom els to accessors
	this.cash.setEl(propertyElems.eq(0));
	this.food.setEl(propertyElems.eq(1));
	this.power.setEl(propertyElems.eq(2));
	this.turns.setEl(propertyElems.eq(3));

	//small fix
	propertyElems.eq(0).parent().removeAttr('onmouseover');
	propertyElems.eq(0).parent().removeAttr('onclick');
};

/**
 * @private
 * @return {Object} properties Properties deserialized from local storage
 */
app.ModControl.prototype.deserializeProperties = function () {

	//empty properties
	var properties = {
		cash: -1,
		food : -1,
		power : -1,
		turns : -1,
		serverName : "",
		empireName : "",
		userName : "",
		antiReload: -1,
		paid: false
	};

	properties.serverName = this.getGlobalValue('serverName');
	properties.empireName = this.getGlobalValue('empireName');
	properties.userName = this.getGlobalValue('userName');

	properties.cash = this.getGlobalValue(properties.userName + "." + this.cash.id);
	properties.food = this.getGlobalValue(properties.userName + "." + this.food.id);
	properties.power = this.getGlobalValue(properties.userName + "." + this.power.id);
	properties.turns = this.getGlobalValue(properties.userName + "." + this.turns.id);

	properties.antiReload = this.getGlobalValue(properties.userName + ".antiReload");
	properties.paid = this.getGlobalValue(properties.userName + ".isPaid");

	properties.authToken = this.getGlobalValue(properties.userName + '.a-authentication-token');
	properties.authenticated = properties.authToken ?  true : false;

	return properties;
};

/**
 * @param {Object} properties Properties map as created elsewhere
 * @private
 */
app.ModControl.prototype.serializeProperties = function (properties) {
	this.setGlobalValue('serverName', properties.serverName);
	this.setGlobalValue('empireName', properties.empireName);
	this.setGlobalValue('userName', properties.userName);
	this.setGlobalValue(properties.userName + '.' + 'isPaid', properties.paid);
	this.setGlobalValue(properties.userName + '.' + 'antiReload', properties.antiReload);
	this.setGlobalValue(properties.userName + '.' + 'cash', properties.cash);
	this.setGlobalValue(properties.userName + '.' + 'food', properties.food);
	this.setGlobalValue(properties.userName + '.' + 'turns', properties.turns);
	this.setGlobalValue(properties.userName + '.' + 'power', properties.power);
};

/**
 * Use a server name provided by a properties object to add server-related data
 *
 * @param {Object} properties Properties map as created elsewhere
 * @param {string} serverName Name for a GC server (e.g. Normal)
 * @return {Object} properties Properties map as created elsewhere
 */
app.ModControl.prototype.setServer = function (properties, serverName) {

	//devault values
	properties.server = {
		id: -1,
		name: "",
		turnRate: -1,
		turnHold: -1
	};

	//known servers
	var servers = [{
		id: 0,
		name: 'Normal',
		turnRate: 900000,
		turnHold: 180
	}, {
		id: 1,
		name: 'Fast',
		turnRate: 300000,
		turnHold: 150
	}, {
		id: 2,
		name: 'Slow',
		turnRate: 1800000,
		turnHold: 250
	}, {
		id: 3,
		name: 'Ultra',
		turnRate: 120000,
		turnHold: 100
	}, {
		id: 4,
		name: 'RT',
		turnRate: 7800,
		turnHold: 30
	}, {
		id: 5,
		name: 'DM',
		turnRate: 3000,
		turnHold: 120
	}];

	//server
	for (var i = 0; i < servers.length; i = i + 1) {
		if (servers[i].name === serverName) {
			properties.server = servers[i];
			break;
		}
	}

	//adjust server
	if (properties.paid) {
		properties.server.turnRate = properties.server.turnRate * 0.85;
		properties.server.turnHold = properties.server.turnHold * 1.5;
	}

	//set turn max
	this.turns.setMax(properties.server.turnHold, true);

	//adapt gameServer variable
	if (properties.server.name === 'DM') {
		app.gameServer += 'dm/';
	}

	return properties;
};


/**
 * Open a link in new tab - a wrapper for a Greasemonkey function
 *
 * @param {string} href Link to be opened in new tab
 */
app.ModControl.prototype.openInTab = function (href) {
  GM_openInTab(href);
};

/**
 * Get value from local storage.
 *
 * @param {string} key Key under which a value was stored in localStorage
 * @return {string|number|boolean|undefined} Value retrieved from local storage
 */
app.ModControl.prototype.getGlobalValue = function (key) {
	return app.util.storageGet(key);
};



/**
 * Set value to local storage. Casts large numbers to String
 *
 * @param {string} key Key under which a value was stored in localStorage
 * @param {string|number|boolean|undefined} value Value retrieved from local storage
 */
app.ModControl.prototype.setGlobalValue = function (key, value) {
	app.util.storageSet(key, value);
};

/**
 * Gets value from local storage. Takes userName for namespace
 *
 * @param {string} key Key under which a value was stored in localStorage
 * @return {string|number|boolean|undefined} Value retrieved from local storage
 */
app.ModControl.prototype.getValue = function (key) {
	return this.getGlobalValue(this.userName + '.' + key);
};

/**
 * Sets value to local storage. Takes userName for namespace. Casts large numbers to String.
 *
 * @param {string} key Key under which a value was stored in localStorage
 * @param {string|number|boolean|undefined} value Value retrieved from local storage
 */
app.ModControl.prototype.setValue = function (key, value) {
	this.setGlobalValue(this.userName + '.' + key, value);
};

/**
 * Checks if any other page in this http session was more recent then this one
 * @return {boolen} True if this page is fresh and most recent among all tabs
 */
app.ModControl.prototype.isNewest = function () {
	if (this.getGlobalValue('a-propertycheck-timestamp')) {
		return this.timestamp - this.getGlobalValue('a-propertycheck-timestamp') >= 0;
	}
	return true;
};

/**
 * Goes through all the mods and set default setting properties in local storage if they are missing
 */
app.ModControl.prototype.forceDefaultSettings = function () {

	var gc = this;
	//default settings
	$.each(this.mods, function (index, mod) {
		if (mod.defaultValue !== undefined && gc.getValue(mod.id) === undefined) {
			gc.setValue(mod.id, mod.defaultValue);
		}

		if (!mod.items) {
			return;
		}

		$.each(mod.items, function (index, item) {

			//no id, no value
			if (item.id) {
				//default setting
				if (item.defaultValue !== undefined && gc.getValue(item.id) === undefined) {
					gc.setValue(item.id, item.defaultValue);
				}
				//set value
				item.value = gc.getValue(item.id);
			}
		});
	});
};

/**
 * Shows a message box on top of the gc pages
 *
 * @param {string} title Title of the message box
 * @param {string} message Message shown in the message box
 * @param {string=} id Optional id value assigned to a message box, if user may remove a message permanently
 */
app.ModControl.prototype.showMessage = function (title, message, id) {
	if (id) {
		id = id.replace(/\W/g, '');
	}
	var gc = this;

	if (!id || this.getValue(id) !== false) {
		var messageBox = $("body").prepend(
			'<div class="a-info-wrap">' +
				'<div class="a-info-title" id="' + id + '">' + title + '</div>' +
				'<div class="a-info" >' + message + '</div>' +
			'</div>');
		$(".a-info-title", messageBox).click(function (e) {
			var target = $(e.target), id = target.attr('id'), offset = target.offset(),
	        imgLeft = e.pageX - offset.left,
	        imgTop = e.pageY - offset.top;
			//a very rough approximation
			if (target.hasClass("a-info-title") && 770 < imgLeft && imgLeft < 796 && 0 < imgTop && imgTop < 16) {
				target.parent().fadeOut("slow", function () {
					$(this).remove();
					if (id) {
						gc.setValue(id, false);
					}
				});
			}
		});
	}
};

/**
 * Run all mods
 */
app.ModControl.prototype.runMods = function () {
	var modMarkup = '<li class="a-mod" id="${id}"><div class="a-mod-line" ><ul><li class="a-mod-submit"><input type=checkbox id="${id}-checkbox" /></li><li class="a-mod-name"><a name=${id}></a><b>${title}</b><br /></li></div></ul><div class="a-mod-line" ><i>${description}</i></div><div><ul class="a-mod-item" /></div></li>';
	var listMarkup = '<li class="a-mod-item-list"><ul class="a-mod-item-parts"><li class="a-mod-item-parts-body">${description}<br /><textarea id="${id}" cols="70">${value}</textarea></li></ul></li>';
	var inputMarkup = '<li class="a-mod-item-input"><ul class="a-mod-item-parts"><li class="a-mod-item-parts-body"><span class="a-mod-item-input-desc">${description}</span><span class="a-mod-item-input-submit"><input id="${id}" value="${value}" /></span></li></ul></li>';
	var infoMarkup = '<li class="a-mod-item-info">${text}</li>';
	var checkBoxMarkup = '<li class="a-mod-item-checkbox"><ul class="a-mod-item-parts"><li class="a-mod-item-parts-submit"><input id="${id}" type="checkbox" /></li><li class="a-mod-item-parts-body">${description}</li></ul></li>';

	if (gc.location.match(/i.cfm.f.option($|#.*)/)) {
		$("table.bodybox[width='550'] > tbody > tr > td").attr('id', 'a-options-wrap').append('<div id="a-about"><div><b>Welcome, ' + gc.empireName + '!</b></div><div class="a-separator"/><div>Thank you for trying Anfit\'s Mods for Spacefed GC v.' + app.version + '. All mods are listed below with short explanations. Also, some of the mods require additional configuration they can be switched on.<div class="a-separator"/><div>My mods cannot affect gameplay, they are just UI (User Interface) tweaks, to make this game slightly more playable.</div><div class="a-separator"/><div>To enable more advanced tweaks which interact with other players please enter your gc.mmanir.net authentication token.</div><div class="a-separator"/><div><i>What? Authentication token? What is it? Why?</i></div><div class="a-separator"/><div>Some more advanced mods share data between players. You always know when and how. The best example of this are status tags: you set your status text, all other users of Anfit\'s Mods can see it in the ranking lists, you can see theirs.</div><div>This is possible only through another server located at gc.mmanir.net (one I\'m hosting). To authenticate with this server you have to: </div><div><ol><li>Create an account and login at <a href="http://gc.mmanir.net" target="blank">gc.mmanir.net</a>.</li><li>Retrieve an authentication token (it\'s provided just after login page).</li><li>Copy the authentication token here.</li></ol></div><div><b>Enter your authentication token here</b>: <input id="a-authentication-token" type="text" size="32" /></div><div class="a-separator"/><div>If you have problems, questions or ideas while using Anfit\'s GC Mods contact me (<a href="http://gc.mmanir.net/">Anfit</a>) at <a href="mailto:jan.chimiak@gmail.com?subject=[GC Mods]">jan.chimiak@gmail.com</a> or send me a <a href="javascript:cmsgu(\'i.cfm?popup=msguser&uid=213512\');">private message</a> at GC/normal.</div><div>');
		var token = gc.getValue('a-authentication-token') || '';
		$("#a-authentication-token").val(token);
		if (!gc.authenticated) {
			$("#a-authentication-token").parent().css("background-color", "ff0000");
			$("#a-authentication-token").parent().children().filter("b").css("color", "00ffff");
		}
		$("#a-authentication-token").change(function () {
			var token = $(this).val();
			$(this).addClass('a-loading');
			gc.xhr({
				url: app.modsServer + '?action=verify_token&token=' + token,
				onSuccess: function (responseJson) {
					$('#a-authentication-token').removeClass('a-loading');
					var response = $.parseJSON(responseJson);

					if (response.success) {
						gc.setValue('a-authentication-token', token);
						gc.authenticated = true;
						gc.authToken = token;
						$("#a-authentication-token").parent().css("background-color", "000000");
						$("#a-authentication-token").parent().children().filter("b").css("color", "ffffff");
					}
					else {
						alert(response.msg);
					}
				},
				onFailure: function (responseJson) {
					$('#a-authentication-token').removeClass('a-loading');
					alert('Failed to connect to ' + app.modsServer + '. Server might be down or busy, please try again later. If problem persists, please report this problem at jan.chimiak@gmail.com!');
				}
			});
		});
	}
	$.each(this.mods, function (index, mod) {
		//create an options entry
		if (mod && gc.location.match(/i.cfm.f.option($|#.*)/)) {
			//add
			$.tmpl(modMarkup, mod).appendTo("#a-options-wrap");

			//set value
			$('#' + mod.id + '-checkbox').prop("checked", gc.getValue(mod.id));
			var itemsWrapper = $("#" + mod.id + " ul.a-mod-item");
			//iterate through subitems, if they exist
			if (mod.items) {
				$.each(mod.items, function (index, item) {
					//no id, no value
					if (item.id) {
						//set value
						item.value = gc.getValue(item.id);
					}
					switch (item.type) {
					case 'list':
						//add
						$.tmpl(listMarkup, item).appendTo(itemsWrapper);
						//hitch events
						$('#' + item.id).change(function () {
							gc.setValue(item.id, $('#' + item.id).val());
						});
						break;
					case 'info':
						//add
						$.tmpl(infoMarkup, item).appendTo(itemsWrapper);
						break;
					case 'input':
						//add
						$.tmpl(inputMarkup, item).appendTo(itemsWrapper);
						//hitch events
						$('#' + item.id).change(function () {
							gc.setValue(item.id, $('#' + item.id).val());
						});
						break;
					case 'checkbox':
						//add
						$.tmpl(checkBoxMarkup, item).appendTo(itemsWrapper);
						//set value
						$('#' + item.id).prop("checked", item.value);
						//hitch events;
						$('#' + item.id).click(function () {
							gc.setValue(item.id, $('#' + item.id).prop('checked'));
						});
						break;
					default:
						console.error('[Options] Unrecognized option type');
						break;
					}
				});
			}
			//add event handlers
			//submit
			$('#' + mod.id + '-checkbox').click(function () {
				gc.setValue($(this).attr('id').replace('-checkbox', ''), $(this).prop('checked'));
			});
			if (mod.onAfterRender) {
				mod.onAfterRender.call(this);
			}
		}
		//execute mod
		if (mod.filter.call(mod)) {
      console.log('activating mod: ', mod.id);
			mod.plugin.call(mod);
		}
	});
};

/**
 * A wrapper for GM_xmlhttpRequest, with most options predefined.
 *
 * @param {Object} config Arguments map
 * @param {string} config.url Href of a receiver servelet
 * @param {function} onFailure Function called if request failed
 * @param {function} onSuccess Function called if request succeded
 * @param {string} successCondition String used as an xpath selector
 * by jquery to find a dom node in request result. If that's non-empty,
 *  the whole request was a success
 * @param {string} data Passed to server in a POST request
 * @param {string} method Request type: POST or GET
 * @param {string} extra Additional value to be visible in scope of the callback functions
 */
app.ModControl.prototype.xhr = function (config) {
	if (!config || !config.url) {
		console.error("[Ajax] empty xhr request");
		return;
	}
	var settings = {
		method: "POST",
		url: config.url,
		headers: {
			"Accept": "application/atom+xml,application/xml,text/xml",
			"Content-type": "application/x-www-form-urlencoded"
		},
		onload: function (responseDetails) {

			var antireloadDom = $("td.bodybox a:contains('Private Messages')");
			var antireload;
			if (antireloadDom.length) {
				var href = antireloadDom.first().attr("href");
				if (href) {
					antireload = href.replace(/\D/g, '');
				}
				if (antireload) {
					gc.setValue('antiReload', antireload);
				}
			}
			if (responseDetails.status !== 200) {
				if (config.onFailure) {
					config.onFailure.call(this, responseDetails.responseText);
				}
				return;
			}

			//update gc properties from page data using a global gc object
			if (responseDetails.responseText.indexOf('{') === 0 && $.isPlainObject($.parseJSON(responseDetails.responseText))) {
				//special handling of json results
			}
			else if (gc.isPropertyPage(responseDetails.responseText)) {
				var properties = gc.readProperties(responseDetails.responseText);
				properties = gc.setServer(properties, properties.serverName);
				gc.serializeProperties(properties);
				gc.turns.updateEl();
				gc.power.updateEl();
				gc.cash.updateEl();
				gc.food.updateEl();
			}

			if (config.successCondition && $(config.successCondition, responseDetails.responseText).length) {
				config.onSuccess.call(this, responseDetails.responseText);
			} else if (config.successCondition) {
				config.onFailure.call(this, responseDetails.responseText);
			} else {
				config.onSuccess.call(this, responseDetails.responseText);
			}
		},
		onerror: function (response) {
			console.error('XHR error', config, response);
			config.onFailure.call(this, response);
		}
	};
	if (config.data) {
		settings.data = config.data;
	}
	if (config.method) {
		settings.method = config.method;
	}
	if (config.extra) {
		settings.extra = config.extra;
	}
	GM_xmlhttpRequest(settings);
};
/**
 * automated capsule labs
 */
app.mod.automatedcapsulelab = {
	id: 'a-automatedcapsulelab',
	defaultValue: true,
	title: 'Automated capsule lab',
	description: 'Shows a list of fusable artifacts (incl. your stocks). Clicking on the list fills the fusion form...',
	items: [{
		type: 'checkbox',
		id: 'a-automatedcapsulelab-showall',
		description: 'Show all artifacts, not only those you can fuse'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-automatedcapsulelab')) {
			return false;
		}
		if (gc.location.match(/i.cfm.*f.com_project2.id.3$/) && $("select").length) {
			return true;
		}
		if (gc.location.indexOf('com_market_use') !== -1) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		//artifacts page
		if (gc.location.match(/com_market_use$/)) { //artifact main page: ARTIFACT COUNTER (a part of Capsule Lab)
			(function () {
				var stocks = [];
				$("table.table_back[width='50%'] tr.table_row1").each(function () {
					stocks.push({
						id: $("td a:first", this).attr("href").replace(/.*id=/, '').replace(/\D/, '', 'g') * 1,
						stock: $.trim($("td:eq(2)", this).text()) * 1
					});
				});
				gc.setValue('a-automatedcapsulelab-stocks', (stocks));
			})();
			return;
		}
		//an artifact page
		else if (gc.location.match(/com_market_use.*id=/)) { //artifact main page: ARTIFACT COUNTER (a part of Capsule Lab)
			(function () {
				var row = $("table.table_back[width='50%'] tr.table_row1:first");
				var id = $("td a:first", row).attr("href").replace(/.*id=/, '').replace(/\D/, '', 'g') * 1;
				var stock = $("td:eq(2)", row).text().replace(/\D/, '', 'g') * 1;
				//get current
				var stocks = gc.getValue('a-automatedcapsulelab-stocks');
				//remove old, if it exists
				for (var i = 0; i < stocks.length; i = i + 1) {
					if (stocks[i].id === id) {
						console.log(stocks[i]);
						stocks.splice(i, 1);
						break;
					}
				}
				//add current
				stocks.unshift({
					id: id,
					stock: stock
				});
				gc.setValue('a-automatedcapsulelab-stocks', (stocks));
			})();
			return;
		}

		//FIXME move artifacts definition to a global object defining game variables
		if (!gc.getValue('a-automatedcapsulelab-definitions')) {
			gc.setValue('a-automatedcapsulelab-definitions', '{"items":[{"id":10,"type":"Common","name":"Energy Pod","effect":"Used to fuse other artifacts","ingredients":[]},{"id":13,"type":"Common","name":"White Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":14,"type":"Common","name":"Black Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":15,"type":"Common","name":"Blue Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":16,"type":"Common","name":"Green Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":17,"type":"Common","name":"Orange Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":18,"type":"Common","name":"Yellow Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":19,"type":"Common","name":"Purple Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":20,"type":"Common","name":"Gray Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":21,"type":"Common","name":"Brown Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":22,"type":"Common","name":"Moccasin Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":23,"type":"Common","name":"Golden Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":24,"type":"Common","name":"Turquoise Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":25,"type":"Common","name":"Aqua Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":26,"type":"Common","name":"Pink Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":27,"type":"Common","name":"Plum Orb","effect":"Used to fuse other artifacts","ingredients":[]},{"id":7,"type":"Special","name":"Organic Base","effect":"Used to fuse other artifacts","ingredients":[]},{"id":8,"type":"Special","name":"Assimillated Base","effect":"Used to fuse other artifacts","ingredients":[]},{"id":28,"type":"Uncommon","name":"Cuarto Mapa","effect":"Gives Artifact Formulas","ingredients":[{"id":13,"amount":1},{"id":14,"amount":1},{"id":15,"amount":1},{"id":16,"amount":1},{"id":17,"amount":1}]},{"id":29,"type":"Uncommon","name":"Bronze Dinero","effect":"Target empire credits increase a small amount","ingredients":[{"id":14,"amount":1},{"id":17,"amount":1},{"id":16,"amount":1},{"id":15,"amount":1},{"id":18,"amount":1}]},{"id":30,"type":"Uncommon","name":"Silver Dinero","effect":"Target empire credits increase a small amount","ingredients":[{"id":18,"amount":1},{"id":13,"amount":1},{"id":20,"amount":1},{"id":19,"amount":1},{"id":26,"amount":1}]},{"id":31,"type":"Uncommon","name":"Gold Dinero","effect":"Target empire credits increase a small amount","ingredients":[{"id":20,"amount":1},{"id":26,"amount":1},{"id":25,"amount":1},{"id":24,"amount":1},{"id":27,"amount":1}]},{"id":32,"type":"Uncommon","name":"Platinum Dinero","effect":"Target empire credits increase a small amount","ingredients":[{"id":25,"amount":2},{"id":27,"amount":1},{"id":26,"amount":2},{"id":26,"amount":2},{"id":25,"amount":2}]},{"id":33,"type":"Uncommon","name":"Amber Dinero","effect":"Target empire credits decrease a small amount","ingredients":[{"id":18,"amount":2},{"id":21,"amount":1},{"id":19,"amount":1},{"id":20,"amount":1},{"id":18,"amount":2}]},{"id":34,"type":"Uncommon","name":"Garnet Dinero","effect":"Target empire credits decrease a small amount","ingredients":[{"id":16,"amount":1},{"id":22,"amount":2},{"id":24,"amount":1},{"id":23,"amount":1},{"id":22,"amount":2}]},{"id":35,"type":"Uncommon","name":"Topaz Dinero","effect":"Target empire credits decrease a small amount","ingredients":[{"id":15,"amount":1},{"id":23,"amount":1},{"id":17,"amount":1},{"id":24,"amount":1},{"id":26,"amount":1}]},{"id":36,"type":"Uncommon","name":"Opal Dinero","effect":"Target empire credits decrease a small amount","ingredients":[{"id":10,"amount":2},{"id":18,"amount":1},{"id":25,"amount":1},{"id":15,"amount":1},{"id":10,"amount":2}]},{"id":37,"type":"Uncommon","name":"Amethyst Dinero","effect":"Target empire credits decrease a small amount","ingredients":[{"id":10,"amount":1},{"id":23,"amount":1},{"id":17,"amount":1},{"id":16,"amount":1},{"id":21,"amount":1}]},{"id":11,"type":"Unique","name":"STC","effect":"Target empire receives 10 turns","ingredients":[{"id":46,"amount":1},{"id":47,"amount":1},{"id":44,"amount":1},{"id":45,"amount":1},{"id":43,"amount":1}]},{"id":38,"type":"Rare","name":"Minor Suerte","effect":"Gives Luck","ingredients":[{"id":28,"amount":1},{"id":7,"amount":1},{"id":30,"amount":1},{"id":29,"amount":1},{"id":31,"amount":1}]},{"id":39,"type":"Rare","name":"Major Suerte","effect":"Gives Luck","ingredients":[{"id":8,"amount":1},{"id":30,"amount":1},{"id":29,"amount":1},{"id":31,"amount":1},{"id":32,"amount":1}]},{"id":40,"type":"Rare","name":"Minor Requerido","effect":"Target empire raw material decreases","ingredients":[{"id":30,"amount":1},{"id":7,"amount":1},{"id":31,"amount":1},{"id":32,"amount":1},{"id":33,"amount":1}]},{"id":41,"type":"Rare","name":"Minor Gente","effect":"Target empire population decreases(Doesnt work)","ingredients":[{"id":34,"amount":1},{"id":32,"amount":2},{"id":32,"amount":2},{"id":31,"amount":1},{"id":8,"amount":1}]},{"id":42,"type":"Rare","name":"Minor Alimento","effect":"Target empire food decreases","ingredients":[{"id":36,"amount":1},{"id":34,"amount":1},{"id":35,"amount":1},{"id":33,"amount":1},{"id":32,"amount":1}]},{"id":43,"type":"Rare","name":"Minor Cosecha","effect":"Target empire population decreases","ingredients":[{"id":33,"amount":1},{"id":34,"amount":1},{"id":35,"amount":1},{"id":36,"amount":1},{"id":37,"amount":1}]},{"id":44,"type":"Rare","name":"Minor Tierra","effect":"Target empire Ore decreases","ingredients":[{"id":31,"amount":1},{"id":30,"amount":3},{"id":28,"amount":1},{"id":30,"amount":3},{"id":30,"amount":3}]},{"id":45,"type":"Rare","name":"Traicione","effect":"Target empire loyalty decreases","ingredients":[{"id":36,"amount":1},{"id":33,"amount":2},{"id":29,"amount":1},{"id":28,"amount":1},{"id":33,"amount":2}]},{"id":12,"type":"Unique","name":"BTC","effect":"Gives 100 Turns(up to max any over are wasted)","ingredients":[{"id":11,"amount":2},{"id":58,"amount":1},{"id":59,"amount":1},{"id":11,"amount":2},{"id":57,"amount":1}]},{"id":46,"type":"Unique","name":"Minor Gordo","effect":"Increases max land on top planet +20-40 land (not homeworld)","ingredients":[{"id":43,"amount":2},{"id":43,"amount":2},{"id":44,"amount":1},{"id":42,"amount":1},{"id":41,"amount":1}]},{"id":47,"type":"Rare","name":"Minor Barrera","effect":"Prevents artifacts of any type to be used on Empire. Breakable with 5 rares","ingredients":[{"id":28,"amount":2},{"id":36,"amount":2},{"id":28,"amount":2},{"id":36,"amount":2},{"id":30,"amount":1}]},{"id":48,"type":"Unique","name":"Historia","effect":"Target empire loses 40 turns","ingredients":[{"id":38,"amount":1},{"id":11,"amount":1},{"id":40,"amount":1},{"id":39,"amount":1},{"id":43,"amount":1}]},{"id":49,"type":"Unique","name":"Minor Afortunado","effect":"Gives Luck","ingredients":[{"id":40,"amount":1},{"id":39,"amount":1},{"id":38,"amount":2},{"id":41,"amount":1},{"id":38,"amount":2}]},{"id":50,"type":"Unique","name":"Major Afortunado","effect":"Gives Luck","ingredients":[{"id":39,"amount":1},{"id":40,"amount":1},{"id":41,"amount":2},{"id":42,"amount":1},{"id":41,"amount":2}]},{"id":51,"type":"Unique","name":"Minor Estructura","effect":"Destroys infrastructure on outermost planet of target empire","ingredients":[{"id":41,"amount":1},{"id":40,"amount":1},{"id":11,"amount":1},{"id":43,"amount":1},{"id":42,"amount":1}]},{"id":52,"type":"Unique","name":"Major Alimento","effect":"You don\'t notice any effect","ingredients":[{"id":47,"amount":2},{"id":46,"amount":3},{"id":47,"amount":2},{"id":46,"amount":3},{"id":46,"amount":3}]},{"id":53,"type":"Unique","name":"Major Cosecha","effect":"You don\'t notice any effect","ingredients":[{"id":46,"amount":2},{"id":45,"amount":3},{"id":45,"amount":3},{"id":46,"amount":2},{"id":45,"amount":3}]},{"id":54,"type":"Unique","name":"Major Tierra","effect":"You don\'t notice any effect","ingredients":[{"id":43,"amount":2},{"id":44,"amount":3},{"id":44,"amount":3},{"id":43,"amount":2},{"id":44,"amount":3}]},{"id":55,"type":"Unique","name":"Persiana","effect":"Attacks against empire are halted for a time. Generally 2-3 attack attempts","ingredients":[{"id":40,"amount":1},{"id":11,"amount":2},{"id":41,"amount":1},{"id":11,"amount":2},{"id":42,"amount":1}]},{"id":56,"type":"Special","name":"Major Gordo","effect":"Adds 60-100 land on outermost planets. Does not work on homeworld","ingredients":[{"id":58,"amount":1},{"id":55,"amount":1},{"id":46,"amount":1},{"id":50,"amount":1},{"id":12,"amount":1}]},{"id":57,"type":"Unique","name":"Major Barrera","effect":"Prevents artifacts of any kind being used on target empire. Breakable with 20 rare artifacts","ingredients":[{"id":40,"amount":1},{"id":41,"amount":1},{"id":42,"amount":1}]},{"id":58,"type":"Unique","name":"Regalo","effect":"Gives Random number of a Random Artifacts, excluding other Regalos. Works best during Rare dig and after luck artifacts","ingredients":[{"id":46,"amount":1},{"id":34,"amount":1},{"id":45,"amount":1},{"id":42,"amount":1},{"id":43,"amount":1}]},{"id":59,"type":"Unique","name":"Major Producto","effect":"Decreases Consumer Goods of Target Empire (Roughly 500k)","ingredients":[{"id":43,"amount":1},{"id":44,"amount":1},{"id":45,"amount":1},{"id":41,"amount":1},{"id":42,"amount":1}]},{"id":60,"type":"Unique","name":"Major Dinero","effect":"Decreases target empire credits 3%","ingredients":[{"id":42,"amount":1},{"id":43,"amount":1},{"id":44,"amount":1},{"id":33,"amount":1},{"id":40,"amount":1}]},{"id":61,"type":"Special","name":"Grand Estructura","effect":"Destroys infrastructure on outermost planet","ingredients":[{"id":46,"amount":1},{"id":51,"amount":1},{"id":48,"amount":1},{"id":49,"amount":1},{"id":52,"amount":1}]},{"id":62,"type":"Special","name":"Grand Alimenter","effect":"Target Empire food Increases","ingredients":[{"id":50,"amount":1},{"id":49,"amount":1},{"id":51,"amount":1},{"id":53,"amount":1},{"id":52,"amount":1}]},{"id":63,"type":"Special","name":"Grand Cosecha","effect":"Target Empire food increases","ingredients":[{"id":50,"amount":1},{"id":52,"amount":1},{"id":51,"amount":1},{"id":54,"amount":1},{"id":53,"amount":1}]},{"id":64,"type":"Special","name":"Grand Gente","effect":"Target Empire population decreases","ingredients":[{"id":53,"amount":1},{"id":12,"amount":1},{"id":54,"amount":1},{"id":11,"amount":1},{"id":50,"amount":1}]},{"id":65,"type":"Special","name":"Grand Tierra","effect":"Target Empire Ore decreases 25%","ingredients":[{"id":52,"amount":1},{"id":54,"amount":1},{"id":53,"amount":1},{"id":55,"amount":1},{"id":56,"amount":1}]},{"id":66,"type":"Special","name":"Grand Requerido","effect":"Target Empire raw material decreases approx 3%","ingredients":[{"id":56,"amount":1},{"id":55,"amount":1},{"id":54,"amount":1},{"id":53,"amount":1},{"id":57,"amount":1}]},{"id":67,"type":"Special","name":"Grand Barrera","effect":"Prevents artifacts of any kind being used on target empire","ingredients":[{"id":55,"amount":1},{"id":54,"amount":1},{"id":57,"amount":1},{"id":56,"amount":1},{"id":58,"amount":1}]},{"id":68,"type":"Special","name":"Grand Producto","effect":"Target Empires consumer goods decrease","ingredients":[{"id":58,"amount":2},{"id":52,"amount":2},{"id":42,"amount":1},{"id":58,"amount":2},{"id":52,"amount":2}]},{"id":69,"type":"Special","name":"Grand Alimento","effect":"Target Empire food decreases","ingredients":[{"id":56,"amount":1},{"id":48,"amount":1},{"id":57,"amount":1},{"id":59,"amount":1},{"id":58,"amount":1}]},{"id":70,"type":"Special","name":"Grand Dinero","effect":"Target empire credits decrease 10%","ingredients":[{"id":53,"amount":1},{"id":52,"amount":1},{"id":51,"amount":1},{"id":40,"amount":1},{"id":55,"amount":1}]},{"id":9,"type":"Special","name":"PCC","effect":"Random planet assigned to border","ingredients":[{"id":29,"amount":1},{"id":62,"amount":1},{"id":64,"amount":1},{"id":63,"amount":1},{"id":65,"amount":1}]}]}');
		}

		//warning for new empires about unresearched capsule lab
		gc.showMessage('Unresearched capsule lab warning', 'Please note, that if you entered this page from a link in the extra menu of Anfit\'s GC mods, but had not researched Capsule Lab, then investing turns here will not gain you anything...', 'a-automatedcapsulelab-warning');

		/**
		 * Ingredient, used to create artifact
		 *
		 * @param {Object} config Named arguments map
		 * @param {number} config.id Identifier of an ingredient
		 * @param {number} config.amount Amount in which the ingredient is required
		 *
		 * @constructor
		 */
		var Ingredient = function (config) {
			/**
			 * Identifier of an ingredient
			 * @type {number}
			 */
			this.id = config.id;

			/**
			 * Amount in which the ingredient is required
			 * @type {number}
			 */
			this.amount = config.amount;
		};

		/**
		 * @returns {boolean} Whether all necessary properties are set
		 */
		Ingredient.prototype.validate = function () {
			if (this.id === undefined) {
				return false;
			}
			if (this.amount === undefined) {
				return false;
			}
			return true;
		};

		/**
		 * Artifact
		 *
		 * @param {Object} config Named arguments map
		 * @param {number} config.id Identifier of an artifact
		 * @param {string} config.name Name of an artifact
		 * @param {string} config.type Type of an artifact
		 * @param {string=} config.effect Description of an artifact's effect
		 * @param {number=} config.stock How many of an artifact there are in stock
		 * @param {Array.<Ingredient>=} config.ingredients Artifact ingredients
		 *
		 * @constructor
		 */
		var Artifact = function (config) {
			/**
			 * Identifier of an artifact
			 * @type {number}
			 */
			this.id = config.id;

			/**
			 * Name of an artifact
			 * @type {string}
			 */
			this.name = config.name;

			/**
			 * Type of an artifact
			 * @type {string}
			 */
			this.type = config.type;

			/**
			 * How many of an artifact there are in stock
			 * @type {number}
			 */
			this.stock = config.stock;

			/**
			 * Description of an artifact's effect
			 * @type {string}
			 */
			this.effect = config.effect;

			/**
			 * Artifact ingredients
			 * @type {Array.<Ingredient>}
			 */
			this.ingredients = [];

			if (config.ingredients !== undefined) {
				for (var i = 0; i < config.ingredients.length; i = i + 1) {
					var ingredient = new Ingredient(config.ingredients[i]);
					if (ingredient.validate() === true) {
						this.ingredients.push(ingredient);
					}
					else {
						console.error("An erroneous ingredient spotted in artifact " + this.id);
					}
				}
			}
		};

		/**
		 * @returns {boolean} Whether all necessary properties are set
		 */
		Artifact.prototype.validate = function () {
			if (this.id === undefined) {
				return false;
			}
			if (this.name === undefined) {
				return false;
			}
			if (this.type === undefined) {
				return false;
			}
			return true;
		};

		/**
		 * A list of artifacts
		 *
		 * @param {string} jsonString Stringified json with artifacts
		 *
		 * @constructor
		 */
		var ArtifactList = function (jsonString) {
			/**
			 * Artifacts
			 * @type {Array.<Artifact>}
			 */
			this.items = [];

			/**
			 * A artifactId, array key map which maps outside worlds' artifact ids to keys in this list
			 * @type {Object.<string, number>}
			 */
			this.keys = {};

			/**
			 * A artifactId, array key map which maps outside worlds' outputted' artifact ids to keys in this list
			 * @type {Object.<string, Array.<number>>}
			 */
			this.results = {};

			var json = $.parseJSON(jsonString);

			//FIXME remove the a_ prefixes and see what breaks

			//go through the json to create elements of the artifact list object
			var key = 0;
			if (json.items !== undefined) {
				for (var i = 0; i < json.items.length; i = i + 1) {
					var artifact = new Artifact(json.items[i]);
					if (artifact.validate() === true) {
						this.items.push(artifact);
						this.keys['a_' + artifact.id] = key;
						for (var j = 0; j < artifact.ingredients.length; j = j + 1) {
							var resultKeys = this.results['a_' + artifact.ingredients[j].id];
							if (resultKeys === undefined) {
								this.results['a_' + artifact.ingredients[j].id] = [];
							}
							this.results['a_' + artifact.ingredients[j].id].push(key);
						}
						key = key + 1;
					}
					else {
						console.error("An erroneous artifact spotted in artifactlist argument at " + i);
					}
				}
			}
		};

		/**
		 * Get an artifact from the artifact list by id
		 *
		 * @param {number} id
		 * @returns {Artifact|undefined}
		 */
		ArtifactList.prototype.get = function (id) {
			var key = this.keys['a_' + id];
			if (key === undefined) {
				return undefined;
			}
			return this.items[key];
		};

		/**
		 * Get an array of result artifacts from artifact list
		 *
		 * @param {number} id
		 * @returns {Array.<Artifact>}
		 */
		ArtifactList.prototype.getResults = function (id) {
			var results = this.results['a_' + id];
			if (results === undefined) {
				return undefined;
			}
			var resultArtifacts = [];
			for (var i = 0; i < results.length; i = i + 1) {
				var key = results[i];
				var artifact = this.items[key];
				if (artifact) {
					resultArtifacts.push(artifact);
				}
			}
			return resultArtifacts;
		};

		/**
		 * Change the values of stocks and fusable after an artifact has been fused
		 *
		 * @param {Artifact} artifact
		 */
		ArtifactList.prototype.onAfterSuccessfulFuse = function (artifact) {
			//check if necessary ingredients are in stock
			for (var i = 0; i < this.items.length; i = i + 1) {
				//FIXME remove null stock handling
				//ignore null stock
				if (this.items[i].id === 0) {
					continue;
				}
				//add new artie
				if (this.items[i].id === artifact.id) {
					this.items[i].stock = this.items[i].stock + 1;
				}
				//remove ingredients
				for (var j = 0; j < artifact.ingredients.length; j = j + 1) {
					if (this.items[i].id === artifact.ingredients[j].id) {
						this.items[i].stock = this.items[i].stock - artifact.ingredients[j].amount;
						break;
					}
				}
			}
			//recalculate stocks and fusables
			this.resetFusable();
		};

		/**
		 * Create a json string representation
		 *
		 * @returns {string} a json string
		 */
		ArtifactList.prototype.stringify = function () {
			var keys = this.keys;
			var results = this.results;
			delete this.keys;
			delete this.results;
			var string = (this);
			this.keys = keys;
			this.results = results;
			return string;
		};

		/**
		 * Forces artifact stock to this value
		 *
		 * @param {number} id
		 * @param {number} stock
		 */
		ArtifactList.prototype.setStock = function (id, stock) {
			if (id === 0) {
				console.debug("ArtifactList.setStock: Zero artifact is not allowed");
				return;
			}
			var artifact = this.get(id);
			if (artifact) {
				artifact.stock = stock;
			} else {
				console.debug("ArtifactList.setStock: No such artifact: " + id, this.items);
				return;
			}
		};

		/**
		 * Recalculate stocks and fusables
		 */
		ArtifactList.prototype.resetFusable = function () {
			var i;
			//delete old values
			for (i = 0; i < this.items.length; i = i + 1) {
				delete this.items[i].fusable;
			}
			//for each artifact
			for (i = 0; i < this.items.length; i = i + 1) {
				var artifact = this.items[i];
				//ignore if it has no id
				if (artifact.id === 0) {
					continue;
				}
				var results = this.getResults(artifact.id);
				if (results !== undefined) {
					for (var j = 0; j < results.length; j = j + 1) {
						var fusable = Math.floor(artifact.stock / app.util.countInArray(results[j], results));
						if (!fusable) {
							fusable = 0;
						}
						var existingFusable = results[j].fusable;
						if (existingFusable === undefined) {
							results[j].fusable = fusable;
						} else {
							results[j].fusable = Math.min(fusable, existingFusable);
						}
					}
				}
			}
		};


		var artifactList;
		var leftPanelWrap;
		var leftPanelBody;
		var rightPanelBody;
		var i;
		/**
		 *
		 */
		var fillForm = function (artifactId) {
			var artifact = artifactList.get(artifactId),
				ingredients = [];
			//zero form
			$('select[name^="g"]').val(0);
			//prepare ingredients table
			$("#a-automatedcapsulelab-ingredients-body").show();
			$("#a-automatedcapsulelab-ingredients-body tr:gt(0)").remove();
			//stateful
			gc.setValue('a-automatedcapsulelab-last', artifactId);
			//add submit info
			$("input[type='submit']:first").val('Fuse ' + artifact.name);
			//fill form, prepare ingredients
			for (var i = 0; i < artifact.ingredients.length; i = i + 1) {
				var ingredient = artifactList.get(artifact.ingredients[i].id);
				ingredients.push(ingredient);
				$('select[name="g' + (i + 1) + '"]').val(ingredient.id);
			}
			//add ingredients
			var markup = '<tr class="table_row1"><td>${name}</td><td width="1%" align="center"><small>${type}</small></td><td align="right">${stock}</td><td align="right">${fusable}</td></tr>';
			$.tmpl(markup, ingredients).appendTo("#a-automatedcapsulelab-ingredients-body");
			//show effect
			$("#a-artifact-effect").html(artifact.effect);
		};
		//false if its undefined
		if (!gc.getValue('a-automatedcapsulelab-stocks')) { //brand new world, let's get some data first...
			console.log("[Automated capsule lab] Artifacts stock is not cached. Re-caching. Please wait until the page reloads.");
			//get stocks with an xhr call from the artifacts page
			gc.xhr({
				url: 'i.cfm?f=com_market_use',
				method: 'GET',
				successCondition: "b:contains('ARTIFACTS')",
				onSuccess: function (response) {
					var stocks = [];
					$("table.table_back[width='50%'] tr.table_row1", response).each(function () {
						stocks.push({
							id: $("td a:first", this).attr("href").replace(/.*id=/, '').replace(/\D/, '', 'g') * 1,
							stock: $("td:eq(2)", this).text().replace(/\D/, '', 'g') * 1
						});
					});
					gc.setValue('a-automatedcapsulelab-stocks', (stocks));
					document.location.href = app.gameServer + 'i.cfm?f=com_project2&id=3';
				},
				onFailure: function (response) {
					console.error("[Automated capsule lab] Failed to re-cache artifacts stocks with a background xhr.");
				}
			});
			return;
		}
		var stocks = gc.getValue('a-automatedcapsulelab-stocks');

		artifactList = new ArtifactList(gc.getValue('a-automatedcapsulelab-definitions'));
		for (i = 0; i < stocks.length; i = i + 1) {
			artifactList.setStock(stocks[i].id, stocks[i].stock);
		}
		artifactList.resetFusable();
		//on fusing history exists
		var previousArtifactId = gc.getValue('a-automatedcapsulelab-last');
		//adapt stocks based on fusing results
		if (previousArtifactId && $("b:contains('was successfully created')").length) {
			var fusedArtifact = artifactList.get(previousArtifactId);
			artifactList.onAfterSuccessfulFuse(fusedArtifact);
			var stock = [];
			for (i = 0; i < artifactList.items.length; i = i + 1) {
				stock.push({
					id: artifactList.items[i].id,
					stock: artifactList.items[i].stock
				});
			}
			gc.setValue('a-automatedcapsulelab-stocks', (stock));
		}
		//define panels: right
		$("table.bodybox[width='310']").attr("id", "a-automatedcapsulelab-rightpanel-wrap");
		rightPanelBody = $("#a-automatedcapsulelab-rightpanel-wrap div:first");
		rightPanelBody.attr("id", "a-automatedcapsulelab-rightpanel-body");
		$("a:last", rightPanelBody).remove();
		rightPanelBody.append('<table width="230" class="a-table" id="a-automatedcapsulelab-ingredients-wrap"><tbody id="a-automatedcapsulelab-ingredients-body"><tr class="table_row0"><th>Ingredient</th><th width="1%" align="center">Type</th><th align="right">Stock</th><th align="right">Fusable</th></tr></tbody></table><div id="a-artifact-effect" />');
		//define panels: left
		leftPanelWrap = $("table.bodybox[width='250']");
		leftPanelWrap.attr("id", "a-automatedcapsulelab-leftpanel-wrap");
		leftPanelBody = $("#a-automatedcapsulelab-leftpanel-wrap tbody");
		leftPanelBody.attr("id", "a-automatedcapsulelab-leftpanel-body");
		leftPanelBody.html('<div class="a-bold">Anfit\'s Upgraded Capsule Lab</div>');
		leftPanelBody.append('<div>Allows fusing artifacts</div><table id="a-automatedcapsulelab-artifacts-wrap" class="a-table"><tbody id="a-automatedcapsulelab-artifacts-body"><tr class="table_row0"><th>Artifact</th><th width="1%" align="center">Type</th><th align="right">Stock</th><th align="right">Fusable</th></tr></tbody></table><div><a href="i.cfm?&f=com_project">Back to project list</a></div>');
		//add artifacts
		var markup = '<tr id="a-automatedcapsulelab-artifact-${id}" class="table_row1 fusable-${fusable}"><td><a href="i.cfm?&amp;f=com_market_use&amp;id=${id}">${name}</a></td><td align="center"><small>${type}</small></td><td align="right">${stock}</td><td align="right">${fusable}</td></tr>';
		$.tmpl(markup, artifactList.items).appendTo("#a-automatedcapsulelab-artifacts-body");
		//hide unfusable
		if (!gc.getValue('a-automatedcapsulelab-showall')) {
			$("#a-automatedcapsulelab-artifacts-body .fusable-0, #a-automatedcapsulelab-artifacts-body .fusable-").hide();
		}
		//on select
		$('#a-automatedcapsulelab-artifacts-body tr').click(function (e) {
			var row = $(this);
			var id = row.attr('id').replace("a-automatedcapsulelab-artifact-", "");
			if (row.hasClass('table_row1')) {
				row.addClass('table_row0').removeClass('table_row1');
				row.siblings('tr:gt(0).table_row0').addClass('table_row1').removeClass('table_row0');
				fillForm(id);
			}
		});
		//on global keypress
		window.addEventListener("keypress", function (event) {
			for (var i = event.target; i; i = i.parentNode) {
				if (i.nodeName === "TEXTAREA" || i.nodeName === "INPUT" || i.nodeName === "BUTTON") {
					return;
				}
			}
			if (String.fromCharCode(event.which) === "q") {
				if (!gc.getValue('AGC_chainReactor')) {
					gc.setValue('AGC_chainReactor', 1);
					$("#a-automatedcapsulelab-leftpanel-wrap").addClass("automated");
				} else {
					gc.setValue('AGC_chainReactor', 0);
					$("#a-automatedcapsulelab-leftpanel-wrap").removeClass("automated");
				}
			}
		}, true);
		//mark selection
		$("#a-automatedcapsulelab-artifacts-body #a-automatedcapsulelab-artifact-" + previousArtifactId).addClass("table_row0").removeClass("table_row1");
		if (previousArtifactId) {
			fillForm(previousArtifactId);
		}
		//on automation is turned on
		if (gc.getValue('AGC_chainReactor')) {
			$("#a-automatedcapsulelab-leftpanel-wrap").addClass("automated");
			if ($("#a-automatedcapsulelab-rightpanel-body").text().match("Not enought")) {
				console.error("Cannot fuse any more of the selected artifact, run out of ingredients");
			} else {
				window.setTimeout(function () {
					$("input[type='submit']:first")[0].click();
				}, app.util.getRandomNumber(232, 3201));
			}
		}
	}
};
/**
 * battles markup
 */
app.mod.battlesmarkup = {
	id: 'a-battlesmarkup',
	defaultValue: true,
	title: 'Battles markup',
	description: 'Replaces copy-pasted battle logs in fed chat and in the forums with a neat table.',
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-battlesmarkup')) {
			return false;
		}
		if (gc.location.indexOf('fed_forum') !== -1) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		var regexp = /^\s*([\-\w \.\(\)]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s*$/gi;
		var template = '<ul class="a-battlesmarkup-ship"><li class="a-battlesmarkup-ship-name">$1</li><li class="a-battlesmarkup-ship-amount">$2</li><li class="a-battlesmarkup-ship-lost">$3</li><li class="a-battlesmarkup-ship-remaining">$4</li></ul>';
		var cells = $("table.table_back[width='500'] table tr td:odd");
		var buf = 0;
		var lastBreakLine;
		cells.each(function () {
			$(this).contents().each(function () {
				if (this.nodeType === 3 && this.textContent.match(regexp)) {
					if (buf === 0) {
						buf = 1;
					} else {
						$(lastBreakLine).remove();
					}
					$(this).replaceWith(this.textContent.replace(regexp, template));
				} else if (this.nodeType === 3) {
					if (buf === 1) {
						buf = 0;
					}
				} else if (this.nodeName === 'BR') {
					lastBreakLine = this;
				}
			});
		});
	}
};
/**
 * Chat highlighter
 */
app.mod.chathighlighter = {
	id: 'a-chathighlighter',
	title: 'Chat highlighter',
	description: 'Assign colours to particular phrases in the chat! (requested by Certicom).',
	items: [{
		type: 'list',
		id: 'a-chathighlighter-list',
		defaultValue: "ace700;FF0000\nborrok;00FF00",
		description: 'One entry per line, marked phrase separated from a hexadecimal color with a semi-colon:'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-chathighlighter')) {
			return false;
		}
		if (!gc.getValue('a-chathighlighter-list')) {
			return false;
		}
		if (!$("#chat, table.bodybox[width='105'], td[colspan='3'] table.table_back").length) {
			return false;
		}
		return true;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		function highlightInner($el, phrase, colour) {
			$el.contents().each(function () {
				if (this.nodeType === 3 && $(this).text().match(phrase)) { // Text only, matching
					$(this).replaceWith($(this).text().replace(phrase, '<span style="color: #' + colour + '">' + phrase + '</span>', 'g'));
				} else if (this.nodeType === 3) { // Text only
					//ignore
				} else if ($(this).text().match(phrase)) { // Child element
					highlightInner($(this), phrase, colour);
				}
			});
		}
		var setttings = gc.getValue('a-chathighlighter-list') ? gc.getValue('a-chathighlighter-list').split("\n") : [];
		var highlight = function () {
				for (var i = 0; i < setttings.length; i = i + 1) {
					if (!setttings[i].match(';')) {
						console.error("[Chat highlighter] Setting '" + setttings[i] + "' is incorrect. There should be a semicolon in it.");
						continue;
					}
					var parts = setttings[i].split(";");
					var phrase = parts[0];
					var colour = parts[1];
					if ((colour.length !== 6 && colour.length !== 3) || colour.replace(/\D/g, '') === "") {
						console.error("[Chat highlighter] Setting '" + setttings[i] + "' is incorrect. The assigned colour value is incorrect.");
						continue;
					}
					highlightInner($("#chat, table.bodybox[width='105'], td[colspan='3'] table.table_back"), phrase, colour);
				}
			};
		highlight();
		if (gc.location.indexOf('i_chat.cfm') !== -1) {
			window.setInterval(highlight, 10000);
		}
	}
};
/**
 * Click to continue
 */
app.mod.clicktocontinue = {
	id: 'a-clicktocontinue',
	defaultValue: true,
	title: 'Click to continue',
	description: 'Some pages show a "Click to continue" message. This mod clicks there automatically.',
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-clicktocontinue')) {
			return false;
		}
		return true;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		var el = $("a:contains('Click here to continue.')");
		if (el.length) {
			el[0].click();
		}
	}
};
/**
 * cluster builder
 */
app.mod.clusterbuilder = {
	id: 'a-clusterbuilder',
	defaultValue: true,
	title: 'Cluster builder',
	description: 'Build your C1s and C2s really fast. You must have researched respective colony levels first, of course...',
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-clusterbuilder')) {
			return false;
		}
		if (gc.location.match(/f=com_col$/)) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		
		var button = $("input[value='Plunder Colony']");
		button.after("<br /><span class=\"table_row1 a-clusterbuilder-button a-button\"	id=\"a-clusterbuilder-createc1\">Create a C1</span>&nbsp;&nbsp;<span class=\"table_row1 a-clusterbuilder-button a-button\"	id=\"a-clusterbuilder-createc2\">Create a C2</span>&nbsp;&nbsp;<select id=\"a-clusterbuilder-mineral\">	<option value=\"1\">Terran Metal</option>	<option value=\"2\">Red Crystal</option>	<option value=\"3\">White Crystal</option>	<option value=\"4\">Rutile</option>	<option value=\"5\">Composite</option>	<option value=\"6\" selected=\"selected\">Strafez Organism</option></select>");
		$("#a-clusterbuilder-createc1").click(function (e) {
			
			var planetType = $("#a-clusterbuilder-mineral option:selected").val();
			
			gc.xhr({
				url: app.gameServer + 'i.cfm?&' + gc.getValue('antiReload') + '&f=com_colupgrade&tid=20&con=1',
				data: 'goodid=' + planetType,
				onFailure: function (response) {
					console.error("[Cluster builder] XHR query to create a C1 cluster failed.");
				},
				successCondition: "td:contains('New C1 was formed !')",
				onSuccess: function (response) {
					console.log("[Cluster builder] A new C1 cluster was formed.");
				}
			});
		});
		$("#a-clusterbuilder-createc2").click(function (e) {
			var planetType = $("#a-clusterbuilder-mineral option:selected").val();
			
			gc.xhr({
				url: app.gameServer + 'i.cfm?&' + gc.getValue('antiReload') + '&f=com_colupgrade&tid=21&con=1',
				data: 'goodid=' + planetType,
				onFailure: function (response) {
					console.error("[Cluster builder] XHR query to create a C2 cluster failed.");
				},
				successCondition: "td:contains('New C2 was formed !')",
				onSuccess: function (response) {
					console.log("[Cluster builder] A new C2 cluster was formed.");
				}
			});
		});
	}
};
/**
 * Common css. This should be run as the last mod
 */
app.mod.commoncss = {
	id: 'a-commoncss',
	defaultValue: true,
	title: 'Common css actions',
	description: 'Css manipulations common to most mods, eg.: on mouse over background change for action buttons.',
	items: [{
		type: 'info',
		text: 'You really should not disable this part, but if you want to take the eye candy off, feel free to do so.'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-commoncss')) {
			return false;
		}
		return true;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		$(".a-button").hover(

		function () {
			$(this).addClass("table_row0").removeClass("table_row1");
		}, function () {
			$(this).removeClass("table_row0").addClass("table_row1");
		});
		$(".a-revbutton").hover(

		function () {
			$(this).removeClass("table_row0").addClass("table_row1");
		}, function () {
			$(this).addClass("table_row0").removeClass("table_row1");
		});
	}
};
/**
 * credits
 */
app.mod.credits = {
	id: 'a-credits',
	defaultValue: true,
	title: 'Credits',
	description: 'Adds a short info blob about the mods to status page.',
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-credits')) {
			return false;
		}
		if (gc.location.match(/com_empire&cm=2/)) {
			return true;
		}
		if (gc.location.match(/com_empire&cm=4/)) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		var markup = '<div id="a-credits-text">You\'re using <a href="javascript:cmsgu(\'i.cfm?popup=msguser&uid=213512\');">Anfit</a>\'s GC Mod Pack v.${version} <a href="i.cfm?f=option">Check out the options and enjoy!</a> <a href="http://gc.mmanir.net"><img src="data:image/jpeg;base64,%2F9j%2F4AAQSkZJRgABAQAAAQABAAD%2F2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys%2FRD84QzQ5Ojf%2F2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf%2FwAARCAAKAAoDASIAAhEBAxEB%2F8QAFwAAAwEAAAAAAAAAAAAAAAAAAgQGB%2F%2FEACAQAAEFAAICAwAAAAAAAAAAAAECAwQFERIhAAZRUpH%2FxAAUAQEAAAAAAAAAAAAAAAAAAAAF%2F8QAGREBAAMBAQAAAAAAAAAAAAAAAQACAwQi%2F9oADAMBAAIRAxEAPwAPX6Wt9IZXZzkGfFXCbkKjvw0K5cwCSFYcQnQOX26A77lri%2Fp3LecuK8lDCpDhaQls4lPI4BgzM%2BOvGba1sXaOVDdsJa4ojlIYU8oowDocdzBg%2FPM28NribHphuPLXrF0Wf%2F%2FZ"/></a> (${paid} account${authenticated})</div>';
		$.tmpl(markup, {
			paid: gc.isPaid ? 'paid' : 'normal',
			authenticated: gc.authenticated ? '' : ', UNAUTHENTICATED with modserver',
			version: app.version
		}).appendTo("td:contains('Welcome to (SFGC) Galactic Conquest'):last");
	}
};
/**
 * disbander tweaks
 */
app.mod.disbandertweaks = {
	id: 'a-disbandertweaks',
	defaultValue: true,
	title: 'Fleet disbander tweaks',
	description: 'Slightly improves the "Manage Fleet" page. Calculates total PR and fleet PR after disbanding, shows 130% and 150% threshold, etc.',
	items: [{
		type: 'info',
		text: 'You can also disband stacks entire from the manage fleet page if you have that mod enabled.'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-disbandertweaks')) {
			return false;
		}
		if (gc.location.match(/com_disband$/)) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		//info
		$("table.bodybox[width='550'] td:first").append('<div>Anfit\'s tweaks:<ul><li>All you have to do is type in the input fields.</li><li>Quick disband (-10/-50) idea by VorteX...</li></ul></div>');
		var table = $("table.table_back[width='500'] table");
		var rows = $("tr", table);
		if (rows && rows.length === 1) {
			return;
		}
		//table headers
		rows.first().append('<td class="a-revbutton a-disbandertweaks-disband10" title="Click to prepare a 10% stack disband query">-10</td><td class="a-revbutton a-disbandertweaks-disband50" title="Click to prepare a 50% stack disband query">-50</td><td class="a-revbutton a-disbandertweaks-disbandall" title="Click to prepare a full stack disband query">all</small></td>');
		rows.filter("tr:gt(0)").append('<td class="a-button a-disbandertweaks-disband10" title="Click to prepare a 10% stack disband query">-10</td><td class="a-button a-disbandertweaks-disband50" title="Click to prepare a 50% stack disband query">-50</td><td class="a-button a-disbandertweaks-disbandall" title="Click to prepare a full stack disband query">all</small></td>');
		$("tr.table_row0:first", table).parent().attr("id", "a-disbandertweaks-parentTable");
		$("td.a-disbandertweaks-disband10:first").click(function () {
			$("td.a-disbandertweaks-disband10:gt(0)").each(function () {
				$(this)[0].click();
			});
		});
		$("td.a-disbandertweaks-disband50:first").click(function () {
			$("td.a-disbandertweaks-disband50:gt(0)").each(function () {
				$(this)[0].click();
			});
		});
		$("td.a-disbandertweaks-disbandall:first").click(function () {
			$("td.a-disbandertweaks-disbandall:gt(0)").each(function () {
				$(this)[0].click();
			});
		});
		$("tr:gt(0)", table).each(function () {
			var name = $.trim($("td:eq(0)", this).text());
			var pr = $("td:eq(5)", this).text().replace(/\D/g, '');
			var amount = $("td:eq(3)", this).text().replace(/\D/g, '');
			var stackUpkeep = $("td:eq(4)", this).text().replace(/\D/g, '');
			var upkeep = stackUpkeep / amount;
			var inputNode = $("td:eq(2) input", this);
			inputNode.val(0);
			var amountNode = $("td:eq(3)", this);
			var stackUpkeepNode = $("td:eq(4)", this);
			var stackPrNode = $("td:eq(6)", this);
			stackPrNode.addClass("a-disbandertweaks-stackpr");
			$("td.a-disbandertweaks-disband10", this).click(function (e) {
				inputNode.val(Math.floor(amount * 0.10));
				inputNode.trigger("change");
			});
			$("td.a-disbandertweaks-disband50", this).click(function (e) {
				inputNode.val(Math.floor(amount * 0.50));
				inputNode.trigger("change");
			});
			$("td.a-disbandertweaks-disbandall", this).click(function (e) {
				inputNode.val(amount);
				inputNode.trigger("change");
			});
			inputNode.change(function (e) {
				var disbandedAmount = $(this).val().replace(/\D/g, '') * 1;
				var newAmount = Math.max(amount - disbandedAmount, 0);
				amountNode.html(app.util.formatCurrency(newAmount) + "&nbsp;");
				stackUpkeepNode.html(app.util.formatCurrency(newAmount * upkeep) + "&nbsp;");
				stackPrNode.html(app.util.formatCurrency(newAmount * pr));
				var fleetPr = 0;
				$("td.a-disbandertweaks-stackpr").each(function () {
					fleetPr += $(this).text().replace(/\D/g, '') * 1;
				});
				var basePr = $("#a-disbandertweaks-fleetPr").attr("basePr") * 1;
				$("#a-disbandertweaks-fleetPr").text(app.util.formatCurrency(fleetPr));
				$('#a-disbandertweaks-totalPr').text(app.util.formatCurrency(basePr + fleetPr));
				$('#a-disbandertweaks-totalPr130').text(app.util.formatCurrency(Math.floor((basePr + fleetPr) / 1.3)));
				$('#a-disbandertweaks-totalPr150').text(app.util.formatCurrency(Math.floor((basePr + fleetPr) / 1.5)));
			});
		});
		var fleetPr = 0;
		$("td.a-disbandertweaks-stackpr").each(function () {
			fleetPr += $(this).text().replace(/\D/g, '') * 1;
		});
		var basePr = 1 * gc.power.getValue() - fleetPr;
		var markup = '<tr class="table_row0"><td colspan="5"/><td>total fleet pr:</td><td id="a-disbandertweaks-fleetPr" align="right" basepr="${basePr}">${fleetPr}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr class="table_row0"><td colspan="5"/><td>total pr:</td><td id="a-disbandertweaks-totalPr" align="right">${totalPr}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr class="table_row0"><td colspan="5"/><td>pr / 130%:</td><td id="a-disbandertweaks-totalPr130" align="right">${totalPr130}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr class="table_row0"><td colspan="5"/><td>pr / 150%:</td><td id="a-disbandertweaks-totalPr150" align="right">${totalPr150}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
		$.tmpl(markup, {
			basePr: basePr,
			fleetPr: app.util.formatCurrency(fleetPr),
			totalPr: app.util.formatCurrency(gc.power.getValue()),
			totalPr130: app.util.formatCurrency(Math.floor(gc.power.getValue() / 1.3)),
			totalPr150: app.util.formatCurrency(Math.floor(gc.power.getValue() / 1.5))
		}).appendTo("#a-disbandertweaks-parentTable", table);
	}
};
/**
 * Extra menu
 */
app.mod.extramenu = {
	id: 'a-extramenu',
	defaultValue: true,
	title: 'Extra menu',
	description: 'Add a new customisable menu (below normal ones) with shortcuts of your choice, visible on most GC pages.',
	items: [{
		type: 'list',
		id: 'a-extramenu-list',
		defaultValue: "http://www.sfcommunity.co.nr/;SFCommunity\n" + app.modsServer + ";Anfit's Scriptorium\ni.cfm?f=com_project2&id=3;Capsule Lab",
		description: 'List of menu items: one link per line, followed with a label after a semicolon'
	}, {
		type: 'info',
		text: 'SFGC links include a randomized antireload entry. Sometimes its imporant, sometimes not (e.g. market requires you to have a correct antireload value in your queries). In the settings above replace SFGC\'s antireload (four digits in some links) with "antireload".'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-extramenu')) {
			return false;
		}
		if (!$("table.bodybox tr td font.table_row0")[0]) {
			return false;
		}
		if (gc.location.match(/i.cfm.*f.com/)) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		var links = [];
		//fuck yeah :P
		if (gc.empireName === 'Anfit') {
			links.push({
				url: 'i.cfm?&' + gc.getValue('antiReload') + '&f=com_col_find&colid=20085661&tid=23',
				name: 'U.Spaz'
			});
		}
		//user links
		if (gc.getValue('a-extramenu-list')) {
			var userLinks = gc.getValue('a-extramenu-list').replace(/antireload/g, gc.getValue('antiReload')).split("\n");
			for (var i = 0; i < userLinks.length; i = i + 1) {
				var parts = userLinks[i].split(";");
				if (parts.length === 2) {
					links.push({
						url: parts[0],
						name: parts[1]
					});
				} else if (parts.length === 1) {
					links.push({
						url: parts[0],
						name: '[unnamed link]'
					});
				}
			}
		}
		//show extra menu if there are any links
		if (links.length > 0) {
			var wrap = $("table.bodybox tr td font.table_row0:first");
			wrap.append('<br /><br />Extra');
			$.tmpl('<br /><a href="${url}">${name}</a>', links).appendTo(wrap);
		}
	}
};
/**
 * fed chat
 */
app.mod.fedchat = {
	id: 'a-fedchat',
	defaultValue: true,
	title: 'Fed chat instead of Chat',
	description: 'Replaces the usual chat on main GC pages (on the right) with fed discussion board.',
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-fedchat')) {
			return false;
		}
		if (gc.location.indexOf('fed_forum') !== -1) {
			return false;
		}
		if ($("table.bodybox[width='105'] tbody tr td")[0]) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		var chatPanel = $("table.bodybox[width='105'] tbody tr td:first");
		if (!gc.getValue('a-fedchat-lastupdate') || !gc.getValue('a-fedchat-lastupdate')) {
			gc.setValue('a-fedchat-lastupdate', gc.timestamp);
		}
		if (gc.timestamp - 600000 > gc.getValue('a-fedchat-lastupdate') || !gc.getValue('fedchat.html')) {
			gc.xhr({
				method: 'GET',
				url: app.gameServer + 'i.cfm?f=fed_forum',
				onFailure: function (response) {
					console.error("[Fed chat] XHR query to get posts failed");
				},
				onSuccess: function (response) {
					var fedchatDigest = '';
					$("tr.table_row1[valign='top'], tr.table_row2", response).each(function () {
						var name = $(this).children().first().html().replace(/\s+<a.*/, "");
						var post = $(this).children().last().text();
						fedchatDigest += '<u>' + name + '</u>: ' + post + '<br/><img height="5" src="i/w/sp_.gif"/><br/>';
					});
					gc.setValue('a-fedchat-lastupdate', gc.timestamp);
					chatPanel.html(fedchatDigest);
					gc.setValue('fedchat.html', fedchatDigest);
					
				}
			});
		} else {
			chatPanel.html(gc.getValue('fedchat.html'));
		}
		chatPanel.attr("title", "Doubleclick to switch to fedchat");
		chatPanel.dblclick(function () {
			document.location.href = "http://gc.gamestotal.com/i.cfm?f=fed_forum";
		});
		
	}
};
/**
 * fed pms
 */
app.mod.fedpms = {
	id: 'a-fedpms',
	defaultValue: true,
	title: 'Fed private messages',
	description: 'Send a pm to all the members of your federation with a single click.',
	items: [{
		type: 'info',
		text: 'This mods adds a special message box below on the page listing members of the fed you are in.'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-fedpms')) {
			return false;
		}
		if (gc.location.indexOf('fed_member') !== -1 || gc.location.match(/#post/)) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		if (gc.location.match(/#post/)) {
			$("textarea[name='forum2']").val(gc.getValue('a-fedpms-message'));
			$("input[name='remLen2']").val(gc.getValue('a-fedpms-remaining'));
			$("input[value*='Send']")[0].click();
			return;
		}
		$("table.bodybox[width='400'] td:first").prepend('<div><center>PM all of the above, except yourself, via this form:<br /><textarea cols=67 rows=5 id="message"></textarea><br /><br /><input id="a-fedpms-submit" type="button" value="submit" /></center><br /></div>');
		var empires = [];
		$("a[href*='msguser']").each(function () {
			var name = $.trim($(this).text());
			//ignore self
			if (name !== gc.empireName) {
				empires.push(name);
			}
		});
		$("body:first").append('<iframe id="a-fedpms-iframe"></iframe>');
		
		function sendAPrivateMessage() {
			var recipient = empires.shift();
			gc.setValue('a-fedpms-recipient', recipient);
			gc.setValue('a-fedpms-status', 'SENDING');
			console.log('[Fed PMs] Sending message to ' + recipient + ' ...');
			$('#a-fedpms-iframe')[0].src = 'i.cfm?popup=msguser&nic=' + recipient + '&se=' + gc.server.id + '#post';
		}
		
		$("#a-fedpms-iframe").load(function (e) {
			if ($(this)[0].src) {
				var status = gc.getValue('a-fedpms-status');
				if (status === 'SENDING') {
					console.log('[Fed PMs] Message to ' + gc.getValue('a-fedpms-recipient') + ' sent or sending failed silently.');
					gc.setValue('a-fedpms-status', 'IDLE');
					if (empires.length) {
						sendAPrivateMessage();
					} else {
						$('#message').val('');
						gc.setValue('a-fedpms-message', '');
						gc.setValue('a-fedpms-remaining', '');
						gc.setValue('a-fedpms-recipient', '');
						gc.setValue('a-fedpms-status', '');
						console.log('[Fed PMs] Outgoing message queue is empty.');
					}
				}
			}
		});

		$('#a-fedpms-submit').click(function () {
			var message = $('#message').val().substring(0, 2000);
			var remaining = 2000 - message.length;
			gc.setValue('a-fedpms-message', message);
			gc.setValue('a-fedpms-remaining', remaining);
			console.log('[Fed PMs] PMs are being sent to your fedmates. Do not close this window for a while unless you want to stop sending...');
			sendAPrivateMessage();
		});
	}
};
/**
 * forum killfile
 */
app.mod.forumkillfile = {
	id: 'a-forumkillfile',
	title: 'Forum killfile',
	description: 'Removes forum posts and threads by users you list in the settings.',
	items: [{
		type: 'list',
		id: 'a-forumkillfile-list',
		defaultValue: 'usernameOne,usernameTwo',
		description: 'Enter name of people you want to ignore, comma-separated (in one line)'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-forumkillfile')) {
			return false;
		}
		if (!gc.getValue('a-forumkillfile-list')) {
			return false;
		}
		if (gc.location.indexOf('hef') !== -1) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		var shitlist = gc.getValue('a-forumkillfile-list').replace(/ /g, '').split(',');
		for (var i = 0; i < shitlist.length; i = i + 1) {
			var name = shitlist[i];
			if (!name) {
				continue;
			}
			$("tr td.fs font:contains('" + name + "')").parent().parent().addClass("a-forumkillfile-hidden");
			$("tr td:first-child a:contains('" + name + "')").parent().parent().addClass("a-forumkillfile-hidden");
			$("tr.tb1 td:first-child").attr("width", "1%");
		}
	}
};
/**
 * Infrastructure building tweak
 */
app.mod.infratweak = {
	id: 'a-infratweak',
	defaultValue: true,
	title: 'Infrastructure building tweak',
	description: 'Build at most 99999 of anything on a colony (at once) instead of 999.',
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-infratweak')) {
			return false;
		}
		if (gc.location.match(/com_col.*colid/)) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		$("input[maxlength='3']").attr('maxlength', 5);
	}
};
/**
 * automated capsule labs
 */
//http://gc.gamestotal.com/i.cfm?f=com_market_use

app.mod.integratedCapsuleLab = {
  id: 'a-integrated-capsule-lab',
  defaultValue: true,
  title: 'Automated capsule lab',
  description: 'Shows a list of fusable artifacts (incl. your stocks). Clicking on the list fills the fusion form...',
  items: [{
    type: 'checkbox',
    id: 'a-integrated-capsule-lab-showall',
    description: 'Show all artifacts, not only those you can fuse'
  }],

  arties: {
    "items": [{
      "id": 10,
      "type": "Common",
      "name": "Energy Pod",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 13,
      "type": "Common",
      "name": "White Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 14,
      "type": "Common",
      "name": "Black Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 15,
      "type": "Common",
      "name": "Blue Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 16,
      "type": "Common",
      "name": "Green Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 17,
      "type": "Common",
      "name": "Orange Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 18,
      "type": "Common",
      "name": "Yellow Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 19,
      "type": "Common",
      "name": "Purple Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 20,
      "type": "Common",
      "name": "Gray Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 21,
      "type": "Common",
      "name": "Brown Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 22,
      "type": "Common",
      "name": "Moccasin Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 23,
      "type": "Common",
      "name": "Golden Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 24,
      "type": "Common",
      "name": "Turquoise Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 25,
      "type": "Common",
      "name": "Aqua Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 26,
      "type": "Common",
      "name": "Pink Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 27,
      "type": "Common",
      "name": "Plum Orb",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 7,
      "type": "Uncommon",
      "name": "Organic Base",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 8,
      "type": "Uncommon",
      "name": "Assimillated Base",
      "effect": "Used to fuse other artifacts",
      "ingredients": []
    }, {
      "id": 28,
      "type": "Uncommon",
      "name": "Cuarto Mapa",
      "effect": "Gives Artifact Formulas",
      "ingredients": [{
        "id": 13,
        "amount": 1
      }, {
        "id": 14,
        "amount": 1
      }, {
        "id": 15,
        "amount": 1
      }, {
        "id": 16,
        "amount": 1
      }, {
        "id": 17,
        "amount": 1
      }]
    }, {
      "id": 29,
      "type": "Uncommon",
      "name": "Bronze Dinero",
      "effect": "Target empire credits increase a small amount",
      "ingredients": [{
        "id": 14,
        "amount": 1
      }, {
        "id": 17,
        "amount": 1
      }, {
        "id": 16,
        "amount": 1
      }, {
        "id": 15,
        "amount": 1
      }, {
        "id": 18,
        "amount": 1
      }]
    }, {
      "id": 30,
      "type": "Uncommon",
      "name": "Silver Dinero",
      "effect": "Target empire credits increase a small amount",
      "ingredients": [{
        "id": 18,
        "amount": 1
      }, {
        "id": 13,
        "amount": 1
      }, {
        "id": 20,
        "amount": 1
      }, {
        "id": 19,
        "amount": 1
      }, {
        "id": 26,
        "amount": 1
      }]
    }, {
      "id": 31,
      "type": "Uncommon",
      "name": "Gold Dinero",
      "effect": "Target empire credits increase a small amount",
      "ingredients": [{
        "id": 20,
        "amount": 1
      }, {
        "id": 26,
        "amount": 1
      }, {
        "id": 25,
        "amount": 1
      }, {
        "id": 24,
        "amount": 1
      }, {
        "id": 27,
        "amount": 1
      }]
    }, {
      "id": 32,
      "type": "Uncommon",
      "name": "Platinum Dinero",
      "effect": "Target empire credits increase a small amount",
      "ingredients": [{
        "id": 25,
        "amount": 2
      }, {
        "id": 27,
        "amount": 1
      }, {
        "id": 26,
        "amount": 2
      }, {
        "id": 26,
        "amount": 2
      }, {
        "id": 25,
        "amount": 2
      }]
    }, {
      "id": 33,
      "type": "Uncommon",
      "name": "Amber Dinero",
      "effect": "Target empire credits decrease a small amount",
      "ingredients": [{
        "id": 18,
        "amount": 2
      }, {
        "id": 21,
        "amount": 1
      }, {
        "id": 19,
        "amount": 1
      }, {
        "id": 20,
        "amount": 1
      }, {
        "id": 18,
        "amount": 2
      }]
    }, {
      "id": 34,
      "type": "Uncommon",
      "name": "Garnet Dinero",
      "effect": "Target empire credits decrease a small amount",
      "ingredients": [{
        "id": 16,
        "amount": 1
      }, {
        "id": 22,
        "amount": 2
      }, {
        "id": 24,
        "amount": 1
      }, {
        "id": 23,
        "amount": 1
      }, {
        "id": 22,
        "amount": 2
      }]
    }, {
      "id": 35,
      "type": "Uncommon",
      "name": "Topaz Dinero",
      "effect": "Target empire credits decrease a small amount",
      "ingredients": [{
        "id": 15,
        "amount": 1
      }, {
        "id": 23,
        "amount": 1
      }, {
        "id": 17,
        "amount": 1
      }, {
        "id": 24,
        "amount": 1
      }, {
        "id": 26,
        "amount": 1
      }]
    }, {
      "id": 36,
      "type": "Uncommon",
      "name": "Opal Dinero",
      "effect": "Target empire credits decrease a small amount",
      "ingredients": [{
        "id": 10,
        "amount": 2
      }, {
        "id": 18,
        "amount": 1
      }, {
        "id": 25,
        "amount": 1
      }, {
        "id": 15,
        "amount": 1
      }, {
        "id": 10,
        "amount": 2
      }]
    }, {
      "id": 37,
      "type": "Uncommon",
      "name": "Amethyst Dinero",
      "effect": "Target empire credits decrease a small amount",
      "ingredients": [{
        "id": 10,
        "amount": 1
      }, {
        "id": 23,
        "amount": 1
      }, {
        "id": 17,
        "amount": 1
      }, {
        "id": 16,
        "amount": 1
      }, {
        "id": 21,
        "amount": 1
      }]
    }, {
      "id": 11,
      "type": "Rare",
      "name": "Small Time Capsule (STC)",
      "effect": "Target empire receives 10 turns",
      "ingredients": [{
        "id": 46,
        "amount": 1
      }, {
        "id": 47,
        "amount": 1
      }, {
        "id": 44,
        "amount": 1
      }, {
        "id": 45,
        "amount": 1
      }, {
        "id": 43,
        "amount": 1
      }]
    }, {
      "id": 38,
      "type": "Rare",
      "name": "Minor Suerte",
      "effect": "Gives Luck",
      "ingredients": [{
        "id": 28,
        "amount": 1
      }, {
        "id": 7,
        "amount": 1
      }, {
        "id": 30,
        "amount": 1
      }, {
        "id": 29,
        "amount": 1
      }, {
        "id": 31,
        "amount": 1
      }]
    }, {
      "id": 39,
      "type": "Rare",
      "name": "Major Suerte",
      "effect": "Gives Luck",
      "ingredients": [{
        "id": 8,
        "amount": 1
      }, {
        "id": 30,
        "amount": 1
      }, {
        "id": 29,
        "amount": 1
      }, {
        "id": 31,
        "amount": 1
      }, {
        "id": 32,
        "amount": 1
      }]
    }, {
      "id": 40,
      "type": "Rare",
      "name": "Minor Requerido",
      "effect": "Target empire raw material decreases",
      "ingredients": [{
        "id": 30,
        "amount": 1
      }, {
        "id": 7,
        "amount": 1
      }, {
        "id": 31,
        "amount": 1
      }, {
        "id": 32,
        "amount": 1
      }, {
        "id": 33,
        "amount": 1
      }]
    }, {
      "id": 41,
      "type": "Rare",
      "name": "Minor Gente",
      "effect": "Target empire population decreases(Doesnt work)",
      "ingredients": [{
        "id": 34,
        "amount": 1
      }, {
        "id": 32,
        "amount": 2
      }, {
        "id": 32,
        "amount": 2
      }, {
        "id": 31,
        "amount": 1
      }, {
        "id": 8,
        "amount": 1
      }]
    }, {
      "id": 42,
      "type": "Rare",
      "name": "Minor Alimento",
      "effect": "Target empire food decreases",
      "ingredients": [{
        "id": 36,
        "amount": 1
      }, {
        "id": 34,
        "amount": 1
      }, {
        "id": 35,
        "amount": 1
      }, {
        "id": 33,
        "amount": 1
      }, {
        "id": 32,
        "amount": 1
      }]
    }, {
      "id": 43,
      "type": "Rare",
      "name": "Minor Cosecha",
      "effect": "Target empire population decreases",
      "ingredients": [{
        "id": 33,
        "amount": 1
      }, {
        "id": 34,
        "amount": 1
      }, {
        "id": 35,
        "amount": 1
      }, {
        "id": 36,
        "amount": 1
      }, {
        "id": 37,
        "amount": 1
      }]
    }, {
      "id": 44,
      "type": "Rare",
      "name": "Minor Tierra",
      "effect": "Target empire Ore decreases",
      "ingredients": [{
        "id": 31,
        "amount": 1
      }, {
        "id": 30,
        "amount": 3
      }, {
        "id": 28,
        "amount": 1
      }, {
        "id": 30,
        "amount": 3
      }, {
        "id": 30,
        "amount": 3
      }]
    }, {
      "id": 45,
      "type": "Rare",
      "name": "Traicione",
      "effect": "Target empire loyalty decreases",
      "ingredients": [{
        "id": 36,
        "amount": 1
      }, {
        "id": 33,
        "amount": 2
      }, {
        "id": 29,
        "amount": 1
      }, {
        "id": 28,
        "amount": 1
      }, {
        "id": 33,
        "amount": 2
      }]
    }, {
      "id": 12,
      "type": "Unique",
      "name": "Big Time Capsule (BTC)",
      "effect": "Gives 100 Turns(up to max any over are wasted)",
      "ingredients": [{
        "id": 11,
        "amount": 2
      }, {
        "id": 58,
        "amount": 1
      }, {
        "id": 59,
        "amount": 1
      }, {
        "id": 11,
        "amount": 2
      }, {
        "id": 57,
        "amount": 1
      }]
    }, {
      "id": 46,
      "type": "Unique",
      "name": "Minor Gordo",
      "effect": "Increases max land on top planet +20-40 land (not homeworld)",
      "ingredients": [{
        "id": 43,
        "amount": 2
      }, {
        "id": 43,
        "amount": 2
      }, {
        "id": 44,
        "amount": 1
      }, {
        "id": 42,
        "amount": 1
      }, {
        "id": 41,
        "amount": 1
      }]
    }, {
      "id": 47,
      "type": "Rare",
      "name": "Minor Barrera",
      "effect": "Prevents artifacts of any type to be used on Empire. Breakable with 5 rares",
      "ingredients": [{
        "id": 28,
        "amount": 2
      }, {
        "id": 36,
        "amount": 2
      }, {
        "id": 28,
        "amount": 2
      }, {
        "id": 36,
        "amount": 2
      }, {
        "id": 30,
        "amount": 1
      }]
    }, {
      "id": 48,
      "type": "Unique",
      "name": "Historia",
      "effect": "Target empire loses 40 turns",
      "ingredients": [{
        "id": 38,
        "amount": 1
      }, {
        "id": 11,
        "amount": 1
      }, {
        "id": 40,
        "amount": 1
      }, {
        "id": 39,
        "amount": 1
      }, {
        "id": 43,
        "amount": 1
      }]
    }, {
      "id": 49,
      "type": "Unique",
      "name": "Minor Afortunado",
      "effect": "Gives Luck",
      "ingredients": [{
        "id": 40,
        "amount": 1
      }, {
        "id": 39,
        "amount": 1
      }, {
        "id": 38,
        "amount": 2
      }, {
        "id": 41,
        "amount": 1
      }, {
        "id": 38,
        "amount": 2
      }]
    }, {
      "id": 50,
      "type": "Unique",
      "name": "Major Afortunado",
      "effect": "Gives Luck",
      "ingredients": [{
        "id": 39,
        "amount": 1
      }, {
        "id": 40,
        "amount": 1
      }, {
        "id": 41,
        "amount": 2
      }, {
        "id": 42,
        "amount": 1
      }, {
        "id": 41,
        "amount": 2
      }]
    }, {
      "id": 51,
      "type": "Unique",
      "name": "Minor Estructura",
      "effect": "Destroys infrastructure on outermost planet of target empire",
      "ingredients": [{
        "id": 41,
        "amount": 1
      }, {
        "id": 40,
        "amount": 1
      }, {
        "id": 11,
        "amount": 1
      }, {
        "id": 43,
        "amount": 1
      }, {
        "id": 42,
        "amount": 1
      }]
    }, {
      "id": 52,
      "type": "Unique",
      "name": "Major Alimento",
      "effect": "You don\'t notice any effect",
      "ingredients": [{
        "id": 47,
        "amount": 2
      }, {
        "id": 46,
        "amount": 3
      }, {
        "id": 47,
        "amount": 2
      }, {
        "id": 46,
        "amount": 3
      }, {
        "id": 46,
        "amount": 3
      }]
    }, {
      "id": 53,
      "type": "Unique",
      "name": "Major Cosecha",
      "effect": "You don\'t notice any effect",
      "ingredients": [{
        "id": 46,
        "amount": 2
      }, {
        "id": 45,
        "amount": 3
      }, {
        "id": 45,
        "amount": 3
      }, {
        "id": 46,
        "amount": 2
      }, {
        "id": 45,
        "amount": 3
      }]
    }, {
      "id": 54,
      "type": "Unique",
      "name": "Major Tierra",
      "effect": "You don\'t notice any effect",
      "ingredients": [{
        "id": 43,
        "amount": 2
      }, {
        "id": 44,
        "amount": 3
      }, {
        "id": 44,
        "amount": 3
      }, {
        "id": 43,
        "amount": 2
      }, {
        "id": 44,
        "amount": 3
      }]
    }, {
      "id": 55,
      "type": "Unique",
      "name": "Persiana",
      "effect": "Attacks against empire are halted for a time. Generally 2-3 attack attempts",
      "ingredients": [{
        "id": 40,
        "amount": 1
      }, {
        "id": 11,
        "amount": 2
      }, {
        "id": 41,
        "amount": 1
      }, {
        "id": 11,
        "amount": 2
      }, {
        "id": 42,
        "amount": 1
      }]
    }, {
      "id": 56,
      "type": "Special",
      "name": "Major Gordo",
      "effect": "Adds 60-100 land on outermost planets. Does not work on homeworld",
      "ingredients": [{
        "id": 58,
        "amount": 1
      }, {
        "id": 55,
        "amount": 1
      }, {
        "id": 46,
        "amount": 1
      }, {
        "id": 50,
        "amount": 1
      }, {
        "id": 12,
        "amount": 1
      }]
    }, {
      "id": 57,
      "type": "Unique",
      "name": "Major Barrera",
      "effect": "Prevents artifacts of any kind being used on target empire. Breakable with 20 rare artifacts",
      "ingredients": [{
        "id": 40,
        "amount": 1
      }, {
        "id": 41,
        "amount": 1
      }, {
        "id": 42,
        "amount": 1
      }]
    }, {
      "id": 58,
      "type": "Unique",
      "name": "Regalo",
      "effect": "Gives Random number of a Random Artifacts, excluding other Regalos. Works best during Rare dig and after luck artifacts",
      "ingredients": [{
        "id": 46,
        "amount": 1
      }, {
        "id": 34,
        "amount": 1
      }, {
        "id": 45,
        "amount": 1
      }, {
        "id": 42,
        "amount": 1
      }, {
        "id": 43,
        "amount": 1
      }]
    }, {
      "id": 59,
      "type": "Unique",
      "name": "Major Producto",
      "effect": "Decreases Consumer Goods of Target Empire (Roughly 500k)",
      "ingredients": [{
        "id": 43,
        "amount": 1
      }, {
        "id": 44,
        "amount": 1
      }, {
        "id": 45,
        "amount": 1
      }, {
        "id": 41,
        "amount": 1
      }, {
        "id": 42,
        "amount": 1
      }]
    }, {
      "id": 60,
      "type": "Unique",
      "name": "Major Dinero",
      "effect": "Decreases target empire credits 3%",
      "ingredients": [{
        "id": 42,
        "amount": 1
      }, {
        "id": 43,
        "amount": 1
      }, {
        "id": 44,
        "amount": 1
      }, {
        "id": 33,
        "amount": 1
      }, {
        "id": 40,
        "amount": 1
      }]
    }, {
      "id": 61,
      "type": "Special",
      "name": "Grand Estructura",
      "effect": "Destroys infrastructure on outermost planet",
      "ingredients": [{
        "id": 46,
        "amount": 1
      }, {
        "id": 51,
        "amount": 1
      }, {
        "id": 48,
        "amount": 1
      }, {
        "id": 49,
        "amount": 1
      }, {
        "id": 52,
        "amount": 1
      }]
    }, {
      "id": 62,
      "type": "Special",
      "name": "Grand Alimenter",
      "effect": "Target Empire food Increases",
      "ingredients": [{
        "id": 50,
        "amount": 1
      }, {
        "id": 49,
        "amount": 1
      }, {
        "id": 51,
        "amount": 1
      }, {
        "id": 53,
        "amount": 1
      }, {
        "id": 52,
        "amount": 1
      }]
    }, {
      "id": 63,
      "type": "Special",
      "name": "Grand Cosecha",
      "effect": "Target Empire food increases",
      "ingredients": [{
        "id": 50,
        "amount": 1
      }, {
        "id": 52,
        "amount": 1
      }, {
        "id": 51,
        "amount": 1
      }, {
        "id": 54,
        "amount": 1
      }, {
        "id": 53,
        "amount": 1
      }]
    }, {
      "id": 64,
      "type": "Special",
      "name": "Grand Gente",
      "effect": "Target Empire population decreases",
      "ingredients": [{
        "id": 53,
        "amount": 1
      }, {
        "id": 12,
        "amount": 1
      }, {
        "id": 54,
        "amount": 1
      }, {
        "id": 11,
        "amount": 1
      }, {
        "id": 50,
        "amount": 1
      }]
    }, {
      "id": 65,
      "type": "Special",
      "name": "Grand Tierra",
      "effect": "Target Empire Ore decreases 25%",
      "ingredients": [{
        "id": 52,
        "amount": 1
      }, {
        "id": 54,
        "amount": 1
      }, {
        "id": 53,
        "amount": 1
      }, {
        "id": 55,
        "amount": 1
      }, {
        "id": 56,
        "amount": 1
      }]
    }, {
      "id": 66,
      "type": "Special",
      "name": "Grand Requerido",
      "effect": "Target Empire raw material decreases approx 3%",
      "ingredients": [{
        "id": 56,
        "amount": 1
      }, {
        "id": 55,
        "amount": 1
      }, {
        "id": 54,
        "amount": 1
      }, {
        "id": 53,
        "amount": 1
      }, {
        "id": 57,
        "amount": 1
      }]
    }, {
      "id": 67,
      "type": "Special",
      "name": "Grand Barrera",
      "effect": "Prevents artifacts of any kind being used on target empire",
      "ingredients": [{
        "id": 55,
        "amount": 1
      }, {
        "id": 54,
        "amount": 1
      }, {
        "id": 57,
        "amount": 1
      }, {
        "id": 56,
        "amount": 1
      }, {
        "id": 58,
        "amount": 1
      }]
    }, {
      "id": 68,
      "type": "Special",
      "name": "Grand Producto",
      "effect": "Target Empires consumer goods decrease",
      "ingredients": [{
        "id": 58,
        "amount": 2
      }, {
        "id": 52,
        "amount": 2
      }, {
        "id": 42,
        "amount": 1
      }, {
        "id": 58,
        "amount": 2
      }, {
        "id": 52,
        "amount": 2
      }]
    }, {
      "id": 69,
      "type": "Special",
      "name": "Grand Alimento",
      "effect": "Target Empire food decreases",
      "ingredients": [{
        "id": 56,
        "amount": 1
      }, {
        "id": 48,
        "amount": 1
      }, {
        "id": 57,
        "amount": 1
      }, {
        "id": 59,
        "amount": 1
      }, {
        "id": 58,
        "amount": 1
      }]
    }, {
      "id": 70,
      "type": "Special",
      "name": "Grand Dinero",
      "effect": "Target empire credits decrease 10%",
      "ingredients": [{
        "id": 53,
        "amount": 1
      }, {
        "id": 52,
        "amount": 1
      }, {
        "id": 51,
        "amount": 1
      }, {
        "id": 40,
        "amount": 1
      }, {
        "id": 55,
        "amount": 1
      }]
    }, {
      "id": 9,
      "type": "Special",
      "name": "Planetary core (PCC)",
      "effect": "Random planet assigned to border",
      "ingredients": [{
        "id": 29,
        "amount": 1
      }, {
        "id": 62,
        "amount": 1
      }, {
        "id": 64,
        "amount": 1
      }, {
        "id": 63,
        "amount": 1
      }, {
        "id": 65,
        "amount": 1
      }]
    }]
  },

  // Returns true only when this mod can be launched

  filter: function () {
    // enabled in settings
    if (!gc.getValue('a-integrated-capsule-lab')) {
      return false;
    }
    // check we are on artifact page
    if (gc.location.match(/com_market_use$/g)) {
      return true;
    }
    return false;
  },
  // Mod's body function

  plugin: function () {
    // update stock information
    var stocks = [];
    $("table.table_back[width='50%'] tr.table_row1").each(function () {
      stocks.push({
        id: $("td a:first", this).attr("href").replace(/.*id=/, '').replace(/\D/, '', 'g') * 1,
        stock: $.trim($("td:eq(2)", this).text()) * 1
      });
    });
    gc.setValue('a-integrated-capsule-lab-stocks', stocks);

    //warning for new empires about unresearched capsule lab
    gc.showMessage('Unresearched capsule lab warning', 'Please note, that if you entered this page from a link in the extra menu of Anfit\'s GC mods, but had not researched Capsule Lab, then investing turns here will not gain you anything...', 'a-integrated-capsule-lab-warning');

    // *
    //  * Ingredient, used to create artifact
    //  *
    //  * @param {Object} config Named arguments map
    //  * @param {number} config.id Identifier of an ingredient
    //  * @param {number} config.amount Amount in which the ingredient is required
    //  *
    //  * @constructor

    var Ingredient = function (config) {
      this.id = config.id;
      this.amount = config.amount;
    };

    Ingredient.prototype.validate = function () {
      return (this.id !== undefined) && (this.amount !== undefined);
    };

    // *
    //  * Artifact
    //  *
    //  * @param {Object} config Named arguments map
    //  * @param {number} config.id Identifier of an artifact
    //  * @param {string} config.name Name of an artifact
    //  * @param {string} config.type Type of an artifact
    //  * @param {string=} config.effect Description of an artifact's effect
    //  * @param {number=} config.stock How many of an artifact there are in stock
    //  * @param {Array.<Ingredient>=} config.ingredients Artifact ingredients

    var Artifact = function (config) {
      this.id = config.id;
      this.name = config.name;
      this.type = config.type;

      //  * How many of an artifact there are in stock
      this.stock = config.stock;

      //  * Description of an artifact's effect
      this.effect = config.effect;

      // Artifact ingredients
      this.ingredients = [];

      if (config.ingredients !== undefined) {
        for (var i = 0; i < config.ingredients.length; i = i + 1) {
          var ingredient = new Ingredient(config.ingredients[i]);
          if (ingredient.validate() === true) {
            this.ingredients.push(ingredient);
          } else {
            console.error("An erroneous ingredient spotted in artifact " + this.id);
          }
        }
      }
    };

    Artifact.prototype.validate = function () {
      return (this.id !== undefined) && (this.name !== undefined) && (this.type !== undefined);
    };

    // A list of artifacts
    // input: json with artifacts

    var ArtifactList = function (data) {
      // artifacts by id
      this.artifacts = {};

      // maps artifacts to artifacts they are an ingredient for.
      this.results = {};

      //go through the data to create elements of the artifact list object
      if (data.items === undefined) {
        return
      }
      for (var i = 0, il = data.items.length; i < il; i++) {
        var artifact = new Artifact(data.items[i]);

        if (artifact.validate() !== true) {
          console.error("An erroneous artifact spotted in artifactList argument at " + i, artifact);
          continue;
        }
        this.artifacts[artifact.id] = artifact;

        for (var j = 0, jl = artifact.ingredients.length; j < jl; j++) {
          var ingredient_id = artifact.ingredients[j].id;
          var resultKeys = this.results[ingredient_id];

          if (resultKeys === undefined) {
            resultKeys = this.results[ingredient_id] = [];
          }
          resultKeys.push(artifact.id);
        }
      }

      var rarityValue = {
        'Common': 1,
        'Uncommon': 5,
        'Rare': 25,
        'Unique': 125,
        'Special': 625
      };
      var self = this;

      function calcArtifactValue(artifact) {
        if (artifact.value) {
          return artifact.value;
        }
        console.log('calcArtifactValue', artifact);

        var value = 0;
        for (var i = 0, l = artifact.ingredients.length; i < l; i++) {
          var iid = artifact.ingredients[i].id;
          var ingredient = self.get(iid);
          value += calcArtifactValue(ingredient);
        }
        value = value || rarityValue[artifact.type];

        artifact.value = value;
        return value;
      }

      // calculate artifact values
      try {
        for (var a in this.artifacts) {
          calcArtifactValue(this.artifacts[a]);
        }
      } catch (e) {
        console.log('error', e)
      }

      console.log('ArtifactList', this);
    };

    ArtifactList.typeOrder = ['Common', 'Uncommon', 'Rare', 'Unique', 'Special'];

    ArtifactList.artCompare = function (a, b) {
      var aType = ArtifactList.typeOrder.indexOf(a.type);
      var bType = ArtifactList.typeOrder.indexOf(b.type);

      if (aType > bType) {
        return 1;
      }
      if (aType < bType) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
    }

    // Get an artifact by id
    ArtifactList.prototype.get = function (id) {
      return this.artifacts[id];
    };

    // Get an artifact by id
    ArtifactList.prototype.getAll = function () {
      var arts = this.artifacts;
      var artList = Object.keys(arts).map(function (key) {
        return arts[key];
      });
      artList.sort(ArtifactList.artCompare);
      return artList;
    };

    //  * Get an array of result artifacts by id
    //  *
    //  * @param {number} id
    //  * @returns {Array.<Artifact>}

    ArtifactList.prototype.getResults = function (id) {
      var artifacts = this.artifacts;
      var resultIds = this.results[id] || [];
      return resultIds.map(function (i) {
        return artifacts[i];
      });
    };

    // *
    //  * Change the values of stocks and fusable after an artifact has been fused
    //  *
    //  * @param {Artifact} artifact

    ArtifactList.prototype.onAfterSuccessfulFuse = function (artifact) {
      console.log('onAfterSuccessfulFuse', artifact);
      // check if necessary ingredients are in stock
      var aid = artifact.id;
      var artifacts = this.artifacts;
      var art = artifacts[aid];

      // add new artifact
      art.stock += 1;

      // remove ingredients
      art.ingredients.forEach(function (ingredient) {
        artifacts[ingredient.id].stock -= 1; //ingredient.amount;
      });

      //recalculate stocks and fusables
      this.resetFusable();
    };

    //  * Sets artifact stock
    //  *
    //  * @param {number} artifact id
    //  * @param {number} value

    ArtifactList.prototype.setStock = function (id, stock) {
      if (id === 0) {
        console.debug("ArtifactList.setStock: Zero artifact is not allowed");
        return;
      }
      var artifact = this.get(id);
      if (!artifact) {
        console.debug("ArtifactList.setStock: No such artifact: " + id);
        return;
      }

      artifact.stock = stock;
      if (stock >= 254) {
        artifact.stockFull = true;
      } else {
        artifact.stockFull = false;
      }
    };

    //  * Recalculate stocks and fusables

    ArtifactList.prototype.resetFusable = function () {
      var artifacts = this.artifacts;

      function calcIngredientFusable(ingredient) {
        var stock = artifacts[ingredient.id].stock || 0;
        return Math.floor(stock / ingredient.amount);
      }

      for (var a in artifacts) {
        var artifact = artifacts[a];
        artifact.fusable = 0;

        if (artifact.ingredients.length > 0) {
          var maxFusable = artifact.ingredients.map(calcIngredientFusable)
          artifact.fusable = Math.min.apply(Math, maxFusable);
        }
        // console.log('artifact, maxFusable', artifact, maxFusable);
      }
    };

    var artifactList = new ArtifactList(this.arties);
    var CRAFT_URL = 'i.cfm?f=com_project2&id=3';

    function craft(artifact, callback) {
      var ingredients = artifact.ingredients;
      var postData = {
        g1: ingredients[0].id,
        g2: ingredients[1].id,
        g3: ingredients[2].id,
        g4: ingredients[3].id,
        g5: ingredients[4].id
      };
      $.post(CRAFT_URL, postData, callback);
    }

    function checkForSuccessfulFuse(doc) {
      if ($("b:contains('was successfully created')", doc).length) {
        return true;
      }
      return false;
    }

    function createFuser(artifact, n) {
      var button = $('<button class="fuse">x' + n + '</button>')
        .click(function (e) {
          var crafted = 0;
          var toCraft = n;

          function craftN(data) {
            if (data) {
              var successful = checkForSuccessfulFuse(data);
              if (!successful) {
                console.log('unsucessful fuse');
                return;
              }
              console.log('sucessful fuse');
              try {
                artifactList.onAfterSuccessfulFuse(artifact);
                updateTable(artifact);
              } catch (e) {
                console.log('error', e)
              }
              crafted++;
            }

            if (crafted >= toCraft) {
              return;
            }

            craft(artifact, craftN);
          }

          craftN();
        });
      return button;
    };

    var mainTable = $('.table_back table').attr('id', 'main-artifact-table')
    var mainTbody = $('tbody', mainTable).empty();


    function highlightIngredient(artifact) {
      $('#a-integrated-capsule-lab-artifact-' + artifact.id).addClass('highlighted-ingredient');
    }

    function highlightResult(artifact) {
      $('#a-integrated-capsule-lab-artifact-' + artifact.id).addClass('highlighted-result');
    }


    function highlightSharedIngredient(artifact) {
      $('#a-integrated-capsule-lab-artifact-' + artifact.id).addClass('highlighted-shared-ingredient');
    }
    function highlightSharedResult(artifact) {
      $('#a-integrated-capsule-lab-artifact-' + artifact.id).addClass('highlighted-shared-result');
    }

    var MAX_STOCK = 255;
    function setFuseButtons(i, tr) {
      var id = $(tr).data('id');
      var art = artifactList.get(id);
      var container = $('td.fuse', tr).empty();
      var canFuse = Math.min(art.fusable, MAX_STOCK - art.stock);
      if (canFuse > 0) {
        container.append(createFuser(art, 1));
      }
      if (canFuse > 5) {
        container.append(createFuser(art, 6));
      }
      if (canFuse > 35) {
        container.append(createFuser(art, 36));
      }
      // <button class="fuse">x1</button><button class="fuse">x6</button><button class="fuse">x36</button>
    }


    var artifactsTableHeader = '<tr class="table_row0">\
      <th>Artifact</th>\
      <th width="1%" align="center">Type</th>\
      <th align="center">Value</th>\
      <th align="center">Stock</th>\
      <th align="center">Fusable</th>\
      <th align="center">Fuse</th>\
    </tr>';
    var artifactRowTemplate = '<tr data-id="${id}" id="a-integrated-capsule-lab-artifact-${id}" class="table_row1 fusable-${fusable}">\
    <td><a href="i.cfm?&amp;f=com_market_use&amp;id=${id}">${name}</a></td>\
    <td align="center" class="type-data"><small>${type}</small></td>\
    <td align="right" class="value-data">${value}</td>\
    <td align="right" class="stock-data stock-full-${stockFull}">${stock}</td>\
    <td align="right" class="fusable-data">${fusable}</td>\
    <td align="left" class="fuse"></td>\
    </tr>';

    function flatten (l) {
      return [].concat.apply([], l);
    }

    function makeTable() {
      $('table.table_back').attr('width', '');

      console.log('setting stocks');

      var stocks = gc.getValue('a-integrated-capsule-lab-stocks');
      for (var i = 0; i < stocks.length; i = i + 1) {
        artifactList.setStock(stocks[i].id, stocks[i].stock);
      }

      console.log('resetFusable');
      artifactList.resetFusable();

      $(artifactsTableHeader).appendTo(mainTbody);
      $.tmpl(artifactRowTemplate, artifactList.getAll())
        .appendTo(mainTbody)
        .each(setFuseButtons);

      if (!gc.getValue('a-integrated-capsule-lab-showall')) {
        // $('.fusable-0, .fusable-', mainTbody).hide();
      }

      //on select
      $('tr', mainTbody).click(function (e) {
        var row = $(this);
        var id = row.attr('id').replace('a-integrated-capsule-lab-artifact-', '');
        if (!row.hasClass('table_row1')) {
          return
        }

        // reset other rows
        row.siblings('tr')
          .addClass('table_row1')
          .removeClass('table_row0')
          .removeClass('highlighted-ingredient')
          .removeClass('highlighted-result')
          .removeClass('highlighted-shared-ingredient')
          .removeClass('highlighted-shared-result');


        // highlight this row
        row.addClass('table_row0')
          .removeClass('table_row1');

        var art = artifactList.get(id);
        console.log(art);

        var ingredients = art.ingredients;
        var results = artifactList.getResults(id);
        var sharedResults = flatten(results.map(function(a){return a.ingredients;}));
        var sharedIngredients = flatten(ingredients.map(function(a){return artifactList.getResults(a.id);}));


        console.log('ingredients, results', ingredients, results);


        ingredients.forEach(highlightIngredient);
        results.forEach(highlightResult);
        sharedResults.forEach(highlightSharedResult);
        sharedIngredients.forEach(highlightSharedIngredient);
      });
    }

    function updateTable(fusedArtifact) {
      updateRow(fusedArtifact);
      fusedArtifact.ingredients.forEach(function (ingredient) {
        updateRow(artifactList.get(ingredient.id));
        artifactList.getResults(ingredient.id).forEach(updateRow);
      });
      artifactList.getResults(fusedArtifact.id).forEach(updateRow);
    }

    function updateRow(artifact) {
      var tr = $('tr[data-id="' + artifact.id + '"]', mainTbody);

      $('.stock-data', tr).text(artifact.stock);
      $('.fusable-data', tr).text(artifact.fusable);

      setFuseButtons(0, tr);
    }

    makeTable();
  }
};
/**
 * key bindings
 */
app.mod.keybindings = {
	id: 'a-keybindings',
	title: 'Key bindings',
	description: 'Add key bindings of your choice to most GC pages (all except forum - if you feel forum should be included, contact me - Anfit).',
	items: [{
		type: 'list',
		id: 'a-keybindings-list',
		defaultValue: app.gameServer + 'forum2/;F\n' + app.gameServer + 'i.cfm?&antireload&f=com_ship2&shiptype=19;V',
		description: 'Replace SFGC\'s antireload with "antireload". V is capital v and stands for "Shift+v".'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-keybindings')) {
			return false;
		}
		if (!gc.getValue('a-keybindings-list')) {
			return false;
		}
		if (gc.location.indexOf('i.cfm') !== -1) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		$(window).keypress(function (event) {
			var wrongNodes = $(event.target).parentsUntil("TEXTAREA, INPUT, BUTTON");
			if (wrongNodes.length) {
				return;
			}
			var keys = gc.getValue('a-keybindings-list').replace(/antireload/g, gc.getValue('antiReload')).split("\n");
			for (var i = 0; i < keys.length; i = i + 1) {
				var parts = keys[i].split(";");
				var key = parts[1];
				var link = parts[0];
				if (parts.length !== 2 || key.length !== 1) {
					console.error("[Key bindings] config line " + keys[i] + " is wrong...");
					continue;
				}
				if (String.fromCharCode(event.which) === key) {
					document.location.href = link;
				}
			}
		});
	}
};
/**
 * market tweaks
 */
app.mod.markettweaks = {
	id: "a-markettweaks",
	defaultValue: true,
	title: "Market tweaks",
	description: "Adds small improvements to the market (buy faster and similar, see notes added to the market pages). Thx, Wingnut for the idea!.",
	items: [{
		type: 'info',
		text: 'Type in a price total and is calculates the amount; click on the topmost offer to fill in the purchase form with that amount; ctrl-click on the topmost offer to buy it.'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-markettweaks')) {
			return false;
		}
		if (gc.location.indexOf('market2') !== -1) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		$("input[name^='total']").removeAttr("onfocus");
		$("input[name='totalbuy']").change(function (e) {
			$("input[name='amount']").val(Math.floor($("input[name='totalbuy']").val() / $("input[name='price']").val()));
		});
		$("input[name='totalsell']").change(function (e) {
			$("input[name='amount']").val(Math.floor($("input[name='totalsell']").val() / $("input[name='price']").val()));
		});
		var topOffer = $("table.bodybox[width='550'] table.table_back:eq(3) table tr:eq(1)");
		//set title
		topOffer.attr("title", "Click to fill the buy field with the amount from the topmost offer. Ctrl-click to buy this offer, instead.");
		topOffer.addClass("a-button");
		//on click
		topOffer.click(function (e) {
			$("input[name='amount']").val($("td:eq(1)", this).text().replace(/^\s*|,|\s*$/g, ''));
			if (e.ctrlKey === true) {
				$("input[name='buyflag']")[0].click();
			}
		});
		$("table.bodybox[width='550'] td:first").append('<div><ul><li>Type total price and amount gets calculated automagickally (idea by wingnut),</li><li>Click on the topmost offer to fill the buy field with that amount,</li><li>Ctrl-click on the topmost offer to BUY it.</li></ul></div>');
	}
};
/**
 * newbie protection ranking
 */
app.mod.newbieranking = {
	id: "a-newbieranking",
	defaultValue: true,
	title: "Ranking around newbie protection",
	description: "Replaces the absurd empty 'Rank near me' page for empires in Newbie Protection with something which may show some empires around thr 5000PR threashold. If your servers is underpopulated you might want to change the threshold value below to something higher (idea: wingnut).",
	items: [{
		id: 'a-newbieranking-threshold',
		defaultValue: '7000',
		type: 'list',
		description: 'Show empires with power rating this high or lower. If no empires above newbie protection, but below this value exist, then the usual "Nothing listed here" message will be shown...'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-newbieranking')) {
			return false;
		}
		if (!gc.location.indexOf('rank') !== -1) {
			return false;
		}
		if (gc.power.getValue() >= 5000) {
			return false;
		}
		return true;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		$("a[href$='rank2']").attr('href', 'i.cfm?f=rank2&nx=' + gc.getValue('a-newbieranking-threshold'));
	}
};
/**
 * page titles
 */
app.mod.pagetitles = {
	id: 'a-pagetitles',
	defaultValue: true,
	title: 'Page titles',
	description: 'Adds sensible page titles to most GC Pages. Makes multi-tab browsing way more user-friendly: different pages get different tab titles.',
	items: [{
		type: 'info',
		text: 'A page title == global prefix + local prefix + page title. Here you can change the first one and toggle the second one on/off.'
	}, {
		type: 'input',
		id: 'a-pagetitles-tag',
		description: 'Set the global prefix here:',
		defaultValue: '(GC) '
	}, {
		type: 'checkbox',
		id: 'a-pagetitles-allowlocal',
		description: 'Allow local prefixes like "Build:" before shipnames and "Market:" before minerals etc?'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-pagetitles')) {
			return false;
		}
		return true;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		//CONFIG
		var global = gc.getValue('a-pagetitles-tag');
		var title = global ? global : '';
		var name = '';
		var pages = [{
			title: "Counters",
			regexp: "rank2.*ty=3"
		}, {
			title: "Rank near me",
			regexp: "rank2"
		}, {
			title: "Top Stats",
			regexp: "rank_s"
		}, {
			title: "Top Planets",
			regexp: "rank.*ty=1"
		}, {
			title: "Top Ranking",
			regexp: "rank$"
		}, {
			title: "Options",
			regexp: "option"
		}, {
			title: "Fed Battles",
			regexp: "fed_prev"
		}, {
			title: "Feds2",
			regexp: "fed_join2"
		}, {
			title: "Feds",
			regexp: "fed_join$"
		}, {
			title: "Fedchat",
			regexp: "fed_forum"
		}, {
			title: "Fed Details",
			regexp: "fed_detail"
		}, {
			title: "Fed...",
			regexp: "fed_"
		}, {
			title: "Research Mining",
			regexp: "com_research2.*rtype=5"
		}, {
			title: "Research Agriculture",
			regexp: "com_research2.*rtype=4"
		}, {
			title: "Research Industry",
			regexp: "com_research2.*rtype=3"
		}, {
			title: "Research Commercial",
			regexp: "com_research2.*rtype=2"
		}, {
			title: "Research Housing",
			regexp: "com_research2.*rtype=1"
		}, {
			title: "Research",
			regexp: "com_research$"
		}, {
			title: "Capsule Lab",
			regexp: "com_project2.*id=3.*new=1"
		}, {
			title: "Loktar",
			regexp: "com_project2.*id=2.*new=1"
		}, {
			title: "Hektar",
			regexp: "com_project2.*id=1.*new=1"
		}, {
			title: "Projects",
			regexp: "com_project"
		}, {
			title: "Missions",
			regexp: "com_mission"
		}, {
			title: "Strafez",
			regexp: "com_market2.*gid=6"
		}, {
			title: "Composite",
			regexp: "com_market2.*gid=5"
		}, {
			title: "Rutile",
			regexp: "com_market2.*gid=4"
		}, {
			title: "White Crystal",
			regexp: "com_market2.*gid=3"
		}, {
			title: "Consumer Goods",
			regexp: "com_market2.*gid=24"
		}, {
			title: "Raws",
			regexp: "com_market2.*gid=23"
		}, {
			title: "Ore",
			regexp: "com_market2.*gid=22"
		}, {
			title: "Food",
			regexp: "com_market2.*gid=21"
		}, {
			title: "Red Crystal",
			regexp: "com_market2.*gid=2"
		}, {
			title: "Terran Metal",
			regexp: "com_market2.*gid=1"
		}, {
			title: "Market",
			regexp: "com_market$"
		}, {
			title: "Intelligence",
			regexp: "com_intel"
		}, {
			title: "Income",
			regexp: "com_income"
		}, {
			title: "Explore",
			regexp: "com_explore"
		}, {
			title: "Events",
			regexp: "com_empire.*cm=4"
		}, {
			title: "Summary",
			regexp: "com_empire.*cm=3"
		}, {
			title: "Events",
			regexp: "com_empire.*cm=2"
		}, {
			title: "Fleet",
			regexp: "com_disband"
		}, {
			title: "Create C3",
			regexp: "com_colupgrade.*tid=22"
		}, {
			title: "Create C2",
			regexp: "com_colupgrade.*tid=21"
		}, {
			title: "Create C1",
			regexp: "com_colupgrade.*tid=20"
		}, {
			title: "Clustering",
			regexp: "com_colupgrade"
		}, {
			title: "Reward",
			regexp: "com_col_r.*colid.\d+"
		}, {
			title: "Plunder",
			regexp: "com_col_plunder.*colid.\d+"
		}, {
			title: "Dig",
			regexp: "com_col_find.*colid.\d+"
		}, {
			title: "Colony",
			regexp: "com_col.*colid.\d+"
		}, {
			title: "Colonies",
			regexp: "com_col"
		}, {
			title: "Battle Result",
			regexp: "com_attack3"
		}, {
			title: "Attack Info",
			regexp: "com_attack2"
		}, {
			title: "Battle Logs",
			regexp: "com_attack_prev"
		}, {
			title: "Attack",
			regexp: "com_attack"
		}, {
			title: "Forum",
			regexp: "hef.cfm"
		}, {
			title: "Chat",
			regexp: "com_msgsector"
		}, {
			title: "Post to Chat",
			regexp: "popup=msgsector"
		}, {
			title: "Build Ships",
			regexp: "com_ship"
		}, {
			title: "Artifacts",
			regexp: "com_market_use"
		}];
		//default value for local tags is ''
		var local = '';
		//ships are handled separately
		if (gc.location.indexOf('com_ship2') !== -1) {
			local = 'Build: ';
			var cells = $("td[width='40%']:first");
			if (cells.length) {
				name = $.trim(cells.text());
			} else {
				name = 'Build';
			}
		} else {
			if (gc.location.indexOf('com_market2') !== -1) {
				local = 'Market: ';
			}
			for (var i = 0; i < pages.length; i = i + 1) {
				if (gc.location.match(new RegExp(pages[i].regexp))) {
					name = pages[i].title;
					break;
				}
			}
		}
		if (gc.getValue('a-pagetitles-allowlocal')) {
			title += local;
		}
		title += name;
		if (name) {
			document.title = title;
		}
	}
};
/**
 * planet plunderer
 */
app.mod.planetplunderer = {
	id: 'a-planetplunderer',
	defaultValue: true,
	title: 'Planet plunderer',
	description: 'Fast plunder for non-paid accounts.',
	items: [{
		type: 'info',
		text: 'Adds direct plunder buttons to planet list. Support Stephen so he can update GC oh so often. Or be a cheap bastard and use this tweak... And, no, you cannot plunder somebody else\'s planets, I have checked >:)'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-planetplunderer')) {
			return false;
		}
		//unpaid accounts only
		if (gc.isPaid) {
			return false;
		}
		if (gc.location.match(/f=com_col$/)) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		var table = $("table.table_back[width='100%'] table[width='100%']");
		$("tr:first", table).append('<td>&nbsp;x&nbsp;</td>');
		$("tr td:first", table).remove();
		var rows = $("tr.table_row1", table);
		rows.each(function () {
			var planetId = $("input", this).val();
			$(this).children().first().remove();
			if (planetId) {
				$(this).append('<td class="a-planetplunderer-plunderable a-button" planetid="' + planetId + '">&nbsp;x&nbsp;</td>');
			} else {
				$(this).append('<td>&nbsp;&nbsp;&nbsp;</td>');
			}
		});
		$(".a-planetplunderer-plunderable").click(function () {
			var planetId = $(this).attr("planetid");
			gc.xhr({
				url: app.gameServer + 'i.cfm?&f=com_col_plunder&cid=' + planetId + '&co=1',
				successCondition: "b:contains('Colony has been destroyed')",
				onSuccess: function (response) {
					console.log("[Planet plunderer] Planet " + planetId + " was destroyed.");
					$("td.a-planetplunderer-plunderable[planetid='" + planetId + "']").parent().remove();
				},
				onFailure: function (response) {
					console.error("[Planet plunderer] XHR query to plunder aa planet " + planetId + " failed.");
				}
			});
		});
		var button = $("input[value='Plunder Colony']");
		button.hide();
	}
};
/**
 * preset builder
 */
app.mod.presetbuilder = {
	id: 'a-presetbuilder',
	defaultValue: true,
	title: 'Preset builder',
	description: 'Build stacks fast from saved presets.',
	items: [{
		type: 'info',
		text: 'This mod replaces the quick dial. It offers some of the functionalities its predecessor. Is quite likely to be actively developed in the future.'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-presetbuilder')) {
			return false;
		}
		if (gc.location.indexOf('rank') !== -1) {
			return true;
		}
		if (gc.location.indexOf('com_explore') !== -1) {
			return true;
		}
		if (gc.location.indexOf('com_attack') !== -1) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		$("body").append('<div id="a-presetbuilder-wrap" class="draggable" title="These presets can be edited from the Build Ships page"><b>Presets: </b><br/><table class="a-table" width="100%" id="a-presetbuilder-saves"><tbody><tr class="table_row2"><td id="a-ship-save-a" class="a-presetbuilder-save a-button">&nbsp;</td><td id="a-ship-save-b" class="a-presetbuilder-save a-button">&nbsp;</td><td id="a-ship-save-c" class="a-presetbuilder-save a-button">&nbsp;</td><td id="a-ship-save-d" class="a-presetbuilder-save a-button">&nbsp;</td><td id="a-ship-save-e" class="a-presetbuilder-save a-button">&nbsp;</td></tr><tr class="table_row2"><td id="a-ship-save-f" class="a-presetbuilder-save a-button">&nbsp;</td><td id="a-ship-save-g" class="a-presetbuilder-save a-button">&nbsp;</td><td id="a-ship-save-h" class="a-presetbuilder-save a-button">&nbsp;</td><td id="a-ship-save-i" class="a-presetbuilder-save a-button">&nbsp;</td><td id="a-ship-save-j" class="a-presetbuilder-save a-button">&nbsp;</td></tr></tbody></table></div><div id="a-presetbuilder-save-infobox" style="display: none;"><table width="100%"><tbody><tr></tr></tbody></table></div>');
		//get all ships. note: the ships array is indexed by shipid, which means that entries are nullable;
		var allShips = gc.getValue('a-allships', 'JSON_AS_ARRAY');
		
		//help on usage
		var usageHelpTitle = 'How to use the preset builder';
		var usageHelpMessage = 'Preset builder allows to build many different ships at once, fast. You have to define a preset first in the ship builder. Afterwards you can just click on an item in the preset list to build it, if you have the resources and turns of course.';
		gc.showMessage(usageHelpTitle, usageHelpMessage, 'a-presetbuilder-usagehelp');
		var pageTitle = $("#a-presetbuilder-wrap b:contains('Presets')");
		pageTitle.append('<img src="i/help.gif" title="' + usageHelpTitle + '" />').click(function () {
			if (!$("#a-presetbuilder-usagehelp").length) {
				gc.showMessage(usageHelpTitle, usageHelpMessage);
			}
		});
		
		
		$('#a-presetbuilder-wrap').css('top', typeof gc.getValue('a-presetbuilder-wrap-top') === "undefined" ? 108 : gc.getValue('a-presetbuilder-wrap-top'));
		$('#a-presetbuilder-wrap').css('left', typeof gc.getValue('a-presetbuilder-wrap-left') === "undefined" ? 0 : gc.getValue('a-presetbuilder-wrap-left'));
		$('#a-presetbuilder-wrap').mousedown(app.util.startDragging);
		$(document).bind('dragStop', function (e, targetId, top, left) {
			gc.setValue(targetId + '-top', top);
			gc.setValue(targetId + '-left', left);		
		});
		
		$(".a-presetbuilder-save").each(function () {
			var id = $(this).attr('id');
			var label = gc.getValue(id + "-name");
			if (label) {
				$(this).text(label);
			}
		});
		$(".a-presetbuilder-save").click(function () {
			var id = $(this).attr('id');
			var save = gc.getValue(id + "-value", 'JSON_AS_ARRAY');
			if (save.length) {
				
				var onSuccess =  function (response) {
					var msg = $("td:contains('You bought ')", response).contents().filter(function () {
						return this.nodeType === 3 && this.textContent.match('You bought');
					});
					console.log('[Preset builder] ' + msg.text());
				};
				
				var onFailure = function (response) {
					var name = $("b:contains('SHIPS')", response).text();
					var msg = $("font[color='red'] > b", response).text();
					console.error('[Preset builder] ' + name + ': ' + msg);
				};
				
				for (var i = 0; i < save.length; i = i + 1) {
					gc.xhr({
						url: 'i.cfm?&f=com_ship2&shiptype=' + save[i].id,
						data: 'amount=' + save[i].amount,
						successCondition: "td:contains('You bought ')",
						onSuccess: onSuccess,
						onFailure: onFailure 
					});
				}
			}
		});
		$(".a-presetbuilder-save").hover(
		function (e) {
			var id = $(this).attr('id');
			var value = gc.getValue(id + "-value");
			if (value && value !== '[]') {
				$(this).text('build');
				var save = gc.getValue(id + "-value", 'JSON_AS_ARRAY');
				var totals = {
					name: "total", 
					amount: '',
					turns: 0,
					power: 0
				};
				var savedStacks = [];
				for (var i = 0; i < save.length; i = i + 1) {
					var stack = jQuery.extend(true, {}, allShips[save[i].id]);
					stack.amount = save[i].amount;
					stack.turns = Math.ceil(save[i].amount / stack.build);
					stack.power = stack.power * stack.amount;
					totals.turns += stack.turns;
					totals.power += stack.power;
					savedStacks.push(stack);
				}
				savedStacks.sort(app.util.sortByPowerDesc);
				var saveMarkup = '<tr class="a-presetbuilder-save-body"><td align="left"  width="70%">${name}</td><td align="right" width="10%">${amount}</td><td align="right" width="10%">${turns}</td><td align="right" width="10%">${power}</td></tr>';
				$("#a-presetbuilder-save-infobox").attr("style", 'display: block; top: ' + (e.clientY + 25) + 'px; left: ' + (e.clientX + 5) + 'px;');
				$.tmpl(saveMarkup, savedStacks).appendTo("#a-presetbuilder-save-infobox tbody");
				var totalsMarkup = '<tr id="a-presetbuilder-totals-body"><td align="left"  width="70%">${name}</td><td align="right" width="10%">${amount}</td><td align="right" width="10%">${turns}</td><td align="right" width="10%">${power}</td></tr>';
				$.tmpl(totalsMarkup, totals).appendTo("#a-presetbuilder-save-infobox tbody");
			}
		}, function () {
			var id = $(this).attr('id');
			var value = gc.getValue(id + "-value");
			if (value && value !== '[]') {
				var label = gc.getValue(id + "-name");
				$(this).text(label);
				$("#a-presetbuilder-save-infobox tr").remove();
				$("#a-presetbuilder-save-infobox").hide();
			} else {
				$(this).html('&nbsp;');
			}
		});
	}
};
/**
 * Ranking tweaks
 */
app.mod.rankingtweaks = {
	id: 'a-rankingtweaks',
	defaultValue: true,
	title: "Ranking tweaks",
	description: "Many tweaks to the ranking list. See below for a details.",
	items: [{
		type: 'checkbox',
		id: 'a-rankingtweaks-statuses',
		defaultValue: true,
		description: 'Enable empire statuses'
	}, {
		type: 'info',
		text: 'Show your empire\'s status and other empires\' statuses in the ranking list below empire name (others will still see yours). Status is a short text meant to be visible to others. It will be visible to other users of this mod. Statuses are stored on my (Anfit\'s) server, so they can be changed and re-checked only if that server is up and running.'
	}, {
		type: 'input',
		id: 'a-rankingtweaks-statuses-mystatus',
		defaultValue: 'I have installed Anfit Mods',
		description: 'Your empire\'s status:'
	}, {
		type: 'input',
		id: 'a-rankingtweaks-statuses-forceupdate',
		description: 'Statuses are re-checked (redownloaded) only every two days, but you can do it manualy by clicking here:'
	}, {
		type: 'checkbox',
		id: 'a-rankingtweaks-labels',
		defaultValue: true,
		description: 'Enable empire labels?'
	}, {
		type: 'info',
		text: 'A label is a short text you add. This tweak adds a new column (titled "Label") in the ranking list in which you can set custom labels. If you doubleclick a cell in this column, you will be prompted to add your label. It can be anything as it will be visible just for you.'
	}, {
		type: 'checkbox',
		id: 'a-rankingtweaks-fedtags',
		defaultValue: true,
		description: 'Enable empire fed tags?'
	}, {
		type: 'info',
		text: 'Fed tag is the name of the federation an empire is in (or "N/A"). This tweak makes it possible to show fed tags in the the ranking list, below empire names. To make it less server intensive you have to doubleclick on the race field of the empire, which fed tag you want to check. Please note that (to save server load), once checked it will be cached for 7 days - unless you doubleclick again.'
	}, {
		type: 'checkbox',
		id: 'a-rankingtweaks-fedtags-showall',
		defaultValue: true,
		description: 'Show all cached fed tags'
	}, {
		type: 'checkbox',
		id: 'a-rankingtweaks-bloodwar',
		description: 'Enable Blood War?'
	}, {
		type: 'info',
		text: 'Blood War is an extension of the fed tag tweak. If you enable it tweak, you\'ll see federations your federation is in war with in red, allies will be shown in green, and neutrals in blue. This is not automatic, you have to define which fed is which below. Just fed names, no extra data, one per line!'
	}, {
		type: 'list',
		id: 'a-rankingtweaks-bloodwar-enemies',
		description: 'Name your blood enemies.',
		defaultValue: "Example Fed One\nExample Fed Two"
	}, {
		type: 'list',
		id: 'a-rankingtweaks-bloodwar-allies',
		description: 'Name your kin.',
		defaultValue: "Example Fed One\nExample Fed Two"
	}, {
		type: 'list',
		id: 'a-rankingtweaks-bloodwar-neutrals',
		description: 'Name the neutral bystanders.',
		defaultValue: "Example Fed One\nExample Fed Two"
	}],
	/**
	 * Additional server interaction for this component's options panel 
	 */
	onAfterRender: function () {
		//special mods for this page...
		var mystatus = $('#a-rankingtweaks-statuses-mystatus');
		if (mystatus.length) { 
			mystatus.change(function (e) {
				var status = $(this).val();
				$(this).addClass('a-loading');
				gc.xhr({
					url: app.modsServer + '?action=set_status&empire=' + gc.userName + '&status=' + status + '&token=' + gc.authToken,
					onSuccess: function (responseJson) {
						$('#a-rankingtweaks-statuses-mystatus').removeClass('a-loading');
						var response = $.parseJSON(responseJson);	
						if (response.success) {
							gc.setValue('a-rankingtweaks-statuses-mystatus', status);
						}
						else {
							$('#a-rankingtweaks-statuses-mystatus').val('');
							gc.setValue('a-rankingtweaks-statuses-mystatus', '');
							alert(response.msg);
						}
					},
					onFailure: function (response) {
						$('#a-rankingtweaks-statuses-mystatus').removeClass('a-loading');
						$('#a-rankingtweaks-statuses-mystatus').val('');
						gc.setValue('a-rankingtweaks-statuses-mystatus', '');
						alert('Failed to connect to ' + app.modsServer + '. Server might be down or busy, please try again later. If problem persists, please report a bug!');
					}
				});
				//TODO post to gc.mmanir.net, check authentication, etc
			});
		}
		var forceUpdate = $('#a-rankingtweaks-statuses-forceupdate');
		if (forceUpdate.length) {
			//forceUpdate.attr('type', 'submit');
			//jquery cannot change input type, workaround
			document.getElementById('a-rankingtweaks-statuses-forceupdate').type = 'submit';
			forceUpdate.val('Force status update');
			forceUpdate.click(function (e) {
				gc.setValue('a-rankingtweaks-lastupdate', (new Date(0)).toString());
			});
		}
	},
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-rankingtweaks')) {
			return false;
		}
		if (gc.location.indexOf('rank') !== -1) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		var statuses;
		//statuses
		if (gc.getValue('a-rankingtweaks-statuses')) {
			statuses = gc.getValue('a-rankingtweaks-statuses-list', 'JSON_AS_OBJECT');
		}
		else {
			gc.setValue('a-rankingtweaks-statuses-list', '{"empires":[],"statuses":[]}');
			statuses = {
				empires: [],
				statuses: []
			};
		}
		//labels
		if (gc.getValue('a-rankingtweaks-labels')) {
			var headers = $("table.table_back[width='350'] table tr.table_row0, table.table_back[width='70%'] table tr.table_row0");
			headers.append('<td>Label</td>');
		}
		//fedtags: blood war
		if (gc.getValue('a-rankingtweaks-bloodwar')) {
			var enemies = gc.getValue('a-rankingtweaks-bloodwar-enemies') ? gc.getValue('a-rankingtweaks-bloodwar-enemies').split('\n') : [];
			var allies = gc.getValue('a-rankingtweaks-bloodwar-allies') ? gc.getValue('a-rankingtweaks-bloodwar-allies').split('\n') : [];
			var neutrals = gc.getValue('a-rankingtweaks-bloodwar-neutrals') ? gc.getValue('a-rankingtweaks-bloodwar-neutrals').split('\n') : [];
		}
		var rows = $("table.table_back[width='350'] table tr.table_row1, table.table_back[width='70%'] table tr.table_row1");
		rows.each(function () {
			var row = $(this);
			var name = $.trim($("td:eq(2)", this).text());
			var eid = $("td:eq(1) a", this).attr("href").replace(/.*eid=/, '');
			var nameCell = $("td:eq(2)", this);
			var raceCell = $("td:eq(3)", this);
			nameCell.attr("id", name);
			nameCell.append('<div class="a-rankingtweaks-statustag a-hidden" /><div class="a-rankingtweaks-fedtag a-hidden" />');
			var statusNode = $("div.a-rankingtweaks-statustag", nameCell);
			var fedNode = $("div.a-rankingtweaks-fedtag", nameCell);
			//status
			if (gc.getValue('a-rankingtweaks-statuses')) {
				if ($.inArray(name, statuses.empires) !== -1 && statuses.statuses[statuses.empires.indexOf(name)]) {
					var status = statuses.statuses[statuses.empires.indexOf(name)];
					statusNode.text(status).removeClass("a-hidden");
				}
			}
			//fed tag
			if (gc.getValue('a-rankingtweaks-fedtags')) {
				//planter

				var setFedTag = function (fed) {
					fedNode.text(fed).removeClass("a-hidden");
					if (gc.getValue('a-rankingtweaks-bloodwar')) {
						//add blood war support
						if ($.inArray(fed, enemies) !== -1) {
							fedNode.addClass("a-rankingtweaks-bloodwar-enemy");
						} else if ($.inArray(fed, allies) !== -1) {
							fedNode.addClass("a-rankingtweaks-bloodwar-ally");
						} else if ($.inArray(fed, neutrals) !== -1) {
							fedNode.addClass("a-rankingtweaks-bloodwar-neutral");
						}
					}
				};
				//getter event
				raceCell.dblclick(function (e) {
					//GET fed and assign it						
					gc.xhr({
						url: 'i.cfm?&f=com_intel&eid=' + eid,
						method: 'GET',
						successCondition: "b:contains('EMPIRE INTELLIGENCE')",
						onSuccess: function (response) {
							var fed = $.trim($("table.table_back[width='280'] table td:contains('Federation')", response).next().contents().first().text());
							setFedTag(fed);
							//save
							gc.setValue('player.' + name + '.fed', fed);
							gc.setValue('player.' + name + '.lastcheck', (new Date()).toString());
						}
					});
				});
				raceCell.addClass("a-button");
				raceCell.attr("title", "Double click to show federation");
				//on show all anyway
				if (gc.getValue('a-rankingtweaks-fedtags-showall') && gc.getValue('player.' + name + '.fed')) {
					//ok, there is something to show and user chose to show it, but we'll show only fresh tags, all right?
					var aSingleDay = 86400000;
					var now = new Date();
					var lastFedTagUpdate = gc.getValue('player.' + name + '.lastcheck') ? new Date(gc.getValue('player.' + name + '.lastcheck')) : new Date(0);
					//show only fresh ones, ha!
					if (now - lastFedTagUpdate < aSingleDay * 7) {
						var fed = gc.getValue('player.' + name + '.fed');
						setFedTag(fed);
					}
				}
			}
			//labels
			if (gc.getValue('a-rankingtweaks-labels')) {
				row.append('<td class="a-rankingtweaks-label" >&nbsp;</td>');
				var label = gc.getValue('player.' + name + '.label');
				var labelCell = $("td.a-rankingtweaks-label", row);
				labelCell.text(label);
				labelCell.dblclick(function (e) {
					var existingValue = label ? label : "";
					var newLabel = prompt('Label this empire', existingValue);
					if (newLabel || newLabel === "") {
						gc.setValue('player.' + name + '.label', newLabel);
						$("td.a-rankingtweaks-label", row).text(newLabel);
					}
				});
				labelCell.addClass("a-button");
				labelCell.attr("title", "Double click to set a label");
			}
		});
		//reget statuses
		var aSingleDay = 86400000;
		var now = new Date();
		var lastTagUpdate = gc.getValue('a-rankingtweaks-lastupdate') ? new Date(gc.getValue('a-rankingtweaks-lastupdate')) : new Date(0);
		if (now - lastTagUpdate > aSingleDay) {
			//update tags
			gc.xhr({
				method: 'GET',
				url: app.modsServer + '?action=get_statuses&server=' + gc.server.name,
				onSuccess: function (response) {
					gc.setValue('a-rankingtweaks-statuses-list', response);
					gc.setValue('a-rankingtweaks-lastupdate', now.toString()); //timestamp
				},
				onFailure: function (response) {
					console.log(response);
				}
			});
		}
	}
};
/**
 * Infrastructure building tweak
 */
app.mod.researchtweak = {
	id: 'a-researchtweak',
	defaultValue: true,
	title: 'Reasearch tweak',
	description: 'Reasearch at most 999 turns of anything (at once) instead of 9.',
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-researchtweak')) {
			return false;
		}
		if (gc.location.indexOf('com_research') !== -1) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		$("input[name='turns']").attr('maxlength', 3).val(999);
	}
};
/**
 * ship builder
 */
app.mod.shipbuilder = {
  id: 'a-shipbuilder',
  defaultValue: true,
  title: 'Ship builder',
  description: 'Build many stacks at once, clean and fast.',
  items: [{
    type: 'info',
    text: 'This mod replaces the old fleet builder mod. Old functionalities are still there: a doubleclick removes a saved preset. The main new thing is that this mods acquires ship data dynamically, whenever you visit a build page of a particular ship. If some of the data (e.g. build rates) are wrong, just visit the apropriate ship page. Also: you can use this to manage existing fleets...'
  }, {
    type: 'checkbox',
    defaultValue: true,
    id: 'a-shipbuilder-resetafterbuild',
    description: 'Reset form after successful build'
  }],
  /**
   * Returns true only when this mod can be launched
   */
  filter: function () {
    if (!gc.getValue('a-shipbuilder')) {
      return false;
    }
    if (window.location.href.match(/com_ship$/g)) {
      return true;
    }
    return false;
  },
  /**
   * Mod's body function
   */
  plugin: function () {

    var harvestShipData;
    var refreshExistingFleet;
    var RESET_AFTER_BUILD;
    var OPTIMIZE_UPKEEP;

    /**
     * Read ship data from dom
     *
     * @param {Node=} scope Dom node within which ship data should be looked for
     * @return {Object} Ship data read from dom nodes on this page / within scope
     */
    harvestShipData = function (scope) {
      if (scope === undefined) {
        scope = $("body");
      }
      var tables = $("table.table_back table", scope);
      var ship = {};
      ship.id = $("form[name='stepform']", scope).attr('action').replace(/.*shiptype=/, '') * 1;
      ship.type = $.trim($("td:contains('Class')", tables).next().text());
      ship.build = $.trim($("td:contains('1 turn produces')", tables).next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.weapon = $.trim($("td:contains('Weapon')", tables).next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.damage = {};
      ship.damage.energy = $.trim($("td:contains('Energy Damage')", tables).next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.damage.kinetic = $.trim($("td:contains('Kinetic Damage')", tables).next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.damage.missile = $.trim($("td:contains('Missile Damage')", tables).next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.damage.chemical = $.trim($("td:contains('Chemical Damage')", tables).next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.hull = $.trim($("td:contains('Hull')", tables).next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.range = $.trim($("td:contains('Range')", tables).next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.scanner = $.trim($("td:contains('Scanner rating')", tables).next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.power = $.trim($("td:contains('Power rating')", tables).next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.cost = $.trim($("td:contains('Cost per unit')", tables).next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.upkeep = $.trim($("td:contains('Upkeep')", tables).next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.minerals = {};
      ship.minerals.terranMetal = $.trim($("td:contains('Terran Metal')", tables).next().next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.minerals.redCrystal = $.trim($("td:contains('Red Crystal')", tables).next().next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.minerals.whiteCrystal = $.trim($("td:contains('White Crystal')", tables).next().next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.minerals.rutile = $.trim($("td:contains('Rutile')", tables).next().next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.minerals.composite = $.trim($("td:contains('Composite')", tables).next().next().text().replace(/[^\.\d]/g, '')) * 1;
      ship.minerals.strafezOrganism = $.trim($("td:contains('Strafez Organism')", tables).next().next().text().replace(/[^\.\d]/g, '')) * 1;

      return ship;
    };


    //TODO move ships to game abstraction
    if (!gc.getValue('a-allships')) {
      gc.setValue("a-allships", JSON.parse('[    null,    {        \"id\": 1,        \"name\": \"T.Ryu-jin\",        \"power\": 8,        \"cost\": 88,        \"upkeep\": 3,        \"weapon\": 5,        \"hull\": 10,        \"range\": 1,        \"race\": \"Terran\",        \"type\": \"Fighter\",        \"damage\": {            \"energy\": 5,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 1,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 4500    },    {        \"id\": 2,        \"name\": \"Viator\",        \"power\": 1,        \"cost\": 27,        \"upkeep\": 30,        \"weapon\": 0,        \"hull\": 3,        \"range\": 1,        \"race\": \"Terran\",        \"type\": \"Scout\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 9,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 80    },    {        \"id\": 3,        \"name\": \"T.Maru\",        \"power\": 51,        \"cost\": 590,        \"upkeep\": 22,        \"weapon\": 35,        \"hull\": 10015,        \"range\": 3,        \"race\": \"Terran\",        \"type\": \"Corvette\",        \"damage\": {            \"energy\": 35,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 5,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 650    },    {        \"id\": 4,        \"name\": \"T.Sentouki\",        \"power\": 174,        \"cost\": 1855,        \"upkeep\": 125,        \"weapon\": 56,        \"hull\": 500,        \"range\": 7,        \"race\": \"Terran\",        \"type\": \"Frigate\",        \"damage\": {            \"energy\": 28,            \"kinetic\": 28,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 10,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 100    },    {        \"id\": 5,        \"name\": \"T.Garuda\",        \"power\": 956,        \"cost\": 9420,        \"upkeep\": 750,        \"weapon\": 400,        \"hull\": 200030,        \"range\": 9,        \"race\": \"Terran\",        \"type\": \"Destroyer\",        \"damage\": {            \"energy\": 400,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 50,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 28    },    {        \"id\": 6,        \"name\": \"T.Kalieum\",        \"power\": 1701,        \"cost\": 15435,        \"upkeep\": 1800,        \"weapon\": 350,        \"hull\": 400050,        \"range\": 8,        \"race\": \"Terran\",        \"type\": \"Cruiser\",        \"damage\": {            \"energy\": 350,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 100,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 20    },    {        \"id\": 7,        \"name\": \"Light fighter-drone\",        \"power\": 5,        \"cost\": 66,        \"upkeep\": 1,        \"weapon\": 5,        \"hull\": 520,        \"range\": 1,        \"race\": \"\",        \"type\": \"Fighter\",        \"damage\": {            \"energy\": 5,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 0,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 7000    },    {        \"id\": 8,        \"name\": \"Light Corvette\",        \"power\": 34,        \"cost\": 364,        \"upkeep\": 6,        \"weapon\": 20,        \"hull\": 5020,        \"range\": 3,        \"race\": \"\",        \"type\": \"Corvette\",        \"damage\": {            \"energy\": 20,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 2,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 800    },    {        \"id\": 9,        \"name\": \"Light Frigate\",        \"power\": 126,        \"cost\": 1265,        \"upkeep\": 25,        \"weapon\": 53,        \"hull\": 25020,        \"range\": 5,        \"race\": \"\",        \"type\": \"Frigate\",        \"damage\": {            \"energy\": 53,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 8,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 120    },    {        \"id\": 10,        \"name\": \"Small Strafez Fodder\",        \"power\": 55,        \"cost\": 535,        \"upkeep\": 1,        \"weapon\": 0,        \"hull\": 200,        \"range\": 1,        \"race\": \"\",        \"type\": \"Special\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 0,        \"build\": 700,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 2        }    },    {        \"id\": 11,        \"name\": \"Large Strafez Fodder\",        \"power\": 205,        \"cost\": 2035,        \"upkeep\": 5,        \"weapon\": 0,        \"hull\": 80095,        \"range\": 1,        \"race\": \"\",        \"type\": \"Special\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 0,        \"build\": 180,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        }    },    {        \"id\": 12,        \"name\": \"Small Strafez Runner\",        \"power\": 115,        \"cost\": 1046,        \"upkeep\": 2,        \"weapon\": 80,        \"hull\": 1,        \"range\": 7,        \"race\": \"\",        \"type\": \"Special\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 80        },        \"scanner\": 0,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 2        },        \"build\": 400    },    {        \"id\": 13,        \"name\": \"Large Strafez Runner\",        \"power\": 435,        \"cost\": 4247,        \"upkeep\": 12,        \"weapon\": 400,        \"hull\": 299.95,        \"range\": 7,        \"race\": \"\",        \"type\": \"Special\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 400        },        \"scanner\": 0,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 100    },    {        \"id\": 14,        \"name\": \"T.Empereur\",        \"power\": 5881,        \"cost\": 52475,        \"upkeep\": 5400,        \"weapon\": 2500,        \"hull\": 800020,        \"range\": 7,        \"race\": \"Terran\",        \"type\": \"Battleship\",        \"damage\": {            \"energy\": 1500,            \"kinetic\": 1000,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 500,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 8    },    {        \"id\": 15,        \"name\": \"C.Aries\",        \"power\": 51,        \"cost\": 617,        \"upkeep\": 37,        \"weapon\": 20,        \"hull\": 200,        \"range\": 1,        \"race\": \"\",        \"type\": \"Corvette\",        \"damage\": {            \"energy\": 20,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 2,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 100    },    {        \"id\": 16,        \"name\": \"C.Gemini\",        \"power\": 243,        \"cost\": 2784,        \"upkeep\": 230,        \"weapon\": 53,        \"hull\": 1000,        \"range\": 5,        \"race\": \"\",        \"type\": \"Frigate\",        \"damage\": {            \"energy\": 53,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 4,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 40    },    {        \"id\": 17,        \"name\": \"C.Taurus\",        \"power\": 1488,        \"cost\": 14595,        \"upkeep\": 1300,        \"weapon\": 400,        \"hull\": 4000,        \"range\": 7,        \"race\": \"\",        \"type\": \"Destroyer\",        \"damage\": {            \"energy\": 200,            \"kinetic\": 200,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 85,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 20    },    {        \"id\": 18,        \"name\": \"C.Cancer\",        \"power\": 1804,        \"cost\": 18355,        \"upkeep\": 1800,        \"weapon\": 350,        \"hull\": 6000,        \"range\": 6,        \"race\": \"\",        \"type\": \"Cruiser\",        \"damage\": {            \"energy\": 350,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 25,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 16    },    {        \"id\": 19,        \"name\": \"Viator II\",        \"power\": 25,        \"cost\": 636,        \"upkeep\": 400,        \"weapon\": 0,        \"hull\": 1,        \"range\": 1,        \"race\": \"Terran\",        \"type\": \"Scout\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 500,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 160    },    {        \"id\": 20,        \"name\": \"P.Apollo\",        \"power\": 66,        \"cost\": 811,        \"upkeep\": 55,        \"weapon\": 80,        \"hull\": 25,        \"range\": 5,        \"race\": \"Terran\",        \"type\": \"Corvette\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 80,            \"chemical\": 0        },        \"scanner\": 0,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 220    },    {        \"id\": 21,        \"name\": \"P.Odin\",        \"power\": 201,        \"cost\": 2311,        \"upkeep\": 255,        \"weapon\": 212,        \"hull\": 125,        \"range\": 9,        \"race\": \"Terran\",        \"type\": \"Frigate\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 212,            \"chemical\": 0        },        \"scanner\": 0,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 90    },    {        \"id\": 22,        \"name\": \"P.Thor\",        \"power\": 1624,        \"cost\": 16905,        \"upkeep\": 1600,        \"weapon\": 1600,        \"hull\": 500,        \"range\": 11,        \"race\": \"Terran\",        \"type\": \"Destroyer\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 1600,            \"chemical\": 0        },        \"scanner\": 50,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 16    },    {        \"id\": 23,        \"name\": \"P.Zeus\",        \"power\": 1755,        \"cost\": 17175,        \"upkeep\": 3000,        \"weapon\": 1400,        \"hull\": 1000,        \"range\": 10,        \"race\": \"Terran\",        \"type\": \"Cruiser\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 1400,            \"chemical\": 0        },        \"scanner\": 50,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 16    },    {        \"id\": 24,        \"name\": \"Nirvana\",        \"power\": 18030,        \"cost\": 175410,        \"upkeep\": 22000,        \"weapon\": 12000,        \"hull\": 2000060,        \"range\": 6,        \"race\": \"Terran\",        \"type\": \"Dreadnought\",        \"damage\": {            \"energy\": 5000,            \"kinetic\": 5000,            \"missile\": 2000,            \"chemical\": 0        },        \"scanner\": 200,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 3    },    {        \"id\": 25,        \"name\": \"Chimaera\",        \"power\": 21393,        \"cost\": 213765,        \"upkeep\": 10054,        \"weapon\": 10000,        \"hull\": 45000,        \"range\": 5,        \"race\": \"Terran\",        \"type\": \"Starbase\",        \"damage\": {            \"energy\": 4000,            \"kinetic\": 6000,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 500,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 3    },    {        \"id\": 26,        \"name\": \"Eel\",        \"power\": 60,        \"type\": \"Fighter\",        \"weapon\": 50,        \"damage\": {            \"energy\": 0,            \"kinetic\": 25,            \"missile\": 25,            \"chemical\": 0        },        \"hull\": 505,        \"range\": 3,        \"scanner\": 13,        \"cost\": 655,        \"upkeep\": 10,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 300    },    {        \"id\": 27,        \"name\": \"Ray\",        \"power\": 82,        \"type\": \"Corvette\",        \"weapon\": 50,        \"damage\": {            \"energy\": 25,            \"kinetic\": 25,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 150,        \"range\": 6,        \"scanner\": 10,        \"cost\": 917,        \"upkeep\": 12,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 250    },    {        \"id\": 28,        \"name\": \"Piranha\",        \"power\": 379,        \"type\": \"Frigate\",        \"weapon\": 80,        \"damage\": {            \"energy\": 40,            \"kinetic\": 40,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 750,        \"range\": 5,        \"scanner\": 50,        \"cost\": 3332,        \"upkeep\": 56,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 45    },    {        \"id\": 29,        \"name\": \"Barracuda\",        \"power\": 2272,        \"type\": \"Destroyer\",        \"weapon\": 800,        \"damage\": {            \"energy\": 600,            \"kinetic\": 200,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 300080,        \"range\": 8,        \"scanner\": 250,        \"cost\": 19440,        \"upkeep\": 522,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 14    },    {        \"id\": 30,        \"name\": \"Shark\",        \"power\": 2052,        \"type\": \"Cruiser\",        \"weapon\": 500,        \"damage\": {            \"energy\": 250,            \"kinetic\": 250,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 500030,        \"range\": 7,        \"scanner\": 100,        \"cost\": 19180,        \"upkeep\": 307,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 16    },    {        \"id\": 31,        \"name\": \"Pyth\",        \"power\": 22527,        \"type\": \"Battleship\",        \"weapon\": 20000,        \"damage\": {            \"energy\": 7500,            \"kinetic\": 7500,            \"missile\": 5000,            \"chemical\": 0        },        \"hull\": 2000015,        \"range\": 6,        \"scanner\": 6500,        \"cost\": 244195,        \"upkeep\": 4280,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 3    },    {        \"id\": 32,        \"name\": \"M.Lyth\",        \"power\": 30040,        \"type\": \"Dreadnought\",        \"weapon\": 15000,        \"damage\": {            \"energy\": 3000,            \"kinetic\": 0,            \"missile\": 12000,            \"chemical\": 0        },        \"hull\": 3500035,        \"range\": 7,        \"scanner\": 1250,        \"cost\": 270270,        \"upkeep\": 52052,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 2    },    {        \"id\": 33,        \"name\": \"M.Hal\",        \"power\": 23,        \"type\": \"Fighter\",        \"weapon\": 20,        \"damage\": {            \"energy\": 20,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 2520,        \"range\": 4,        \"scanner\": 1,        \"cost\": 287,        \"upkeep\": 5,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 1500    },    {        \"id\": 34,        \"name\": \"M.Alium\",        \"power\": 46,        \"type\": \"Corvette\",        \"weapon\": 30,        \"damage\": {            \"energy\": 30,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 50,        \"range\": 4,        \"scanner\": 5,        \"cost\": 487,        \"upkeep\": 28,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 500    },    {        \"id\": 35,        \"name\": \"M.Illite\",        \"power\": 182,        \"type\": \"Frigate\",        \"weapon\": 80,        \"damage\": {            \"energy\": 80,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 40010,        \"range\": 6,        \"scanner\": 10,        \"cost\": 1880,        \"upkeep\": 130,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 125    },    {        \"id\": 36,        \"name\": \"M.Epidote\",        \"power\": 936,        \"type\": \"Destroyer\",        \"weapon\": 500,        \"damage\": {            \"energy\": 500,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 150010,        \"range\": 9,        \"scanner\": 50,        \"cost\": 9195,        \"upkeep\": 740,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 28    },    {        \"id\": 37,        \"name\": \"M.Chlor\",        \"power\": 1656,        \"type\": \"Cruiser\",        \"weapon\": 500,        \"damage\": {            \"energy\": 500,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 500010,        \"range\": 8,        \"scanner\": 50,        \"cost\": 17160,        \"upkeep\": 1900,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 16    },    {        \"id\": 38,        \"name\": \"M.Flysch\",        \"power\": 7231,        \"type\": \"Battleship\",        \"weapon\": 3000,        \"damage\": {            \"energy\": 1500,            \"kinetic\": 500,            \"missile\": 1000,            \"chemical\": 0        },        \"hull\": 1000015,        \"range\": 7,        \"scanner\": 500,        \"cost\": 64225,        \"upkeep\": 5254,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 9    },    {        \"id\": 39,        \"name\": \"A.Aragonite\",        \"power\": 5035,        \"type\": \"Dreadnought\",        \"weapon\": 2500,        \"damage\": {            \"energy\": 1000,            \"kinetic\": 1500,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 600025,        \"range\": 7,        \"scanner\": 200,        \"cost\": 45445,        \"upkeep\": 5982,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 12    },    {        \"id\": 40,        \"name\": \"M.Lakko\",        \"power\": 24444,        \"type\": \"Starbase\",        \"weapon\": 23700,        \"damage\": {            \"energy\": 7700,            \"kinetic\": 0,            \"missile\": 16000,            \"chemical\": 0        },        \"hull\": 3650095,        \"range\": 3,        \"scanner\": 416,        \"cost\": 286791,        \"upkeep\": 20666,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 3    },    {        \"id\": 41,        \"name\": \"A.Kryo\",        \"power\": 75182,        \"type\": \"Starbase\",        \"weapon\": 6000,        \"damage\": {            \"energy\": 1500,            \"kinetic\": 1500,            \"missile\": 3000,            \"chemical\": 0        },        \"hull\": 15000020,        \"range\": 7,        \"scanner\": 8000,        \"cost\": 601480,        \"upkeep\": 32328,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 2    },    {        \"id\": 42,        \"name\": \"Seeker\",        \"power\": 2,        \"type\": \"Scout\",        \"weapon\": 0,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 195,        \"range\": 1,        \"scanner\": 40,        \"cost\": 61,        \"upkeep\": 60,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 60    },    {        \"id\": 43,        \"name\": \"Ranger\",        \"power\": 50,        \"type\": \"Scout\",        \"weapon\": 0,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 195,        \"range\": 1,        \"scanner\": 1000,        \"cost\": 1261,        \"upkeep\": 800,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 160    },    {        \"id\": 44,        \"name\": \"G.Livid\",        \"power\": 13013,        \"type\": \"Fighter\",        \"weapon\": 8000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 8000,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 2500085,        \"range\": 5,        \"scanner\": 4000,        \"cost\": 140365,        \"upkeep\": 0,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 1    },    null,    null,    null,    null,    null,    null,    null,    null,    {        \"id\": 53,        \"name\": \"G.Livid (r)\",        \"power\": 12513,        \"type\": \"Fighter\",        \"weapon\": 5000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 5000,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 2500075,        \"range\": 5,        \"scanner\": 2750,        \"cost\": 121615,        \"upkeep\": 15641,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 4    },    {        \"id\": 54,        \"name\": \"G.Agate\",        \"power\": 13135,        \"type\": \"Fighter\",        \"weapon\": 5000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 5000,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 2500020,        \"range\": 4,        \"scanner\": 2700,        \"cost\": 208814,        \"upkeep\": 1712,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 4    },    {        \"id\": 55,        \"name\": \"G.Amethyst\",        \"power\": 18018,        \"type\": \"Corvette\",        \"weapon\": 15000,        \"damage\": {            \"energy\": 15000,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 24000,        \"range\": 6,        \"scanner\": 1800,        \"cost\": 329892,        \"upkeep\": 2030,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 4    },    {        \"id\": 56,        \"name\": \"G.Quartz\",        \"power\": 36068,        \"type\": \"Frigate\",        \"weapon\": 14000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 14000,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 8000020,        \"range\": 5,        \"scanner\": 3500,        \"cost\": 592766,        \"upkeep\": 4596,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 3    },    {        \"id\": 57,        \"name\": \"L.Garnet\",        \"power\": 16303,        \"type\": \"Frigate\",        \"weapon\": 8000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 8000,            \"chemical\": 0        },        \"hull\": 2000010,        \"range\": 8,        \"scanner\": 2050,        \"cost\": 248981,        \"upkeep\": 1834,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 5    },    {        \"id\": 58,        \"name\": \"G.Corundum\",        \"power\": 55028,        \"type\": \"Destroyer\",        \"weapon\": 30000,        \"damage\": {            \"energy\": 18750,            \"kinetic\": 11250,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 6500070,        \"range\": 7,        \"scanner\": 4500,        \"cost\": 855858,        \"upkeep\": 5357,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 2    },    {        \"id\": 59,        \"name\": \"L.Topaz\",        \"power\": 49081,        \"type\": \"Cruiser\",        \"weapon\": 16000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 16000,            \"chemical\": 0        },        \"hull\": 10000045,        \"range\": 7,        \"scanner\": 2700,        \"cost\": 759069,        \"upkeep\": 5091,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 1    },    {        \"id\": 60,        \"name\": \"G.Fluorite\",        \"power\": 69768,        \"type\": \"Cruiser\",        \"weapon\": 30000,        \"damage\": {            \"energy\": 30000,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 16000010,        \"range\": 3,        \"scanner\": 1500,        \"cost\": 1173120,        \"upkeep\": 7500,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 1    },    {        \"id\": 61,        \"name\": \"L.Emerald\",        \"power\": 41636,        \"type\": \"Destroyer\",        \"weapon\": 30000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 30000,            \"chemical\": 0        },        \"hull\": 2000060,        \"range\": 9,        \"scanner\": 3400,        \"cost\": 647673,        \"upkeep\": 4536,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 2    },    {        \"id\": 62,        \"name\": \"G.Diamond\",        \"power\": 139532,        \"type\": \"Starbase\",        \"weapon\": 20000,        \"damage\": {            \"energy\": 10000,            \"kinetic\": 10000,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 24000015,        \"range\": 7,        \"scanner\": 15000,        \"cost\": 1863823,        \"upkeep\": 17946,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 1    },    {        \"id\": 63,        \"name\": \"S.Lapiz\",        \"power\": 25,        \"type\": \"Scout\",        \"weapon\": 0,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 520,        \"range\": 1,        \"scanner\": 500,        \"cost\": 1074,        \"upkeep\": 50,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 30    },    {        \"id\": 64,        \"name\": \"S.Opal\",        \"power\": 75,        \"type\": \"Scout\",        \"weapon\": 0,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 520,        \"range\": 1,        \"scanner\": 1500,        \"cost\": 3168,        \"upkeep\": 150,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 20    },    {        \"id\": 65,        \"name\": \"D.Hammerhead\",        \"power\": 3612,        \"type\": \"Frigate\",        \"weapon\": 4000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 1500,            \"missile\": 2500,            \"chemical\": 0        },        \"hull\": 300015,        \"range\": 7,        \"scanner\": 75,        \"cost\": 41955,        \"upkeep\": 632,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 9    },    {        \"id\": 66,        \"name\": \"D.Bullhead\",        \"power\": 6336,        \"type\": \"Cruiser\",        \"weapon\": 3250,        \"damage\": {            \"energy\": 1250,            \"kinetic\": 0,            \"missile\": 2000,            \"chemical\": 0        },        \"hull\": 700025,        \"range\": 8,        \"scanner\": 400,        \"cost\": 57160,        \"upkeep\": 1140,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 6    },    {        \"id\": 67,        \"name\": \"D.Angel\",        \"power\": 23206,        \"type\": \"Battleship\",        \"weapon\": 22000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 7000,            \"missile\": 15000,            \"chemical\": 0        },        \"hull\": 1500010,        \"range\": 7,        \"scanner\": 0,        \"cost\": 244850,        \"upkeep\": 4614,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 4    },    {        \"id\": 68,        \"name\": \"M.Chlorite\",        \"power\": 1236,        \"type\": \"Destroyer\",        \"weapon\": 1000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 1000,            \"chemical\": 0        },        \"hull\": 800,        \"range\": 9,        \"scanner\": 60,        \"cost\": 12330,        \"upkeep\": 962,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 22    },    {        \"id\": 69,        \"name\": \"Manta\",        \"power\": 74,        \"type\": \"Fighter\",        \"weapon\": 75,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 75,            \"chemical\": 0        },        \"hull\": 50,        \"range\": 6,        \"scanner\": 15,        \"cost\": 882,        \"upkeep\": 13,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 250    },    {        \"id\": 70,        \"name\": \"G.Lictor\",        \"power\": 51178,        \"type\": \"Juggernaught\",        \"weapon\": 14000,        \"damage\": {            \"energy\": 10000,            \"kinetic\": 4000,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 8000040,        \"range\": 5,        \"scanner\": 2500,        \"cost\": 428440,        \"upkeep\": 40000,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 2    },    {        \"id\": 71,        \"name\": \"Hercules\",        \"power\": 45402,        \"cost\": 385310,        \"upkeep\": 35000,        \"weapon\": 20000,        \"hull\": 4500030,        \"range\": 5,        \"race\": \"Terran\",        \"type\": \"Juggernaught\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 12000,            \"missile\": 8000,            \"chemical\": 0        },        \"scanner\": 2000,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 2    },    {        \"id\": 72,        \"name\": \"Strafez Queen\",        \"power\": 896,        \"cost\": 8121,        \"upkeep\": 20,        \"weapon\": 700,        \"hull\": 2599.95,        \"range\": 8,        \"race\": \"\",        \"type\": \"Special\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 700        },        \"scanner\": 30,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 40    },    {        \"id\": 73,        \"name\": \"F.Axe\",        \"power\": 178,        \"cost\": 1898,        \"upkeep\": 152,        \"weapon\": 65,        \"hull\": 500,        \"range\": 5,        \"race\": \"\",        \"type\": \"Frigate\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 65,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 8,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 100    },    {        \"id\": 74,        \"name\": \"F.Sword\",        \"power\": 1152,        \"cost\": 11400,        \"upkeep\": 955,        \"weapon\": 600,        \"hull\": 2000,        \"range\": 8,        \"race\": \"\",        \"type\": \"Destroyer\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 600,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 60,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 20    },    {        \"id\": 75,        \"name\": \"F.Spear\",        \"power\": 1512,        \"cost\": 14670,        \"upkeep\": 2100,        \"weapon\": 400,        \"hull\": 4000,        \"range\": 6,        \"race\": \"\",        \"type\": \"Cruiser\",        \"damage\": {            \"energy\": 0,            \"kinetic\": 400,            \"missile\": 0,            \"chemical\": 0        },        \"scanner\": 50,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 20    },    {        \"id\": 76,        \"name\": \"Pike\",        \"power\": 1276,        \"type\": \"Destroyer\",        \"weapon\": 1000,        \"damage\": {            \"energy\": 500,            \"kinetic\": 500,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 100010,        \"range\": 9,        \"scanner\": 60,        \"cost\": 12780,        \"upkeep\": 382,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 20    },    null,    null,    {        \"id\": 79,        \"name\": \"K.Hun-Li\",        \"power\": 51224,        \"type\": \"Destroyer\",        \"weapon\": 14000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 4000,            \"missile\": 0,            \"chemical\": 10000        },        \"hull\": 5000050,        \"range\": 6,        \"scanner\": 7500,        \"cost\": 663602,        \"upkeep\": 5343,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 1    },    {        \"id\": 80,        \"name\": \"K.Hun-Xe\",        \"power\": 71322,        \"type\": \"Cruiser\",        \"weapon\": 12000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 4000,            \"chemical\": 8000        },        \"hull\": 8000050,        \"range\": 5,        \"scanner\": 11000,        \"cost\": 883831,        \"upkeep\": 7596,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 1    },    {        \"id\": 81,        \"name\": \"Sting\",        \"power\": 1611,        \"type\": \"Cruiser\",        \"weapon\": 1000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 1000,            \"chemical\": 0        },        \"hull\": 2000,        \"range\": 8,        \"scanner\": 50,        \"cost\": 15685,        \"upkeep\": 272,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 20    },    {        \"id\": 82,        \"name\": \"Tourmaline\",        \"power\": 6510,        \"type\": \"Fighter\",        \"weapon\": 8000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 8000,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 1500040,        \"range\": 4,        \"scanner\": 250,        \"cost\": 153414,        \"upkeep\": 720,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 6    },    {        \"id\": 83,        \"name\": \"Ruby\",        \"power\": 11268,        \"type\": \"Corvette\",        \"weapon\": 13000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 13000,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 1600050,        \"range\": 6,        \"scanner\": 350,        \"cost\": 237432,        \"upkeep\": 1220,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 5    },    {        \"id\": 84,        \"name\": \"V.Borrelly\",        \"power\": 452,        \"type\": \"Destroyer\",        \"weapon\": 400,        \"damage\": {            \"energy\": 0,            \"kinetic\": 100,            \"missile\": 0,            \"chemical\": 300        },        \"hull\": 50050,        \"range\": 8,        \"scanner\": 0,        \"cost\": 4965,        \"upkeep\": 271,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 60    },    {        \"id\": 85,        \"name\": \"V.Chiron\",        \"power\": 18482,        \"type\": \"Starbase\",        \"weapon\": 8000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 3000,            \"missile\": 0,            \"chemical\": 5000        },        \"hull\": 3000050,        \"range\": 7,        \"scanner\": 1000,        \"cost\": 170980,        \"upkeep\": 9241,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 3    },    {        \"id\": 86,        \"name\": \"Kohoutek\",        \"power\": 20,        \"type\": \"Scout\",        \"weapon\": 0,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 120,        \"range\": 1,        \"scanner\": 400,        \"cost\": 511,        \"upkeep\": 200,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 180    },    {        \"id\": 87,        \"name\": \"R.Pinnace\",        \"power\": 162,        \"type\": \"Corvette\",        \"weapon\": 200,        \"damage\": {            \"energy\": 0,            \"kinetic\": 200,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 200,        \"range\": 4,        \"scanner\": 0,        \"cost\": 2100,        \"upkeep\": 74,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 200    },    {        \"id\": 88,        \"name\": \"R.Sloop\",        \"power\": 558,        \"type\": \"Frigate\",        \"weapon\": 550,        \"damage\": {            \"energy\": 550,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 75010,        \"range\": 7,        \"scanner\": 0,        \"cost\": 6547,        \"upkeep\": 177,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 55    },    {        \"id\": 89,        \"name\": \"H.Galleon\",        \"power\": 2056,        \"type\": \"Destroyer\",        \"weapon\": 900,        \"damage\": {            \"energy\": 0,            \"kinetic\": 800,            \"missile\": 100,            \"chemical\": 0        },        \"hull\": 450010,        \"range\": 9,        \"scanner\": 100,        \"cost\": 20595,        \"upkeep\": 417,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 22    },    {        \"id\": 90,        \"name\": \"R.Schooner\",        \"power\": 2136,        \"type\": \"Destroyer\",        \"weapon\": 1150,        \"damage\": {            \"energy\": 900,            \"kinetic\": 0,            \"missile\": 250,            \"chemical\": 0        },        \"hull\": 2500,        \"range\": 9,        \"scanner\": 170,        \"cost\": 19815,        \"upkeep\": 476,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 16    },    {        \"id\": 91,        \"name\": \"H.Barkentine\",        \"power\": 3246,        \"type\": \"Cruiser\",        \"weapon\": 1300,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 1300,            \"chemical\": 0        },        \"hull\": 500030,        \"range\": 8,        \"scanner\": 300,        \"cost\": 29360,        \"upkeep\": 949,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 14    },    {        \"id\": 92,        \"name\": \"K.Yang-Fo\",        \"power\": 747092,        \"type\": \"Juggernaught\",        \"weapon\": 45000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 15000,            \"missile\": 15000,            \"chemical\": 15000        },        \"hull\": 45000060,        \"range\": 2,        \"scanner\": 106333,        \"cost\": 4629313,        \"upkeep\": 0,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 200    },    {        \"id\": 93,        \"name\": \"K.Yang-Xe\",        \"power\": 747092,        \"type\": \"Juggernaught\",        \"weapon\": 42000,        \"damage\": {            \"energy\": 15000,            \"kinetic\": 0,            \"missile\": 15000,            \"chemical\": 12000        },        \"hull\": 45000099,        \"range\": 2,        \"scanner\": 106333,        \"cost\": 4614313,        \"upkeep\": 0,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 200    },    {        \"id\": 94,        \"name\": \"K.Wai-Li\",        \"power\": 373555,        \"type\": \"Dreadnought\",        \"weapon\": 32000,        \"damage\": {            \"energy\": 9000,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 23000        },        \"hull\": 30000099,        \"range\": 3,        \"scanner\": 54708,        \"cost\": 2457513,        \"upkeep\": 0,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 200    },    {        \"id\": 95,        \"name\": \"K.Wai-Xe\",        \"power\": 373555,        \"type\": \"Dreadnought\",        \"weapon\": 32000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 9000,            \"missile\": 0,            \"chemical\": 23000        },        \"hull\": 30000099,        \"range\": 3,        \"scanner\": 54708,        \"cost\": 2457513,        \"upkeep\": 0,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 200    },    {        \"id\": 96,        \"name\": \"K.Wei-Li\",        \"power\": 186772,        \"type\": \"Battleship\",        \"weapon\": 22000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 10000,            \"chemical\": 12000        },        \"hull\": 15000060,        \"range\": 5,        \"scanner\": 31000,        \"cost\": 1262410,        \"upkeep\": 0,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 400    },    {        \"id\": 97,        \"name\": \"K.Wei-Xe\",        \"power\": 168094,        \"type\": \"Battleship\",        \"weapon\": 22000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 10000,            \"missile\": 0,            \"chemical\": 12000        },        \"hull\": 15000099,        \"range\": 5,        \"scanner\": 31000,        \"cost\": 1169020,        \"upkeep\": 0,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 1    },    {        \"id\": 98,        \"name\": \"F.Broadsword\",        \"power\": 1116,        \"type\": \"Destroyer\",        \"weapon\": 700,        \"damage\": {            \"energy\": 0,            \"kinetic\": 700,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 100010,        \"range\": 9,        \"scanner\": 80,        \"cost\": 10500,        \"upkeep\": 635,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 20    },    {        \"id\": 99,        \"name\": \"Tyr\",        \"power\": 13035,        \"cost\": 130245,        \"upkeep\": 14500,        \"weapon\": 10000,        \"hull\": 1200020,        \"range\": 7,        \"race\": \"Terran\",        \"type\": \"Dreadnought\",        \"damage\": {            \"energy\": 500,            \"kinetic\": 500,            \"missile\": 9000,            \"chemical\": 0        },        \"scanner\": 0,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 5    },    {        \"id\": 100,        \"name\": \"Scorpion\",        \"power\": 73606,        \"cost\": 548850,        \"upkeep\": 27500,        \"weapon\": 8000,        \"hull\": 10500020,        \"range\": 7,        \"race\": \"Terran\",        \"type\": \"Starbase\",        \"damage\": {            \"energy\": 1000,            \"kinetic\": 1000,            \"missile\": 6000,            \"chemical\": 0        },        \"scanner\": 9500,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 1    },    {        \"id\": 101,        \"name\": \"M.Calcite\",        \"power\": 1701,        \"type\": \"Cruiser\",        \"weapon\": 850,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 850,            \"chemical\": 0        },        \"hull\": 2000,        \"range\": 8,        \"scanner\": 100,        \"cost\": 15435,        \"upkeep\": 962,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 18    },    {        \"id\": 102,        \"name\": \"A.Hoko\",        \"power\": 9945,        \"type\": \"Starbase\",        \"weapon\": 4000,        \"damage\": {            \"energy\": 1000,            \"kinetic\": 1000,            \"missile\": 2000,            \"chemical\": 0        },        \"hull\": 1000015,        \"range\": 10,        \"scanner\": 400,        \"cost\": 82725,        \"upkeep\": 4475,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 7    },    {        \"id\": 103,        \"name\": \"Tiger\",        \"power\": 1496,        \"type\": \"Destroyer\",        \"weapon\": 1200,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 1200,            \"chemical\": 0        },        \"hull\": 1500,        \"range\": 9,        \"scanner\": 50,        \"cost\": 15495,        \"upkeep\": 448,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 18    },    {        \"id\": 104,        \"name\": \"H.Brigantine\",        \"power\": 286,        \"type\": \"Frigate\",        \"weapon\": 300,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 100,            \"chemical\": 200        },        \"hull\": 30035,        \"range\": 6,        \"scanner\": 0,        \"cost\": 3365,        \"upkeep\": 90,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 135    },    {        \"id\": 105,        \"name\": \"R.Snow\",        \"power\": 6804,        \"type\": \"Battleship\",        \"weapon\": 4000,        \"damage\": {            \"energy\": 1800,            \"kinetic\": 0,            \"missile\": 2200,            \"chemical\": 0        },        \"hull\": 750010,        \"range\": 7,        \"scanner\": 330,        \"cost\": 63795,        \"upkeep\": 1908,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 10    },    {        \"id\": 106,        \"name\": \"H.Man-O-War\",        \"power\": 450,        \"type\": \"Starbase\",        \"weapon\": 250,        \"damage\": {            \"energy\": 100,            \"kinetic\": 150,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 60020,        \"range\": 7,        \"scanner\": 13,        \"cost\": 4333,        \"upkeep\": 200,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 80    },    {        \"id\": 107,        \"name\": \"D. Mako\",        \"power\": 12645,        \"type\": \"Starbase\",        \"weapon\": 3000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 3000        },        \"hull\": 15000,        \"range\": 7,        \"scanner\": 1453,        \"cost\": 98498,        \"upkeep\": 2000,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 100    },    {        \"id\": 108,        \"name\": \"D. Luminous\",        \"power\": 12645,        \"type\": \"Starbase\",        \"weapon\": 7000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 7000,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 10000100,        \"range\": 7,        \"scanner\": 903,        \"cost\": 111698,        \"upkeep\": 2000,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 100    },    {        \"id\": 109,        \"name\": \"D. Megalodon\",        \"power\": 72902,        \"type\": \"Juggernaught\",        \"weapon\": 50000,        \"damage\": {            \"energy\": 10000,            \"kinetic\": 0,            \"missile\": 20000,            \"chemical\": 20000        },        \"hull\": 6500030,        \"range\": 6,        \"scanner\": 0,        \"cost\": 695820,        \"upkeep\": 4000,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 100    },    {        \"id\": 110,        \"name\": \"D. Icithio\",        \"power\": 12645,        \"type\": \"Starbase\",        \"weapon\": 11000,        \"damage\": {            \"energy\": 11000,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 900050,        \"range\": 8,        \"scanner\": 152,        \"cost\": 129707,        \"upkeep\": 2000,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 100    },    {        \"id\": 111,        \"name\": \"D. White\",        \"power\": 12645,        \"type\": \"Starbase\",        \"weapon\": 12000,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 12000,            \"chemical\": 0        },        \"hull\": 7000,        \"range\": 10,        \"scanner\": 50,        \"cost\": 132125,        \"upkeep\": 2000,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 100    },    {        \"id\": 112,        \"name\": \"Strafez King\",        \"power\": 890,        \"type\": \"Special\",        \"weapon\": 550,        \"damage\": {            \"energy\": 0,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 550        },        \"hull\": 20090,        \"range\": 8,        \"scanner\": 50,        \"cost\": 7580,        \"upkeep\": 60,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 40    },    {        \"id\": 113,        \"name\": \"T.Fenrir\",        \"power\": 1512,        \"type\": \"Cruiser\",        \"weapon\": 600,        \"damage\": {            \"energy\": 350,            \"kinetic\": 250,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 2800,        \"range\": 8,        \"scanner\": 68,        \"cost\": 14208,        \"upkeep\": 1400,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 18    },    {        \"id\": 114,        \"name\": \"D.Thresher\",        \"power\": 11956,        \"type\": \"Battleship\",        \"weapon\": 9000,        \"damage\": {            \"energy\": 7000,            \"kinetic\": 1000,            \"missile\": 1000,            \"chemical\": 0        },        \"hull\": 800030,        \"range\": 7,        \"scanner\": 450,        \"cost\": 115300,        \"upkeep\": 2032,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 4    },    {        \"id\": 115,        \"name\": \"C.Leo\",        \"power\": 2848,        \"type\": \"Cruiser\",        \"weapon\": 1000,        \"damage\": {            \"energy\": 500,            \"kinetic\": 500,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 5000,        \"range\": 7,        \"scanner\": 175,        \"cost\": 25735,        \"upkeep\": 2100,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 10    },    {        \"id\": 116,        \"name\": \"H.Corsair\",        \"power\": 110,        \"type\": \"Fighter\",        \"weapon\": 75,        \"damage\": {            \"energy\": 25,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 50        },        \"hull\": 10030,        \"range\": 4,        \"scanner\": 20,        \"cost\": 1110,        \"upkeep\": 22,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 300    },    {        \"id\": 117,        \"name\": \"K.Hun-Zen\",        \"power\": 61780,        \"type\": \"Cruiser\",        \"weapon\": 18000,        \"damage\": {            \"energy\": 8000,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 10000        },        \"hull\": 6000025,        \"range\": 6,        \"scanner\": 5750,        \"cost\": 803515,        \"upkeep\": 6000,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 1    },    {        \"id\": 118,        \"name\": \"V.Cronus\",        \"power\": 2016,        \"type\": \"Cruiser\",        \"weapon\": 1000,        \"damage\": {            \"energy\": 300,            \"kinetic\": 0,            \"missile\": 0,            \"chemical\": 700        },        \"hull\": 200020,        \"range\": 8,        \"scanner\": 140,        \"cost\": 17800,        \"upkeep\": 950,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 16    },    {        \"id\": 119,        \"name\": \"K.Hun-Zen\",        \"power\": 1500003,        \"type\": \"Starbase\",        \"weapon\": 345000,        \"damage\": {            \"energy\": 80000,            \"kinetic\": 75000,            \"missile\": 100000,            \"chemical\": 90000        },        \"hull\": 100000099,        \"range\": 4,        \"scanner\": 214530,        \"cost\": 10689585,        \"upkeep\": 0,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 100    },    {        \"id\": 120,        \"name\": \"G.Sapphire\",        \"power\": 17624,        \"type\": \"Destroyer\",        \"weapon\": 12000,        \"damage\": {            \"energy\": 2000,            \"kinetic\": 10000,            \"missile\": 0,            \"chemical\": 0        },        \"hull\": 2000045,        \"range\": 6,        \"scanner\": 1000,        \"cost\": 174180,        \"upkeep\": 16300,        \"minerals\": {            \"terranMetal\": 0,            \"redCrystal\": 0,            \"whiteCrystal\": 0,            \"rutile\": 0,            \"composite\": 0,            \"strafezOrganism\": 0        },        \"build\": 3    }]'));
    }
    //get all ships. note: the ships array is indexed by shipid, which means that entries are nullable;
    var allShips = gc.getValue('a-allships');

    /**
     * ship items are @nullable
     */
    var shipsAvailable = [];
    //refresh ship data and get the list of ships available to a user;
    $("table.table_back[width='95%'] table tr.table_row1").each(function (n) {

      var row = $(this);
      var id = $("td:eq(1) a", this).attr("href").replace(/.*shiptype=/, '') * 1;
      var ship = allShips[id];

      if (!ship) {
        ship = {};
      }
      ship.race = $.trim($("td:eq(0)", this).text());
      ship.name = $.trim($("td:eq(1)", this).text());
      ship.id = id;
      ship.type = $.trim($("td:eq(2)", this).text());
      ship.cost = $.trim($("td:eq(3)", this).text()).replace(/[^\.\d]/g, '') * 1;
      ship.upkeep = $.trim($("td:eq(4)", this).text()).replace(/[^\.\d]/g, '') * 1;
      ship.weapon = $.trim($("td:eq(5)", this).text()).replace(/[^\.\d]/g, '') * 1;
      ship.hull = $.trim($("td:eq(6)", this).text()).replace(/[^\.\d]/g, '') * 1;
      ship.range = $.trim($("td:eq(7)", this).text()).replace(/[^\.\d]/g, '') * 1;
      ship.power = $.trim($("td:eq(8)", this).text()).replace(/[^\.\d]/g, '') * 1;
      if (!ship.order) {
        ship.order = n;
      }

      console.log('ship', ship);

      if (!ship.build) {
        gc.showMessage('Incomplete ' + ship.name + ' data', 'Data for ' + ship.name + ' appears to be incomplete, please wait until it gets harvested. Reload this page after you see an appropriate success message in mod console (left bottom page corner).');
        gc.xhr({
          url: 'i.cfm?f=com_ship2&shiptype=' + id,
          onSuccess: function (response) {
            allShips[id] = harvestShipData(response);
            gc.setValue("a-allships", allShips);
            console.log('Harvested data of ' + ship.name + '.');
          },
          onFailure: function (response) {
            console.log('Query to the ship page for ' + ship.name + ' returned no reply. Terminated.');
          }
        });
      }

      allShips[id] = ship;
      shipsAvailable.push(ship);
    });

    shipsAvailable.sort(function (a, b) {
      var oA = 0,
        oB = 0;

      if (a && a.order) {
        oA = a.order;
      }
      if (b && b.order) {
        oB = b.order;
      }
      if (typeof oA === "string" || typeof oB === "string") {
        return (oA + "").localeCompare((oB + ""));
      }
      return oA - oB;
    });


    // if (gc.location.match(/com_ship$/)) {
    gc.setValue("a-shipbuilder-shipsAvailable", shipsAvailable);
    // }
    // if (gc.location.match(/com_ship.*shiptype/)) {

    //   var id = (gc.location + '').replace(/.*shiptype=/, '') * 1;
    //   var ship = allShips[id];
    //   if (!ship) {
    //     ship = {};
    //   }

    //   $.extend(ship, harvestShipData());

    //   allShips[id] = ship;
    //   gc.setValue("a-allships", allShips);
    // }

    var pageTitle = $("b:contains('BUILDING SHIPS')");

    //help on harvesting
    gc.showMessage('Ship data caching', 'For the ship builder to work it requires valid ship data (power rating, build rate, etc.). Some of that can and will be harvested from the <a href="i.cfm?f=com_ship">ship list page</a>. However, if any build rate on this page is incorrect or missing, it has to be harvested from that ship\'s respective build page (e.g. <a href="i.cfm?f=com_ship2&shiptype=10">this page for Small Strafez Fodder</a>). There, that ship\'s data will be harvested and cached, to be used in the ship builder and other mods which require detailed ship data. The ship builder page will have to be refreshed afterward to use the newly cached data. This process is automated in case of missing data, but it its incorrect, you have to do it on your own. I would be nice if you emailed me that that happened, though.', 'a-shipbuilder-shipdatahelp');

    //help on usage
    var usageHelpTitle = 'How to use the ship builder';
    var usageHelpMessage = 'Ship builder allows to build many different ships at once, fast. The ship types you can build are listed below. The input fields are where you place amounts, which is reflected by the stack building queue below the ship list. If you have enough turns to build what you selected, you will see a submit button there, too.<br />Please note, that some cells in the ship list change background when you move your mouse over them. Those are shortcuts to add/remove from given stack.<br />Furthermore, that above the ship list there are 10 slots for saving fleet presets - just click to save what is currently in the form, to be pasted later. These presets can be used by other mods to quickly build what you want e.g. from the ranking list.<br/ >Lastly, the stack list below the ship list shows not only the stacks you want to build but also the stacks you have already got (queried remotely from the disband page). If you wish to refresh it, either build something or click the "R" header. It may become inaccurate after a while.';
    gc.showMessage(usageHelpTitle, usageHelpMessage, 'a-shipbuilder-usagehelp');
    pageTitle.text('SHIP BUILDER');
    pageTitle.append('<img src="i/help.gif" title="' + usageHelpTitle + '" />').click(function () {
      if (!$("#a-shipbuilder-usagehelp").length) {
        gc.showMessage(usageHelpTitle, usageHelpMessage);
      }
    });

    pageTitle.siblings("b ~ a, b ~ table").remove();
    pageTitle.next().next().after("<table width=\"70px\" class=\"a-table a-shipbuilder-submit-wrap\">	<tbody>		<tr align=\"center\" class=\"table_row1\">			<td class=\"a-button\" id=\"a-shipbuilder-submit\"				title=\"Build the stacks above\">Build all</td>		</tr>	</tbody></table><br /><table class=\"a-table\" width=\"95%\" id=\"a-shipbuilder-saves\">	<tbody>		<tr class=\"table_row2\">			<td id=\"a-ship-save-a\" class=\"a-shipbuilder-save a-button\">&nbsp;</td>			<td id=\"a-ship-save-b\" class=\"a-shipbuilder-save a-button\">&nbsp;</td>			<td id=\"a-ship-save-c\" class=\"a-shipbuilder-save a-button\">&nbsp;</td>			<td id=\"a-ship-save-d\" class=\"a-shipbuilder-save a-button\">&nbsp;</td>			<td id=\"a-ship-save-e\" class=\"a-shipbuilder-save a-button\">&nbsp;</td>			<td id=\"a-ship-save-f\" class=\"a-shipbuilder-save a-button\">&nbsp;</td>			<td id=\"a-ship-save-g\" class=\"a-shipbuilder-save a-button\">&nbsp;</td>			<td id=\"a-ship-save-h\" class=\"a-shipbuilder-save a-button\">&nbsp;</td>			<td id=\"a-ship-save-i\" class=\"a-shipbuilder-save a-button\">&nbsp;</td>			<td id=\"a-ship-save-j\" class=\"a-shipbuilder-save a-button\">&nbsp;</td>		</tr>	</tbody></table><br /><br /><table class=\"a-table\" width=\"95%\" id=\"a-shipbuilder-ships-wrap\">	<tbody>		<tr align=\"center\" class=\"table_row0\">			<td>Race</td>			<td width=\"30%\">Name</td>			<td width=\"10%\">Amount</td>			<td>Build Rate</td>			<td>Cost</td>			<td>PR</td>			<td>Stack PR</td>			<td>Order</td>		</tr>		<tr align=\"center\" class=\"table_row0 a-shipbuilder-actionsrow\">			<td class=\"a-revbutton a-shipbuilder-addoneall\"				title=\"Click to add one to all build requests\">+1</td>			<td width=\"30%\"></td>			<td width=\"10%\"></td>			<td class=\"a-revbutton a-shipbuilder-addturnall\"				title=\"Click to add one turnful to all build requests\">+T</td>			<td class=\"a-revbutton a-shipbuilder-removeturnall\"				title=\"Click to remove one to all build requests\">-T</td>			<td class=\"a-revbutton a-shipbuilder-doubleall\"				title=\"Click to double all build requests\">x2</td>			<td class=\"a-revbutton a-shipbuilder-clearall\"				title=\"Click to clear all build requests\">clear</td>			<td class=\"a-revbutton a-shipbuilder-resetorder\"				title=\"Click to reset ship order\">reset</td>		</tr>	</tbody></table><br /><br /><table width=\"95%\" class=\"a-table\" id=\"a-shipbuilder-stacks-wrap\">	<tbody>		<tr align=\"center\" class=\"table_row0\">			<td width=\"20%\">Name</td>			<td width=\"10%\">To build</td>			<td width=\"10%\">In fleet</td>			<td>Turns</td>			<td>Cost</td>			<td>Upkeep</td>			<td>Weapon</td>			<td>Hull</td>			<td>Scanner</td>			<td>Power<br>			Rating</td>			<td id=\"a-shipbuilder-refresh-stacks\" title=\"Refresh\"				class=\"a-revbutton\">R</td>		</tr>	</tbody></table><br /><br /><table width=\"70px\" class=\"a-table a-shipbuilder-submit-wrap\">	<tbody>		<tr align=\"center\" class=\"table_row1\">			<td class=\"a-button\" id=\"a-shipbuilder-submit\"				title=\"Build the stacks above\">Build all</td>		</tr>	</tbody></table><br /><br /><table class=\"a-table\" id=\"a-shipbuilder-options\" width=\"100%\">	<tbody>		<tr align=\"left\" class=\"table_row0\">			<td>				<input type=\"checkbox\" id=\"a-shipbuilder-resetafterbuild\" />Reset form after build			</td>		</tr>		<tr align=\"left\" class=\"table_row0\">			<td>				<input type=\"checkbox\" id=\"a-shipbuilder-optimize\" />Optimize requests to minimize upkeep (not implemented yet)			</td>		</tr>	</tbody></table><div id=\"a-shipbuilder-save-infobox\" style=\"display: none;\"><table width=\"100%\">	<tbody>		<tr></tr>	</tbody></table></div>");
    var shipMarkup = "<tr class=\"table_row1\" id=\"a-shipbuilder-ship-${id}\" sid=\"${id}\">	<td class=\"a-button a-shipbuilder-addone\"		title=\"Click to add just one to build request\">${race}</td>	<td align=\"left\"><a href=\"i.cfm?f=com_ship2&shiptype=${id}\" class=\"\">${name}</a></td>	<td align=\"center\" class=\"a-shipbuilder-input\"><input type=\"text\"		style=\"width: 50px;\" /></td>	<td align=\"right\" class=\"a-button a-shipbuilder-addturn\"		title=\"Click to add a turnful to build request\">${build}</td>	<td align=\"right\" class=\"a-button a-shipbuilder-removeturn\"		title=\"Click to remove a turnful to build request\">${cost}</td>	<td align=\"right\" class=\"a-button a-shipbuilder-double\"		title=\"Click to double build request\">${power}</td>	<td align=\"right\" class=\"a-button a-shipbuilder-clear a-shipbuilder-stackpower\"		title=\"Click to clear build request\">${stack_power}</td>	<td align=\"right\" class=\"a-button a-shipbuilder-order\"><input type=\"text\"		style=\"width: 50px;\" value=\"${order}\"/></td></tr>";
    $.tmpl(shipMarkup, shipsAvailable).appendTo("#a-shipbuilder-ships-wrap tbody");
    var stacks = [];
    var stackMarkup = "<tr class=\"table_row1 a-shipbuilder-stack\" id=\"a-shipbuilder-ship-${id}\"id=\"${id}\">	<td align=\"left\"><a href=\"i.cfm?f=com_ship2&shiptype=${id}\" class=\"\">${name}</a></td>	<td align=\"right\">${amount}</td>	<td align=\"right\">${existing}</td>	<td align=\"right\">${turns}</td>	<td align=\"right\">${cost}</td>	<td align=\"right\">${upkeep}</td>	<td align=\"right\">${weapon}</td>	<td align=\"right\">${hull}</td>	<td align=\"right\">${scanner}</td>	<td align=\"right\">${power}</td>	<td align=\"right\" class=\"a-button a-shipbuilder-disbandall\"		disbandId=\"${disband}\" disbandAmount=\"${existing}\"		title=\"Click to disband this stack\">x</td></tr>";
    var stackTotalsMarkup = "<tr class=\"table_row0\" id=\"a-shipbuilder-ship-totals\">	<td align=\"left\">Totals</td>	<td align=\"right\">${html amount}</td>	<td align=\"right\">&nbsp;</td>	<td align=\"right\">${html turns}</td>	<td align=\"right\">${html cost}</td>	<td align=\"right\">${html upkeep}</td>	<td align=\"right\">${html weapon}</td>	<td align=\"right\">${html hull}</td>	<td align=\"right\">${html scanner}</td>	<td align=\"right\">${html power}</td>	<td align=\"right\">&nbsp;</td></tr>";
    var totals = {};

    function formatBigNumber (n) {
      var e = Number.prototype.toExponential.call(parseFloat(n), 1);
      return '<sub>' + e.replace('+','').replace('e', '</sub> e ');
    }

    var renderStacks = function () {
      var sortedStacks = jQuery.extend(true, [], stacks);
      sortedStacks.sort(app.util.sortByPowerDesc);
      $("#a-shipbuilder-stacks-wrap tbody tr.table_row1, #a-shipbuilder-ship-totals").remove();
      $.tmpl(stackMarkup, sortedStacks).appendTo("#a-shipbuilder-stacks-wrap tbody");

      //hitch again button on-off - these dom nodes are new to this
      $("#a-shipbuilder-stacks-wrap td.a-button").hover(

        function () {
          $(this).addClass("table_row0").removeClass("table_row1");
        },
        function () {
          $(this).removeClass("table_row0").addClass("table_row1");
        });
      //add a disbander event
      $(".a-shipbuilder-disbandall").click(function () {
        gc.xhr({
          url: 'i.cfm?f=com_disband',
          data: 'submitflag=1&' + $(this).attr("disbandId") + '=' + $(this).attr("disbandAmount"),
          onSuccess: refreshExistingFleet
        });
      });

      console.log('totals:', totals, 'stacks:', stacks);

      totals = {};
      for (var i = 0; i < stacks.length; i++) {
        for (var j in stacks[i]) {
          if (stacks[i] && stacks[i].hasOwnProperty(j)) {
            totals[j] = (totals[j] || 0) + stacks[i][j];
          }
        }
      }
      console.log('totals:', totals);
      for (var j in totals) {
        totals[j] = formatBigNumber(totals[j]);
      }

      $.tmpl(stackTotalsMarkup, totals).appendTo("#a-shipbuilder-stacks-wrap tbody");

      //TODO JCh 2012-01-19 this criteria change after new turns arrive and should be then reevaluated
      //				if (totals.turns > 0 && totals.turns <= gc.turns.getValue() && totals.cost <= gc.cash.getValue()) {
      //					$("#a-shipbuilder-submit-wrap").fadeIn('slow');
      //				} else {
      //					$("#a-shipbuilder-submit-wrap").fadeOut('fast');
      //				}
    };

    //RESET_AFTER_BUILD
    RESET_AFTER_BUILD = gc.getValue("a-shipbuilder-resetafterbuild") === true;
    $("#a-shipbuilder-resetafterbuild").prop("checked", RESET_AFTER_BUILD);

    $("#a-shipbuilder-resetafterbuild").click(function () {
      RESET_AFTER_BUILD = !RESET_AFTER_BUILD;
      gc.setValue("a-shipbuilder-resetafterbuild", RESET_AFTER_BUILD);
    });

    //OPTIMIZE_UPKEEP
    OPTIMIZE_UPKEEP = gc.getValue("a-shipbuilder-optimize") === true;
    $("#a-shipbuilder-optimize").prop("checked", OPTIMIZE_UPKEEP);

    $("#a-shipbuilder-optimize").click(function () {
      OPTIMIZE_UPKEEP = !OPTIMIZE_UPKEEP;
      gc.setValue("a-shipbuilder-optimize", OPTIMIZE_UPKEEP);
    });

    var changeAmount = function (el, changer) {

      var input = el.siblings(".a-shipbuilder-input").children().first();
      var currentAmount = input.val().replace(/\D/, '', 'g') * 1;
      var amount = changer(currentAmount);
      var sid = el.parent().attr("sid");

      //nothing to do
      if (!amount && !stacks[sid]) {
        return;
      }

      input.val(amount ? amount : '');
      var existing = 0;
      var ship = jQuery.extend(true, {}, allShips[sid]);
      if (stacks[sid] && stacks[sid].existing) {
        ship.existing = stacks[sid].existing;
        ship.disband = stacks[sid].disband;
        existing = stacks[sid].existing * 1;
      }

      if (stacks[sid] && !(amount + existing)) {
        delete stacks[sid];
      } else {
        stacks[sid] = ship;
        stacks[sid].amount = amount;
        stacks[sid].turns = Math.ceil(amount / ship.build);
        stacks[sid].cost = ship.cost * amount;
        stacks[sid].upkeep = ship.upkeep * (amount + existing);
        stacks[sid].weapon = ship.weapon * (amount + existing);
        stacks[sid].hull = ship.hull * (amount + existing);
        stacks[sid].power = ship.power * (amount + existing);
        stacks[sid].scanner = ship.scanner * (amount + existing);
      }
      renderStacks();

      el.siblings(".a-shipbuilder-stackpower").text(stacks[sid].power);
    };

    $(".a-shipbuilder-addone").click(function () {
      changeAmount($(this), function (v) {
        return v + 1;
      });
    });
    $(".a-shipbuilder-addturn").click(function () {
      var el = $(this);
      var sid = el.parent().attr("sid");
      var buildRate = allShips[sid].build;
      changeAmount(el, function (v) {
        return v + buildRate;
      });
    });
    $(".a-shipbuilder-removeturn").click(function () {
      var el = $(this);
      var sid = el.parent().attr("sid");
      var buildRate = allShips[sid].build;
      changeAmount(el, function (v) {
        return Math.max(v - buildRate, 0);
      });
    });
    $(".a-shipbuilder-double").click(function () {
      changeAmount($(this), function (v) {
        return v * 2;
      });
    });
    $(".a-shipbuilder-clear").click(function () {
      changeAmount($(this), function (v) {
        return 0;
      });
    });

    $(".a-shipbuilder-addoneall").click(function () {
      $("td.a-shipbuilder-input input").each(function () {
        var el = $(this).parent().next();
        changeAmount(el, function (v) {
          return v + 1;
        });
      });
    });
    $(".a-shipbuilder-addturnall").click(function () {
      $("td.a-shipbuilder-input input").each(function () {
        var el = $(this).parent().next();
        var sid = el.parent().attr("sid");
        var buildRate = allShips[sid].build;
        changeAmount(el, function (v) {
          return v + buildRate;
        });
      });
    });
    $(".a-shipbuilder-removeturnall").click(function () {
      $("td.a-shipbuilder-input input").each(function () {
        var el = $(this).parent().next();
        var sid = el.parent().attr("sid");
        var buildRate = allShips[sid].build;
        changeAmount(el, function (v) {
          return Math.max(v - buildRate, 0);
        });
      });
    });
    $(".a-shipbuilder-doubleall").click(function () {
      $("td.a-shipbuilder-input input").each(function () {
        var el = $(this).parent().next();
        changeAmount(el, function (v) {
          return v * 2;
        });
      });
    });
    $(".a-shipbuilder-clearall").click(function () {
      $("td.a-shipbuilder-input input").each(function () {
        var el = $(this).parent().next();
        changeAmount(el, function (v) {
          return 0;
        });
      });
    });
    $(".a-shipbuilder-resetorder").click(function () {
      for (var i = 0; i < allShips.length; i = i + 1) {
        if (allShips[i] && allShips[i].order) {
          delete allShips[i].order;
        }
      }
      gc.setValue("a-allships", allShips);
      console.log("Order was reset, please refresh page.");
    });
    $("td.a-shipbuilder-order input").change(function () {
      var el = $(this).parent();
      var sid = el.parent().attr("sid");
      var ship = allShips[sid];
      if (ship) {
        ship.order = $(this).val();

      }
    });
    $("td.a-shipbuilder-input input").change(function () {
      var el = $(this).parent().next();
      changeAmount(el, function (v) {
        return v;
      });
    });
    $(".a-shipbuilder-save").each(function () {
      var id = $(this).attr('id');
      var label = gc.getValue(id + "-name");
      if (label) {
        $(this).text(label);
      }
    });
    $(".a-shipbuilder-save").dblclick(function () {
      var id = $(this).attr('id');
      var value = gc.getValue(id + "-value");
      if (value && value !== '[]') {
        gc.setValue(id + "-value", '');
        gc.setValue(id + "-name", '');
        $(this).html('&nbsp;');
      }
    });
    $(".a-shipbuilder-save").click(function () {
      // save or load ship preset
      var i;
      var id = $(this).attr('id');
      var save = gc.getValue(id + '-value');

      // if we click an existing preset
      if (save) {
        for (i = 0; i < save.length; i = i + 1) {
          var el = $("#a-shipbuilder-ship-" + save[i].id + " td.a-shipbuilder-input").next();
          //regarding the jslint warning: i'm explicitely using the dangerous functionality, each function passes a different amount
          changeAmount(el, function (v) {
            return save[i].amount;
          });
        }

      // otherwise this is a blank preset
      } else {
        save = [];
        for (i = 0; i < stacks.length; i = i + 1) {
          if (stacks[i] && stacks[i].amount) {
            save.push({
              id: i,
              amount: stacks[i].amount
            });
          }
        }
        if (!save.length) {
          return;
        }
        var label = prompt("Enter a label for this stack preset, 10 characters at most, preferably 7");
        if (label) {
          gc.setValue(id + "-value", save);
          label = label.substring(0, 10);
          gc.setValue(id + "-name", label);
          $(this).text(label);
          console.log('[Ship builder] A preset ' + label + ' was created.');
        }
      }
    });

    var onMouseOver = function (e) {
      var id = $(this).attr('id');
      var value = gc.getValue(id + "-value");
      if (value && value !== '[]') {
        $(this).text('paste');
        var save = gc.getValue(id + "-value");
        var savedStacks = [];
        for (var i = 0; i < save.length; i = i + 1) {
          var stack = jQuery.extend(true, {}, allShips[save[i].id]);
          stack.amount = save[i].amount;
          stack.turns = Math.ceil(save[i].amount / stack.build);
          savedStacks.push(stack);
        }
        savedStacks.sort(app.util.sortByPowerDesc);
        var saveMarkup = '<tr class="a-shipbuilder-save-body""><td align="left"  width="70%">${name}</td><td align="right" width="10%">${amount}</td><td align="right" width="10%">${turns}</td><td align="right" width="10%">${power}</td></tr>';
        $("#a-shipbuilder-save-infobox").attr("style", 'display: block; top: ' + (e.clientY + 15) + 'px; left: ' + $(this).position().left + 5 + 'px;');
        $.tmpl(saveMarkup, savedStacks).appendTo("#a-shipbuilder-save-infobox tbody");
      } else if (totals.power > 0) {
        $(this).text('save');
      }
    };

    var onMouseOut = function () {
      var id = $(this).attr('id');
      var value = gc.getValue(id + "-value");
      if (value && value !== '[]') {
        var label = gc.getValue(id + "-name");
        $(this).text(label);
        $("#a-shipbuilder-save-infobox tr").remove();
        $("#a-shipbuilder-save-infobox").hide();
      } else {
        $(this).html('&nbsp;');
      }
    };

    $(".a-shipbuilder-save").hover(onMouseOver, onMouseOut);
    /**
    			//unlock

    			gc.xhr({
    				method: 'GET',
    				url: 'i.cfm?&popup=attackmsg&c=1',
    				onSuccess: function (response) {
    					unsafeWindow.console.log(response);
    				},
    				onFailure: function (response) {
    					unsafeWindow.console.error(response);
    				}
    			});

    		*/
    $(".a-shipbuilder-submit-wrap").click(function () {
      var el = $(this);

      var turns = 0,
        i, stackCount = 0;
      for (i = 0; i < stacks.length; i = i + 1) {
        if (stacks[i] && stacks[i].amount && stacks[i].id) {
          turns += stacks[i].turns * 1;
          stackCount = stackCount + 1;
        }
      }
      /**
       * @param {string} response text returned from server
       */
      var onSuccess = function (response) {
        var msg = $("td:contains('You bought ')", response).contents().filter(function () {
          return this.nodeType === 3 && this.textContent.match('You bought');
        });
        console.log('[Ship builder] ' + msg.text());
        gc.turns.subtractValue(this.extra.turns);
        gc.cash.subtractValue(this.extra.cost);
        stackCount = stackCount - 1;

        //clear form if all stacks were build
        if (RESET_AFTER_BUILD && stackCount === 0) {

          console.log('Resetting building form');
          //clear all
          //FIXME JCh 2012-01-19 fix code duplication
          $("td.a-shipbuilder-input input").each(function () {

            var e = $(this).parent().next();
            changeAmount(e, function (v) {
              return 0;
            });
          });
        }

        //refresh stacks if all stacks were build
        if (stackCount === 0) {
          refreshExistingFleet();
        }
      };

      /**
       * @param {string} response text returned from server
       */
      var onFailure = function (response) {
        var name = $("b:contains('SHIPS')", response).text();
        var msg = $("font[color='red'] > b", response).text();
        console.error('[Ship builder] ' + name + ': ' + msg);
      };

      // if (turns > gc.turns.getValue()) {
      //   console.log('Not enough turns to build all stacks');
      //   return;
      // }

      for (i = 0; i < stacks.length; i = i + 1) {
        if (stacks[i] && stacks[i].amount && stacks[i].id) {
          gc.xhr({
            extra: stacks[i],
            url: 'i.cfm?&f=com_ship2&shiptype=' + stacks[i].id,
            data: 'amount=' + stacks[i].amount,
            successCondition: "td:contains('You bought ')",
            onSuccess: onSuccess,
            onFailure: onFailure
          });
        }
      }
    });

    refreshExistingFleet = function () {
      gc.xhr({
        //extra: stacks,
        url: 'i.cfm?f=com_disband',
        method: 'GET',
        onSuccess: function (response) {
          var i;
          //clear archaiv data
          for (i = 0; i < stacks.length; i = i + 1) {
            if (stacks[i]) {
              stacks[i].existing = 0;
            }
          }
          //var stacks = this.extra;
          $("input[name^='dis']", response).each(function () {
            var el = $(this);
            var disband = el.attr("name");
            var name = $.trim(el.parent().prev().prev().text());
            var existing = el.parent().next().text().replace(/[^\.\d]/g, '');
            var id = 0;
            for (i = 0; i < allShips.length; i = i + 1) {
              if (allShips[i] && allShips[i].name === name) {
                id = i;
                break;
              }
            }
            //a ship as its taken from cache
            var ship = jQuery.extend(true, {}, allShips[id]);
            var amount = 0;
            //if stack exists in builds and isn't a historical entry, add existing and recalculate values
            if (stacks[id] && stacks[id].amount) {
              amount = stacks[id].amount;
            }
            //otherwise stack is new and we have to create it
            else {
              stacks[id] = jQuery.extend(true, {}, allShips[id]);
            }
            //either way we paint stack with new data
            stacks[id].existing = existing;
            stacks[id].disband = disband;
            //and multiply relevant values by amount
            stacks[id].turns = Math.ceil(amount / ship.build);
            stacks[id].cost = ship.cost * amount;
            stacks[id].upkeep = ship.upkeep * (amount + existing);
            stacks[id].weapon = ship.weapon * (amount + existing);
            stacks[id].hull = ship.hull * (amount + existing);
            stacks[id].power = ship.power * (amount + existing);
            stacks[id].scanner = ship.scanner * (amount + existing);
          });
          //delete disbanded stacks
          for (i = 0; i < stacks.length; i = i + 1) {
            if (stacks[i] && (!stacks[i].amount && !stacks[i].existing)) {
              delete stacks[i];
            }
          }
          renderStacks();
        }
      });
    };
    //after init get data from the disband page
    refreshExistingFleet();
    $("#a-shipbuilder-refresh-stacks").click(refreshExistingFleet);
  }
};
/**
 * CSS tweaks
 */
app.mod.stylehandler = {
	id: 'a-stylehandler',
	defaultValue: true,
	title: 'CSS tweaks',
	description: 'Adapts game CSS stylesheet.',
	items: [{
		type: 'checkbox',
		id: 'a-stylehandler-nobgimage',
		defaultValue: true,
		description: 'Remove background images from most gc pages.'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-stylehandler')) {
			return false;
		}
		return true;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		if (gc.getValue('a-stylehandler-nobgimage') && gc.isPropertyPage()) {
			$("body").addClass('no-blue-image');
		}
	}
};
/**
 * tabbed pms
 */
app.mod.tabbedpms = {
	id: 'a-tabbedpms',
	defaultValue: true,
	title: 'Tabbed private messages',
	description: 'When it spots the blinking yellow annoyance it opens a new tab with PM inbox. And more...',
	items: [{
		type: 'checkbox',
		id: 'a-tabbedpms-autoopen',
		defaultValue: true,
		description: 'Jump to new PMs automagically (in new tab each)?'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-tabbedpms')) {
			return false;
		}
		if (gc.location.indexOf('i.cfm') !== -1) {
			return true;
		}
		return false;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		//on new pms --> open inbox
		if ($("td[background*='blink']").length && !gc.location.match(/.*f=pm/)) {
			gc.openInTab(app.gameServer + "i.cfm?f=pm");
		}
		//on inbox
		if (gc.location.match(/.*f=pm$/)) {
			var newPms = $("table.table_back[width='80%'] img[src='i/w/pm_n.gif']"); //new, unanswered pms
			if (newPms.length) {
				var newTitle;
				if (newPms.length > 1) {
					newTitle = newPms.length + " PMs";
				} else {
					newTitle = newPms.first().parent().siblings().eq(2).text();
				}
				document.title = newTitle;
				if (gc.getValue('a-tabbedpms-autoopen')) {
					if (newPms.length > 1) {
						newPms.each(function () {
							var newpmlink = $(this).first().parent().siblings().eq(3).children().first().attr("href");
							gc.openInTab(app.gameServer + newpmlink);
						});
					}
					else {
						var newpmlink = newPms.first().parent().siblings().eq(3).children().first().attr("href");
						document.location.href = app.gameServer + newpmlink;
					}
				}
			}
		}
		//on pms
		else if (gc.location.match(/.*f=pm/)) {
			document.title = $.trim($("img[src='i/w/pm_add.gif']").first().parent().parent().text());
		}
	}
};
/**
 * Turn Ticker
 */
app.mod.turnticker = {
	id: "a-turnticker",
	defaultValue: true,
	title: "Turn ticker",
	description: "Updates the turn counts while you wait. Relative to last sync with gc servers  (req.: Taiaha).",
	items: [{
		type: 'info',
		text: 'It should also spot that you have logged onto another game speed in another tab and notify you (server gets marked with red).'
	}, {
		type: 'checkbox',
		id: 'a-turnticker-showturns',
		description: 'Show turns in tab titles'
	}, {
		type: 'checkbox',
		id: 'a-turnticker-showmaxedturns',
		description: 'Show maxed-out turns in tab titles'
	}],
	/**
	 * Returns true only when this mod can be launched
	 */
	filter: function () {
		if (!gc.getValue('a-turnticker')) {
			return false;
		}
		return true;
	},
	/**
	 * Mod's body function
	 */
	plugin: function () {
		var initTimestamp = new Date().getTime();
		window.setInterval(function () {
			var delay = (gc.getValue('a-propertycheck-timestamp') - initTimestamp) % gc.server.turnRate;
			//user check
			if (gc.userName === gc.getGlobalValue('userName')) {
				$("#a-server-name").removeClass('a-bodybox-red').addClass('bodybox');
			} else {
				$("#a-server-name").removeClass('bodybox').addClass('a-bodybox-red');
			}
			//max check
			if (gc.turns.getValue() >= gc.turns.max) {
				return;
			}
			if (delay < 0) {
				if (gc.isNewest()) {
					gc.turns.addValue(1);
				}
				if (gc.turns.getValue() < gc.turns.max) {
					window.setTimeout(function () {
						if (gc.isNewest()) {
							gc.turns.addValue(1);
						}
					}, (gc.server.turnRate - delay));
				}
			} else {
				window.setTimeout(function () {
					if (gc.isNewest()) {
						gc.turns.addValue(1);
					}
				}, delay);
			}
		}, gc.server.turnRate);
		
		var blink = true;
		var pageTitle = document.title;
		if (gc.getValue('a-turnticker-showturns')) {
			document.title = gc.turns.getValue() + ' ' + pageTitle;
		}
		//this function will launch itself once per second, to check if there shouldn't be an update, or two...
		window.setInterval(function () {

			if (gc.getValue('a-turnticker-showturns')) {
				document.title = gc.turns.getValue() + ' ' + pageTitle;
			}
			
			if (gc.isNewest() === false && gc.userName === gc.getGlobalValue('userName')) {
				gc.turns.updateEl();
				gc.power.updateEl();
				gc.food.updateEl();
				gc.cash.updateEl();
				$("a").each(function () {
					var value = $(this).attr('href');
					if (value) {
						$(this).attr('href', value.replace(/&\d\d\d\d&/, '&' + gc.getValue('antiReload') + '&'));
					}
				});
				$("form").each(function () {
					var value = $(this).attr('action');
					if (value) {
						$(this).attr('action', value.replace(/&\d\d\d\d&/, '&' + gc.getValue('antiReload') + '&'));
					}
				});
				$("input").each(function () {
					var value = this.getAttribute('onclick');
					if (value) {
						this.setAttribute('onclick', value.replace(/&\d\d\d\d&/, '&' + gc.getValue('antiReload') + '&'));
					}
				});
				
				
			}
			
			if (gc.getValue('a-turnticker-showmaxedturns') && gc.turns.getValue() === gc.turns.max) {
				if (blink) {
					document.title = gc.turns.getValue() + ' ' + pageTitle;
					blink = false;
				}
				else {
					//String copy
					document.title = (gc.turns.getValue() + '').replace(/./g, '_') + ' ' + pageTitle;
					blink = true;
				}
			}
		}, 1000);
	}
};
/**!
 * Global object containing global properties and objects
 */
(function (window) {
	//create mod control and run on-init logic
	/**
	 * @type {app.ModControl}
	 */
	window.gc = new app.ModControl({
    mods: Object.keys(app.mod).map(function(k){return app.mod[k];})
		// mods : [
		// 	app.mod.automatedcapsulelab,
		// 	app.mod.battlesmarkup,
		// 	app.mod.chathighlighter,
		// 	app.mod.clicktocontinue,
		// 	app.mod.clusterbuilder,
		// 	app.mod.credits,
		// 	app.mod.disbandertweaks,
		// 	app.mod.extramenu,
		// 	app.mod.fedchat,
		// 	app.mod.fedpms,
		// 	app.mod.forumkillfile,
		// 	app.mod.infratweak,
		// 	app.mod.researchtweak,
		// 	app.mod.keybindings,
		// 	app.mod.markettweaks,
		// 	app.mod.pagetitles,
		// 	app.mod.planetplunderer,
		// 	app.mod.presetbuilder,
		// 	app.mod.rankingtweaks,
		// 	app.mod.newbieranking,
		// 	app.mod.shipbuilder,
		// 	app.mod.stylehandler,
		// 	app.mod.tabbedpms,
		// 	app.mod.turnticker,
		// 	app.mod.commoncss
		// ]
	});
	//break execution in control failed to load
	if (gc.loaded === false) {
		return;
	}
	//append css
	$("head:first").append("<style type=\"text/css\">.a-bodybox-red{background-image:url(data:image/gif;base64,R0lGODlhMgAyAKEBALAAAP8AAP8AAP8AACH/C05FVFNDQVBFMi4wAwEAAAAh+QQEMgD/ACwAAAAAMgAyAAACM4yPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gvH8kzX9o3n+s73/g8MCofEovGITConBQAh+QQBMgABACwAAAAAMgAyAAACM4SPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gvH8kzX9o3n+s73/g8MCofEovGITConBQA7);border:1px solid #595959;color:#9EDCFE;}.a-bodybox-yellow{background-image:url(data:image/gif;base64,R0lGODlhMgAyAJEAAP//ALCwAP4BAgAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQEMgD/ACwAAAAAMgAyAAACM4SPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gvH8kzX9o3n+s73/g8MCofEovGITConBQAh+QQFMgACACwAAAAAMgAyAAACM4yPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gvH8kzX9o3n+s73/g8MCofEovGITConBQA7);border:1px solid #595959;color:#4f4f00;}.a-hidden{display:none;}.a-separator{height:10px;}.a-table{border-collapse:collapse;border-spacing:0;border-width:0 0 1px 1px;}.a-table td,.a-table th{border-width:1px 1px 0 0;margin:0;padding:1px;}.a-table,.a-table td,.a-table th{border-color:gray;border-style:solid;}#a-about{border:1px solid #595959;text-align:left;margin:5px 5px 20px;padding:4px;}.a-mod{border:1px solid #595959;list-style:none;text-align:left;margin:5px;padding:4px;}.a-mod-item{list-style-type:none;margin-left:5px;margin-top:7px;padding-left:15px;}.a-mod-item li{margin:6px;}.a-mod-item-parts{padding:0;}.a-mod-item-parts li{display:inline;margin:0;}.a-mod-item-parts-submit input{cursor:pointer;margin-left:-20px;vertical-align:middle;}.a-mod-line li{display:inline;}.a-mod-line ul{padding-left:0;margin:0;}.a-mod-submit{cursor:pointer;float:right;}.a-info-wrap{background-color:#383838;width:796px;padding:1px;border:solid 1px yellow;color:white;margin-left:auto;margin-right:auto;margin-top:2px;border-radius:4px 4px 4px 4px;}.a-info-title{font-weight:bold;color:#A4A400;width:100%;padding:3px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAADXCAYAAADFuwsIAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sJEwoLKCBHKKsAAALnSURBVGje7dtNaxNBGMDxfxLNgmmtynZ9CV2jNLQVFNQcdE85RTAeBCVnPek938VPkFM+QYkhIItzEm+iqFF8jWlqm4htM9Wqh8zUdUm0Z3l+EJaZzLM7M8/s7dkEf0oAHjANHAD2ARvmtwJsxwdbGeCUCRpnB3gL9GxHylwPAktAmsmSwGFz/WI7UsB8bBZ/cxyYscGeWRsArVbrWhiGN2w7DMMbzWazHLvBCUzQIdtTKpVm8vl8wXGcaaVUYmdn5+fCwkKgtR4EQfBAKfXVDJ0G0ikgZ6fcbrd1r9d7UiwWz3qeN++67pzWelCtVu8tLy/3Y09fT8bXWqvVet1ut23bnU7nZb1eXx2z9lQS0NEepdRN3/cvaK0HWutBLpe7GN2DiO3dbQcIgmAqm80u2alWq9V7WuuB7/uLhUIhmv9tYCthcnvW5rxcLh/OZDIpO9VKpeL2+/1vjUZjEAl+Baza9c6a07UX68CL6AnbBH6aFCT+Efga+MGYgQdM6qbimwO8Az5PejGi0sB+c4i2gS2EEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBD/n3hFcRI4AxxlVBmfBtYYlSE/Bb5OCvaAwASN8w14BDyzHbaKOgtcYXKBvx07BzjAB9uRBq4yKnzei1mzjC92jY79p9Vq3Q7D8I5th2F4p9ls3ord4ByMSqyztqdUKnn5fH7RcRxHKXXX1Okvaa2HQRAcUUqtRfZnKgVcMrtMu93e6PV6L4rF4nnP8465rjurtR6aOv1Psae/S9pAq1arvel2ux3b7nQ6H+v1+tsxa08nGX1rsUspddf3/VNa66HWepjL5U5H9yBiIwnsTicIgiPZbPaknaqp0x/6vn+yUCjMRAI3gbUEo+L26zZV5XL5eCaT2W+nWqlU/H6/P2w0GiuR4IfAc3vCFoHLe8zze+B+9ISt8vv7k8Q/AkPg+7gXwzUzcGP9m8BjzJcBk94qa8qcc8dkY23coF8WkP7lZPMGIgAAAABJRU5ErkJggg==) 777px 5px no-repeat transparent;}.a-info{padding:3px 15px 3px 3px;}.a-info-title:hover{background-position:777px -195px;}.a-loading{background:url(data:image/gif;base64,R0lGODlhDgAOAIQAAAQCBIyOjERCRBweHMzKzBQSFFxaXLSytCwuLGRmZAwKDJyanCQmJBwaHLy6vGxubAQGBJSSlFRSVCQiJPz+/BQWFFxeXLS2tDQyNGxqbAwODAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQIBgAAACwAAAAADgAOAAAFbuAmiso0QeMIVBXQMEwDsYBYwc3NVO9uw4ONprDpNUSQhiyVXFYEmFpqAyjIJAYDYyqETSQWLVfjfSKkqVVDIUxkjiOE4wA3RCIZiEQCuFAoCyISAREJDwQEDwd/ESRYGgGIAQ0LAURTCAcHCFMhACH5BAgGAAAALAAAAAAOAA4AhAQCBISGhERCRCQiJBQSFMzKzGRmZLS2tDQ2NAwKDIyOjFRSVBwaHHRydOTm5Dw+PAQGBIyKjERGRCQmJBQWFGxqbDw6PAwODJSSlFxeXBweHHx6fPz+/AAAAAAAAAAAAAVzYCeKyTBA4whQFMBMEwOxgEjBzD1R727Dms6F0OkxRBCGLJVcJhiEWqoDiRwsA9hl2qlwOI7sZDs1fB3JFheiuHYSDwFxNMBEKCJLJiOAWCwACgUFGyIIewILChgLAYMNSAgICQYYChUUGxVkKQMBAQNTIQAh+QQIBgAAACwAAAAADgAOAAAFceAmiso0QeMIVBXQMEwzLEEhVnCDM9VBUZEbbLDR2C6/hQjSaKBGCMehsVE0CoDUMhNATGAa7UZCIBy+jLCWbGa2xBAuYsN0phqZhHo3ADAmAFwRBkIxGAYWGAkRERIiKw0AAhYGAhoGEk8pFRISFVohACH5BAgGAAAALAAAAAAOAA4AhAQCBISGhERCRCQiJBQSFMzKzGRmZLS2tDQ2NAwKDIyOjFRSVBwaHHRydOTm5Dw+PAQGBIyKjERGRCQmJBQWFGxqbDw6PAwODJSSlFxeXBweHHx6fPz+/AAAAAAAAAAAAAVwYCeKj+NY4whQFHBw3EFt1SVS08REcBQVhcYtx0gYKhAMcCOCMIopjSJA6SQYBECquTBMBjnb1oLBBMATcYpsdra2HUh3EH9CUoTHIzGcaDoXNgIZGSgdODoEORSDGQgiKwwADEQJCAh3WwkDA3wpIQAh+QQIBgAAACwAAAAADgAOAAAFc+AmithxYeNYBMsQEERQSJIiBhR1PHCWRBGJaJFzAGiAX8QgGhwciFQjkShsFI0CICWCYASVCYOh4W4mFoNETDYzDBYJpFHZcgHfymbegKTmFX4bFWMDGxplA2MNIoQMWWMVDYsiAJIAk4+YWmYKExM2KSEAIfkECAYAAAAsAAAAAA4ADgCEBAIEhIaEREJEJCIkFBIUzMrMZGZktLa0NDY0DAoMjI6MVFJUHBocdHJ05ObkPD48BAYEjIqMREZEJCYkFBYUbGpsPDo8DA4MlJKUXF5cHB4cfHp8/P78AAAAAAAAAAAABXFgJ4pDEAzjeDUNVWGYkVgIJDZFES0KtjyZDEK0ySkgNIggaBFRAgqUSvBIdB6HiC3VAVAYEAeHY+B2LpPJQEw2E9IDrNYMIDCsAIZmK0owGABOaRpnFx0MaRQiiBMMbxNfaQwidYCMlgSBXAkDA1YpIQAh+QQIBgAAACwAAAAADgAOAAAFc+AmipUkVeOoSIYmWIYAVRUgSkGUYDDWMAzUxhCJZACMCWAAbIg0iYRQBBk0bIjAA5ISAQoNyIVAkHQ3GuDkQDZ308lshtv9NhSbwcGBSEEaYSILFBQOaBp5QEIBhAcFij8MThsFEQuATQANBTZdEEl4KSEAIfkECAYAAAAsAAAAAA4ADgCEBAIEhIaEREJEJCIkFBIUzMrMZGZktLa0NDY0DAoMjI6MVFJUHBocdHJ05ObkPD48BAYEjIqMREZEJCYkFBYUbGpsPDo8DA4MlJKUXF5cHB4cfHp8/P78AAAAAAAAAAAABXJgJ4rJMEDjCCFWQk0TA1EUICJZ9rwTxcAUkSWzkHQIic4vRnoICCkIQ9YZGBaoVAdAkAUwGIu2c4ENvgqxtjwxXbMpgC9JiWAG0amtsykUFBAGBhAaQCINfgEKHBwKSwwkFRsUB4wHAAwEeykWDg5qIyEAOw==) no-repeat right top;}#a-authentication-token{width:228px;}.no-blue-image{background-image:none;}#a-logappender{float:left;left:10px;overflow:hidden;width:100%;}#a-logappender-wrap{bottom:0;left:0;overflow:auto;position:fixed;width:380px;}.a-battlesmarkup-ship{width:383px!important;list-style:none;padding-left:5px;margin:5px;}.a-battlesmarkup-ship-lost{width:60px!important;color:#faa;}.a-battlesmarkup-ship-amount{width:60px!important;}.a-battlesmarkup-ship-name{width:202px!important;}.a-battlesmarkup-ship-remaining{width:60px!important;color:#afa;}ul.a-battlesmarkup-ship>li{display:inline;float:left;width:50px;}.a-clusterbuilder-button{border:1px solid gray;padding:3px;}#a-credits-text{margin-top:5px;}#a-fedpms-iframe{color:#FFF;filter:alpha(opacity=0);height:0;opacity:0;width:0;}.a-forumkillfile-hidden{display:none;}button.fuse{display:inline-block;font-size:.8em;margin:0 1px;padding:0;}.stock-full-true{background-color:#611!important;}.highlighted-ingredient{background-color:#353!important;}.highlighted-result{background-color:#335!important;}.highlighted-shared-ingredient a{border-left:4px solid #8F3!important;padding-left:.4em;}.highlighted-shared-result a{border-bottom:2px solid #83F!important;}button{background:#2c375a none repeat scroll 0 0;border:1px solid #ffbf00;color:#ababab;font-family:Arial,Helvetica,sans-serif;font-size:11px;}#a-presetbuilder-wrap{position:fixed;width:300px;}#a-presetbuilder-save-infobox{background-color:#000;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAK8AAACvABQqw0mAAAACF0RVh0U29mdHdhcmUATWFjcm9tZWRpYSBGaXJld29ya3MgMy4w72kx8AAAAQNJREFUeJzt0TENACEAwMDnpWAF96hiRgEd7hQ06Vhz7I+M/3UAN0NiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIk52jsB+O+6+asAAAAASUVORK5CYII=);border:1px solid #C46200;color:#FFF;display:block;filter:alpha(opacity=85);font-size:xx-small;left:5px;opacity:.85;position:fixed;text-align:left;top:5px;width:252px;padding:4px;}#a-presetbuilder-totals-body td{border-top:1px solid #C46200;}#a-presetbuilder-saves td{text-align:center;width:10%;}.a-shipbuilder-actionsrow{font-size:xx-small;height:25px;}.a-rankingtweaks-bloodwar-ally{color:#0f0;}.a-rankingtweaks-bloodwar-enemy{color:red;}.a-rankingtweaks-bloodwar-neutral{color:#00f;}.a-rankingtweaks-fedtag{font-size:x-small;padding-left:3px;}.a-rankingtweaks-statustag{font-size:x-small;font-style:italic;padding-left:3px;}#a-shipbuilder-save-infobox{background-color:#000;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAK8AAACvABQqw0mAAAACF0RVh0U29mdHdhcmUATWFjcm9tZWRpYSBGaXJld29ya3MgMy4w72kx8AAAAQNJREFUeJzt0TENACEAwMDnpWAF96hiRgEd7hQ06Vhz7I+M/3UAN0NiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIk52jsB+O+6+asAAAAASUVORK5CYII=);border:1px solid #C46200;color:#FFF;display:block;filter:alpha(opacity=85);font-size:xx-small;left:5px;opacity:.85;position:fixed;text-align:left;top:5px;width:252px;padding:4px;}#a-shipbuilder-saves td{text-align:center;width:10%;}.a-shipbuilder-actionsrow{font-size:xx-small;height:25px;}.a-property{background-color:#000;border:1px solid #FF0;filter:alpha(opacity=85);height:38px;opacity:.85;position:fixed;margin:2px;padding:2px;}.a-property-close{background-color:#FFF;float:right;font-size:9px;}.a-property-restore{background-color:#FFF;font-size:9px;}</style>");

	//run mods
	gc.runMods();
})(window);
