// Compatibility reasons
if (!chrome.runtime) { // Chrome 20-12
    chrome.runtime = chrome.extension;
} else if (!chrome.runtime.onMessage) { // Chrome 22-25
    chrome.runtime.onMessage = chrome.extension.onMessage;
    chrome.runtime.sendMessage = chrome.extension.sendMessage;
    chrome.runtime.onConnect = chrome.extension.onConnect;
    chrome.runtime.connect = chrome.extension.connect;
}

/* This function call the listener inside of 'js/background.js' file. */
function reinstall() {
    chrome.extension.sendMessage({type: "reinstall"});
}

document.getElementById('save').addEventListener('click', reinstall);
