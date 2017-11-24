define(
["bin/core/spaApplication", "application/dataCenter", "css!application/css/application.css"],
function(Base, DataCenter)
{
	var Application = {};

	Application.run = function()
	{
		Base.prototype.run.call(this);
		
		bin.naviController.startWith("home/index");
	}

	return Base.extend(Application);
});
