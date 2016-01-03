var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');


gulp.task('js', function() {
    var b = browserify({
        entries: ['./src/main.js']
    });
    return b.bundle()
        .pipe(source('socialtools.js'))
        .pipe(gulp.dest('dist'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['js']);
