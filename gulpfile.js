var gulp         = require('gulp');
var browserSync  = require('browser-sync');
var browserify   = require('browserify');
var watchify     = require('watchify');
var notify       = require("gulp-notify");
var source       = require('vinyl-source-stream');
var babelify     = require('babelify');
var gutil        = require('gulp-util');
var prettyHrtime = require('pretty-hrtime');
var startTime;

var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });
var s3           = require('gulp-s3-upload')(nconf.get('aws'));

var dest = './client/build';
var src = './client/src';
var markupSrc = src+'/www/**';

// Provides gulp style logs to the bundle method in browserify.js
var bundleLogger = {
  start: function(filepath) {
    startTime = process.hrtime();
    gutil.log('Bundling', gutil.colors.green(filepath) + '...');
  },
  end: function(filepath) {
    var taskTime = process.hrtime(startTime);
    var prettyTime = prettyHrtime(taskTime);
    gutil.log('Bundled', gutil.colors.green(filepath), 'in', gutil.colors.magenta(prettyTime));
  }
};

var handleErrors = function() {
  var args = Array.prototype.slice.call(arguments);

  // Send error to notification center with gulp-notify
  notify.onError({
    title: "Compile Error",
    message: "<%= error.message %>"
  }).apply(this, args);

  // Keep gulp from hanging on this task
  this.emit('end');
};


gulp.task('watch', ['setWatch', 'browserSync', 'build'], function() {
  gulp.watch(markupSrc, ['markup']);
});

gulp.task('setWatch', function() {
  global.isWatching = true;
});

gulp.task('markup', function() {
  return Promise.all([
    gulp.src('./node_modules/css-social-buttons/css/**/*', {base: '.'})
      .pipe(gulp.dest(dest)),
    gulp.src(markupSrc)
      .pipe(gulp.dest(dest))
  ]);
});

gulp.task('default', ['watch']);

gulp.task('build', ['browserify', 'markup']);

gulp.task('browserSync', ['build'], function() {
  browserSync({
    server: {
      // We're serving the src folder as well
      // for sass sourcemap linking
      baseDir: [dest, src]
    },
    files: [
      dest + '/**'
    ],
      port:3001
  });
});

gulp.task('browserify', function(callback) {
  // A separate bundle will be generated for each
  // bundle config in the list below
  var bundleConfigs = [{
    entries: src + '/app/main.jsx',
    dest: dest,
    outputName: 'app.js'
  }]

  var bundleQueue = bundleConfigs.length;

  var browserifyThis = function(bundleConfig) {

    var bundler = browserify({
      // Required watchify args
      cache: {}, packageCache: {}, fullPaths: false,
      // Specify the entry point of your app
      entries: bundleConfig.entries,
      // Add file extentions to make optional in your requires
      extensions: ['.js','.jsx'],
      // Enable source maps
      debug: true
    });

    var bundle = function() {
      // Log when bundling starts
      bundleLogger.start(bundleConfig.outputName);

      return bundler
        .bundle()
        // Report compile errors
        .on('error', handleErrors)
        // Use vinyl-source-stream to make the
        // stream gulp compatible. Specifiy the
        // desired output filename here.
        .pipe(source(bundleConfig.outputName))
        // Specify the output destination
        .pipe(gulp.dest(bundleConfig.dest))
        .on('end', reportFinished);
    };

    bundler.transform(babelify.configure({stage: 1}));

    if (global.isWatching) {
      // Wrap with watchify and rebundle on changes
      bundler = watchify(bundler);
      // Rebundle on update
      bundler.on('update', bundle);
    }

    var reportFinished = function() {
      // Log when bundling completes
      bundleLogger.end(bundleConfig.outputName);

      if (bundleQueue) {
        bundleQueue--;
        if (bundleQueue === 0) {
          // If queue is empty, tell gulp the task is complete.
          // https://github.com/gulpjs/gulp/blob/master/docs/API.md#accept-a-callback
          callback();
        }
      }
    };

    return bundle();
  };

  // Start bundling with Browserify for each bundleConfig specified
  bundleConfigs.forEach(browserifyThis);
});

gulp.task('s3', function(){
  gulp.src("./client/build/**")
    .pipe(s3({
      Bucket: nconf.get('aws:bucket'), //  Required
      ACL:    'public-read'       //  Needs to be user-defined
    }));
})