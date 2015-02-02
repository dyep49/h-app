var gulp = require('gulp');
var mochaPhantomJS = require('gulp-mocha-phantomjs');

module.exports = function() {
  gulp.task('client-test', ['browserify-test'], function() {
    return gulp.src(['./test/spec/client/test-runner.html'])
      .pipe(mochaPhantomJS());
  })
}