"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toUpperFirst = toUpperFirst;
exports.toCamelCase = toCamelCase;
exports.toUpperCamelCase = toUpperCamelCase;
function toUpperFirst(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function toCamelCase(str) {
  return str.toString().replace(/[- ][a-z]/g, function (car) {
    return car[1].toUpperCase();
  });
}

function toUpperCamelCase(str) {
  return toUpperFirst(toCamelCase(str));
}