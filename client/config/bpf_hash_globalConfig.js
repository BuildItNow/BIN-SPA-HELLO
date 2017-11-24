define(
{
	name: "SPA-HELLO",
	appID: "com.bin.spa-hello",
	runtime: "RELEASE",
	pageIOAnim: "rightILeftO",
	placeholder: "bin/res/img/bpf_hash_placeholder.jpg",
	mapSDK: "2.0",
	DEBUG: 
	{
		debug: true,
		useNetLocal: true,
		server: "$HOST/",
		timeout: 20000,
		maxCacheDuration: 20000
	},
	RELEASE:
	{
		useNetLocal: true,
		server: "$HOST/",
		timeout: 20000,
		maxCacheDuration: 20000
	},
	requireConfig:
	{
		packages: 
		[],
		paths: 
		{
		},
		shim: 
		{
		},
		urlArgs:"v=$(bpv_version)"
	},
	classConfig:
	{
		core:
		{
			Application:"application/application",
			NetManager:
			{
				_path:"bin/core/netManager",
				CallbackPolicy:"application/netCallbackPolicy",
				SendCheckPolicy:"bin/core/netPolicy/netSendCheckPolicy"	
			},
			DataCenter:"application/dataCenter",
			HUDManager:"bin/core/hudManager",	
			NavigationController:"bin/core/navigationController",
			MapManager:"bin/core/mapManager"
		},
		ui:
		{
			View:"bin/core/view",
			PageView:"bin/core/pageView",
			NaviPageView:"bin/core/naviPageView"
		}
	},
	packages:
	[
		"bin/bpf_hash_bin.bundle.js",
		"bin/bpf_hash_3party.bundle.js"
	]
});
