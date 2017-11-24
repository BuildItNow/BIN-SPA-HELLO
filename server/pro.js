var cp     = require("child_process");

console.log("Build project ...");

cp.execSync("npm run build", {stdio: "inherit"});



var config = require("../config/serverConfig");
var gulpConfig = require("../config/gulpConfig");
var path = require("path");

config.server = path.resolve(gulpConfig.destPath || "client-build");

var BrowserSync = require("browser-sync");

var bs = BrowserSync.create();
bs.init(config);
bs.reload();
