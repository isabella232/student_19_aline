import * as Cothority from "@dedis/cothority";
import { spawnWebPageContractWithParameters } from "./AlineFeatures";

export {
  Cothority
};

// Save checkbox value inbetween extension reloadings
export function save_options() {
  var textOnlyCurrent = document.getElementById('txtOnly') as HTMLInputElement;
  var textOnlyCurrentValue = textOnlyCurrent.checked;
  chrome.storage.sync.set({
    textOnlyOrNot: textOnlyCurrentValue,
  });
}
// Restore checkbox value when extension is reloading
export function restore_options() {
  // Use default value for textOnly file
  chrome.storage.sync.get({
    textOnlyOrNot: false
  }, function (items) {
    var textOnlyCurrent = document.getElementById('txtOnly') as HTMLInputElement;
    textOnlyCurrent.checked = items.textOnlyOrNot;
  });
}

export async function uploadTriggerTextForms() {
  document.getElementById('uploadinstanceid').style.display = "inline";
  document.getElementById('uploadcontentid').style.display = "inline";
  document.getElementById('submitbutton').style.display = "inline";
}

export async function startSelectorGadget() {
  save_options();
  alert("Please click on the desired section of the webpage, then click on the extension icon again.\n")
  chrome.tabs.executeScript(null, {
    file: "./scripts/startSelectorGadget.js"
  }, function () {
    if (chrome.runtime.lastError) {
      console.log("There was an error injecting script : \n" + chrome.runtime.lastError.message);
      displayErrorForUser();
    }
  });
}

export async function getSelectorAndCloseSelectorGadget(pageSectionSelector: string) {
  // Retrieve CSS Selector
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
}

export async function displayErrorForUser() {
  document.getElementById('status').innerText = "Sorry, a problem occured. Please try again.\n\n"
  document.getElementById('loadinggifid').style.visibility = "hidden"
}

export async function decodeHTML(html: string) {
  var txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};