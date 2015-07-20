var gulp = require('gulp');
var config = require('../config').markup;

gulp.task('markup', function() {
  //fixme: handle this properly (just copy/pasted here)
  gulp.src('./node_modules/css-social-buttons/css/**/*', {base: '.'})
    .pipe(gulp.dest(config.dest));

  return gulp.src(config.src)
    .pipe(gulp.dest(config.dest));
});
