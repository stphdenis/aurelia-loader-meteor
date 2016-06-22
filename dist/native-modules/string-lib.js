export function toUpperFirst(str) {
  return str[0].toUpperCase() + str.slice(1);
}

export function toCamelCase(str) {
  return str.toString().replace(/[- ][a-z]/g, function (car) {
    return car[1].toUpperCase();
  });
}

export function toUpperCamelCase(str) {
  return toUpperFirst(toCamelCase(str));
}