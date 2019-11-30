// Retrieve the desired content of the webpage
var content;
var sectionOrFull;
var textOnly;
var selector;

chrome.runtime.onRequest.addListener(
    function (request, sender, sendRequest) {

        isFull = request.isFull;
        textOnly = request.textOnly;
        CSSSelector = request.CSSSelector;

        console.log("receive msg 1,2,3");
        // Retrieve the actual content
        if (textOnly) {
            if (isFull.innerText.localeCompare("full") == 0) {
                sendRequest({ content: document.documentElement.innerText });
            } else {
                sendRequest({ content: document.querySelector(selector).innerText });
            }
        } else {
            if (document.getElementById('sectionorfull').innerText.localeCompare("full") == 0) {
                sendRequest({ content: document.documentElement.innerHTML });
            } else {
                sendRequest({ content: document.querySelector(selector).innerHTML });
            }
        }

    });


