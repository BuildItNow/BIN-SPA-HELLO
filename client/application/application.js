define(
["bin/core/spaApplication", "application/dataCenter"],
function(Base, DataCenter)
{
	var Application = {};

	Application.run = function()
	{
		Base.prototype.run.call(this);
		
		bin.naviController.startWith("home/index", null, {onPushed:function()
		{
			bin.app.appBootBg.dismiss();
		}});
	}

	Application.onResize = function()
	{
		Base.prototype.onResize.call(this);

		var w = this._width;
		if(w <= 420)
		{
			return ;
		}
		this._width = 420;
		document.documentElement.style.fontSize = "26px";
	}

	return Base.extend(Application);
});
