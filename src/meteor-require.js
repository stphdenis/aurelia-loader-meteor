import { toUpperCamelCase } from './string-lib';

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
