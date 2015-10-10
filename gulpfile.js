var gulp         = require('gulp');
var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });
var s3           = require('gulp-s3-upload')(nconf.get('aws'));
var release = nconf.get('release');

var dest = './client/build';
var src = './client/src';
var markupSrc = src+'/www/**';

gulp.task('markup', function() {
  return Promise.all([
    gulp.src('./node_modules/css-social-buttons/css/**/*', {base: '.'})
      .pipe(gulp.dest(dest)),
    gulp.src(markupSrc)
      .pipe(gulp.dest(dest))
  ]);
});

gulp.task('s3', function(){
  gulp.src("./client/build/**")
    .pipe(s3({
      Bucket: nconf.get('aws:bucket'), //  Required
      ACL:    'public-read'       //  Needs to be user-defined
    }));
})