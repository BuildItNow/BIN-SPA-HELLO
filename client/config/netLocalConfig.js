(function()
{
	var config = {};
	var TURN_ON  = true;
	var TURN_OFF = false;

	var CASE = function(api, on, data, options)
	{
		if(on)
		{
			if(typeof(options) === "string")
			{
				options = {method:options};
			}

			config[api] = {data:data, options:options};
		}
	}
	var NET_DATA_GENERATOR = function(generator) {
		config._netDataGenerator = generator;
	}

	define([], function()
	{
		var hots = 
		[
            {
                name: "天坑",
                addr: "武隆",
                icon: "url(work/img/wulongtiankeng.jpg)",
                locate: {lat:107.811253, lng:29.434985},
                desc: "重庆武隆后坪乡天坑群，景区内的阎王沟岩溶峡谷全长2300m，总深度约500m，是盲谷式现代峡谷，谷深林幽，特别是下段，谷底深切，两岸下部近直立，宽度及小，气势逼人，行走其中，感受别样，具有一定的观赏价值，对了解该地区的水文、地貌发育演化史也有重要意义。"
            },
            {
                name: "芙蓉洞",
                addr: "武隆",
                icon: "url(work/img/furongdong.jpeg)",
                locate: {lat:107.915758, lng:29.226557},
                desc: "重庆武隆芙蓉洞，是喀斯特世界自然遗产保护地、中国国家5A级旅游区、中国国家重点风景名胜区、中国国家地质公园。也是世界唯一被列为世界自然遗产保护地的洞穴。芙蓉洞庞大的洞体，丰富的洞穴沉积物不但征服了各国洞穴专家，更倍受众多前来观光的游客青睐。"
            },
            {
                name: "黑山谷",
                addr: "万盛",
                icon: "url(work/img/heishangu.jpeg)",
                locate: {lat:107.003586, lng:28.891549},
                desc: "黑山谷景区原始生态风景由峻岭、峰林、幽峡、峭壁、森林、林海、飞瀑、碧水、溶洞、栈道、浮桥、云海、田园、原始植被、珍稀动植物等200多个景点景观组成。"
            }
        ];

        CASE("api/getHots", TURN_ON, function()
        {
        	// Shuffle the array
        	for(var i=0; i<20; ++i)
        	{
        		var l = parseInt(Math.random()*1000)%hots.length;
        		var r = parseInt(Math.random()*1000)%hots.length;

        		var t = hots[l];
        		hots[l] = hots[r];
        		hots[r] = t;
        	}

        	return hots;
        });

        CASE("api/updatePassword", TURN_ON, true, "POST");

		return config;
	});
}());