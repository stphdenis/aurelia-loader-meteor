import {Origin} from 'aurelia-metadata';
import {Loader} from 'aurelia-loader';
import {DOM,PLATFORM} from 'aurelia-pal';

export function toUpperFirst(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

export function toCamelCase(str: string): string {
  return str.toString().replace(/[- ][a-z]/g, (car) => car[1].toUpperCase());
}

export function toUpperCamelCase(str: string): string {
  return toUpperFirst(toCamelCase(str));
}

export function meteorRequire(name: string): any {
  let result;
  try {
    result = require(`${name}`);
  } catch (e1) {
    try {
      result = require(`/${name}`);
    } catch (e2) {
      try {
        result = require(`/${name}.ts`);
      } catch (e3) {
        const names = name.split('/');                                // names[0] = module-name, names[1] = sub-module-name
        try {                                                           // path = module-name/sub-module-name
          const mainPath = require(names[0] + '/package.json').main;    // mainPath = "path/to/module-name.js"
          const pathTo = mainPath.substr(0, mainPath.lastIndexOf('/')); // pathTo = "path/to"
          result = require(`${names[0]}/${pathTo}/${names[1]}`);        // require("module-name/path/to/sub-module-name")
        } catch (e4) {
          try {
            result = require(names[0])[toUpperCamelCase(names[1])];
          } catch (e5) {
            if (e1.message.startsWith('Cannot find module')) {
              if (e2.message.startsWith('Cannot find module')) {
                if (e3.message.startsWith('Cannot find module')) {
                  if (e4.message.startsWith('Cannot find module')) {
                    result = e5.message;
                  } else {
                    result = e4.message;
                  }
                } else {
                  result = e3.message;
                }
              } else {
                result = e2.message;
              }
            } else {
              result = e1.message;
            }
            const errorMessage = `aurelia-loader-meteor: error requiring module '${name}' : ${result}`;
            console.error(errorMessage);
            if (name.endsWith('.html')) {
              result = '<template>' + errorMessage + '</template>';
            } else {
              result = undefined;
            }
          }
        }
      }
    }
  }
  if (result instanceof HTMLElement) {
    result = `/* "${name}" -> Aurelia don\'t have to load it as Meteor should have done the job */`;
  }
  return result;
}

// !!! import added !!!

/**
* An implementation of the TemplateLoader interface implemented with text-based loading.
*/
export class TextTemplateLoader {
  /**
  * Loads a template.
  * @param loader The loader that is requesting the template load.
  * @param entry The TemplateRegistryEntry to load and populate with a template.
  * @return A promise which resolves when the TemplateRegistryEntry is loaded with a template.
  */
  loadTemplate(loader, entry) {
    return loader.loadText(entry.address).then(text => {
      entry.template = DOM.createTemplateFromMarkup(text);
    });
  }
}

function ensureOriginOnExports(executed, name) {
  let target = executed;
  let key;
  let exportedValue;

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

/**
* A default implementation of the Loader abstraction which works with webpack (extended common-js style).
*/
export class MeteorLoader extends Loader { // !!! class renamed !!!
  constructor() {
    super();

    this.moduleRegistry = Object.create(null);
    this.loaderPlugins = Object.create(null);
    this.useTemplateLoader(new TextTemplateLoader());

    let that = this;

    this.addPlugin('template-registry-entry', {
      'fetch': function(address) {
        let entry = that.getOrCreateTemplateRegistryEntry(address);
        return entry.templateIsLoaded ? entry : that.templateLoader.loadTemplate(that, entry).then(x => entry);
      }
    });

    PLATFORM.eachModule = callback => {
      let registry = this.moduleRegistry;

      for (let key in registry) {
        try {
          if (callback(key, registry[key])) return;
        } catch (e) { undefined; }
      }
    };
  }

  _import(moduleId) {
    const moduleIdParts = moduleId.split('!');
    const path = moduleIdParts.splice(moduleIdParts.length - 1, 1)[0];
    const loaderPlugin = moduleIdParts.length === 1 ? moduleIdParts[0] : null;

    return new Promise((resolve, reject) => {
      try {
        if (loaderPlugin) {
          resolve(this.loaderPlugins[loaderPlugin].fetch(path));
        } else {
          resolve(meteorRequire(path)); // !!! block replaced !!!
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
  * Maps a module id to a source.
  * @param id The module id.
  * @param source The source to map the module to.
  */
  map(id, source) {

  }

  /**
  * Normalizes a module id.
  * @param moduleId The module id to normalize.
  * @param relativeTo What the module id should be normalized relative to.
  * @return The normalized module id.
  */
  normalizeSync(moduleId, relativeTo) {
    return moduleId;
  }

  /**
  * Normalizes a module id.
  * @param moduleId The module id to normalize.
  * @param relativeTo What the module id should be normalized relative to.
  * @return The normalized module id.
  */
  normalize(moduleId, relativeTo) {
    return Promise.resolve(moduleId);
  }

  /**
  * Instructs the loader to use a specific TemplateLoader instance for loading templates
  * @param templateLoader The instance of TemplateLoader to use for loading templates.
  */
  useTemplateLoader(templateLoader) {
    this.templateLoader = templateLoader;
  }

  /**
  * Loads a collection of modules.
  * @param ids The set of module ids to load.
  * @return A Promise for an array of loaded modules.
  */
  loadAllModules(ids) {
    let loads = [];

    for (let i = 0, ii = ids.length; i < ii; ++i) {
      loads.push(this.loadModule(ids[i]));
    }

    return Promise.all(loads);
  }

  /**
  * Loads a module.
  * @param id The module id to normalize.
  * @return A Promise for the loaded module.
  */
  loadModule(id) {
    let existing = this.moduleRegistry[id];
    if (existing) {
      return Promise.resolve(existing);
    }

    return new Promise((resolve, reject) => {
      try {
        this._import(id).then(m => {
          this.moduleRegistry[id] = m;
          resolve(ensureOriginOnExports(m, id));
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
  * Loads a template.
  * @param url The url of the template to load.
  * @return A Promise for a TemplateRegistryEntry containing the template.
  */
  loadTemplate(url) {
    return this._import(this.applyPluginToUrl(url, 'template-registry-entry'));
  }

  /**
  * Loads a text-based resource.
  * @param url The url of the text file to load.
  * @return A Promise for text content.
  */
  loadText(url) {
    return this._import(url).then(result => {
      if (result instanceof Array && result[0] instanceof Array && result.hasOwnProperty('toString')) {
        // we're dealing with a file loaded using the css-loader:
        return result.toString();
      }

      return result;
    });
  }

  /**
  * Alters a module id so that it includes a plugin loader.
  * @param url The url of the module to load.
  * @param pluginName The plugin to apply to the module id.
  * @return The plugin-based module id.
  */
  applyPluginToUrl(url, pluginName) {
    return `${pluginName}!${url}`;
  }

  /**
  * Registers a plugin with the loader.
  * @param pluginName The name of the plugin.
  * @param implementation The plugin implementation.
  */
  addPlugin(pluginName, implementation) {
    this.loaderPlugins[pluginName] = implementation;
  }
}

PLATFORM.Loader = MeteorLoader; // !!! class renamed !!!
