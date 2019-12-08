import { getDarc, loadSigner, addRule, spawnWebPage, hexStringToByte } from "./CothorityUtilities";
import * as Cothority from "@dedis/cothority";
import { ContractWebPageData } from "./ContractWebPageData"
import { Handler } from "./Handler";
import { roster } from "./roster";
import { WebPageInstance } from './WebPageInstance';
import { displayErrorForUser } from './AlineUtilities';

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

/*---------------------------------------------------------------------
 | Upload feature - Submit text forms
 *-------------------------------------------------------------------*/
export async function uploadSubmitTextForms() {
  var instanceIDString1Elem = document.getElementById('instanceid1') as HTMLInputElement;
  var instanceIDString1 = instanceIDString1Elem.value;
  var instanceIDString2Elem = document.getElementById('instanceid2') as HTMLInputElement;
  var instanceIDString2 = instanceIDString2Elem.value;

  Handler.startLoader();
  console.log("creating an RPC to get the key value instance...");
  const rpc = Cothority.byzcoin.ByzCoinRPC.fromByzcoin(Handler.roster, Handler.scid);
  rpc.then(
    (r) => {
      console.log("RPC created, we now send a get proof request...");
      /*---------------------------------------------------------------------
      |  INSTANCE # 1
      *-------------------------------------------------------------------*/
      r.getProofFromLatest(Buffer.from(hexStringToByte(instanceIDString1))).then(
        (proof) => {
          console.log("got the proof, let's check it...");
          if (!proof.exists(Buffer.from(hexStringToByte(instanceIDString1)))) {
            console.log("this is not a proof of existence... aborting!");
            return;
          }
          if (!proof.matchContract(WebPageInstance.contractID)) {
            console.log("this is not a proof for the webpagecontrac... aborting!");
            return;
          }
          console.log("ok, now let's decode it...");
          const webpageInstance1 = ContractWebPageData.decode(proof.value);
          console.log("here is the webpage instance: \n" + webpageInstance1.toString());
          /*---------------------------------------------------------------------
          |  INSTANCE # 2
          *-------------------------------------------------------------------*/
          r.getProofFromLatest(Buffer.from(hexStringToByte(instanceIDString2))).then(
            (proof) => {
              console.log("got the proof, let's check it...");
              if (!proof.exists(Buffer.from(hexStringToByte(instanceIDString2)))) {
                console.log("this is not a proof of existence... aborting!");
                return;
              }
              if (!proof.matchContract(WebPageInstance.contractID)) {
                console.log("this is not a proof for the webpagecontrac... aborting!");
                return;
              }
           /*---------------------------------------------------------------------
          |  Comparison of the two hashes - beginning
          *-------------------------------------------------------------------*/
              console.log("ok, now let's decode it...");
              const webpageInstance2 = ContractWebPageData.decode(proof.value);
              console.log("here is the webpage instance: \n" + webpageInstance2.toString());

              console.log("Hash of 1st instance: "+ webpageInstance1.HashedContent.toString("hex"));
              console.log("Hash of 2nd instance: "+ webpageInstance2.HashedContent.toString("hex"));
              // We compare the two hashes
              if (webpageInstance1.HashedContent.toString("hex").localeCompare(webpageInstance2.HashedContent.toString("hex")) == 0) {
                document.getElementById('tickid').style.visibility = "visible";
                document.getElementById('positiveanswer').innerText = "The content of this webpage has not changed !";
                document.getElementById('positiveanswer').style.display = "inline";
    
              } else {
                document.getElementById('crossid').style.visibility = "visible";
                document.getElementById('negativeanswer').innerText = "The content of this webpage has changed !";
                document.getElementById('negativeanswer').style.display = "inline";
              }
           /*---------------------------------------------------------------------
          |  Comparison of the two hashes - end
          *-------------------------------------------------------------------*/
            },
            (e: Error) => {
              console.error(e);
              console.log("failed to get the key value instance: " + e);
            },
          ).finally(
            () => Handler.stopLoader(),
          );
        },
        (e: Error) => {
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
  );;
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
          (e: Error) => {
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