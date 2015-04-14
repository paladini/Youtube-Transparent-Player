function checkSuccess(cookie) {
	if(cookie == null) {
		alert("Something went wrong with Youtube Transparent Player.\nWe couldn't set your Youtube player to the new Youtube Transparent Player.\n Please contact the developers about this issue.");
	}
}

function changePreferences() {
	var aliceCroockipier = {
		url: "http://youtube.com", 
		name: "PREF"
	};

	chrome.cookies.get(aliceCroockipier, function(cookie){

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
			expirationDate: cookie.expirationDate
		}, function(c) {
			if(c == null) {
				alert("Something went wrong while trying to change Youtube language into English!");
			}
		});
	});
}

function setNewPlayer(cookie) {
	var fredTheCookie = {
		url: "http://youtube.com", 
		name: "VISITOR_INFO1_LIVE",
		value: "Q06SngRDTGA",
		domain: ".youtube.com",
		path: "/",
		expirationDate: (new Date().getTime()/1000) + 31536000
	}

	chrome.cookies.set(fredTheCookie, checkSuccess);
};

var option = confirm("To get the Youtube onew transparent player, you must change your Youtube language to English (US). \n\nCan we do that for you?")
if (option) {
	changePreferences();
}

setNewPlayer();
