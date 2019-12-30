import * as Cothority from "@dedis/cothority";
import { spawnWebPageContractWithParameters } from "./AlineFeatures";
import { hexStringToByte } from "./CothorityUtilities";
import { ContractWebPageData } from "./ContractWebPageData"
import { Handler } from "./Handler";
import { WebPageInstance } from './WebPageInstance';


export {
  Cothority
};

var blake = require('blakejs')

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

export async function getInstanceAndCompare(contentToCompare: string, instanceIDString: string) {

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
            document.getElementById('status').innerText = "This ID does not exist. Please try with another attestation ID.\n\n"
            document.getElementById('loadinggifid').style.visibility = "hidden"
            return;
          }
          if (!proof.matchContract(WebPageInstance.contractID)) {
            console.log("this is not a proof for the webpagecontract... aborting!");
            displayErrorForUser();
            return;
          }
          console.log("ok, now let's decode it...");
          const webpageInstance = ContractWebPageData.decode(proof.value);
          console.log("here is the webpage instance: \n" + webpageInstance.toString());

          /*---------------------------------------------------------------------
         | Comparison of the two hashes
         *-------------------------------------------------------------------*/
          var OUTPUT_LENGTH = 32 // bytes
          var context = blake.blake2bInit(OUTPUT_LENGTH, null)

          var enc = new TextEncoder(); // always utf-8
          blake.blake2bUpdate(context, enc.encode(contentToCompare.concat(webpageInstance.CreationDate)));
          console.log("Is going to be hashed:");
          console.log(contentToCompare + webpageInstance.CreationDate);

          // finally, once the stream has been exhausted
          var hashToCheck = Buffer.from(blake.blake2bFinal(context)).toString("hex");
          console.log("Creation date:");
          console.log(webpageInstance.CreationDate);
          console.log("Hash to check :");
          console.log(hashToCheck);
          console.log("Hash on the skipchain: ");
          console.log(webpageInstance.HashedContent.toString("hex"));

          if (webpageInstance.HashedContent.toString("hex").localeCompare(hashToCheck) == 0) {
            document.getElementById('loadinggifid').style.visibility = "hidden";
            document.getElementById('tickid').style.visibility = "visible";
            document.getElementById('positiveanswer').innerText = "The content of this attestation has been correctly verified !";
            document.getElementById('positiveanswer').style.display = "inline";
            document.getElementById('status').innerText = "";

          } else {
            document.getElementById('loadinggifid').style.visibility = "hidden";
            document.getElementById('crossid').style.visibility = "visible";
            document.getElementById('negativeanswer').innerText = "The provided content does not match with the attestation !";
            document.getElementById('negativeanswer').style.display = "inline";
            document.getElementById('status').innerText = "";
          }
        },
        (e: Error) => {
          console.error(e);
          console.log("failed to get the key value instance: " + e);
          displayErrorForUser();
          throw "A problem occured.";
        },
      ).finally(
        () => Handler.stopLoader(),
      );
    },
    (e) => {
      Handler.stopLoader();
      console.log("failed to create RPC: " + e);
      displayErrorForUser();
      throw "A problem occured.";
    },
  );
}

export function RetrieveContentOfAttestation(domain: string, instanceIDString: string){
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
            displayErrorForUser();
            return;
          }
          if (!proof.matchContract(WebPageInstance.contractID)) {
            console.log("this is not a proof for the webpagecontrac... aborting!");
            displayErrorForUser();
            return;
          }
          console.log("ok, now let's decode it...");
          const webpageInstance = ContractWebPageData.decode(proof.value);
          console.log("here is the webpage instance: \n" + webpageInstance.toString());
          var blob = new Blob(["Instance ID: " + instanceIDString + "\n" + webpageInstance.Content], { type: "text/plain" });
          chrome.downloads.download({
            url: URL.createObjectURL(blob),
            filename: "Content of website " + domain
          });
          document.getElementById('loadinggifid').style.visibility = "hidden";
          document.getElementById('status').innerText = "Download completed !";
        },
        (e: Error) => {
          console.error(e);
          console.log("failed to get the key value instance: " + e);
          displayErrorForUser();
          throw "A problem occured.";
        },
      ).finally(
        () => Handler.stopLoader(),
      );
    },
    (e) => {
      Handler.stopLoader();
      console.log("failed to create RPC: " + e);
      displayErrorForUser();
      throw "A problem occured.";
    },
  );
}
