define(
["bin/core/spaApplication", "application/dataCenter"],
function(Base, DataCenter)
{
	var Application = {};

	Application.run = function()
	{
		Base.prototype.run.call(this);
		
		bin.naviController.startWith("home/index");
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

		var elemRoot = document.documentElement;
		if(!this._fontSize)
		{
			var f = parseInt(elemRoot.style.fontSize);
			this._fontSize = parseInt(420*f/w)+"px";
		}
		elemRoot.style.fontSize = this._fontSize;
	}

	return Base.extend(Application);
});
