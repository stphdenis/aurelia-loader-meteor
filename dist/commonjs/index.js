'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _aureliaLoaderMeteor = require('./aurelia-loader-meteor');

Object.keys(_aureliaLoaderMeteor).forEach(function (key) {
  if (key === "default") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _aureliaLoaderMeteor[key];
    }
  });
});