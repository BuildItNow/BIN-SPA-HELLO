var config = 
{
    target: "spa",
	destPath: "client-build",
    tempPath: "client-build-temp",
    clientPatterns : ["!bin/web/**"],
    mergeBINViews : true,
    binParsedVariableTracingPatterns : ["!3rdParty/**", "!bin/3rdParty/**", "!bin/web/3rdParty/**"],
    binParsedVariables :
    {
        version : Date.now(),
    }
}

module.exports = config;