define(
[], 
function()
{
	var Super = bin.ui.NaviPageView;
	var Class = {};

    Class.onViewPush = function(from, data)
    {
        this._pushData = data;
    }

	Class.posGenHTML = function()
	{
        if(this._pushData && this._pushData.name)
        {
            this.setTitle(this._pushData.addr+" "+this._pushData.name);
        }

        var self = this;
        this.request(new Promise(function(res, rej)
        {
            bin.mapManager.require(function(error)
            {   
                if(error)
                {
                    rej(error);
                    return ;
                }

                res();
            });
        })).then(function()
        {
            var map = new BMap.Map("mapContainer");

            var lat = 106.558721;
            var lng = 29.569247;

            var lvl = 12;

            if(self._pushData && self._pushData.locate)
            {
                lat = self._pushData.locate.lat;
                lng = self._pushData.locate.lng;
                lvl = 14;
            }

            map.centerAndZoom(new BMap.Point(lat, lng), lvl);
        }).catch(function(error)
        {
            bin.hudManager.showStatus("加载地图失败");
        });
	}

	return Super.extend(Class);
});