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
				"#3party", 
				//"bin/core/debugManager",
				//"bin/core/netPolicy/netDebugPolicy", 
				//"bin/debug/debugView",
				//"text!bin/debug/debugView.html"
			],
			//out:"",
		},
		"3party":
		{
			include:
			[
				"vue", 
				"i18n", 
				"css",
				"swiper",  
				"domReady", 
				"text", 
				"iscroll", 
				"fastclick", 
				"prloader", 
				"lsloader", 
				"lzstring", 
				"jquery", 
				"underscore", 
				"backbone"
			],
			exclude:[],
			//out:"",
		}
	}
}

module.exports = config;