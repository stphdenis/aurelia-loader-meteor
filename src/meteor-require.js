import { toCamelCase } from 'to-camel-case';

export function meteorRequire(path) {
  const name = path;
  let result;
  try {
    result = require(`/${name}`);
  } catch (e) {
    const names = name.split('/');
    result = require(names[0]);
    for (let i = 1; i < names.length; i++) {
      result = result[toCamelCase(names[i])];
    }
  }
  return result;
}
