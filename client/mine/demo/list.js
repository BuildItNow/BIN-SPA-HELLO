/*
 * bitnow-cli auto generate
 */

define(
["bin/common/listView"], 
function(ListView)
{
	var Super = bin.ui.NaviPageView;
	var Class = {};

	Class.vmData = 
	{
		items:[]
	}

	Class.preGenHTML = function()
	{
		// Provide list data
		this.dataProvider = new ListView.DataProvider({
			pageSize: 15,
			loadAPI: function(params, success, error)
			{
				// Mock async requesting
				setTimeout(function()
				{
					var page = params.page;
					var pageSize = params.pageSize;

					var data = {page: page, pageSize: pageSize};

					// page 0 means refresh, otherwise loadmore
					if(page === 0)
					{
						data.total = 3*pageSize;
					}

					var items = [];
					for(var i=0; i<pageSize; ++i)
					{
						items.push(page*pageSize+i);
					}

					data.data = items;

					success({code:0, data:data});
				}, 1000);
			}
		});

		// Provide item view instance
		this.itemProvider = function(view, i, data)
		{
			return new bin.ui.View({
				html: "<section>Section {{index}}</section>",
				vmData: {index:data}
			});
		}
	}

	Class.posGenHTML = function()
	{
	}

	return Super.extend(Class);
});