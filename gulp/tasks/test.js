var gulp = require('gulp');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');

module.exports = function() {
  gulp.task('test', function() {
    return gulp.src(['./test/spec/**/*.js'], {read: false})
      .pipe(cover.instrument({
          pattern: ['./libs/**/*.js'],
          debugDirectory: 'debug'
      }))
      .pipe(mocha())
      .pipe(cover.report({
        outFile: 'test-coverage.html'
      }))
  });

}

