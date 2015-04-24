// Compatibility reasons
if (!chrome.runtime) { // Chrome 20-12
    chrome.runtime = chrome.extension;
} else if(!chrome.runtime.onMessage) { // Chrome 22-25
    chrome.runtime.onMessage = chrome.extension.onMessage;
    chrome.runtime.sendMessage = chrome.extension.sendMessage;
    chrome.runtime.onConnect = chrome.extension.onConnect;
    chrome.runtime.connect = chrome.extension.connect;
}

chrome.extension.sendMessage({type: "checkCookies"});

