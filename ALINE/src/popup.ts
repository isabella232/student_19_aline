import * as Cothority from "@dedis/cothority";
import { spawnWebPageContractWithParameters, save_options, restore_options } from "./AlineUtilities"


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
      document.getElementById('sectionorfull').innerText = "full";
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
    // Retrieve CSS Selector
    var pageSectionSelector = request.CSSSelector
    document.getElementById('cssselector').innerText = pageSectionSelector;

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
    document.getElementById('sectionorfull').innerText = "section";

  });

  /*---------------------------------------------------------------------
 |  Download contract data
 *-------------------------------------------------------------------*/

  /*---------------------------------------------------------------------
 |  Download content of attestation
 *-------------------------------------------------------------------*/
  // Check if button to download the content of the webpage is pressed
  var checkDownloadContentButton = document.getElementById('downloadcontent');

  if (checkDownloadContentButton) {
    checkDownloadContentButton.addEventListener('click', function () {

      chrome.tabs.query({
        'active': true,
        'lastFocusedWindow': true
      }, function (tabs) {
        // Retrieve URL of current webpage
        var url = tabs[0].url;
        var domain = url.replace('www.', '').replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

        const textOnlyBox = document.getElementById('txtOnly') as HTMLInputElement;
        var isFull = document.getElementById('sectionorfull').innerText.localeCompare("full") == 0;

        var CSSSelector: string;
        if (isFull) {
          CSSSelector = "html";
        } else {
          CSSSelector = document.getElementById('cssselector').innerText
        }
        // SECOND ATTP
        /*chrome.tabs.executeScript(null, {
          file: "./scripts/retrieveWebpageContent.js"
        }, function () {
          if (chrome.runtime.lastError) {
            console.log("Error in script : \n" + chrome.runtime.lastError.message);
          }
        });*/
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { isFull: isFull, textOnly: textOnlyBox, CSSSelector: CSSSelector }, function (response) {
            var content = response.content
            console.log("receive content");
            var blob = new Blob([content], { type: "text/plain" });
            chrome.downloads.download({
              url: URL.createObjectURL(blob),
              filename: "Content of website " + domain
            });
          });
        });
        //SECOND ATTP
        //!!
        /*chrome.tabs.executeScript(null, {
          file: "./scripts/retrieveWebpageContent.js"
        }, function () {
          if (chrome.runtime.lastError) {
            console.log("Error in script : \n" + chrome.runtime.lastError.message);
          }
        });*/


        // Retrieve content to write to file

        // Retrieve CSS Selector

        //!!



      });

    }, false);
  }

  /*---------------------------------------------------------------------
 |  Download information of the attestation
 *-------------------------------------------------------------------*/
  // Check if button to download the information of the webpage is pressed
  var checkDownloadInfosButton = document.getElementById('downloadinfos');
  if (checkDownloadInfosButton) {
    checkDownloadInfosButton.addEventListener('click', function () {
      chrome.tabs.query({
        'active': true,
        'lastFocusedWindow': true
      }, async function (tabs) {

        // Retrieve URL of current webpage
        var url = tabs[0].url;
        var domain = url.replace('www.', '').replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
        var blob = new Blob([document.getElementById('infosofcontract').innerText], { type: "text/plain" });
        chrome.downloads.download({
          url: URL.createObjectURL(blob),
          filename: "Attestation of website " + domain
        });
      });
    }, false);
  }
}
