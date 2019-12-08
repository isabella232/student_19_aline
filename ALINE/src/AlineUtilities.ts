import { getDarc, loadSigner, addRule, spawnWebPage } from "./CothorityUtilities";
import * as Cothority from "@dedis/cothority";
import { ContractWebPageData } from "./ContractWebPageData"
import { Handler } from "./Handler";
import { roster } from "./roster";
import { WebPageInstance } from './WebPageInstance';
import { hexStringToByte } from './CothorityUtilities';

export {
  Cothority
};

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
    try {
      await Handler.getInstance().LoadRoster(roster);
    } catch (e) {

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
        displayErrorForUser();
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
  const fr = new FileReader();
  fr.onload = (evt) => {
    alert(evt.target.result.toString());
  };
  alert(instanceID);
}

export async function downloadContentOfWebpage() {
  chrome.tabs.query({
    'active': true,
    'lastFocusedWindow': true
  }, function (tabs) {
    // Retrieve URL of current webpage
    var url = tabs[0].url;
    var domain = url.replace('www.', '').replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
    var instanceIDString = document.getElementById('instanceid').innerText

    Handler.startLoader();
    console.log("creating an RPC to get the key value instance...");
    const rpc = Cothority.byzcoin.ByzCoinRPC.fromByzcoin(Handler.roster, Handler.scid);
    rpc.then(
        (r) => {
            console.log("RPC created, we now send a get proof request...");
            r.getProofFromLatest(Buffer.from(hexStringToByte(instanceIDString))).then(
                (proof) => {
                  console.log("got the proof, let's check it...");
                    if (!proof.exists(Buffer.from(hexStringToByte(instanceIDString)))) {
                      console.log("this is not a proof of existence... aborting!");
                        return;
                    }
                    if (!proof.matchContract(WebPageInstance.contractID)) {
                      console.log("this is not a proof for the webpagecontrac... aborting!");
                        return;
                    }
                    console.log("ok, now let's decode it...");
                    const webpageInstance = ContractWebPageData.decode(proof.value);
                    console.log("here is the webpage instance: \n" + webpageInstance.toString());
                    var blob = new Blob([webpageInstance.Content], { type: "text/plain" });
                    chrome.downloads.download({
                      url: URL.createObjectURL(blob),
                      filename: "Content of website " + domain
                    });
                },
                (e:Error) => {
                    console.error(e);
                    console.log("failed to get the key value instance: " + e);
                },
            ).finally(
                () => Handler.stopLoader(),
            );
        },
        (e) => {
            Handler.stopLoader();
            console.log("failed to create RPC: " + e);
        },
    );
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