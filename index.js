var archiver = require('archiver');
var fs = require('fs');
var AWS = require('aws-sdk');
var exec = require('child_process').exec;

function archive(cb) {
	var zipLocation = '/tmp/thaumaturgy.zip'
	var output = fs.createWriteStream(zipLocation);
	var archive = archiver.create('zip', {}); // or archiver('zip', {});
	archive.pipe(output);

	output.on('close', function() {
		console.log('Archive Complete.');
		cb(null, zipLocation);
	});

	archive.on('error', function(err) {
		console.log('error creating archive')
		cb(err);
	});

	var dirs = fs.readdirSync('/tmp/thaumaturgy/node_modules/');

	dirs.forEach(function(dir) {
		if (['.bin', 'nopt', 'npm', 'archiver'].indexOf(dir) == -1) {
			console.log('archiving dir /tmp/thaumaturgy/node_modules/' + dir);
			archive.directory('/tmp/thaumaturgy/node_modules/' + dir, dir);
		}
	});

	//copy bin files, if they exist
	if ( fs.existsSync('/tmp/thaumaturgy/node_modules/.bin') ){
		var binfiles = fs.readdirSync('/tmp/thaumaturgy/node_modules/.bin/');
		binfiles.forEach(function(file) {
			if (['nopt', 'npm'].indexOf(file) == -1) {
				console.log('archiving bin file /tmp/thaumaturgy/node_modules/.bin/' + file);
				archive.file('/tmp/thaumaturgy/node_modules/.bin/' + file, { name : '.bin/' + file });
			}
		});
	}

	archive.finalize();
}

function store(zipLocation, bucket, cb) {
	var s3 = new AWS.S3();

	var params = {
		Bucket: bucket,
		Key: 'thaumaturgy.zip',
		Body: fs.createReadStream(zipLocation)
	};

	s3.putObject(params, cb);
}

exports.handler = function(event, context) {
	var packages = event.packages,
		bucket = event.bucket || 'thaumaturgy';

	if (typeof packages == 'undefined') {
		packages = {
			"request": "^2.58.0",
			"mkdirp": "^0.5.1"
		}
	}

	console.log('Starting.');
	console.log('Bucket:', bucket);
	console.log('Packages:');
	console.log(packages);

	exec('rm -rf /tmp/thaumaturgy && mkdir -p /tmp/thaumaturgy && cp -r /var/task/node_modules /tmp/thaumaturgy', function(err, stdio, stderr) {
		if (err) context.fail(err);
		else {
			console.log('copy complete')
			process.chdir('/tmp/thaumaturgy');

			var packagejson = {
				title: "thaumaturgybuild",
				dependencies: packages
			};
			
			fs.writeFileSync('/tmp/thaumaturgy/package.json', JSON.stringify(packagejson, null, 4));
			
			console.log('wrote package.json');
			
			exec('node node_modules/npm/bin/npm-cli.js install', function(err, stdio, stderr) {
				if (err) context.fail(err);
				else {
					console.log('install complete')
					archive(function(err, zipLocation) {
						if (err) context.fail(err);
						else {
							store(zipLocation, bucket, function(err,data){
								if (err) context.fail(err);
								else {
									console.log('archive put to s3 successfully');
									console.log(data);
									context.succeed(data);
								}
							});							
						}
					});
				}
			});
		}
	});
};