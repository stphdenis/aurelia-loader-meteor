'use strict';

System.register(['aurelia-metadata', 'aurelia-loader', 'aurelia-pal', './meteor-require'], function (_export, _context) {
  "use strict";

  var Origin, Loader, DOM, PLATFORM, meteorRequire, TextTemplateLoader, MeteorLoader;

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  

  function ensureOriginOnExports(executed, name) {
    var target = executed;
    var key = void 0;
    var exportedValue = void 0;

    if (target.__useDefault) {
      target = target.default;
    }

    Origin.set(target, new Origin(name, 'default'));

    for (key in target) {
      exportedValue = target[key];

      if (typeof exportedValue === 'function') {
        Origin.set(exportedValue, new Origin(name, key));
      }
    }

    return executed;
  }

  return {
    setters: [function (_aureliaMetadata) {
      Origin = _aureliaMetadata.Origin;
    }, function (_aureliaLoader) {
      Loader = _aureliaLoader.Loader;
    }, function (_aureliaPal) {
      DOM = _aureliaPal.DOM;
      PLATFORM = _aureliaPal.PLATFORM;
    }, function (_meteorRequire) {
      meteorRequire = _meteorRequire.meteorRequire;
    }],
    execute: function () {
      _export('TextTemplateLoader', TextTemplateLoader = function () {
        function TextTemplateLoader() {
          
        }

        TextTemplateLoader.prototype.loadTemplate = function loadTemplate(loader, entry) {
          return loader.loadText(entry.address).then(function (text) {
            entry.template = DOM.createTemplateFromMarkup(text);
          });
        };

        return TextTemplateLoader;
      }());

      _export('TextTemplateLoader', TextTemplateLoader);

      _export('MeteorLoader', MeteorLoader = function (_Loader) {
        _inherits(MeteorLoader, _Loader);

        function MeteorLoader() {
          

          var _this = _possibleConstructorReturn(this, _Loader.call(this));

          _this.moduleRegistry = Object.create(null);
          _this.loaderPlugins = Object.create(null);
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

          PLATFORM.eachModule = function (callback) {
            var registry = _this.moduleRegistry;

            for (var key in registry) {
              try {
                if (callback(key, registry[key])) return;
              } catch (e) {
                undefined;
              }
            }
          };
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
                resolve(meteorRequire(path));
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
          return this._import(url).then(function (result) {
            if (result instanceof Array && result[0] instanceof Array && result.hasOwnProperty('toString')) {
              return result.toString();
            }

            return result;
          });
        };

        MeteorLoader.prototype.applyPluginToUrl = function applyPluginToUrl(url, pluginName) {
          return pluginName + '!' + url;
        };

        MeteorLoader.prototype.addPlugin = function addPlugin(pluginName, implementation) {
          this.loaderPlugins[pluginName] = implementation;
        };

        return MeteorLoader;
      }(Loader));

      _export('MeteorLoader', MeteorLoader);

      PLATFORM.Loader = MeteorLoader;
    }
  };
});