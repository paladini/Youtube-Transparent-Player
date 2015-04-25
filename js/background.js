/*

Current problem: not setting cookies correctly.
Apenas chamar uma vez o getCookie, não dentro do listener.
*/



// Compatibility reasons
if (!chrome.runtime) { // Chrome 20-12
    chrome.runtime = chrome.extension;
} else if(!chrome.runtime.onMessage) { // Chrome 22-25
    chrome.runtime.onMessage = chrome.extension.onMessage;
    chrome.runtime.sendMessage = chrome.extension.sendMessage;
    chrome.runtime.onConnect = chrome.extension.onConnect;
    chrome.runtime.connect = chrome.extension.connect;
}

var languageConfig = {
	url: "http://youtube.com", 
	name: "PREF"
};

var cacheConfig = {
	url: "http://youtube.com",
	name: "VISITOR_INFO1_LIVE"
};

var cookieCache = null;
var cookieConfig = null;
var cookiesLoaded = false;

function getCookies(callback) {
	chrome.cookies.get(languageConfig, function(cookie){
		cookieConfig = cookie;
		chrome.cookies.get(cacheConfig, function(c) {
			cookieCache = c;
			cookiesLoaded = true;
			callback();
		});
	});
}

/* Change the Youtube cookie responsible for the preferences (summarizing, change the language to EN-US). */
function changePreferences(callback) {
	var cookie = cookieConfig;

	// Get "hl=" and later the first "&"
	var indexHL = cookie.value.indexOf("hl=");
	var indexEnd = cookie.value.indexOf("&", indexHL);

	// Dealing with the position of "hl=__&" in the 'cookie.value' string.
	if (cookie.value.charAt(indexHL - 1) == "&") {
		indexHL--;
	} 

	if (indexEnd == -1) {
		cookie.value = cookie.value.substr(0, indexHL);
	} else {
		if (cookie.value.charAt(indexEnd) == "&") {
			indexEnd++;
		}

		if (indexHL != 0) {
			indexEnd--;
		}

		cookie.value = cookie.value.substr(0, indexHL) + cookie.value.substr(indexEnd);
	}

	cookie.value += "&hl=en";
	createCookieLanguage(cookie, callback);
	
};

/** Set the cookie responsible for enable the new Youtube Transparent Player. */
function createCookiePlayer(tabId) {
	var fredTheCookie = {
		url: "http://youtube.com",
		name: cookieCache.name,
		value: "Q06SngRDTGA",
		domain: cookieCache.domain,
		path: cookieCache.path,
		expirationDate: cookieCache.expirationDate
	}
	// alert(JSON.stringify(fredTheCookie));
	// cookieCache.value = "Q06SngRDTGA";
	// cookieCache.url = "http://youtube.com";

	// alert("Youtube Transparent Player will reload the page to enable the new player. If it not works, try reload manually. \n\n This message should appear only once, if this not happens, please, contact the developers.");
	chrome.cookies.set(fredTheCookie, function() {
		chrome.tabs.reload(tabId, { bypassCache: false } );
	});
};

/** Set the cookie responsible for the language settings. Works both for cookie cretion or overwrite. */
function createCookieLanguage(cookie, callback) {
	chrome.cookies.set({
		url: languageConfig.url,
		name: languageConfig.name,
		value: cookie.value,
		domain: ".youtube.com",
		path: "/", 
		expirationDate: cookie.expirationDate
	}, callback());
}

function check(tabId) {
	// Create the cookie if it doesn't exists (probably will be never called)
	/*if(cookieConfig == null || cookieConfig == undefined) {
		var cookie = {
			value: "hl=en",
			expirationDate: (new Date().getTime()/1000) + 31536000
		};

		var callback = function() {
			createCookiePlayer(tabId);
		};
		createCookieLanguage(cookie, callback);
	} else { */
		/* var callback = function() {
    		changePreferences(function() {
    			createCookiePlayer(tabId);
    		});
    	}
		checkIfNeeded(callback); */
	//alert(cookieConfig.value.indexOf("hl=en") == -1);
	// alert(cookieCache.value != "Q06SngRDTGA");
	if (cookieConfig.value.indexOf("hl=en") == -1 || cookieCache.value != "Q06SngRDTGA") {
		changePreferences(function() {
			createCookiePlayer(tabId);
		});
	} 
	//}
}

// Adding listener.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "checkCookies") { // every time access Youtube.com
    	
    	// Check if the cookies are loaded.
    	if(cookiesLoaded == false) {
	    	getCookies(function(){
	    		check(sender.tab.id);
	    	});
    	} else {
    		check(sender.tab.id);
    	}

    } else if (request.type == "reinstall"){ // from options page
    	
    	// Check if the cookies are loaded.
    	if(cookiesLoaded == false) {
	    	getCookies(function(){
	    		changePreferences(function() {
		    		createCookiePlayer(tabId);
		    	});
	    	});
    	} else {
    		changePreferences(function() {
	    		createCookiePlayer(tabId);
	    	});
    	}
    }
	return true;
});