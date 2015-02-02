var gulp = require('gulp');
var mochaPhantomJS = require('gulp-mocha-phantomjs');

module.exports = function() {
  gulp.task('client-test', ['browserify-test'], function() {
  
    return gulp.src(['./test/client/front-end/test-runner.html'])
      .pipe(mochaPhantomJS());
  })
}