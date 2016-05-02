export function meteorRequire(name) {
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
        try { // path = module-name/sub-module-name
          const names = name.split('/'); // names[0] = module-name, names[1] = sub-module-name
          const mainPath = require(names[0] + '/package.json').main; // mainPath = "path/to/module-name.js"
          const pathTo = mainPath.substr(0, mainPath.lastIndexOf('/')); // pathTo = "path/to"
          result = require(`${names[0]}/${pathTo}/${names[1]}`); // require("module-name/path/to/sub-module-name")
        // result = require(names[0] + '/dist/commonjs/' + names[1]);
        } catch (e4) {
          console.debug(`aurelia-loader-meteor/meteorRequire: error requiring module ${name}`);
        }
      }
    }
  }
  if(result.textContent) {
    result = `/* "${name}" -> Aurelia don\'t have to load it as Meteor shoul\'d have done the job */`;
  }
  return result;
}
