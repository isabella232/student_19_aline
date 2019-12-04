import { getDarc, loadSigner, addRule, spawnWebPage } from "./CothorityUtilities";
import { ContractWebPageData } from "./ContractWebPageData"
import { Handler } from "./Handler";
import { roster } from "./roster";

/*---------------------------------------------------------------------
 |  Spawn contract with correct parameters
 *-------------------------------------------------------------------*/
export async function spawnWebPageContractWithParameters(selector: string) {

  document.getElementById('loadinggifid').style.visibility = "visible"
  document.getElementById('status').innerText = "Your attestation is currently being created. Please do not click anywhere."

  // Retrieve current URL  
  chrome.tabs.query({
    'active': true,
    'lastFocusedWindow': true
  }, async function (tabs) {

    var skipChainID = "8653fd3407a680dc41b569afcd329f61d0a0e528e66158d4cc3fc593d9d8e0fa";
    var privateKey = "ef31a12194cf70b960644d010e12a77a874bcc16ed20af3224a5ac40ad82ea03";

    // Retrieve URL of current webpage
    var url = tabs[0].url;

    // Retrieve TextOnly field
    const textOnlyBox = document.getElementById('txtOnly') as HTMLInputElement;
    var textOnly = textOnlyBox.checked

    // Get public.toml
    try{
    await Handler.getInstance().LoadRoster(roster);
    } catch (e){

    }
  // Skip chain ID
  await getDarc(skipChainID);

  // Private Key
  await loadSigner(privateKey);

  // Add rule to spawn the webPage contract
  // To do only once
  //await addRule("spawn:webPage");

  // Spawn the webPage contract
  var contractWebPageData = new ContractWebPageData();
  contractWebPageData.URLWebPage = url;
  contractWebPageData.Selector = selector;
  contractWebPageData.TextOnly = textOnly;

  await spawnWebPage(contractWebPageData).then(
    (r) => {
      document.getElementById("downloadcontent").style.visibility = "visible";
      document.getElementById("downloadinfos").style.visibility = "visible";
      document.getElementById('loadinggifid').style.visibility = "hidden"
      document.getElementById('status').innerText = "Your attestation has been successfully created !\n\n"
    }
  ).catch(
    (e) => {
      console.log("failed to spawn web page: " + e)
      displayErrorAndStop();
      throw "A problem occured."
    }
  )
});
}

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
  document.getElementById('attestationidform').style.display = "inline";
  document.getElementById('contentidform').style.display = "inline";
  document.getElementById('submitbutton').style.display = "inline";
}
export async function uploadSubmitTextForms() {
  var instanceIDStringElem = document.getElementById('attestationidform') as HTMLInputElement;
  var instanceIDString = instanceIDStringElem.value;
  var instanceID = parseInt(instanceIDString, 10);
  var contentToCheckElem = document.getElementById('contentidform') as HTMLInputElement;
  var contentToCheck = contentToCheckElem.value;
  alert(instanceID);
  alert(contentToCheck);
}

export async function downloadContentOfWebpage() {
  chrome.tabs.query({
    'active': true,
    'lastFocusedWindow': true
  }, function (tabs) {
    // Retrieve URL of current webpage
    var url = tabs[0].url;
    var domain = url.replace('www.', '').replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

    var textOnlyElem = document.getElementById('txtOnly') as HTMLInputElement;
    var textOnlyBox = textOnlyElem.checked;
    var isFull = document.getElementById('sectionorfull').innerText;
    var textOnly = "initialization";
    if (textOnlyBox) {
      textOnly = "true"
    } else {
      textOnly = "false";
    }

    var CSSSelector: string;
    if (isFull.localeCompare("full") == 0) {
      CSSSelector = "html";
    } else {
      CSSSelector = document.getElementById('cssselector').innerText
    }

    // Send message and then listen for Answer
    // TODO: is the line below really useful ?
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { isFull: isFull, textOnly: textOnly, CSSSelector: CSSSelector }, function (response) {
        var content = response.content
        console.log("receive content");
        var blob = new Blob([content], { type: "text/plain" });
        chrome.downloads.download({
          url: URL.createObjectURL(blob),
          filename: "Content of website " + domain
        });
      });
    });
  });
}
export async function downloadInfosOfAttestation() {

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
}

export async function displayErrorAndStop() {
  document.getElementById('status').innerText = "Sorry, a problem occured. Please try again.\n\n"
  document.getElementById('loadinggifid').style.visibility = "hidden"
}