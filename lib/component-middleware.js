/**
 * Module dependencies
 */

var fs = require('fs'),
    path = require('path'),
    join = path.join,
    Builder = require('component-builder');

module.exports = function(dir) {
  var json = join(dir, 'component.json'),
      conf = require(json),
      build = join(dir, 'build'),
      mtime;

  return function(req, res, next) {

    fs.stat(json, function(err, stats) {
      if(err) return next(err);

      // Only recompile if component.json has been modified
      if(mtime && stats.mtime <= mtime) return next();
      mtime = stats.mtime;

      var js = fs.createWriteStream(path.join(build, 'build.js')),
          css = fs.createWriteStream(path.join(build, 'build.css')),
          builder = new Builder(dir),
          pending = 2;

      builder.addLookup(conf.paths);
      builder.development();
      builder.prefixUrls(dir);
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
    });
  };
};
