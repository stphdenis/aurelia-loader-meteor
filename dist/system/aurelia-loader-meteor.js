'use strict';

System.register(['./impl'], function (_export, _context) {
  "use strict";

  var TextTemplateLoader, MeteorLoader;
  return {
    setters: [function (_impl) {
      TextTemplateLoader = _impl.TextTemplateLoader;
      MeteorLoader = _impl.MeteorLoader;
    }],
    execute: function () {
      _export('TextTemplateLoader', TextTemplateLoader);

      _export('MeteorLoader', MeteorLoader);
    }
  };
});