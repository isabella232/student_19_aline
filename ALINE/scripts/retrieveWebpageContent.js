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

        console.log("receive msg 1,2,3");
        // Retrieve the actual content
        if (textOnly) {
            if (isFull.innerText.localeCompare("full") == 0) {
                sendResponse({ content: document.documentElement.innerText });
            } else {
                sendResponse({ content: document.querySelector(selector).innerText });
            }
        } else {
            if (document.getElementById('sectionorfull').innerText.localeCompare("full") == 0) {
                sendResponse({ content: document.documentElement.innerHTML });
            } else {
                sendResponse({ content: document.querySelector(selector).innerHTML });
            }
        }

    });


