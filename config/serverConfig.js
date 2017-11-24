var config =
{
    server: "./client",
    port: 3000,
    notify: false,
    files: "./client/**",
    logFileChanges: false,
    reloadDebounce: 1000
}

var fs = require("fs");
if(config.index)
{

}
else if(fs.existsSync("./client/index.html"))
{
    config.index = "index.html";
}
else if(fs.existsSync("./client/index-spa.html"))
{
    config.index = "index-spa.html";
}
else if(fs.existsSync("./client/index-web.html"))
{
    config.index = "index-web.html";
}

module.exports = config;
