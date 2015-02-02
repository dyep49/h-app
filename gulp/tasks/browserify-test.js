var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var gStreamify = require('gulp-streamify');
var size = require('gulp-size');

module.exports = function() {
  gulp.task('browserify-test', function() {
    var opts = {
      entries: ['./test/spec/client/index.js'],
      debug: true
    }

    var bundle = browserify(opts);

    return bundle
      .bundle()
      .pipe(source('client-test.js'))
      // .pipe((gStreamify(uglify())))
      .pipe(gulp.dest('./test/spec/client/build'))
      .pipe((gStreamify(size())))
      
  })
}