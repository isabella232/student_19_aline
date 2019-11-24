// Retrieve CSS Selector in input form
    var isSelectorGadgetRunning = (document.getElementById('_sg_path_field') !== null);
    var selector;
    if(isSelectorGadgetRunning){
        selector = document.getElementById('_sg_path_field').value;
        chrome.extension.sendRequest({CSSSelector: selector});
    }


