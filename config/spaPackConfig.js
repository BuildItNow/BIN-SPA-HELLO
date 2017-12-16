var config = 
{
	mainConfigFile : "bin/bpf_hash_requireMain.js",
	bundles :
	{
		"bin":
		{
			include:
			[
				"view",
				"html",
			    "map",
			    "bin/core/application", 
			    "bin/core/spaApplication", 
			    "bin/core/main",
			    "bin/core/classHierarchyLoader",
			    "bin/core/netManager",
			    "bin/core/hudManager",
			    "bin/core/navigationController",
			    "bin/core/dataCenter",
			    "bin/core/mapManager",
			    "bin/core/view",
			    "bin/core/pageView",
			    "bin/core/pageView-animation",
			    "bin/core/naviPageView",
			    "bin/core/navigationController-ioEffecters",
			    "bin/core/netPolicy/netCallbackPolicy",
			    //"bin/core/netPolicy/netDebugPolicy",
			    "bin/core/netPolicy/netSendCheckPolicy",
			    "bin/core/util",
			    "bin/core/route",
			    "bin/core/router",

			    // common
			    "bin/common/hudView",
			    "bin/common/alertView",
			    "text!bin/common/alertView.html",
			    "css!bin/common/alertView.css",
			    "bin/common/selectView",
			    "text!bin/common/selectView.html",
			    "css!bin/common/selectView.css",
			    "bin/common/dataProvider",
			    "bin/common/datePickerView",
			    "text!bin/common/datePickerView.html",
			    "css!bin/common/datePickerView.css",
			    "bin/common/imageSet",
			    "bin/common/indicatorView",
			    "text!bin/common/indicatorView.html",
			    "css!bin/common/indicatorView.css",
			    "bin/common/itemProvider",
			    "bin/common/lazyLoadView",
			    "bin/common/listView",
			    "bin/common/refreshFooterView",
			    "text!bin/common/refreshFooterView.html",
				"bin/common/refreshHeaderView",
				"text!bin/common/refreshHeaderView.html",
			    "bin/common/scrollView",
				"bin/common/refreshView",
				"bin/common/statusView",
				"text!bin/common/statusView.html",
				"css!bin/common/statusView.css",
				"bin/common/swipeView",
				"bin/common/tabBarView",
				"bin/common/tabView",

				// debug
				//"bin/debug/debugView",
				//"text!bin/debug/debugView.html",

				// res
				"text!bin/res/html/defaultNaviBar.html",
			],
			exclude:
			[
				"#3party-0", 
				"#3party-1", 
				"#3party-2", 
				"#3party-3"
				//"bin/core/debugManager",
				//"bin/core/netPolicy/netDebugPolicy", 
				//"bin/debug/debugView",
				//"text!bin/debug/debugView.html"
			],
			//out:"",
		},
		"3party-0":
		{
			include:
			[
				"jquery"
			],
			exclude:[],
			//out:"",
		},
		"3party-1":
		{
			include:
			[
				"i18n", 
				"css",
				"domReady", 
				"text",
				"fastclick", 
				"prloader", 
				"lsloader", 
				"lzstring",
				"backbone"
			],
			exclude:["#3party-0"],
			//out:"",
		},
		"3party-2":
		{
			include:
			[
				"iscroll", 
				"swiper"
			],
			exclude:["#3party-0", "#3party-1"],
			//out:"",
		},
		"3party-3":
		{
			include:
			[
				"underscore", 
				"vue"
			],
			exclude:["#3party-0", "#3party-1", "#3party-2"]
			//out:"",
		}
	}
}

module.exports = config;
