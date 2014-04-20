var fs = require('fs');
var path = require('path');

/**
 * Traverse the directory
 * @param dir - directory to traverse
 * @param cond - callback for determining whether or not to keep file
 * @param done - callback for what to do with results
 */
var walk = function(dir, cond, done) {
	var results = [];
	fs.readdir(dir, function(err, list) {
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
 */
var createAggregate = function(fileArr, targetFile){
	if(!fileArr || fileArr.length<1){
		return;
	}
	fs.writeFileSync(targetFile, ""); // clear file
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
exports.aggregateTemplates = function(targetDir, targetFile){
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
