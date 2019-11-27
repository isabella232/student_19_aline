import * as Cothority from "@dedis/cothority";
import { getDarc, loadSigner, addRule, spawnWebPage } from "./Utilities";
import { ContractWebPageData } from "./WebPageInstance";
import { Handler } from "./Handler";
import { roster } from "./roster";

//TODO: 3retrieve domain -> use already exsting functions to parse URLs for file name

//TODO: when uploading, compare actual url with contract url
//TODO: Gestion erreur utilisateur ?
export {
  Cothority
};

window.onload = function () {
  
  document.addEventListener('DOMContentLoaded', restore_options);

  /*---------------------------------------------------------------------
    |  Certify whole page
    *-------------------------------------------------------------------*/
  var checkPageButton = document.getElementById('fullpage');
  if (checkPageButton) {
    checkPageButton.addEventListener('click', function () {
      spawnWebPageContractWithParameters("html");
    }, false);
  }

  /*---------------------------------------------------------------------
   |  Certify page section
   *-------------------------------------------------------------------*/

  // STEP 1 : Click on button to initiate the procedure
  var checkPageSectionButton = document.getElementById('pagesection');
  if (checkPageSectionButton) {
    checkPageSectionButton.addEventListener('click', function () {
      save_options();
      alert("Please click on the desired section of the webpage, then click on the extension icon again.\n")
      chrome.tabs.executeScript(null, {
        file: "./scripts/startSelectorGadget.js"
      }, function () {

        if (chrome.runtime.lastError) {
          console.log("There was an error injecting script : \n" + chrome.runtime.lastError.message);
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
      console.log("Error in script : \n" + chrome.runtime.lastError.message);
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

    // Restaure Text Only check box value

    restore_options();

    // Spawn the contract
    spawnWebPageContractWithParameters(pageSectionSelector);

  });

  /*---------------------------------------------------------------------
 |  Download contract data
 *-------------------------------------------------------------------*/

  // Check if button to download the content of the webpage is pressed
  var checkDownloadContentButton = document.getElementById('downloadcontent');
  if (checkDownloadContentButton) {
    checkDownloadContentButton.addEventListener('click', function () {
      // TODO: Implement this feature !
      alert("I am ready !")
    }, false);
  }

  // Check if button to download the information of the webpage is pressed
  var checkDownloadInfosButton = document.getElementById('downloadinfos');
  if (checkDownloadInfosButton) {
    checkDownloadInfosButton.addEventListener('click', function () {
      // TODO: Implement this feature !
      var blob = new Blob([document.getElementById('infosofcontract').innerText], { type: "text/plain" });
      chrome.downloads.download({
        url: URL.createObjectURL(blob),
        filename: "TODOCLEAR NAME WITH ID OF INSTANCE"
      });
    }, false);
  }
}

/*---------------------------------------------------------------------
 |  Spawn contract with correct parameters
 *-------------------------------------------------------------------*/
async function spawnWebPageContractWithParameters(selector: string) {

  document.getElementById('loadinggifid').style.visibility = "visible"
  document.getElementById('status').innerText = "Your contract is currently being created. Please do not click anywhere."

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

    await spawnWebPage(contractWebPageData).then(
      (r) => {
        console.log("instance spawned: " + r)
        document.getElementById("downloadcontent").style.visibility = "visible";
        document.getElementById("downloadinfos").style.visibility = "visible";
        document.getElementById('loadinggifid').style.visibility = "hidden"
        document.getElementById('status').innerText = "Your contract has been successfully created !"
      }
    ).catch(
      (e) => console.log("failed to spawn web page: " + e)
    )

  });
}

// Save checkbox value inbetween extension reloadings
function save_options() {
  var textOnlyCurrent = document.getElementById('txtOnly') as HTMLInputElement;
  var textOnlyCurrentValue = textOnlyCurrent.checked;
  chrome.storage.sync.set({
    textOnlyOrNot: textOnlyCurrentValue,
  });
}
// Restore checkbox value when extension is reloading
function restore_options() {
  // Use default value for textOnly file
  chrome.storage.sync.get({
    textOnlyOrNot: false
  }, function (items) {
    var textOnlyCurrent = document.getElementById('txtOnly') as HTMLInputElement;
    textOnlyCurrent.checked = items.textOnlyOrNot;
  });
}
