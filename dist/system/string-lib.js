"use strict";

System.register([], function (_export, _context) {
  "use strict";

  return {
    setters: [],
    execute: function () {
      function toUpperFirst(str) {
        return str[0].toUpperCase() + str.slice(1);
      }

      _export("toUpperFirst", toUpperFirst);

      function toCamelCase(str) {
        return str.toString().replace(/[- ][a-z]/g, function (car) {
          return car[1].toUpperCase();
        });
      }

      _export("toCamelCase", toCamelCase);

      function toUpperCamelCase(str) {
        return toUpperFirst(toCamelCase(str));
      }

      _export("toUpperCamelCase", toUpperCamelCase);
    }
  };
});