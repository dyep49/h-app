var gulp = require('./gulp')([
  'watch',
  'browserify',
  'vendor',
  'sass',
  'jshint',
  'nodemon',
  'browser-sync',
  'test'
])

gulp.task('default', ['sass', 'jshint', 'vendor', 'browserify', 'nodemon', 'browser-sync', 'watch']);