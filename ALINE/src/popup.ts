import * as Cothority from "@dedis/cothority";
import {displayStatus, getDarc, loadSigner, addRule, spawnWebPage, printWebPageContract} from "./Utilities";
import {Handler} from "./Handler";
import {WebPageInstance, ContractWebPageData} from "./WebPageInstance";
import {roster} from "./roster"

export {
  Cothority
};

window.onload = function() {
  var checkPageButton = document.getElementById('fullpage');
  if (checkPageButton) {
    checkPageButton.addEventListener('click', function() {

    // Retrieve current URL  
      var url;
      chrome.tabs.query({
        'active': true,
        'lastFocusedWindow': true
      }, async function(tabs) {
        url = tabs[0].url;

        // Retrieve TextOnly field
        const textOnlyBox = document.getElementById('txtOnly') as HTMLInputElement;
        var textOnly = textOnlyBox.checked

        // ** CONTRACT **//
        const p = document.getElementById('status');

        // Get public.toml
        await Handler.getInstance().LoadRoster(roster);

        displayStatus()

        // Skip chain ID
        await getDarc("2a51f015d2bdcbc587dc32144444faa3fa792b5cd058b6c9cb9b456ac356ca64");

        // Private Key
        await loadSigner("90a40ae6e1d89a7a84ea3e95653578bb355b856753d9cf687e4d70343df27317");

        // Add rule to spawn the webPage contract
        await addRule("spawn:webPage");

        // Spawn the webPage contract
        var contractWebPageData = new ContractWebPageData();
        contractWebPageData.URLWebPage = url;
        contractWebPageData.Selector = "html"
        contractWebPageData.TextOnly = textOnly;
        
        await new Promise( resolve => setTimeout(resolve, 30000))
        await spawnWebPage(contractWebPageData);
        //let webPageContractID : string = await spawnWebPage(contractWebPageData);
        
        // Print the webPage contract
        //p.innerText = webPageContractID; //ID to save somewhere
        //Then to print our instance we use toString of WebPageContractInstance
    });
    }, false);
  }
}