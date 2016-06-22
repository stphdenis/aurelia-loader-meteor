define(['exports', './aurelia-loader-meteor'], function (exports, _aureliaLoaderMeteor) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_aureliaLoaderMeteor).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _aureliaLoaderMeteor[key];
      }
    });
  });
});