import { Origin } from 'aurelia-metadata';
import { Loader } from 'aurelia-loader';
import { DOM, PLATFORM } from 'aurelia-pal';

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
    const entryToLoad = entry;
    return loader.loadText(entryToLoad.address).then(text => {
      entryToLoad.template = DOM.createTemplateFromMarkup(text);
    });
  }
}


function ensureOriginOnExports(executed, name) {
  let target = executed;
  let key;
  let exportedValue;

  if (target && target.__useDefault) {
    target = target.default;
  }

  Origin.set(target, new Origin(name, 'default'));

  for (key in target) {
    // if (target.hasOwnProperty(key)) {
    exportedValue = target[key];

    if (typeof exportedValue === 'function') {
      Origin.set(exportedValue, new Origin(name, key));
    }
    // }
  }

  return executed;
}

function toCamelCase(str) {
  const t = str.replace(/(?:^|\.?)(_.-)/g, (x, y) => y.toUpperCase()[1]);
  return t.charAt(0).toUpperCase() + t.substr(1);
}

/**
* A default implementation of the Loader abstraction which works with webpack
* (extended common-js style).
*/
export class MeteorLoader extends Loader {

  constructor() {
    super();

    this.moduleRegistry = {};
    this.loaderPlugins = {};
    this.useTemplateLoader(new TextTemplateLoader());

    const that = this;

    this.addPlugin('template-registry-entry', {
      fetch: (address) => {
        const entry = that.getOrCreateTemplateRegistryEntry(address);
        return entry.templateIsLoaded
          ? entry
          : that.templateLoader.loadTemplate(that, entry).then(() => entry);
      },
    });
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
          // const result = require(`aurelia-loader-context/${path}`);
          const name = path;// .substr(this.baseURL.length);
          let result;
          try {
            result = require(`/${name}`);
          } catch (e) {
            const names = name.split('/');
            result = require(names[0]);
            for (let i = 1; i < names.length; i++) {
              const camelName = toCamelCase(names[i]);
              result = result[camelName];
            }
          }
          resolve(result);
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
    const loads = [];

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
    const existing = this.moduleRegistry[id];
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
    return this._import(url);
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

PLATFORM.Loader = MeteorLoader;

PLATFORM.eachModule = function eachModule(callback) {};
