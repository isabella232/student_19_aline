import * as Cothority from "@dedis/cothority";
import {
  restore_options,
  uploadTriggerTextForms,
  startSelectorGadget,
  getSelectorAndCloseSelectorGadget,
  displayErrorForUser
} from "./AlineUtilities"

import {
  spawnWebPageContractWithParameters,
  uploadSubmitTextForms,
  downloadContentOfWebpage,
  downloadInfosOfAttestation
} from "./AlineFeatures"

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
    startSelectorGadget();
    }, false);
  }


  // STEP 2 : Certify page section
  // Check if user is reloading the app to get CSS Selector
  chrome.tabs.executeScript(null, {
    file: "./scripts/findCSSSelector.js"
  }, function () {
    if (chrome.runtime.lastError) {
      console.log("Error in script : \n" + chrome.runtime.lastError.message);
      displayErrorForUser();
    }
  });

  // Check if Selector Gadget is running. 
  // If yes, also grab the selector and trigger the contract spawning
  chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    getSelectorAndCloseSelectorGadget(request.CSSSelector);
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
      document.getElementById('loadinggifid').style.visibility = "visible";
      document.getElementById('status').innerText = "Your download will begin in a few seconds ...";
      downloadContentOfWebpage();
    }, false);
  }

  /*---------------------------------------------------------------------
 |  Download information of the attestation
 *-------------------------------------------------------------------*/
  // Check if button to download the information of the webpage is pressed
  var checkDownloadInfosButton = document.getElementById('downloadinfos');
  if (checkDownloadInfosButton) {
    checkDownloadInfosButton.addEventListener('click', function () {
      downloadInfosOfAttestation();
    }, false);
  }


  /*---------------------------------------------------------------------
 |  Upload your attestation - Step 1 : Trigger forms appearance
 *-------------------------------------------------------------------*/
  var checkUploadButton = document.getElementById('uploadbutton');
  if (checkUploadButton) {
    checkUploadButton.addEventListener('click', function () {
      uploadTriggerTextForms();
    }, false);
  }

  /*---------------------------------------------------------------------
|  Upload your attestation - Step 2 : Submission
*-------------------------------------------------------------------*/

  var checkSubmitButton = document.getElementById('submitbutton');
  if (checkSubmitButton) {
    checkSubmitButton.addEventListener('click', function () {
      document.getElementById('loadinggifid').style.visibility = "visible";
      document.getElementById('status').innerText = "Your attestation is currently being verified. Please do not click anywhere.";
      uploadSubmitTextForms();
    }, false);
  }
}