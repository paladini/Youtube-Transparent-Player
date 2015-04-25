// Compatibility reasons
if (!chrome.runtime) { // Chrome 20-12
    chrome.runtime = chrome.extension;
} else if(!chrome.runtime.onMessage) { // Chrome 22-25
    chrome.runtime.onMessage = chrome.extension.onMessage;
    chrome.runtime.sendMessage = chrome.extension.sendMessage;
    chrome.runtime.onConnect = chrome.extension.onConnect;
    chrome.runtime.connect = chrome.extension.connect;
}

var cookieCache = null, cookieConfig = null, cookiesLoaded = false;
var languageConfig = {
	url: "http://youtube.com", 
	name: "PREF"
};

var cacheConfig = {
	url: "http://youtube.com",
	name: "VISITOR_INFO1_LIVE"
};

/** Set the cookie responsible for enable the new Youtube Transparent Player. */
function createCookiePlayer() {
	chrome.cookies.set({
		url: "http://youtube.com",
		name: "VISITOR_INFO1_LIVE",
		value: "Q06SngRDTGA",
		domain: ".youtube.com",
		path: "/",
		expirationDate: (new Date().getTime()/1000) + 15552000
	}, function() {
		alert("Done! Now your new Youtube transparent player should be working! Anyway, don't forget to check the options page.\n\nPlease, reload your open Youtube tabs (or open a new one) to test the new player.");
	});
};

/** Set the cookie responsible for the language settings. Works both for cookie cretion or overwrite. */
function createCookieLanguage(cookie, callback) {
	chrome.cookies.set({
		url: "http://youtube.com",
		name: "PREF",
		value: cookie.value,
		domain: ".youtube.com",
		path: "/", 
		expirationDate: (new Date().getTime()/1000) + 15552000
	}, callback);
}

/* Change the Youtube cookie responsible for the preferences (summarizing, change the language to EN-US). */
function changePreferences(callback) {
	if (cookieConfig == null) {
		createCookieLanguage({value: "hl=en"}, callback);
	} else {
		// Get "hl=" and later the first "&"
		var cookie = cookieConfig;
		var indexHL = cookie.value.indexOf("hl=");
		var indexEnd = cookie.value.indexOf("&", indexHL);

		// Dealing with the position of "hl=__&" in the 'cookie.value' string.
		if (cookie.value.charAt(indexHL - 1) == "&") { indexHL--; } 
		if (indexEnd == -1) {
			cookie.value = cookie.value.substr(0, indexHL);
		} else {
			if (cookie.value.charAt(indexEnd) == "&") { indexEnd++; }
			if (indexHL != 0) { indexEnd--; }
			cookie.value = cookie.value.substr(0, indexHL) + cookie.value.substr(indexEnd);
		}
		cookie.value += "&hl=en";
		createCookieLanguage(cookie, callback);
	}
};

function check() {
	if (cookieConfig == null || cookieCache == null) {
		changePreferences(function() {
			createCookiePlayer();
		});
	} else if (cookieConfig.value.indexOf("hl=en") == -1 || cookieCache.value != "Q06SngRDTGA") {
		changePreferences(function() {
			createCookiePlayer();
		});
	} 
}

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

// Adding listener.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "reinstall"){ // from options page
    	
    	// Check if the cookies are loaded.
    	if(cookiesLoaded == false) {
	    	getCookies(function(){
	    		changePreferences(function() {
		    		createCookiePlayer();
		    	});
	    	});
    	} else {
    		changePreferences(function() {
	    		createCookiePlayer();
	    	});
    	}
    }
	return true;
});

// Check if the cookies are loaded.
if(cookiesLoaded == false) {
	getCookies(function(){
		check();
	});
} else {
	check();
}