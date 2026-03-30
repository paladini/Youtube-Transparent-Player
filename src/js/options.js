/* This function call the listener inside of 'js/background.js' file. */
function reinstall() {
    chrome.runtime.sendMessage({type: "reinstall"}, function(response) {
        var message = response && response.message ? response.message : "Reinstall request sent. Reload your Youtube tabs and test again.";
        alert(message);
    });
}

document.getElementById('save').addEventListener('click', reinstall);
