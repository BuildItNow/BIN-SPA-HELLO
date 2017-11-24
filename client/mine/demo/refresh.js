/*
 * bitnow-cli auto generate
 */

define(
[], 
function()
{
	var Super = bin.ui.NaviPageView;
	var Class = {};

	Class.vmData = 
	{
		items:[]
	}

	Class.posGenHTML = function()
	{
		this._page = 0;
	}

	Class.onRefresh = function(view)
	{
		// Refresh TODO
		var self = this;

		// Mock a async requesting
		setTimeout(function()
		{
			if(self._page%3 === 2)
			{
				// Mock refresh fail
				view.refreshDone(true);

				++self._page;

				return ;
			}
			var items = [];

			for(var i=0; i<10; ++i)
			{
				items.push(self._page*10+i);
			}

			++self._page;

			self.vm.items = items;

			// vm updating is async, tell refreshview operation is done in vm.nextTick
			self.vm.$nextTick(function()
			{
				view.refreshDone();
			});
		}, 1000);

	}

	return Super.extend(Class);
});