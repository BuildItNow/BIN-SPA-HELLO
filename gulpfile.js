var config  = require('./config/gulpConfig');
var gulp 	= require('gulp');
var fs      = require('fs');
var path    = require('path');
var glob    = require('glob');
var filter  = require('gulp-filter');
var uglify  = require('gulp-uglify');
var cssMinify = require('gulp-clean-css');
var htmlMinify = require('gulp-htmlmin');
var md5     = require("md5");
var through = require('through2');
var BufferStreams = require('bufferstreams');
var cp 		= require('child_process');
var exec    = function(cmd, cb)
{
	var r = cp.exec(cmd, function (error, stdout, stderr) 
	{
		cb(error, stdout, stderr);
	});
	
	r.stdout.pipe(process.stdout);
	r.stderr.pipe(process.stderr);
}

var spawn   = cp.spawn;

var TARGET = config.target || "spa";
var IS_TARGET_SPA = TARGET === "spa";
var IS_TARGET_WEB = TARGET === "web";

var tempPath = config.tempPath || "client-build-temp";
var destPath = config.destPath || "client-build";

var clientPath = config.clientPath || "client";
var configPath = config.configPath || "config";

var DEFAULT_IGNORES = ["!./.*", "!node_modules/**", "!./*.md", "!"+destPath+"/**", "!"+tempPath+"/**"];

var getFilePath = function(patthern)
{
	var paths = glob.sync(patthern);
	if(!paths || paths.length === 0)
	{
		return null;
	}

	return paths[0];
}

var rmdirSync = function(rmPath) 
{
    var files = null;
    if(fs.existsSync(rmPath)) 
    {
        files = fs.readdirSync(rmPath);
        files.forEach(function(file,index)
        {

            var curPath = path.join(rmPath, file);
            if(fs.statSync(curPath).isDirectory()) 
            {
             	rmdirSync(curPath);
            } 
            else 
            { 
            	fs.unlinkSync(curPath);
            }
        });

        fs.rmdirSync(rmPath);
    }
}

var mkdirsSync = function(mkPath, mode) 
{ 
    if (!fs.existsSync(mkPath)) 
    {
        var pathtmp;
        mkPath.split(path.sep).forEach(function(dirname) 
        {
            if (pathtmp) 
            {
                pathtmp = path.join(pathtmp, dirname);
            }
            else 
            {
                pathtmp = dirname || "/";
            }

            
            if (!fs.existsSync(pathtmp)) 
            {
                if (!fs.mkdirSync(pathtmp, mode)) 
                {
                    return false;
                }
            }
        });
    }
    return true; 
}

var toLeftSlash = function(path)
{
	return path.replace(/\\/g, "/");
}

gulp.task("prepare", function(cb)
{	
	rmdirSync(tempPath);

	var ignores = DEFAULT_IGNORES.splice(0).concat(config.clientPatterns || []);

	return gulp.src(["./**"].concat(ignores), {cwd:clientPath})
	.pipe(gulp.dest(tempPath));
});

gulp.task("minify", ["prepare"], function(cb)
{	
	var ignores = config.minifyPatterns || [];

	var htmlFilter = filter("**/*.html", {restore: true});
	var cssFilter = filter("**/*.css", {restore: true});
	var jsFilter = filter("**/*.js", {restore: true});


	return gulp.src(["./**"].concat(ignores), {cwd:tempPath})
	.pipe(htmlFilter)
	.pipe(htmlMinify({collapseWhitespace: true, minifyCSS:true, minifyJS:true}))
	.on("error", function(err)
	{
		console.log(err);
	})
	.pipe(htmlFilter.restore)
	.pipe(cssFilter)
	.pipe(cssMinify({compatibility: 'ie8', inline:false, rebase: false}))
	.on("error", function(err)
	{
		console.log(err);
	})
	.pipe(cssFilter.restore)
	.pipe(jsFilter)
	.pipe(uglify())
	.on("error", function(err)
	{
		console.log(err);
	})
	.pipe(jsFilter.restore)
	.pipe(gulp.dest(tempPath));
});

var frameworkBundleConfigs = [];
gulp.task("generate-framework-bundle-config-files", ["minify"], function(cb)
{
	var packConfig = require(path.resolve(path.join(configPath, IS_TARGET_SPA ? "spaPackConfig" : "webPackConfig")));
	
	// Generate bundle config
	var generateBundlesConfig = function()
	{
		var bundlesConfig = {};
		var bc;
		var bundles = packConfig.bundles;
		var bundle; 
		for(var name in bundles)
		{
			bundle = bundles[name];

			bc = {};
			bc.name = name;
			bc.include = [];
			bc.exclude = [];
			bc.includeBundle = [];
			bc.excludeBundle = [];

			// include 
			if(bundle.include)
			{
				for(var i=0,i_sz=bundle.include.length; i<i_sz; ++i)
				{
					if(bundle.include[i].startsWith("#"))
					{
						bc.includeBundle.push(bundle.include[i].substring(1));
					}
					else
					{
						bc.include.push(bundle.include[i]);
					}
				}
			}

			if(bundle.exclude)
			{
				for(var i=0,i_sz=bundle.exclude.length; i<i_sz; ++i)
				{
					if(bundle.exclude[i].startsWith("#"))
					{
						bc.excludeBundle.push(bundle.exclude[i].substring(1));
					}
					else
					{
						bc.exclude.push(bundle.exclude[i]);
					}
				}
			}
			if(bundle.out)
			{
				bc.out = bundle.out;
			}
			else
			{
				bc.out = "bin/bpf_hash_"+bc.name+".bundle.js";
			}
			

			bundlesConfig[bc.name] = bc;
		}

		return bundlesConfig;
	}

	// Trace cycle dependent between bundle

	var checkCycleDependent = function(bundlesConfig)
	{
		var CHECKING = 1,CHECKED = 2;
		var bundlesState = {};
		var checkStack   = [];

		var checkBundle = function(bundleConfig, checkInclude)
		{
			checkStack.push(bundleConfig.name);

			if(bundlesState[bundleConfig.name] === undefined)
			{
				bundlesState[bundleConfig.name] = CHECKING;
			}
			else if(bundlesState[bundleConfig.name] === CHECKING)
			{
				return false;
			}
			else if(bundlesState[bundleConfig.name] === CHECKED)
			{
				checkStack.pop();
				return true;
			}

			var r = true;
			var k = checkInclude ? "includeBundle" : "excludeBundle";
			for(var i=0,i_sz=bundleConfig[k].length; i<i_sz; ++i)
			{
				if(!bundlesConfig[bundleConfig[k][i]])
				{
					console.warn("Can't find bundle "+bundleConfig[k][i]);
					continue;
				}

				if(!checkBundle(bundlesConfig[bundleConfig[k][i]]))
				{
					r = false;
					break;
				}
			}

			if(r)
			{
				bundlesState[bundleConfig.name] = CHECKED;
				checkStack.pop();
			}
			
			return r;
		}

		for(var name in bundlesConfig)
		{
			if(!checkBundle(bundlesConfig[name], true))
			{
				console.error("There is include cycle dependent between bundles:");
				console.error(checkStack.join("->"));

				return false;
			}
		}

		bundlesState = {};
		checkStack   = [];

		for(var name in bundlesConfig)
		{
			if(!checkBundle(bundlesConfig[name], false))
			{
				console.error("There is exclude cycle dependent between bundles:");
				console.error(checkStack.join("->"));

				return false;
			}
		}

		return true;
	}

	var fixBundlesDependent = function(bundlesConfig)
	{
		var fixBundleInclude = function(bundleConfig, bundlesConfig)
		{
			if(bundleConfig._biFixed)
			{
				return ;
			}

			for(var i=0,i_sz=bundleConfig.includeBundle.length; i<i_sz; ++i)
			{
				var iBundleConfig = bundlesConfig[bundleConfig.includeBundle[i]];
				fixBundleInclude(iBundleConfig, bundlesConfig);
				fixBundleExclude(iBundleConfig, bundlesConfig);

				var iBundleInclude = iBundleConfig.include;
				var iBundleExclude = iBundleConfig.exclude;

				var dInclude = bundleConfig.include;
				var dExclude = bundleConfig.exclude;

				var dIncludeMap = {};
				var dExcludeMap = {};

				for(var j=0,j_sz=dInclude.length; j<j_sz; ++j)
				{	
					dIncludeMap[dInclude[j]] = true;
				}

				for(var j=0,j_sz=dExclude.length; j<j_sz; ++j)
				{	
					dExcludeMap[dExclude[j]] = true;
				}

				for(var j=0,j_sz=iBundleInclude.length; j<j_sz; ++j)
				{	
					if(!dExcludeMap[iBundleInclude[j]])	// Not excluded
					{
						dIncludeMap[iBundleInclude[j]] = true;
					}
				}

				for(var j=0,j_sz=iBundleInclude.length; j<j_sz; ++j)
				{	
					if(!dIncludeMap[iBundleInclude[j]])	// Not include
					{
						dExcludeMap[iBundleInclude[j]] = true;
					}
				}

				dInclude = bundleConfig.include = [];
				dExclude = bundleConfig.exclude = [];

				for(var name in dIncludeMap)
				{
					dInclude.push(name);
				}

				for(var name in dExcludeMap)
				{
					dExclude.push(name);
				}
			}

			bundleConfig._biFixed = true;
		}

		var fixBundleExclude = function(bundleConfig, bundlesConfig)
		{
			if(bundleConfig._beFixed)
			{
				return ;
			}

			for(var i=0,i_sz=bundleConfig.excludeBundle.length; i<i_sz; ++i)
			{
				var eBundleConfig = bundlesConfig[bundleConfig.excludeBundle[i]];
				fixBundleInclude(eBundleConfig, bundlesConfig);
				
				var eBundleInclude = eBundleConfig.include;
				
				var dInclude = bundleConfig.include;
				var dExclude = bundleConfig.exclude;

				var dIncludeMap = {};
				var dExcludeMap = {};

				for(var j=0,j_sz=dInclude.length; j<j_sz; ++j)
				{	
					dIncludeMap[dInclude[j]] = true;
				}

				for(var j=0,j_sz=dExclude.length; j<j_sz; ++j)
				{	
					dExcludeMap[dExclude[j]] = true;
				}

				for(var j=0,j_sz=eBundleInclude.length; j<j_sz; ++j)
				{	
					if(!dIncludeMap[eBundleInclude[j]])	// Not include
					{
						dExcludeMap[eBundleInclude[j]] = true;
					}
				}

				dInclude = bundleConfig.include = [];
				dExclude = bundleConfig.exclude = [];

				for(var name in dIncludeMap)
				{
					dInclude.push(name);
				}

				for(var name in dExcludeMap)
				{
					dExclude.push(name);
				}
			}

			bundleConfig._beFixed = true;
		}

		for(var name in bundlesConfig)
		{
			fixBundleInclude(bundlesConfig[name], bundlesConfig);
			fixBundleExclude(bundlesConfig[name], bundlesConfig);
		}
	}

	var generateBundlesConfigFile = function(bundlesConfig)
	{
		var packConfigPath = "./";
		mkdirsSync(path.resolve(packConfigPath));
		var generateBundleConfigFile = function(bundleConfig)
		{
			var content = "";
			content += "({\n";
			content += "baseUrl:'.',\n";
			content += "mainConfigFile:'"+packConfig.mainConfigFile+"',\n";
			content += "optimize:'none',\n";
			content += "optimizeCss:'none',\n";
			content += "logLevel:3,\n";
			content += "out:'"+bundleConfig.out+"',\n";
			content += "include:[\n";
			for(var i=0,i_sz=bundleConfig.include.length; i<i_sz; ++i)
			{
				content += "'"+bundleConfig.include[i]+"',\n";
			}
			content += "],\n";
			content += "exclude:[\n";
			for(var i=0,i_sz=bundleConfig.exclude.length; i<i_sz; ++i)
			{
				content += "'"+bundleConfig.exclude[i]+"',\n";
			}
			content += "],\n";
			content += "})";
			
			var filePath = path.resolve(path.join(packConfigPath, bundleConfig.name+".build"));
			frameworkBundleConfigs.push({path:filePath, target:bundleConfig.out});

			fs.writeFileSync(filePath, content, 'utf-8');
		}

		for(var name in bundlesConfig)
		{
			generateBundleConfigFile(bundlesConfig[name]);
		}
	}

	var oldCwd = process.cwd();
	process.chdir(path.resolve(tempPath));

	var bundlesConfig = generateBundlesConfig();

	if(!checkCycleDependent(bundlesConfig))
	{
		process.chdir(oldCwd);
		cb("Bundle Cycle Dependent");
		return ;
	}

	fixBundlesDependent(bundlesConfig);
	generateBundlesConfigFile(bundlesConfig);

	process.chdir(oldCwd);

	cb();
});

gulp.task("generate-framework-bundle-files", ["generate-framework-bundle-config-files"], function(cb)
{
	var oldCwd = process.cwd();
	process.chdir(path.resolve(tempPath));

	var oldCb = cb;
	cb = function()
	{
		for(var i=0,i_sz=frameworkBundleConfigs.length; i<i_sz; ++i)
		{
			fs.unlinkSync(frameworkBundleConfigs[i].path);
		}
		
		process.chdir(oldCwd);

		oldCb.apply(this, arguments);
	}

	var cmd = process.platform === "win32" ? "r.js.cmd -o " : "r.js -o ";
	var bundleConfigs = [].concat(frameworkBundleConfigs);

	var buildBundle = function(bundleConfig)
	{
		if(!bundleConfig)
		{
			cb();
			return ;
		}

		exec(cmd+bundleConfig.path, function(error, stdout, stderr) 
		{
			if(error)
			{
				console.log("    "+bundleConfig.target+" fail");
				cb(error);

				return ;
			}
			else
			{
				console.log("    "+bundleConfig.target+" succeed");
			}

			buildBundle(bundleConfigs.shift());
		});
	}

	console.log("Generate bundles :");
	buildBundle(bundleConfigs.shift());
});

// gulp.task("web-index-inline", ["generate-framework-bundle-files"], function(cb)
// {
// 	// if(IS_TARGET_SPA)
// 	// {
// 	// 	console.log("Nothing to do in SPA");
// 	// 	cb();
// 	// 	return ;
// 	// }

// 	var webIndexes = config.webInlines.files;
// 	var indexPath  = null;
// 	var viewName   = null;
// 	var viewPath   = null;
// 	var content    = null;
// 	var inlineContent = null;
// 	var regx = null;
// 	var match = null;
// 	var attrRegx = /data-bin-[a-zA-Z0-9\-]*=['\"].*['\"]/g;
// 	var styleRegx   = /(class|style)=['\"].*['\"]/g;
// 	var attrs = null;
// 	var styles = null;

// 	for(var i=0,i_sz=webIndexes.length; i<i_sz; ++i)
// 	{
// 		if(typeof webIndexes[i] === "string")
// 		{
// 			continue;
// 		}

// 		indexPath = path.join(tempPath, webIndexes[i].name); 
// 		content = fs.readFileSync(indexPath, 'utf-8');

// 		for(var j=0,j_sz=webIndexes[i].inlines.length; j<j_sz; ++j)
// 		{
// 			viewName = webIndexes[i].inlines[j];
// 			viewPath = path.join(tempPath, viewName); 

// 			regx = new RegExp("<div[^<>]*data-bin-view=['\"]"+viewName+"['\"][^<>]*(/>|></div>)");
// 			match = content.match(regx);
// 			match = match ? match[0] : null;
// 			if(!match)
// 			{
// 				continue;
// 			}

// 			console.log("Inline "+viewName+" in "+webIndexes[i].name);

// 			inlineContent = fs.readFileSync(viewPath+".html", 'utf-8');

// 			attrs = match.match(attrRegx);
// 			attrs.push('data-bin-root="true"');

// 			inlineContent = inlineContent.replace("<div", "<div "+attrs.join(" "));

// 			if(match.indexOf("class=") > 0 || match.indexOf("style=") > 0)
// 			{
// 				styles = match.match(styleRegx);
// 				inlineContent = "<div "+styles.join(" ")+">"+inlineContent+"</div>";
// 			}
			
// 			content = content.replace(match, inlineContent);
			
// 		}

// 		fs.writeFileSync(indexPath, content, 'utf-8');
// 	}

// 	cb();
// });

var tracedBinViews = [];
gulp.task("trace-bin-views", ["generate-framework-bundle-files"], function(cb)
{
	return gulp.src(["**/*.js", "!bin/**"].concat(DEFAULT_IGNORES).concat(config.viewTracingPatterns || []), {cwd:tempPath})
			.pipe(through.obj({}, 
			function(chunk, enc, callback)
			{
				var basePath = chunk.base;
				var fullPath = chunk.path;
				var baseName = path.basename(fullPath, ".js");
				var dirName  = path.dirname(fullPath);
				var htmlFullPath = path.join(dirName, baseName+".html");
				var cssFullPath  = path.join(dirName, baseName+".css");

				if(!fs.existsSync(htmlFullPath))
				{
					callback(null, chunk);
					return ;
				}

				if(!chunk.contents.toString().startsWith("define("))
				{
					callback(null, chunk);
					return ;
				}

				if(!fs.readFileSync(htmlFullPath, "utf-8").startsWith("<div"))
				{
					callback(null, chunk);
					return ;
				}

				tracedBinViews.push(
				{
					base:basePath,
					js:fullPath,
					html:htmlFullPath,
					css:fs.existsSync(cssFullPath) ? cssFullPath : undefined,
				});
				
				callback(null, chunk);
			}, 
			function(cb)
			{
				cb();
			}));
});

gulp.task("merge-bin-views", ["trace-bin-views"], function(cb)
{
	var packConfig = require(path.resolve(path.join(configPath, IS_TARGET_SPA ? "spaPackConfig" : "webPackConfig")));
	
	var oldCwd = process.cwd();
	process.chdir(path.resolve(tempPath));

	var oldCb = cb;
	cb = function()
	{
		fs.unlinkSync(tempConfigPath);
		fs.unlinkSync(tempTargetPath);
		process.chdir(oldCwd);

		oldCb.apply(this, arguments);
	}

	var tempConfigPath = "./__merge.build";
	var tempTargetPath = "./__target.js";

	fs.writeFileSync(tempConfigPath, "", 'utf-8');
	fs.writeFileSync(tempTargetPath, "", 'utf-8');

	var generateMergeConfigFile = function(binView)
	{
		var content = "";
		content += "({\n";
		content += "baseUrl:'.',\n";
		content += "mainConfigFile:'"+packConfig.mainConfigFile+"',\n";
		content += "optimize:'none',\n";
		content += "optimizeCss:'none',\n";
		content += "logLevel:3,\n";
		content += "out:'"+tempTargetPath+"',\n";
		content += "include:[\n";
		content += "'text!"+toLeftSlash(path.relative(binView.base, binView.html))+"',\n";
		content += "],\n";
		content += "exclude:['text'],\n";
		content += "})";
		var filePath = path.resolve(tempConfigPath);

		fs.writeFileSync(filePath, content, 'utf-8');
	}

	var generateMergeTargetFile = function(binView, callback)
	{
		var cmd = process.platform === "win32" ? "r.js.cmd -o " : "r.js -o ";
		cmd += tempConfigPath;

		exec(cmd, function(error, stdout, stderr) 
		{
			var name = path.relative(binView.base, binView.js);
			name = name.replace(".js", "");
			if(error)
			{
				console.log("    "+name+" fail");
			}
			else
			{
				console.log("    "+name+" success");
			}

			callback(error);
		});
	}

	var generateTargetFile = function(binView)
	{
		var htmlAndCssContent = fs.readFileSync(path.resolve(tempTargetPath), "utf-8");
		var jsContent = fs.readFileSync(binView.js, "utf-8");

		fs.writeFileSync(binView.js, htmlAndCssContent+"\n"+jsContent, "utf-8");
	}

	var binViews = tracedBinViews.splice(0);

	var mergeView = function(binView)
	{
		if(!binView)
		{
			cb();
			return ;
		}

		generateMergeConfigFile(binView);
		generateMergeTargetFile(binView, function(error)
		{
			if(error)
			{
				cb(error);
			}
			else
			{
				generateTargetFile(binView);

				mergeView(binViews.shift());
			}
		});
	}
	
	console.log("Merge views :");
	mergeView(binViews.shift());
});

gulp.task("process-bin-parsed-variables", [config.mergeBINViews?"merge-bin-views":"generate-framework-bundle-files"], function(cb)
{
	return gulp.src(["./**"].concat(DEFAULT_IGNORES).concat(config.binParsedVariableTracingPatterns || []), {cwd:tempPath})
			.pipe(through.obj({}, 
			function(chunk, enc, callback)
			{
				if(isIMG(chunk.path))
				{
					callback(null, chunk);

					return ;
				}
				
				if(chunk.isNull()) 
				{
					return callback(null, chunk);
			    }

			    var processBPV = function(buffer, callback)
			    {
			    	var BPVariables = config.binParsedVariables;
			    	var content = buffer.toString("utf-8");
			    	var BPV_NAME_REG = /\$\(bpv_([a-zA-Z0-9\_\$]*)\)/g;
			    	var mat = BPV_NAME_REG.exec(content);
			    	var name  = null;
			    	var unrefs = {};
			    	var ut = false
			    	var refs = {};
			    	var rt = false;
			    	while(mat)
			    	{
			    		name = mat[1];
			    		
			    		if(BPVariables[name] === undefined || BPVariables[name] === null)
			    		{
			    			unrefs[name] = true;
			    			ut = true;

			    			BPV_NAME_REG.lastIndex += mat[0].length;
			    		}
			    		else
			    		{
			    			refs[name] = true;
			    			rt = true;

			    			var temp = content.substring(0, mat.index);
			    			temp += BPVariables[name];
			    			temp += content.substring(mat.index+mat[0].length);
			    			content = temp;
			    		}

			    		mat = BPV_NAME_REG.exec(content);
			    	}


			    	if(rt|| ut)
				    {
				    	console.log("Variables for "+resolveBPFName(chunk.path));
				    	if(rt)
				    	{
				    		for(var name in refs)
					    	{
					    		console.log("    $(bpv_"+name+") ==> "+BPVariables[name]);
					    	}
				    	}
				    	if(ut)
				    	{
				    		for(var name in unrefs)
					    	{
					    		console.log("    $(bpv_"+name+") ==> can't find variable value");
					    	}
				    	}
				    }

			    	callback(null, new Buffer(content, "utf-8"));
			    }

			    var contents = null;
			    var self = this;
			    if(chunk.isBuffer()) 
			    {
			    	processBPV(chunk.contents, function(error, contents)
			    	{
			    		chunk.contents = contents;
			    		callback(null, chunk);
			    	});
			    }
			    else if(chunk.isStream()) 
			    {
			      	chunk.contents.pipe(new BufferStreams(function(none, buffer, done) 
			      	{
			          	processBPV(buffer, function(error, contents)
				    	{
				    		chunk.contents = contents;
				    		callback(null, chunk);
				    	});
			        }));
			    }
			}, 
			function(cb)
			{
				cb();
			}))
		.pipe(gulp.dest(tempPath));		
});


function resolveBPFName(bpfPath)
{
	var rootPath = path.resolve(tempPath);
	bpfPath = path.resolve(bpfPath);
	bpfPath = toLeftSlash(bpfPath.replace(rootPath, ""));
	if(bpfPath.startsWith("/"))
	{
		bpfPath = bpfPath.substr(1);
	}

	return bpfPath;
}

var tracedBPFiles = {};
gulp.task("trace-bin-parsed-files", [config.mergeBINViews?"merge-bin-views":"generate-framework-bundle-files", "process-bin-parsed-variables"], function(cb)
{
	var BPF_NAME_REG = /^bpf_(.*)_(.*)$/;
	// bpf_xxx-xxx-xxx_filename
	//     |--cmds---| |-name-|
	return gulp.src(["**/bpf_*_*"].concat(DEFAULT_IGNORES).concat(config.binParsedFileTracingPatterns || []), {cwd:tempPath})
			.pipe(through.obj({}, 
			function(chunk, enc, callback)
			{
				var basePath = toLeftSlash(chunk.base);
				var fullPath = toLeftSlash(chunk.path);
				var name = resolveBPFName(fullPath);
				var baseName = path.basename(fullPath);
				var matches  = baseName.match(BPF_NAME_REG);
				if(matches)
				{
					tracedBPFiles[name] = 
					{
						base:basePath,
						path:fullPath,
						name:name,
						baseName:baseName,
						bp_name:matches[2],
						bp_cmds:matches[1].split("-"),
					};
				}

				callback(null, chunk);
			}, 
			function(cb)
			{
				cb();
			}));		
});

function isJS(name)
{
	return name.toLowerCase().endsWith(".js");
}

function isHTML(name)
{
	return name.toLowerCase().endsWith(".html");
}

function isCSS(name)
{
	return name.toLowerCase().endsWith(".css");
}

function isJSON(name)
{
	return name.toLowerCase().endsWith(".json");
}

function isIMG(name)
{
	var n = name.toLowerCase();
	return n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".gif") || n.endsWith(".png") || n.endsWith(".webp");
}

var strRegs = 
[
	[
		/\\/g, "\\\\"],
	[
		/\$/g, "\\$"],
	[
		/\(/g, "\\("],
	[
		/\)/g,  "\\)"],
	[
		/\*/g, "\\*"],
	[
		/\+/g, "\\+"],
	[
		/\./g, "\\."],
	[
		/\[/g, "\\["],
	[
		/\]/g, "\\]"],
	[
		/\?/g, "\\?"],
	[
		/\^/g, "\\^"],
	[
		/\{/g, "\\{"],
	[	
		/\}/g, "\\}"],
	[
		/\|/g, "\\|"],
]

function str2reg(str)
{
	for(var i=0,i_sz=strRegs.length; i<i_sz; ++i)
	{
		str = str.replace(strRegs[i][0], strRegs[i][1]);
	}

	return new RegExp(str, "g");
} 

gulp.task("process-bpf-command-hash", ["trace-bin-parsed-files"], function(cb)
{
	var needHashReferenceProcess = function(name)
	{
		return isJS(name) || isHTML(name) || isCSS(name) || isJSON(name);
	}

	var oldCwd = process.cwd();
	process.chdir(path.resolve(tempPath));

	var hashBPFiles = {};
	var hashBPFileNames = [];

	// Collect hash files
	for(var name in tracedBPFiles)		
	{
		var bpf = tracedBPFiles[name];
		for(var i=0,i_sz=bpf.bp_cmds.length; i<i_sz; ++i)
		{
			if(bpf.bp_cmds[i] === "hash")
			{
				hashBPFiles[name] = 
				{
					name:name,
					path:bpf.path,
					baseName:bpf.baseName,
					bp_name:bpf.bp_name,
					deps:[]
				};
				hashBPFileNames.push(name);
			}
		}
	}

	var collectHashReferences = function(filePath)
	{
		if(!needHashReferenceProcess(filePath))
		{
			return ;
		}

		//	based on root path : /xxx         can't handle
		//	based on current path : ./ or xxx/ or ../	
		//		js,html   alwayse from the app root path
		//		css	      from the path of css file, need be resolved to the app root path
		//	full url : can't handle

		var checkCSSMatch = function(match)
		{
			var url = match[3] || match[2] || match[5] || match[6] || match[4];
      		if(!url)
      		{
      			return ;
      		}

      		var reg = /([^<>,;!'=\s\|\:\"\*\?\+\{\}\(\)\[\]]*)bpf_([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)_([^<>,;!'=\\\/\s\|\:\"\*\?\+\{\}\(\)\[\]]+)/;
			match = url.match(reg);
			if(!match || match[0] !== url)
			{
				return ;
			}

			var content = match[0];
			var dirPath = toLeftSlash(match[1] || "");

			var bp_cmds = match[2].split("-");
			var bp_name = match[4];

			if(!bp_name)
			{
				return ;
			}

			var i=0,i_sz=bp_cmds.length;
			for(; i<i_sz; ++i)
			{
				if(bp_cmds[i] === "hash")
				{
					break;
				}
			}

			if(i===i_sz)
			{
				return ;
			}

			if(dirPath && !dirPath.endsWith("/"))	// Invalid
			{
				return ;
			}

			var ret = {};
			ret.content = content;
			ret.dirPath = dirPath;
			ret.bp_cmds = bp_cmds;
			ret.bp_name = bp_name;
			
			ret.name = (dirPath || "")+"bpf_"+match[2]+"_"+bp_name;
			if(!path.isAbsolute(ret.name))
			{
				var rootPath = path.resolve("./");
				var refPath = path.resolve(path.dirname(path.resolve(filePath)), ret.name);
				refPath = toLeftSlash(refPath.replace(rootPath, ""));
				if(refPath.startsWith("/"))
				{
					refPath = refPath.substr(1);
				}

				ret.name = refPath;
			}

			if(ret.name.startsWith("./"))	// Remove ./
			{
				ret.name = ret.name.substr(2);
			}

			ret.newContent = function(hash)
			{
				return content.replace("bpf_"+match[2], hash);
			}

			return ret;
		}

		var checkMatch = function(match)
		{
			var content = match[0];
			var plugin  = match[3];
			var dirPath = toLeftSlash(match[4] || "");
			var cmdsContent = match[5];
			var bp_cmds = cmdsContent.split("-");
			var bp_name = match[7];

			var wr = match[1]+match[8];
			if( wr !== "()" && wr !== "\"\"" && wr !== "''" && wr !== "\\'\\'" && wr !== "\\\"\\\"")
			{
				return ;
			}

			if(!bp_name)
			{
				return ;
			}

			var i=0,i_sz=bp_cmds.length;
			for(; i<i_sz; ++i)
			{
				if(bp_cmds[i] === "hash")
				{
					break;
				}
			}

			if(i===i_sz)
			{
				return ;
			}

			if(dirPath && !dirPath.endsWith("/"))	// Invalid
			{
				return ;
			}

			var ret = {};
			ret.content = content;
			ret.dirPath = dirPath;
			ret.bp_cmds = bp_cmds;
			ret.bp_name = bp_name;
			ret.plugin  = plugin;

			ret.name = (ret.dirPath || "")+"bpf_"+cmdsContent+"_"+bp_name;
			if(isIMG(ret.name) || isCSS(ret.name) || isHTML(ret.name) || isJSON(ret.name) || isJS(ret.name))
			{

			}
			else if(!ret.plugin && !isJS(ret.name))
			{
				ret.name += ".js";
			}
			else if(ret.plugin === "css" && !isCSS(ret.name))
			{
				ret.name += ".css";
			}
			else if(ret.plugin === "json" && !isJSON(ret.name))
			{
				ret.name += ".json";
			}
			else if(ret.plugin === "view" && !isJS(ret.name))
			{
				ret.name += ".js";
			}

			if(ret.name.startsWith("./"))	// Remove ./
			{
				ret.name = ret.name.substr(2);
			}

			ret.newContent = function(hash)
			{
				return content.replace("bpf_"+cmdsContent, hash);
			}

			return ret;
		}

		var cssReg = /@import\s*("([^"]*)"|'([^']*)')|url\s*\((?!#)\s*(\s*"([^"]*)"|'([^']*)'|[^\)]*\s*)\s*\)/g;
		var reg = /('|\"|\(|\\\"|\\\'){1}(([\w\$-]+)\!)?([^<>,;!'=\s\|\:\"\*\?\+\{\}\(\)\[\]]*)bpf_([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)_([^<>,;!'=\\\/\s\|\:\"\*\?\+\{\}\(\)\[\]]+)('|\"|\)|\\\"|\\\'){1}/g;
		reg = isCSS(filePath) ? cssReg : reg; 
		var check = isCSS(filePath) ? checkCSSMatch : checkMatch; 
		var src = fs.readFileSync(filePath, "utf-8");
		var mat = reg.exec(src);
		var ret = [];
		while(mat)
		{
			reg.lastIndex = mat.index+mat[0].length;

			mat = check(mat);
			if(mat)
			{
				ret.push(mat)
			}

			mat = reg.exec(src);
		}

		return ret;
	}

	// Collect reference between hash BP files
	for(var name in hashBPFiles)
	{
		if(!needHashReferenceProcess(name))
		{
			continue;
		}

		var hbpf = hashBPFiles[name];
		var refs = collectHashReferences(hbpf.path);
		if(refs && refs.length > 0)
		{
			hbpf.deps = refs;

			console.log("References for "+name+" :");
			hbpf.deps.forEach(function(value)
			{
				console.log("    "+value.name);
			});
		}
	}

	// Fix reference between hash BP files
	var processBinParsedFileHash = function(BPFile, BPFiles)
	{
		if(BPFile._hashProcessState === 2)		// Done
		{
			return ;
		}
		else if(BPFile._hashProcessState === 1)	// Ing
		{
			BPFile.hash = md5(BPFile.name+(new Date()).getTime());
			BPFile.newBaseName = BPFile.hash+"_"+BPFile.bp_name;
			BPFile._hashProcessState = 2;

			return ;
		}

		BPFile._hashProcessState = 1; 

		if(!needHashReferenceProcess(BPFile.name))
		{
			var content = fs.readFileSync(BPFile.path, "binary");

			BPFile.hash = md5(content.toString());
			BPFile.newBaseName = BPFile.hash+"_"+BPFile.bp_name;
			fs.writeFileSync(BPFile.name.replace(BPFile.baseName, BPFile.newBaseName), content, "binary");

			BPFile._hashProcessState = 2;

			return ;
		}

		for(var i=0,i_sz=BPFile.deps.length; i<i_sz; ++i)
		{
			if(!BPFiles[BPFile.deps[i].name])
			{
				console.log("Can't fix reference "+BPFile.deps[i].name+" for "+BPFile.name);
			}
			else
			{
				processBinParsedFileHash(BPFiles[BPFile.deps[i].name], BPFiles);
			}
		}

		var content = fs.readFileSync(BPFile.path, "utf-8");
		for(var i=0,i_sz=BPFile.deps.length; i<i_sz; ++i)
		{
			var dep = BPFile.deps[i];
			var depBPF = BPFiles[dep.name];
			if(depBPF)
			{
				content = content.replace(str2reg(dep.content), dep.newContent(depBPF.hash));
			}
		}

		if(BPFile._hashProcessState === 1)
		{
			BPFile.hash = md5(content);
			BPFile.newBaseName = BPFile.hash+"_"+BPFile.bp_name;
			BPFile._hashProcessState = 2;
		}

		fs.writeFileSync(BPFile.name.replace(BPFile.baseName, BPFile.newBaseName), content, "utf-8");
	}

	for(var name in hashBPFiles)
	{
		processBinParsedFileHash(hashBPFiles[name], hashBPFiles);
	}

	for(var name in hashBPFiles)
	{
		fs.unlinkSync(hashBPFiles[name].path);
	}
	process.chdir(oldCwd);
	
	// Fix reference for other non-hash-BP files
	var ignores = ["./**"].concat(DEFAULT_IGNORES).concat(config.hashReferenceProcessingPatterns || []);
	var BPNewFilesMap = {};
	for(var name in hashBPFiles)
	{
		BPNewFilesMap[hashBPFiles[name].newBaseName] = true;
	}

	return gulp.src(ignores, {cwd:tempPath})
			.pipe(through.obj({}, 
			function(chunk, enc, callback)
			{
				if(chunk.isNull())
				{
					callback(null, chunk);
					return;
				}

				var fullPath = chunk.path;
				var baseName = path.basename(fullPath);

				if(!needHashReferenceProcess(baseName))
				{
					callback(null, chunk);
					return;
				}

				if(BPNewFilesMap[baseName])
				{
					callback(null, chunk);
					return ;
				}

				var content = null;
				if(chunk.isBuffer())
				{
					content = chunk.contents.toString();
				}
				else if(chunk.isStream())
				{
					callback("Can't handle stream", chunk);
					return ;
				}

				var deps = collectHashReferences(fullPath);
				if(deps && deps.length > 0)
				{
					console.log("References for "+path.relative(path.resolve(tempPath), path.resolve(fullPath)));
					deps && deps.forEach(function(value)
					{
						console.log("    "+value.name);
					});
					for(var i=0,i_sz=deps.length; i<i_sz; ++i)
					{
						var depBPF = hashBPFiles[deps[i].name];
						if(!depBPF)
						{
							console.log("Can't fix reference "+deps[i].name+" for "+fullPath);
						}
						else
						{
							content = content.replace(str2reg(deps[i].content), deps[i].newContent(depBPF.hash));
						}
					}
				}

				chunk.contents = new Buffer(content, "utf-8");
				
				callback(null, chunk);
			}))
			.pipe(gulp.dest(tempPath));
});

gulp.task("generate-local-caches-manifest", ["process-bpf-command-hash"], function(cb) 
{
	var versionConfig = config.localCachesManifest;
	if(!versionConfig)
	{
		cb();

		return ;
	}

	var basePath        = path.resolve(tempPath);
    var nodeRequire     = require;
    var localCachesPath = path.resolve(tempPath, "local-caches.json"); 
    var oldLocalCaches  = null;
    try
    {
        oldLocalCaches = nodeRequire(localCachesPath);
    }
    catch(e)
    {
        oldLocalCaches = {version:0, files:{}};
    }
    var newLocalCaches  = {};

    
    
    var pathToUrl = function(path)
    {
        var ret = path.replace(basePath, (basePath[basePath.length-1]==="/" || basePath[basePath.length-1]==="\\" ? "./" : '.'));
    	return toLeftSlash(ret);
    }

    var processDir = function(dirPath)
    {
        var files = fs.readdirSync(dirPath);
        var filePath = null;
        var fileStat = null;
        for(var i=0,i_sz=files.length; i<i_sz; ++i)
        {
            filePath = files[i];
            if(files[0] === '.')
            {
                continue;
            }
            filePath = path.join(dirPath, filePath);
            fileStat = fs.statSync(filePath);
            if(fileStat.isFile())
            {
                processFile(filePath)
            }
            else if(fileStat.isDirectory())
            {
                processDir(filePath)
            }
        }
    }

    var processFile = function(filePath)
    {
        var ext = path.extname(filePath);
        ext = ext.toLowerCase();
        if(!(ext === ".css" || ext === ".html" || ext === ".js"))
        {
            return ;
        }
        
        var content = fs.readFileSync(filePath, "utf-8");
        var url     = pathToUrl(filePath);
        newLocalCaches.files[url] = md5(content);

        console.log("    "+newLocalCaches.files[url]+" "+url);
    }

    var onLoad = function()
    {
		if (versionConfig.all) {
			newLocalCaches.all = true;
			newLocalCaches.version = oldLocalCaches.version + 1;
		} else {
			var newFiles = newLocalCaches.files;
			var oldFiles = oldLocalCaches.files;
			newLocalCaches.version = oldLocalCaches.version;
			for (var key in newFiles) {
				if (!oldFiles[key] || oldFiles[key] !== newFiles[key]) {
					newLocalCaches.version = oldLocalCaches.version + 1;
					break;
				}
			}

			for (var key in oldFiles) {
				if (!newFiles[key]) {
					newLocalCaches.version = oldLocalCaches.version + 1;
					break;
				}
			}
		}

		var content = JSON.stringify(newLocalCaches);
		fs.writeFileSync(localCachesPath, content, 'utf8');

		cb();
    }

    newLocalCaches.files = {};
    if(versionConfig.all)
	{
		onLoad();

		return;
	}

	console.log("Local cache changed list :")
	var dirs = versionConfig.dirs;
	var dir = null;
	var dirStat = null;
	for (var i = 0, i_sz = dirs.length; i < i_sz; ++i) 
	{
		dir = dirs[i];
		dir = path.resolve(path.join(tempPath, dirs[i]));
		dirStat = fs.statSync(dir);
		if (dirStat.isFile()) 
		{
			processFile(dir)
		}
		else if (dirStat.isDirectory()) 
		{
			processDir(dir)
		}
	}

	onLoad();
});

gulp.task('build', ["generate-local-caches-manifest"], function(cb)
{
	rmdirSync(destPath);
	return 	gulp.src("**", {cwd:tempPath})
			.pipe(gulp.dest(destPath))
			.pipe(through.obj({}, 
			function(chunk, enc, callback)
			{
				callback(null, chunk);
			}, 
			function(cb)
			{
				rmdirSync(tempPath);
				cb();
			}));
});


    















