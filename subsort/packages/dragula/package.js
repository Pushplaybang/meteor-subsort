Package.describe({
  name: 'dragula:dragula',
  version: '0.0.1',
  summary: 'Drag and drop so simple it hurts, Also for Meteor.',
  git: 'https://github.com/bevacqua/dragula',
  documentation: 'bower_componentts/dragula.js/readme.markdown'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');
  api.use('meteor');
  api.addFiles([
    "bower_components/dragula.js/dist/dragula.css",
    "bower_components/dragula.js/dist/dragula.js",
    "export.js"
  ], 'client');

  api.export('dragula');
});

