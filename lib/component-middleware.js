var Builder = require('component-builder'),
    fs = require('fs'),
    path = require('path'),
    mkdir = require('mkdirp').sync,
    join = path.join,
    parse = require('url').parse;

/**
 * component-builder middleware
 * @param  {string} dir - directory to build
 * @api public
 */
module.exports = function(dir, opts) {
  opts = opts || {};
  var build = join(dir, opts.out || 'build');
  
  // mkdir -p
  mkdir(build);
  
  // Return the middleware
  return function(req, res, next) {
    if(!directory(req)) return next();
    var path = join(dir, req.url),
        json = join(path, 'component.json');

    if(!fs.existsSync(join(path, 'component.json'))) {
      path = join(path, '..');
      if(!fs.existsSync(join(path, 'component.json'))) {
        return next(new Error('Could not find component.json'));
      }
    }
    
    var builder = new Builder(path),
        js = fs.createWriteStream(join(build, 'build.js')),
        css = fs.createWriteStream(join(build, 'build.css')),
        pending = 2;

    // Overwrite for now...
    builder.name = '.';

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

function directory(req) {
  var path = parse(req.originalUrl).pathname;
  return (path[path.length - 1] === '/');
}