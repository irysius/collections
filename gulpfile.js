var gulp = require('gulp');
var fs = require('fs');
var rimraf = require('rimraf');
var exec = require('child_process').exec;

gulp.task('clean', function (done) {
	rimraf('./build', done);
});

gulp.task('compile', function (done) {
	exec('tsc', (err, stdout, stderr) => {
		console.log(stdout);
		console.log(stderr);
		done(err);
	});
});

gulp.task('compile-test', function (done) {
	exec('tsc -p tests', (err, stdout, stderr) => {
		console.log(stdout);
		console.log(stderr);
		done(err);
	});
});

gulp.task('watch', function () {
	gulp.watch([
		'src/**/*.ts',
		'tests/**/*.ts'
	], ['compile', 'compile-test']);
});

gulp.task('fix-typings', function (done) {
	function fixGlobalModuleExports(module, lineToReplace) {
		var moduleLocation = './typings/modules/' + module + '/index.d.ts';
		return new Promise((resolve, reject) => {
			fs.readFile(moduleLocation, (err, data) => {
				if (err) { reject(err); return; }
				var text = data.toString();
				var fixedText = text.replace(lineToReplace, '');
				fs.writeFile(moduleLocation, fixedText, err => {
					err ? reject(err) : resolve();
				});
			});
		});
	}
	Promise.all([
		fixGlobalModuleExports('lodash', 'export as namespace _;')
	]).then(() => {
		done();
	}).catch(err => {
		done(err);
	});
});


// Perform a one time set up after pull dependencies to copy them to the appropriate folders
gulp.task('setup', ['fix-typings'])

gulp.task('default', ['watch']);