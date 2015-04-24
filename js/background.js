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

var cookieConfig = null;
chrome.cookies.get(languageConfig, function(cookie){
	cookieConfig = cookie;
});

/** Check if the cookie is already updated with the correct cookies. If not, should call callback(); */
function checkIfNeeded(callback) {
	if (cookieConfig == null) {
		return;
	}

	// Check if the extension must update the cookies (or not).
	if (cookieConfig.value.indexOf("hl=en") == -1) {
		callback();
	} else {
		chrome.cookies.get(cacheConfig, function(cookie){
			if (cookie.value != "Q06SngRDTGA") {
				callback();
			}
		});
	}
};

/* Change the Youtube cookie responsible for the preferences (summarizing, change the language to EN-US). */
function changePreferences(callback) {
	var cookie = cookieConfig;
	if (cookie == null) {
		return;
	}

	// Get "hl=" and later the first "&"
	var indexHL = cookie.value.indexOf("hl=");
	var indexEnd = cookie.value.indexOf("&", indexHL);

	// Dealing with the position of "hl=__&" in the cookie.value string.
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

	// Overwriting the "PREF" cookie.
	chrome.cookies.set({
		url: "http://youtube.com",
		name: "PREF",
		value: cookie.value,
		domain: ".youtube.com",
		path: "/",
		session: false,
		hostOnly: false,
		httpOnly: false,
		secure: false,
		expirationDate: cookie.expirationDate
	}, callback());
};

/** Set the cookie responsible for enable the new Youtube Transparent Player. */
function setNewPlayer(tabId) {
	var fredTheCookie = {
		url: "http://youtube.com",
		name: "VISITOR_INFO1_LIVE",
		value: "Q06SngRDTGA",
		domain: ".youtube.com",
		path: "/",
		session: false,
		hostOnly: false,
		httpOnly: false,
		secure: false,
		expirationDate: (new Date().getTime()/1000) + 31536000
	}

	alert("Youtube Transparent Player will reload the page to enable the new player. If it not works, try reload manually. \n\n This message should appear only once, if this not happens, please, contact the developers.");
	chrome.cookies.set(fredTheCookie, chrome.tabs.reload(tabId));
};

// Adding listener.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "checkCookies") {
    	var callback = function() {
    		changePreferences(function() {
    			setNewPlayer(sender.tab.id);
    		});
    	}
		checkIfNeeded(callback);
    } 
	return true;
});