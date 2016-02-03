var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var umd = require('gulp-umd');



/**
 * As vinyl in gulp is not up-to-date yet, we cannot utilized file.stem for now.
 * This is a helper function for that.
 *
 * @see http://stackoverflow.com/questions/3820381/need-a-basename-function-in-javascript
 */
function baseName (str) {
    var base = new String(str).substring(str.lastIndexOf('/') + 1);
    if(base.lastIndexOf(".") != -1) {
        base = base.substring(0, base.lastIndexOf("."));
    }
    return base;
}

/* ======================================================================= */
/*            DISTRIBUTE                                                   */
/* ======================================================================= */

gulp.task('js-modern', function() {
    var b = browserify({
        entries: ['./build/socialtools-full-modern.js']
    });
    return b.bundle()
        .pipe(source('socialtools-full-modern.js'))
        .pipe(gulp.dest('dist'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('dist'));
});

gulp.task('js-legacy', function() {
    var b = browserify({
        entries: ['./build/socialtools-full-legacy.js']
    });
    return b.bundle()
        .pipe(source('socialtools-full-legacy.js'))
        .pipe(gulp.dest('dist'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('dist'));
});


/* ======================================================================= */
/*            BUILD                                                        */
/* ======================================================================= */

/* ---------- third party modules ----------------------------------------- */

gulp.task('es6-promise', function() {
    return gulp.src('node_modules/es6-promise/dist/es6-promise.js')
      .pipe(gulp.dest('build/'))
});

/* ----------- socialtools modules --------------------------------------- */

gulp.task('common', function() {
    return gulp.src('src/common/*.js')
      .pipe(umd({
          exports: function (file) {
              return 'module.exports';
          },
          namespace: function (file) {
              return baseName(file.path)
          }
      }))
      .pipe(gulp.dest('build/common/'))
});

gulp.task('polyfills', function() {
    return gulp.src('src/polyfills/**/*.js')
      .pipe(umd({
          exports: function (file) {
              return 'module.exports';
          },
          namespace: function (file) {
              return baseName(file.path) + 'Polyfill'
          }
      }))
      .pipe(gulp.dest('build/polyfills'))
});

gulp.task('poller/adapters', function() {
    return gulp.src('src/poller/adapter/*.js')
      .pipe(umd({
          exports: function (file) {
              return 'module.exports';
          },
          namespace: function (file) {
              return baseName(file.path) + 'Adapter'
          }
      }))
      .pipe(gulp.dest('build/poller/adapter/'))
});

gulp.task('poller/poller', function() {
    return gulp.src('src/poller/poller.js')
      .pipe(umd({
          exports: function (file) {
              return 'module.exports';
          },
          namespace: function (file) {
              return 'Poller';
          },
          dependencies: function (file) {
              return [
                  {
                      name: 'utils',
                      amd: '../common/utils',
                      cjs: '../common/utils',
                      global: 'utils',
                      param: 'utils'
                  },
                  {
                      name: 'DefaultAdapterFn',
                      amd: './adapter/default',
                      cjs: './adapter/default',
                      global: 'defaultAdapter',
                      param: 'DefaultAdapterFn'
                  },
              ];
          }
      }))
      .pipe(gulp.dest('build/poller/'))
});

gulp.task('progressbar/progressbar', function() {
    return gulp.src('src/progressbar/progressbar.js')
      .pipe(umd({
          exports: function (file) {
              return 'module.exports';
          },
          namespace: function (file) {
              return 'Progressbar';
          },
          dependencies: function (file) {
              return [
                  {
                      name: 'utils',
                      amd: '../common/utils',
                      cjs: '../common/utils',
                      global: 'utils',
                      param: 'utils'
                  },
                  {
                      name: 'Poller',
                      amd: '../poller/poller',
                      cjs: '../poller/poller',
                      global: 'Poller',
                      param: 'Poller'
                  },
              ];
          }
      }))
      .pipe(gulp.dest('build/progressbar/'))
});

/* ---------- distribution ------------------------------------------------ */

gulp.task('socialtools-full-modern', function() {
    return gulp.src('src/socialtools-full-modern.js')
      .pipe(umd({
          namespace: function (file) {
              return 'Socialtools';
          },
          exports: function (file) {
              return 'module.exports';
          },
          dependencies: function (file) {
              return [
                  {
                      name: 'utils',
                      amd: './common/utils',
                      cjs: './common/utils',
                      global: 'utils',
                      param: 'utils'
                  },
                  {
                      name: 'Progressbar',
                      amd: './progressbar/progressbar',
                      cjs: './progressbar/progressbar',
                      global: 'Progressbar',
                      param: 'Progressbar'
                  },
                  {
                      name: 'Poller',
                      amd: './poller/poller',
                      cjs: './poller/poller',
                      global: 'Poller',
                      param: 'Poller'
                  },
              ];
          }
      }))
      .pipe(gulp.dest('build/'))
});

gulp.task('socialtools-full-legacy', function() {
    return gulp.src('src/socialtools-full-legacy.js')
      .pipe(umd({
          namespace: function (file) {
              return 'Socialtools';
          },
          exports: function (file) {
              return 'module.exports';
          },
          dependencies: function (file) {
              return [
                  {
                      name: 'es6promise',
                      amd: 'es6-promise',
                      cjs: 'es6-promise',
                      global: 'promisePolyfill',
                      param: 'promisePolyfill'
                  },
                  {
                      name: 'assign',
                      amd: './polyfills/object/assign',
                      cjs: './polyfills/object/assign',
                      global: 'assignPolyfill',
                      param: 'assignPolyfill'
                  },
                  {
                      name: 'remove',
                      amd: './polyfills/element/remove',
                      cjs: './polyfills/element/remove',
                      global: 'removePolyfill',
                      param: 'removePolyfill'
                  },
                  {
                      name: 'utils',
                      amd: './common/utils',
                      cjs: './common/utils',
                      global: 'utils',
                      param: 'utils'
                  },
                  {
                      name: 'Progressbar',
                      amd: './progressbar/progressbar',
                      cjs: './progressbar/progressbar',
                      global: 'Progressbar',
                      param: 'Progressbar'
                  },
                  {
                      name: 'Poller',
                      amd: './poller/poller',
                      cjs: './poller/poller',
                      global: 'Poller',
                      param: 'Poller'
                  },
              ];
          }
      }))
      .pipe(gulp.dest('build/'))
});

/* ======================================================================= */
/*            COMPOUND TASKS                                               */
/* ======================================================================= */

gulp.task('umd', [
    'common',
    'polyfills',
    'poller/adapters',
    'poller/poller',
    'progressbar/progressbar',
    'socialtools-full-legacy',
    'socialtools-full-modern'
]);

gulp.task('js', ['js-legacy', 'js-modern']);
gulp.task('build', ['es6-promise', 'umd']);
gulp.task('default', ['build', 'js']);

// vim: set et ts=4 sw=4 :
