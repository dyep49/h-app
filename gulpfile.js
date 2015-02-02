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
  'client-test',
  'watch-test'
])

gulp.task('default', ['sass', 'jshint', 'vendor', 'browserify', 'nodemon', 'browser-sync', 'watch']);

gulp.task('test-client', ['browserify-test', 'client-test', 'watch-test'])

