export function toCamelCase(str) {
  const t = str.replace(/(?:^|\.?)(_.-)/g, function(x, y) {return y.toUpperCase()[1]});
  return t.charAt(0).toUpperCase() + t.substr(1);
}
