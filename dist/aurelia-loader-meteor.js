'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MeteorLoader = exports.TextTemplateLoader = undefined;

var _aureliaMetadata = require('aurelia-metadata');

var _aureliaLoader = require('aurelia-loader');

var _aureliaPal = require('aurelia-pal');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TextTemplateLoader = exports.TextTemplateLoader = function () {
  function TextTemplateLoader() {
    _classCallCheck(this, TextTemplateLoader);
  }

  TextTemplateLoader.prototype.loadTemplate = function loadTemplate(loader, entry) {
    return loader.loadText(entry.address).then(function (text) {
      entry.template = _aureliaPal.DOM.createTemplateFromMarkup(text);
    });
  };

  return TextTemplateLoader;
}();

function ensureOriginOnExports(executed, name) {
  var target = executed;
  var key = void 0;
  var exportedValue = void 0;

  if (target && target.__useDefault) {
    target = target.default;
  }

  _aureliaMetadata.Origin.set(target, new _aureliaMetadata.Origin(name, 'default'));

  for (key in target) {
    exportedValue = target[key];

    if (typeof exportedValue === 'function') {
      _aureliaMetadata.Origin.set(exportedValue, new _aureliaMetadata.Origin(name, key));
    }
  }

  return executed;
}

function toCamelCase(str) {
  var t = str.replace(/(?:^|\.?)(_.-)/g, function(x, y) {return y.toUpperCase()[1]});
  return t.charAt(0).toUpperCase() + t.substr(1);
}

function requireMeteor(path) {
  var name = path;
  var result;
  try {
    result = require('/' + name);
  } catch (e) {
    try {
      result = require('/' + name + '.ts');
    } catch (e) {
      var names = name.split('/');
      result = require(names[0]);
      for (var i = 1; i < names.length; i++) {
        result = result[toCamelCase(names[i])];
      }
    }
  }
  return result;
}

var MeteorLoader = exports.MeteorLoader = function (_Loader) {
  _inherits(MeteorLoader, _Loader);

  function MeteorLoader() {
    _classCallCheck(this, MeteorLoader);

    var _this = _possibleConstructorReturn(this, _Loader.call(this));

    _this.moduleRegistry = {};
    _this.loaderPlugins = {};
    _this.useTemplateLoader(new TextTemplateLoader());

    var that = _this;

    _this.addPlugin('template-registry-entry', {
      'fetch': function fetch(address) {
        var entry = that.getOrCreateTemplateRegistryEntry(address);
        return entry.templateIsLoaded ? entry : that.templateLoader.loadTemplate(that, entry).then(function (x) {
          return entry;
        });
      }
    });
    return _this;
  }


  MeteorLoader.prototype._import = function _import(moduleId) {
    var _this2 = this;

    var moduleIdParts = moduleId.split('!');
    var path = moduleIdParts.splice(moduleIdParts.length - 1, 1)[0];
    var loaderPlugin = moduleIdParts.length === 1 ? moduleIdParts[0] : null;

    return new Promise(function (resolve, reject) {
      try {
        if (loaderPlugin) {
          resolve(_this2.loaderPlugins[loaderPlugin].fetch(path));
        } else {
          resolve(requireMeteor(path));
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  MeteorLoader.prototype.map = function map(id, source) {};

  MeteorLoader.prototype.normalizeSync = function normalizeSync(moduleId, relativeTo) {
    return moduleId;
  };

  MeteorLoader.prototype.normalize = function normalize(moduleId, relativeTo) {
    return Promise.resolve(moduleId);
  };

  MeteorLoader.prototype.useTemplateLoader = function useTemplateLoader(templateLoader) {
    this.templateLoader = templateLoader;
  };

  MeteorLoader.prototype.loadAllModules = function loadAllModules(ids) {
    var loads = [];

    for (var i = 0, ii = ids.length; i < ii; ++i) {
      loads.push(this.loadModule(ids[i]));
    }

    return Promise.all(loads);
  };

  MeteorLoader.prototype.loadModule = function loadModule(id) {
    var _this3 = this;

    var existing = this.moduleRegistry[id];
    if (existing) {
      return Promise.resolve(existing);
    }

    return new Promise(function (resolve, reject) {
      try {
        _this3._import(id).then(function (m) {
          _this3.moduleRegistry[id] = m;
          resolve(ensureOriginOnExports(m, id));
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  MeteorLoader.prototype.loadTemplate = function loadTemplate(url) {
    return this._import(this.applyPluginToUrl(url, 'template-registry-entry'));
  };

  MeteorLoader.prototype.loadText = function loadText(url) {
    return this._import(url);
  };

  MeteorLoader.prototype.applyPluginToUrl = function applyPluginToUrl(url, pluginName) {
    return pluginName + '!' + url;
  };

  MeteorLoader.prototype.addPlugin = function addPlugin(pluginName, implementation) {
    this.loaderPlugins[pluginName] = implementation;
  };

  return MeteorLoader;
}(_aureliaLoader.Loader);

_aureliaPal.PLATFORM.Loader = MeteorLoader;

_aureliaPal.PLATFORM.eachModule = function (callback) {};
