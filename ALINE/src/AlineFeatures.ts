import { spawnWebPage } from "./CothorityUtilities";
import * as Cothority from "@dedis/cothority";
import { displayErrorForUser, getInstanceAndCompare, RetrieveContentOfAttestation } from './AlineUtilities';
import { getDarc, loadSigner} from "./CothorityUtilities";
import { ContractWebPageData } from "./ContractWebPageData"
import { Handler } from "./Handler";
import { roster } from "./roster";

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

    // Init the skip chain
    // Get public.toml
    try {
      await Handler.getInstance().LoadRoster(roster);
    } catch (e) {

    }
    var skipChainID = "8653fd3407a680dc41b569afcd329f61d0a0e528e66158d4cc3fc593d9d8e0fa";
    var privateKey = "ef31a12194cf70b960644d010e12a77a874bcc16ed20af3224a5ac40ad82ea03";

    // Skip chain ID
    await getDarc(skipChainID);

    // Private Key
    await loadSigner(privateKey);

    // Retrieve URL of current webpage
    var url = tabs[0].url;

    // Retrieve TextOnly field
    const textOnlyBox = document.getElementById('txtOnly') as HTMLInputElement;
    var textOnly = textOnlyBox.checked

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
  //Hide potential previous answer
  document.getElementById('tickid').style.visibility = "hidden";
  document.getElementById('crossid').style.visibility = "hidden";
  document.getElementById('positiveanswer').style.display = "none";
  document.getElementById('negativeanswer').style.display = "none";

  // Init the skip chain
  // Get public.toml
  try {
    await Handler.getInstance().LoadRoster(roster);
  } catch (e) {

  }
  var skipChainID = "8653fd3407a680dc41b569afcd329f61d0a0e528e66158d4cc3fc593d9d8e0fa";
  var privateKey = "ef31a12194cf70b960644d010e12a77a874bcc16ed20af3224a5ac40ad82ea03";

  // Skip chain ID
  await getDarc(skipChainID);

  // Private Key
  await loadSigner(privateKey);

  // Retrieve text forms
  var textAreaContentElem = document.getElementById('uploadinstanceid') as HTMLInputElement;
  var textAreaContentString = textAreaContentElem.value;
  var instanceIDString = textAreaContentString.split("Instance ID:")[1].trim().split(" and Content:")[0].trim();
  var content = textAreaContentString.split("Content:")[1].trim()
  console.log("ID:");
  console.log(instanceIDString);
  console.log("Content:");
  console.log(content);
  getInstanceAndCompare(content, instanceIDString);
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
    RetrieveContentOfAttestation(domain, instanceIDString);
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

