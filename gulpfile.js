var gulp = require('gulp');
var browserify = require('gulp-browserify');

gulp.task('default', function() {
    gulp.src('gauges.js')
        .pipe(browserify({
          insertGlobals : true,
          debug : true
        }))
        .pipe(gulp.dest('./dist'))
});