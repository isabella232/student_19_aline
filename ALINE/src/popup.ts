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

        // Retrieve CSS Selector by loading Selector Gadget
        var s = document.createElement('div');
        s.innerHTML='Loading...';
        s.style.color='black';
        s.style.padding='20px';
        s.style.position='fixed';
        s.style.zIndex='9999';
        s.style.fontSize='3.0em';
        s.style.border='2px solid black';
        s.style.right='40px';
        s.style.top='40px';
        s.setAttribute('class','selector_gadget_loading');
        s.style.background='white';
        document.body.appendChild(s);
        var t = document.createElement('script');
        t.setAttribute('type','text/javascript');
        t.setAttribute('src','./scripts/css_selector_scripts/selectorGadget.js');
        document.body.appendChild(t);

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