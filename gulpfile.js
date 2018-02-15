'use strict';

/**
 * Public tasks:
 * - build (default) - build the whole 'target' directory with all browser extensions
 * - build-chrome - build Chrome extension
 * - build-ff - build Firefox extension and its tests
 */

// Dependencies
const gulp              = require('gulp');
const clean             = require('gulp-clean');
const babel             = require('gulp-babel');
const rename            = require('gulp-rename');
const filter            = require('gulp-filter');
const transform         = require('gulp-transform');
const uglify            = require('gulp-uglify');
const zip               = require('gulp-zip');
const runSequence       = require('run-sequence');
const sass              = require('gulp-sass');
const webpack           = require('webpack-stream');
const deleteEmpty       = require('delete-empty');

const webpackConfig     = require('./gulp/webpack.config.js');
const uglifyConfig     = require('./gulp/uglify.config.js');
const browserConditions = require('./gulp/browser_conditions');

// Constants
const dirs = {
    root:                   '.',
    target:                 'target',
    destChromeLocal:        'target/chrome/local',
    destChromePackage:      'target/chrome/package',
    destFirefoxLocal:       'target/firefox/local',
    destFirefoxPackage:     'target/firefox/package',
    sourceExtension:        'src',
};

// Define the browser tasks that we have
const nonChromeFilePattern = '*-ff.*|*BrowserFirefox.*';
const nonFirefoxFilePattern = '*-chrome.*|*BrowserChrome.*';
const chromeBrowserRenameSuffix = '-chrome';
const firefoxBrowserRenameSuffix = '-ff';

const browserTasks = [
    {
        taskName: 'build-ext-chrome',
        browser: 'chrome',
        otherBrowserFilePattern: nonChromeFilePattern,
        thisBrowserRenameSuffix: chromeBrowserRenameSuffix,
        srcDir: dirs.sourceExtension,
        destDir: dirs.destChromeLocal,
        destPackageDir: dirs.destChromePackage,
    },
    {
        taskName: 'build-ext-ff',
        browser: 'firefox',
        otherBrowserFilePattern: nonFirefoxFilePattern,
        thisBrowserRenameSuffix: firefoxBrowserRenameSuffix,
        srcDir: dirs.sourceExtension,
        destDir: dirs.destFirefoxLocal,
        destPackageDir: dirs.destFirefoxPackage,
    },
];

// Clean task: remove the whole target directory
gulp.task(
    'clean',
    () => gulp.src(dirs.target, {read: false}).pipe(clean())
);

// Run all the tasks where we compose the browser-specific directories
browserTasks.forEach(sd => {
    const fThisBrowserRenameFiles = filter('**/*' + sd.thisBrowserRenameSuffix + '.*', {restore: true});
    const fContentFiles = filter('**/*.{js,json,css,scss,htm,html,txt}', {restore: true});

    // Intermediary tasks that we create
    const taskNamePrepareFiles =            sd.taskName + '-prepare-files';

    const taskNameProcessSASS =             sd.taskName + '-sass-process';
    const taskNameCleanSASS =               sd.taskName + '-sass-clean';
    const taskNameSASS =                    sd.taskName + '-sass';

    const taskNameCleanBundledJsFiles  =    sd.taskName + '-remove-bundled';

    const taskNameCleanEmptyDirectories =   sd.taskName + '-remove-empty-dirs';

    const taskNameProcessFiles =            sd.taskName + '-process-files';
    const taskNameUglify =                  sd.taskName + '-uglify';
    const taskNamePackage =                 sd.taskName + '-package';

    const taskNameLicense =                 sd.taskName + '-license';

    // Build the directory with just the target browser source files
    gulp.task(
        taskNamePrepareFiles,
        () => gulp.src(
                sd.srcDir + '/**/!(' + sd.otherBrowserFilePattern + ')',
                {base: sd.srcDir, nodir: true}
            )

            // Rename the browser-specific files by stripping the browser prefix.
            // E.g. "foo-chrome.txt" => "foo.txt".
            .pipe(fThisBrowserRenameFiles)
            .pipe(rename(path => {
                path.basename = path.basename.replace(/-[^-]+$/, '');
            }))
            .pipe(fThisBrowserRenameFiles.restore)

            // Process the browser conditions in the files, leave only the ones for the current target browser
            .pipe(fContentFiles)
            .pipe(transform('utf8', (content, file) => browserConditions(sd.browser, content, file)))
            .pipe(fContentFiles.restore)

            // And dump all the prepared files to the target directory
            .pipe(gulp.dest(sd.destDir))
    );

    // Process the SASS files and clean them
    gulp.task(taskNameProcessSASS, () =>
        gulp.src(sd.destDir + '/**/*.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest(sd.destDir))
    );

    gulp.task(taskNameCleanSASS, () =>
        gulp.src(sd.destDir + '/**/*.scss')
            .pipe(clean())
    );

    gulp.task(
        taskNameSASS,
        cb => runSequence(taskNameProcessSASS, taskNameCleanSASS, cb)
    );

    // Pack all JS files into a single JS script
    const worlds = ['background', 'hb'];
    const bundleTasks = worlds.map((world) => {
        const taskName = sd.taskName + '-bundlejs-' + world;

        gulp.task(taskName,
            () => gulp.src(`${sd.destDir}/js/worlds/${world}/entry.js`)
                .pipe(webpack(webpackConfig))
                .pipe(gulp.dest(`${sd.destDir}/js/worlds/${world}/`))
        );

        return taskName;
    });

    // Run all the tasks that process files (SASS, JS bundling)
    const processTasks = bundleTasks.concat([taskNameSASS]);
    gulp.task(
        taskNameProcessFiles,
        cb => runSequence(taskNamePrepareFiles, processTasks, cb)
    );

    // Remove all now-useless bundled JS files
    gulp.task(taskNameCleanBundledJsFiles,
        [taskNameProcessFiles],
        () => gulp.src(
                [sd.destDir + '/js/**/*.{js,json}', `!${sd.destDir}/js/worlds/*/entry-bundle.js`],
                {read : false}
            )
            .pipe(clean())
    );

    // Remove empty directories
    gulp.task(taskNameCleanEmptyDirectories,
        [taskNameCleanBundledJsFiles],
        () => deleteEmpty.sync(sd.destDir)
    );

    // Strip comments and slightly improve the code for human reading.
    // But do not strip the copyright comments, if any.
    // We don't want to compress the source code, because the extension doesn't need that optimization.
    gulp.task(
        taskNameUglify,
        [taskNameCleanEmptyDirectories],
        () => gulp.src(sd.destDir + '/js/worlds/*/entry-bundle.js', {base: sd.destDir})
            .pipe(babel())
            .pipe(uglify(uglifyConfig))
            .pipe(gulp.dest(sd.destDir))
    );

    // Copy LICENSE
    gulp.task(
        taskNameLicense,
        () => gulp.src(dirs.root + '/LICENSE')
            .pipe(gulp.dest(sd.destDir))
    );


    // Package the extension for uploading to the store
    gulp.task(
        taskNamePackage,
        [taskNameUglify, taskNameLicense],
        () => {
            const versionSuffix = require(`./${sd.destDir}/manifest.json`).version +
                '-' +
                (Math.floor((new Date()).getTime() / 1000));

            return gulp.src(sd.destDir + '/**/*')
                .pipe(zip(`header-bidder-expert-${sd.browser}-${versionSuffix}.zip`))
                .pipe(gulp.dest(sd.destPackageDir));
        }
    );

    // Final task
    gulp.task(sd.taskName, [taskNamePackage]);
});

// Handy tasks - build just a single browser extension
gulp.task(
    'build-chrome',
    cb => runSequence('clean', ['build-ext-chrome'], cb)
);

gulp.task(
    'build-ff',
    cb => runSequence('clean', ['build-ext-ff'], cb)
);

// Main build task - build everything
gulp.task(
    'build',
    cb => runSequence('clean', ['build-ext-chrome', 'build-ext-ff'], cb)
);

// Default task
gulp.task('default', ['build']);
