import * as Cothority from "@dedis/cothority";
import { getDarc, loadSigner, addRule, spawnWebPage } from "./Utilities";
import { ContractWebPageData } from "./WebPageInstance";
import { Handler } from "./Handler";
import { roster } from "./roster";

//TODO: if all good, check if all features work correctly
export {
  Cothority
};

window.onload = function () {
  
  /*---------------------------------------------------------------------
   |  Certify whole page
   *-------------------------------------------------------------------*/
  var checkPageButton = document.getElementById('fullpage');
  if (checkPageButton) {
    checkPageButton.addEventListener('click', function () {
      alert("You are working !");
      //spawnWebPageContractWithParameters("html");
      // Retrieve current URL  
      chrome.tabs.query({
        'active': true,
        'lastFocusedWindow': true
      }, async function (tabs) {

        var skipChainID = "0191ff647ab0d73bc2b5798077f1b43b6c032435d412a29e8fc24c958d995bf8";
        var privateKey = "d7ef534d6bc30fd84903e11d15a1d091b17c9f307a20fef1e83bb6fadd1e6404";

        // Retrieve URL of current webpage
        var url = tabs[0].url;

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
        contractWebPageData.Selector = "html";
        contractWebPageData.TextOnly = textOnly;

        //TODO: Try to lower timeout
        await new Promise(resolve => setTimeout(resolve, 3000))
        await spawnWebPage(contractWebPageData).then(
          (r) => Handler.prependLog("instance spawned: " + r)
        ).catch(
          (e) => Handler.prependLog("failed to spawn web page: " + e)
        )
      });
    }, false);
  }

  /*---------------------------------------------------------------------
   |  Certify page section
   *-------------------------------------------------------------------*/

  // STEP 1 : Select section of webpage
  /*var checkPageSectionButton = document.getElementById('pagesection');
  if (checkPageSectionButton) {
    checkPageSectionButton.addEventListener('click', function () {

      alert("Please click on the desired section of the webpage, then click on the extension icon again.\n")

      chrome.tabs.executeScript(null, {
        file: "./scripts/startSelectorGadget.js"
      }, function () {

        if (chrome.runtime.lastError) {
          Handler.prependLog("There was an error injecting script : \n" + chrome.runtime.lastError.message);
        }
      });
    }, false);
  }


  // STEP 2 : Certify page section
  // Check if user is reloading the app to get CSS Selector
  chrome.tabs.executeScript(null, {
    file: "./scripts/findCSSSelector.js"
  }, function () {
    if (chrome.runtime.lastError) {
      Handler.prependLog("Error in script : \n" + chrome.runtime.lastError.message);
    }
  });

  // Check if Selector Gadget is running. 
  // If yes, also grab the selector and trigger the contract spawning
  chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    if (sender.tab)

      // Retrieve CSS Selector
      var pageSectionSelector = request.CSSSelector

    // After we retrieve the CSS selector, we close Selector Gadget
    var files = [
      './scripts/jquery-3.4.1.js',
      './scripts/closeSelectorGadget.js',
    ];

    for (var file of files) {
      chrome.tabs.executeScript({
        file: file,
        allFrames: true,
      });
    }

    // Spawn the contract
    spawnWebPageContractWithParameters(pageSectionSelector);

  });
}*/

}

/*---------------------------------------------------------------------
 |  Spawn contract with correct parameters
 *-------------------------------------------------------------------*/
async function spawnWebPageContractWithParameters(selector: string) {
  // Retrieve current URL  
  chrome.tabs.query({
    'active': true,
    'lastFocusedWindow': true
  }, async function (tabs) {

    var skipChainID = "0191ff647ab0d73bc2b5798077f1b43b6c032435d412a29e8fc24c958d995bf8";
    var privateKey = "d7ef534d6bc30fd84903e11d15a1d091b17c9f307a20fef1e83bb6fadd1e6404";

    // Retrieve URL of current webpage
    var url = tabs[0].url;

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
    contractWebPageData.Selector = selector;
    contractWebPageData.TextOnly = textOnly;

    //TODO: Try to lower timeout
    await new Promise(resolve => setTimeout(resolve, 3000))
    await spawnWebPage(contractWebPageData).then(
      (r) => Handler.prependLog("instance spawned: " + r)
    ).catch(
      (e) => Handler.prependLog("failed to spawn web page: " + e)
    )
  });
}