import * as Cothority from "@dedis/cothority";
import { displayStatus, getDarc, loadSigner, addRule, spawnWebPage, printWebPageContract } from "./Utilities";
import { Handler } from "./Handler";
import { WebPageInstance, ContractWebPageData } from "./WebPageInstance";
import { roster } from "./roster"

//TODO: Modularize spawn contract inbetween the two features that certify something
//TODO: PASS Selector to application
//TODO: ONLY CLOSE if selectorgadget actually loaded !
//TODO: if all good, check if all features work correctly
export {
  Cothority
};

window.onload = function () {
  var skipChainID = "0191ff647ab0d73bc2b5798077f1b43b6c032435d412a29e8fc24c958d995bf8";
  var privateKey = "d7ef534d6bc30fd84903e11d15a1d091b17c9f307a20fef1e83bb6fadd1e6404";
  var url;

  // Check if user is reloading the app to get CSS Selector
  chrome.tabs.executeScript(null, {
    file: "./scripts/findCSSSelector.js"
  }, function () {
    if (chrome.runtime.lastError) {
      Handler.prependLog("Error in script : \n" + chrome.runtime.lastError.message);
    }
  });

  // If yes, after we retrieve the CSS selector, we close Selector Gadget
  var files = [
    './scripts/jquery-3.4.1.js.js',
    './scripts/closeSelectorGadget.js',
  ];

  for (var file of files) {
    chrome.tabs.executeScript({
      file: file,
      allFrames: true,
    });
  }

  // Check if user is reloading the app to certify a section of the webpage
  /*if ((<HTMLInputElement>document.getElementById('_sg_path_field')).value!== null){
    alert("We may be good !")

    // Retrieve current URL  
    chrome.tabs.query({
      'active': true,
      'lastFocusedWindow': true
    }, async function(tabs) {
      url = tabs[0].url;
 
      // Retrieve TextOnly field
      const textOnlyBox = document.getElementById('txtOnly') as HTMLInputElement;
      var textOnly = textOnlyBox.checked

  });
  } else {
    const p = document.getElementById('status')
    p.innerText = "nothing found";
  }
*/
  // Certify the whole page
  var checkPageButton = document.getElementById('fullpage');
  if (checkPageButton) {
    checkPageButton.addEventListener('click', function () {

      // Retrieve current URL  
      chrome.tabs.query({
        'active': true,
        'lastFocusedWindow': true
      }, async function (tabs) {
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

  // certify page section
  var checkPageButton = document.getElementById('pagesection');
  if (checkPageButton) {
    checkPageButton.addEventListener('click', function () {

      alert("Please select the desired section of the webpage, then click on the extension icon again.\n")

      chrome.tabs.executeScript(null, {
        file: "./scripts/startSelectorGadget.js"
      }, function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
          Handler.prependLog("There was an error injecting script : \n" + chrome.runtime.lastError.message);
        }
      });

      // Retrieve current URL  
      chrome.tabs.query({
        'active': true,
        'lastFocusedWindow': true
      }, async function (tabs) {

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