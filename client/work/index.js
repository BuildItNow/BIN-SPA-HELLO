define(
["work/client"], 
function(Client)
{
	var Super = bin.ui.View;
	var Class = {};

    Class.vmData = 
    {
        images:
        [
            "url(work/img/chongqing0.jpeg)",
            "url(work/img/chongqing1.jpeg)",
            "url(work/img/chongqing2.jpeg)"
        ],
        hots:[]
    }

	Class.posGenHTML = function()
	{
        this.vmMethod_refreshHots();
	}

    Class.vmMethod_gotoHotLocate = function(data)
    {
        bin.naviController.push("work/locate", data);
    }

    Class.vmMethod_refreshHots = function()
    {
        var self = this;
        Client.getHots().then(function(netData)
        {
            if(netData.code == 0)
            {
                self.vm.hots = netData.data;
            }
        });
    }

	return Super.extend(Class);
});