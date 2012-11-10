/**
 * Module dependencies
 */

var fs = require('fs'),
    path = require('path'),
    join = path.join,
    Builder = require('component-builder');

module.exports = function(dir) {
  var conf = require(join(dir, 'component.json')),
      build = join(dir, 'build'),
      builder = new Builder(dir);

  builder.addLookup(conf.paths);
  builder.development();
  builder.prefixUrls('./');
  builder.copyAssetsTo(build);

  return function(req, res, next) {
    var js = fs.createWriteStream(path.join(build, 'build.js')),
        css = fs.createWriteStream(path.join(build, 'build.css')),
        builder = new Builder(dir),
        pending = 2;

    builder.addLookup(conf.paths);
    builder.development();
    builder.prefixUrls('./');
    builder.copyAssetsTo(build);

    builder.build(function(err, build) {
      if(err) return next(err);
      css.write(build.css);
      js.write(build.require);
      js.write(build.js);
      css.on('error', next);
      js.on('error', next);

      css.end(done);
      js.end(done);
    });

    function done() {
      if(!--pending) return next();
    }
  };
};
