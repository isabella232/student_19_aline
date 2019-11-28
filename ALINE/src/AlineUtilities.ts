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
          document.getElementById('status').innerText = "Your contract has been successfully created !\n\n"
        }
      ).catch(
        (e) => console.log("failed to spawn web page: " + e)
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