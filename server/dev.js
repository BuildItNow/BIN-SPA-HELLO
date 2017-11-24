var config = require('../config/serverConfig');
var cp     = require('child_process');
var colors = require('colors');
var param  = "";
for (var key in config) 
{
    if(config[key] === "false") 
    {
        param = param + '--no--' + key + ' '
    } 
    else if(key === "files") 
    {
        param = param + '--' + key + ' ' + '"' + config[key] + '" '
    } 
    else 
    {
        var v = config[key];
        if(typeof v === "boolean")
        {
            v = v ? "true" : "false";
        }
        param = param + "--" + key + ' ' +  config[key] + ' ';
    }
}
param = "browser-sync start " + param;

console.log(param);

cp.exec(param);
console.log(colors.green('Successful, Please open the address in the browser: localhost:' + config.port));