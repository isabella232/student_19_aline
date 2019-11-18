import * as Cothority from "@dedis/cothority";
import {displayStatus, getDarc, loadSigner, addRule, spawnWebPage, printWebPageContract} from "./Utilities";
import {Handler} from "./Handler";
import {WebPageInstance, ContractWebPageData} from "./WebPageInstance";
import {roster} from "./roster"

export {
  Cothority
};

window.onload = function() {

    var skipChainID = "2a51f015d2bdcbc587dc32144444faa3fa792b5cd058b6c9cb9b456ac356ca64";
    var privateKey = "2a51f015d2bdcbc587dc32144444faa3fa792b5cd058b6c9cb9b456ac356ca64";
    var url;

    // CERTIFY WHOLE PAGE
    var checkPageButton = document.getElementById('fullpage');
    if (checkPageButton) {
        checkPageButton.addEventListener('click', function() {

    // Retrieve current URL  
      chrome.tabs.query({
        'active': true,
        'lastFocusedWindow': true
      }, async function(tabs) {
        url = tabs[0].url;

        // Retrieve TextOnly field
        const textOnlyBox = document.getElementById('txtOnly') as HTMLInputElement;
        var textOnly = textOnlyBox.checked

        // ** SPAWN CONTRACT ** //
        const p = document.getElementById('status');

        // Get public.toml
        await Handler.getInstance().LoadRoster(roster);

        // Skip chain ID
        await getDarc(skipChainID);

        // Private Key
        await loadSigner(privateKey);

        // Add rule to spawn the webPage contract
        await addRule("spawn:webPage");

        // Spawn the webPage contract
        var contractWebPageData = new ContractWebPageData();
        contractWebPageData.URLWebPage = url;
        contractWebPageData.Selector = "html"
        contractWebPageData.TextOnly = textOnly;
        
        await new Promise(resolve => setTimeout(resolve, 3000))
        await spawnWebPage(contractWebPageData).then(
            (r) => Handler.prependLog("instance spawned: " + r)
        ).catch(
            (e) => Handler.prependLog("failed to spawn web page: " + e)
        )        
        //let webPageContractID : string = await spawnWebPage(contractWebPageData);
        
        // Print the webPage contract
        //p.innerText = webPageContractID; //ID to save somewhere
        //Then to print our instance we use toString of WebPageContractInstance
    });
    }, false);
  }

  // CERTIFY PAGE SECTION
  var checkPageButton = document.getElementById('pagesection');
  if (checkPageButton) {
    checkPageButton.addEventListener('click', function() {
    
        var message = document.getElementById('message');

        chrome.tabs.executeScript(null, {
          file: "./scripts/css_selector_scripts/startSelectorGadget.js"
        }, function() {
          // If you try and inject into an extensions page or the webstore/NTP you'll get an error
          if (chrome.runtime.lastError) {
            message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
          }
        });

    // Retrieve current URL  
      chrome.tabs.query({
        'active': true,
        'lastFocusedWindow': true
      }, async function(tabs) {

        // Retrieve URL
        url = tabs[0].url;

        // Retrieve TextOnly field
        const textOnlyBox = document.getElementById('txtOnly') as HTMLInputElement;
        var textOnly = textOnlyBox.checked


        /*
        // ** SPAWN CONTRACT ** //
        const p = document.getElementById('status');

        // Get public.toml
        await Handler.getInstance().LoadRoster(roster);

        // Skip chain ID
        await getDarc(skipChainID);

        // Private Key
        await loadSigner(privateKey);

        // Add rule to spawn the webPage contract
        await addRule("spawn:webPage");

        // Spawn the webPage contract
        var contractWebPageData = new ContractWebPageData();
        contractWebPageData.URLWebPage = url;
        contractWebPageData.Selector = "html"
        contractWebPageData.TextOnly = textOnly;
        
        await new Promise(resolve => setTimeout(resolve, 3000))
        await spawnWebPage(contractWebPageData).then(
            (r) => Handler.prependLog("instance spawned: " + r)
        ).catch(
            (e) => Handler.prependLog("failed to spawn web page: " + e)
        )        
        //let webPageContractID : string = await spawnWebPage(contractWebPageData);
        
        // Print the webPage contract
        //p.innerText = webPageContractID; //ID to save somewhere
        //Then to print our instance we use toString of WebPageContractInstance*/
    });
    }, false);
  }
}