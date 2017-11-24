var config = require("../config/serverConfig");
var BrowserSync = require("browser-sync");

var bs = BrowserSync.create();
bs.init(config);
bs.reload();
