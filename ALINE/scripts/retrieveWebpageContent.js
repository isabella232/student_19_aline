// Retrieve the desired content of the webpage
var content;
var sectionOrFull;
var textOnly;
var selector;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        isFull = request.isFull;
        textOnly = request.textOnly;
        CSSSelector = request.CSSSelector;

        // Retrieve the actual content
        if (textOnly.localeCompare("true") == 0) {
            if (isFull.localeCompare("full") == 0) {
                sendResponse({ content: document.documentElement.innerText });
            } else {
                sendResponse({ content: document.querySelector(selector).innerText });
            }
        } else {
            if (isFull.localeCompare("full") == 0) {
                sendResponse({ content: document.documentElement.innerHTML });
            } else {
                console.log("content:\n")
                console.log(document.querySelector(selector).innerHTML)
                sendResponse({ content: document.querySelector(selector).innerHTML });
            }
        }

    });


