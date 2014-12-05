// Library imports
var fs = require('fs');
var path = require('path');

// Local imports
// EMPTY

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

//TODO: finish
///**
// * Copy files
// * @param fileArr - array of files (full path)
// * @param destDir - destination directory for copied files (full path)
// * @param baseDir - (optional) base directory where files came from (full path)
// * 					With this option, we preserve the directory nesting.
// */
//var copyFiles = function copyFiles(fileArr, destDir, baseDir){
////	baseDir = false;
//	if(!fileArr || fileArr.length<1){
//		return;
//	}
//	for(var i=0; i<fileArr.length; i++){
//		var file = fileArr[i];
//		var fileName = file.substring(file.lastIndexOf('/'));
//		
//		// Figure out the new file path
//		var newFile, nesting;
//		if(baseDir){
//			// Preserve the directory nesting
//			newFile = file.replace(baseDir, destDir);
//			
//			// Figure out the nested directories
//			nesting = file.replace(baseDir, "");
//			nesting = nesting.substring(0, nesting.lastIndexOf('/'));
//		}else{
//			// Copy the file to the destDir without any directory nesting
//			newFile = destDir + fileName;
//		}
//		
//		logger.log("~~~~~");
//		logger.log("before: [__]".replace("__", file));
//		logger.log("after : [__]".replace("__", newFile));
//		logger.log("nest  : [__]".replace("__", nesting));
//		
//		//TODO: fs.mkdir for parent dirs
//		// http://stackoverflow.com/questions/16316330/how-to-write-file-if-parent-folder-dosent-exists
//		
//		// Write the file to its new location
//		fs.readFile(file, function(err, data){
//			if(err) throw err;
//			fs.writeFileSync(newFile, data);
//		});
//	}
//};

/**
 * Create an aggregate template file
 * @param targetDir - directory to look in (full path)
 * @param targetFile - file to print to (full path)
 */
var aggregateTemplates = function aggregateTemplates(targetDir, targetFile){
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
var aggregateJavaScript = function aggregateJavaScript(targetDir, targetFile, libDir){
	// Array of libraries to import (order matters)
	var libArray = [ "jquery/js/jquery.js",
	                 "underscore/js/underscore.js",
	                 "backbone/js/backbone.js",
	                 "bootstrap/js/bootstrap.js",
	                 "bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js" ];
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
var aggregateCss = function aggregateCss(targetFile, publicDir){
	// Array of css files to import (order matters)
	var fileArr = [ "lib/bootstrap/css/bootstrap.css",
	                "lib/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css",
	                "lib/bootstrap/css/bootstrap-custom.css",
	                "lib/font-awesome/css/font-awesome.css",
	                "stylesheets/style.css",
	                "stylesheets/style-responsive.css" ];
	fileArr = _.map(fileArr, function(item){
		return path.join(publicDir, item);
	});
	// Create the aggregation
	var strictOrder = true;
	createAggregate(fileArr, targetFile, strictOrder);
};

//TODO: finish
///**
// * 
// */
//var copyDirectory = function copyResources(targetDir, destDir, preserveNesting){
//	// Determine what kind of files we care about
//	var isImage = function(file){
//		return file.match(/.+\.(jpg|png|ico)$/i);
//	};
//	// Determine what we do with the results
//	var done = function(err, result){
//		if(err) throw err;
//		if(preserveNesting){
//			copyFiles(result, destDir, targetDir);
//		}else{
//			copyFiles(result, destDir);
//		}
//	};
//	// Traverse the target directory
//	walk(targetDir, isImage, done);
//};

// Module exports
exports.aggregateTemplates = aggregateTemplates;
exports.aggregateJavaScript = aggregateJavaScript;
exports.aggregateCss = aggregateCss;
//exports.copyDirectory = copyDirectory;
