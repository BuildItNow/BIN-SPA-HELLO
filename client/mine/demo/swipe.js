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

	Class.onChange = function(view, index)
	{
		// Swipe Change TODO
		bin.hudManager.showStatus("Change to "+index);
	}

	return Super.extend(Class);
});