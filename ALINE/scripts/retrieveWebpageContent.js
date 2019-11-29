// Retrieve the desired content of the webpage
var content;
var sectionOrFull;
var textOnly;
var selector;
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    if (sender.tab) {

        // Retrieve useful information about which content to retrieve
        var sectionOrFull = request.sectionOrFull;
        var textOnly = request.textOnly;
        var CSSSelector = "";

        if (sectionOrFull.localeCompare("section") == 0) {
            CSSSelector = request.CSSSelector;
        }


        // Retrieve the actual content
        if (textOnly) {
            if (sectionOrFull.innerText.localeCompare("full") == 0) {
                chrome.extension.sendRequest({ content: document.documentElement.innerText });
            } else {
                chrome.extension.sendRequest({ content: document.querySelector(selector).innerText });
            }
        } else {
            if (document.getElementById('sectionorfull').innerText.localeCompare("full") == 0) {
                chrome.extension.sendRequest({ content: document.documentElement.innerHTML });
            } else {
                chrome.extension.sendRequest({ content: document.querySelector(selector).innerHTML });
            }
        }
    }

});

