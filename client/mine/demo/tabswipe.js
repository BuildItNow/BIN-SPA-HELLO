/*
 * bitnow-cli auto generate
 */

define(
[], 
function()
{
	var Super = bin.ui.NaviPageView;
	var Class = {};

	Class.posGenHTML = function()
	{
	}

	Class.onChange = function(view, item)
	{
		// Tab Change TODO
		bin.hudManager.showStatus("Change to "+item);
	}

	return Super.extend(Class);
});