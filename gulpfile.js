var gulp = require('./gulp')([
  'watch',
  'browserify',
  'vendor',
  'sass',
  'jshint',
  'nodemon',
  'browser-sync',
  'test',
  'browserify-test',
  'client-test'
])

gulp.task('default', ['sass', 'jshint', 'vendor', 'browserify', 'nodemon', 'browser-sync', 'watch']);

gulp.watch(['test/spec/client/**/*.js', '!test/spec/client/build/*'], ['browserify-test', 'client-test']);

gulp.task('test-client', ['browserify-test', 'client-test'])

