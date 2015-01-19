var gulp = require('gulp');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');

module.exports = function() {
  gulp.task('test', function() {
    return gulp.src(['./test/spec/**/*.js'], {
      read: false,
      globals: {
        COMMON_MODULE: require('./../../test/spec_helper.js')()
      }
    })
      .pipe(cover.instrument({
          pattern: ['./libs/**/*.js', './app/models/**/*.js', './app/controllers/**/*.js'],
          debugDirectory: 'debug'
      }))
      .pipe(mocha())
      .pipe(cover.report({
        outFile: 'test-coverage.html'
      }))
  });

}

