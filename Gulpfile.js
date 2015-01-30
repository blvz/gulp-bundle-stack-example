var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var logger = require('gulp-logger');
var rename = require('gulp-rename');
var cond = require('gulp-cond');
var path = require('path');
var mergeStream = require('merge-stream');
var glob = require('glob');
var _ = require('lodash');

var stack = [
  { file: './src/lib-deprecated.js' },
  {
    file: './src/lib.js',
    options: { transforms: ['brfs'] }
  },
  {
    file: './src/lib-edge.js',
    options: { sourcemaps: true }
  }
];

gulp.task('build', function() {
  bundleStack(stack)
  .pipe(gulp.dest('./dist'))
  .pipe(logger({after: 'done'}));
});

gulp.task('watch', function() {
  bundleStack(stack, {watch: true, sourcemaps: true})
  .pipe(gulp.dest('./dist'))
  .pipe(logger({after: 'done'}));
});

gulp.task('simple', function() {
  bundleStack(glob.sync('./src/*.js'))
  .pipe(gulp.dest('./dist'))
  .pipe(logger({after: 'done'}));
});

function bundleStack(stack, opts) {
  return mergeStream.apply(null,
    stack.map(function(obj) {
      if (typeof obj == 'string') obj = {file: obj, opts: {}};
      return bundleFile(obj.file, _.merge(obj.options || {}, opts));
    })
  );
}

// See also: https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md

function bundleFile(jsFile, opts) {
  opts = opts || {};
  var bundler = opts.watch
                ? watchify(browserify(jsFile, _.merge(opts, watchify.args)))
                : browserify(jsFile, opts);
  var basename = path.basename(jsFile);

  // add any other browserify options or transforms here
  if (opts.transforms) {
    opts.transforms.forEach(function(t) {
      bundler.transform(t);
    });
  }

  bundler.on('update', bundle); // on any dep update, runs the bundler

  function bundle() {
    return bundler.bundle()
      // log errors if they happen
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source(basename))
      .pipe(logger({before: 'bundling...'}))
      // optional, remove if you dont want sourcemaps
        .pipe(cond(opts.sourcemaps, buffer()))
        .pipe(cond(opts.sourcemaps, sourcemaps.init({loadMaps: true}))) // loads map from browserify file
        .pipe(cond(opts.sourcemaps, sourcemaps.write('./'))); // writes .map file
      //
  }
  return bundle();
}
