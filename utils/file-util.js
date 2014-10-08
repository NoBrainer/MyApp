var fs = require('fs');
var path = require('path');

/**
 * Traverse the directory
 * @param dir - directory to traverse
 * @param cond - callback for determining whether or not to keep file
 * @param done - callback for what to do with results
 */
var walk = function walk(dir, cond, done){
	var results = [];
	fs.readdir(dir, function(err, list){
		if(err){
			return done(err);
		}
		var i = 0;
		(function next(){
			var file = list[i++];
			if(!file){
				return done(null, results);
			}
			file = path.resolve(dir, file);
			fs.stat(file, function(err, stat){
				if(stat && stat.isDirectory()){
					walk(file, cond, function(err, res){
						results = results.concat(res);
						next();
					});
				}else{
					if(cond(file)){
						results.push(file);
					}
					next();
				}
			});
		})();
	});
};

/**
 * Create aggregate file
 * @param fileArr - array of files (full path)
 * @param targetFile - file to print to (full path)
 * @param strictOrder - (optional) boolean whether or not to enforce order
 */
var createAggregate = function createAggregate(fileArr, targetFile, strictOrder){
	if(!fileArr || fileArr.length<1){
		return;
	}
	fs.writeFileSync(targetFile, ""); // clear file
	if(strictOrder){
		var i = 0;
		(function next(){
			var file = fileArr[i++];
			if(!file){
				return;
			}
			fs.readFile(file, function(err, data){
				if(err) throw err;
				fs.appendFileSync(targetFile, data);
				next();
			});
		})();
		return;
	}
	for(var i=0; i<fileArr.length; i++){
		var file = fileArr[i];
		fs.readFile(file, function(err, data){
			if(err) throw err;
			fs.appendFileSync(targetFile, data);
		});
	}
};

/**
 * Create an aggregate template file
 * @param targetDir - directory to look in (full path)
 * @param targetFile - file to print to (full path)
 */
exports.aggregateTemplates = function aggregateTemplates(targetDir, targetFile){
	// Determine what kind of files we care about
	var isTemplate = function(file){
		return file.match(/.+\.template$/);
	};
	// Determine what we do with the results
	var done = function(err, result){
		if(err) throw err;
		createAggregate(result, targetFile);
	};
	// Traverse the target directory
	walk(targetDir, isTemplate, done);
};

/**
 * Create an aggregate JavaScript file
 * @param targetDir - directory to look in (full path)
 * @param targetFile - file to print to (full path)
 * @param libDir - directory with JavaScript libraries (full path)
 */
exports.aggregateJavaScript = function aggregateJavaScript(targetDir, targetFile, libDir){
	// Array of libraries to import (order matters)
	var libArray = [ "jquery/js/jquery.js", "underscore/js/underscore.js", "backbone/js/backbone.js", "bootstrap/js/bootstrap.js" ];
	libArray = _.map(libArray, function(item){
		return path.join(libDir, item);
	});
	var mainFile = "";
	var setupFile = "";
	// Determine what kind of files we care about
	var isJavaScript = function(file){
		if(file.match(/main\.js$/)){
			mainFile = file;
			return false;
		}else if(file.match(/setup\.js$/)){
			setupFile = file;
			return false
		}
		return file.match(/.+\.js$/);
	};
	// Determine what we do with the results
	var done = function(err, result){
		if(err) throw err;
		var fileArr = _.union(libArray, setupFile, result, mainFile);
		var strictOrder = true;
		createAggregate(fileArr, targetFile, strictOrder);
	};
	// Traverse the target directory
	walk(targetDir, isJavaScript, done);
};

/**
 * Create an aggregate CSS file
 * @param targetFile - file to print to (full path)
 * @param publicDir - public directory (full path)
 */
exports.aggregateCss = function aggregateCss(targetFile, publicDir){
	// Array of css files to import (order matters)
	var fileArr = [ "lib/bootstrap/css/bootstrap.css", "lib/bootstrap/css/bootstrap-custom.css", "lib/font-awesome/css/font-awesome.css", "stylesheets/style.css", "stylesheets/style-responsive.css" ];
	fileArr = _.map(fileArr, function(item){
		return path.join(publicDir, item);
	});
	// Create the aggregation
	var strictOrder = true;
	createAggregate(fileArr, targetFile, strictOrder);
};
