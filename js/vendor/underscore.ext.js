(function () {
  'use strict';

  var root = this;
  var global = window;
  var _ = global._;

  var slice    = Array.prototype.slice;
  var toString = Object.prototype.toString;

  var _e = {
    fail: function (msg) { throw new Error(msg); },
    warn: function (msg) { console.log(['WARN:', msg].join(' ')); },
    info: function (msg) { console.log(['INFO:', msg].join(' ')); },

    existy: function (x) { return x != null; },
    truthy: function (x) { return (x !== false) && this.existy(x); },

    cat: function () {
      var head = _.first(arguments);
      if (_e.existy(head)) {
        return head.concat.apply(head, _.rest(arguments));
      } else {
        return [];
      }
    },

    construct: function (head, tail) {
      return _e.cat([head], _.toArray(tail));
    },

    doWhen: function (cond, action) {
      if(this.truthy(cond)) {
        return action();
      } else {
        return undefined;
      }
    },

    invoker: function (name, func) {
      return function (obj /*, args */) {
        if (!_e.existy(obj)) {
          _e.fail('Must provide a target');
        }
        var targetMethod = obj[name];
        var args = _.rest(arguments);

        return _e.doWhen((_e.existy(targetMethod) && func === targetMethod),
            function () {
          return targetMethod.apply(obj, args);
        });
      };
    },
    // objSum
    // aryConcat
    // func
    // prop
    // lazyPipeline
    dispatch: function (/* funs */) {
      var funcs = _.toArray(arguments);
      var size = funcs.length;

      return function (target /*, args */) {
        var ret;
        var args = _.rest(arguments);

        for (var funIndex = 0; funIndex < size; funIndex++) {
          var fun = funcs[funIndex];
          ret = fun.apply(fun, _e.construct(target, args));
          if (_e.existy(ret)) {
            return ret;
          }
        }
        return ret;
      };
    },

    /**
     * Get a value from an object, whether it is a property or a function.
     *
     * @method getValue
     * @return {String} The value of the object.
     */
    getValue: function (object, prop) {
      if (!(object && object[prop])) {
        return null;
      }
      return _.isFunction(object[prop]) ? object[prop]() : object[prop];
    },

    /**
     * Creates a new namespace object in a 'safe' way
     *
     * @method namespace
     * @return {Object} The new namespaced object.
     */
    namespace: function (nsString) {
      var object = this,
          levels = nsString.split('.');

      // strip redundant leading global
      if (levels[0] === 'Wooga') {
        levels = levels.slice(1);
      }

      _.each(levels, function (level) {
        if (typeof object[level] === 'undefined') {
          object[level] = {};
        }
        object = object[level];
      });

      return object;
    }
  };

  // Exporting

  // CommonJS module is defined
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = _e;
    }
    exports._e = _e;
  }

  // Register as a named module with AMD.
  if (typeof define === 'function' && define.amd) {
    define('underscore.ext', [], function () { return _e; });
  }

  // Integrate with Underscore.js if defined
  // or create our own underscore object.
  // _.extend(root._, _e);
  _.ext = _e;
}).call(this);
