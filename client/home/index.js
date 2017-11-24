define(
[], 
function()
{
	var Super = bin.ui.NaviPageView;
	var Class = {};

	Class.onTabChange = function(view, item)
    {
        if(this._currentItem)
        {
            this[this._currentItem].hide();
        }

        this._currentItem = item;
        this[this._currentItem].show();
    }

    Class.onLeft = function()
    {
        window.open("http://github.com/BuildItNow/BIN");
    }

    Class.onRight = function()
    {
        window.open("http://101.200.215.114/apps/bin/document.html");
    }

	return Super.extend(Class);
});