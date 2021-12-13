"use strict";

const gulp = require("gulp");
var sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const runSequence = require("run-sequence");
const browserSync = require("browser-sync").create();
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
/**
 * Global Variables section
 * In this section we define global variables
 */
const dirs = {
  src: "src",
  dest: "build",
};

var paths = {
  styles: {
    src: `${dirs.src}/styles/style.scss`,
    dest: `${dirs.dest}/styles/`,
    wildcard: `${dirs.src}/styles/**/*.scss`,
  },
  scripts: {
    src: `${dirs.src}/scripts/script.js`,
    dest: `${dirs.dest}/scripts/`,
    wildcard: `${dirs.src}/scripts/**/*.js`,
    dir: `${dirs.src}/scripts/`,
  },
  templates: {
    src: `${dirs.src}/templates/index.html`,
    dest: dirs.dest,
  },
  images: {
    src: `${dirs.src}/images/**/*.*`,
    dest: `${dirs.dest}/images`,
  },
};

/**
 * Handle browser Sync functions
 */
const live = () => {
  browserSync.init({
    server: {
      baseDir: "./build",
      index: "index.html",
      directory: false,
      https: false,
    },
    watch: true,
    port: 8083,
    open: true,
    cors: true,
    notify: false,
  });
};

/**
 * Styles section
 * In this section we define functionality who doing style stuff
 */
const styles = () => {
  return gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on("error", function (err) {
      console.log(err.toString());
      this.emit("end");
    })
    .pipe(autoprefixer())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.styles.dest));
};

/**
 * Script section
 * In this section we define functionality who doing JS stuff ;)
 */
const scripts = () => {
  let b = browserify({
    entries: paths.scripts.src,
    debug: true,
    paths: [paths.scripts.dir],
    extensions: ["es6"],
  });

  return b
    .bundle()
    .on("error", function (err) {
      console.log(err.toString());
      this.emit("end");
    })
    .pipe(source("script.js"))
    .pipe(buffer())
    .pipe(
      sourcemaps.init({
        loadMaps: true,
      })
    )
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(paths.scripts.dest));

  /* 
  // Uncomment when you want use only bable and mulitple files together
  return gulp.src(paths.scripts.src)
    .pipe(babel({
      presets: ['@babel/env'],

    }))
    .pipe(gulp.dest(paths.scripts.dest)) */
};

/**
 * Template handler
 */
const templates = () => {
  return gulp.src(paths.templates.src).pipe(gulp.dest(paths.templates.dest));
};

/**
 * Images handler
 */
const images = () => {
  return gulp.src(paths.images.src).pipe(gulp.dest(paths.images.dest));
};

/**
 * Gulp task watch usefull in development time
 */
const watch = () => {
  gulp
    .watch(paths.styles.wildcard, ["styles"])
    .on("change", browserSync.reload);
  gulp
    .watch(paths.scripts.wildcard, ["scripts"])
    .on("change", browserSync.reload);
  gulp
    .watch(paths.templates.src, ["templates"])
    .on("change", browserSync.reload);
};

/**
 * build Function
 * Provide Sequence for run in order
 */
const build = (callback) => {
  runSequence("styles", "scripts", "templates", "images", callback);
};

/**
 * In development time use this task, it will proviede watch and other stuff
 */
const dev = (callback) => {
  runSequence("build", "live", "watch", callback);
};

/**
 * Gulp Tasks
 */

gulp.task("live", live);
gulp.task("styles", styles);
gulp.task("scripts", scripts);
gulp.task("templates", templates);
gulp.task("images", images);
gulp.task("build", build);
gulp.task("watch", watch);
gulp.task("dev", dev);
gulp.task("default", build);
