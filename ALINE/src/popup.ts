import * as Cothority from "@dedis/cothority";
import ByzCoinRPC from "@dedis/cothority/byzcoin/byzcoin-rpc";
import {WebPageInstance, ContractWebPageData} from "./WebPageInstance";
import { EMPTY_BUFFER } from '@dedis/cothority/protobuf';

export {
  Cothority
};

window.onload = function() {
  var checkPageButton = document.getElementById('fullpage');
  if (checkPageButton) {
    checkPageButton.addEventListener('click', function() {
      var url;
      chrome.tabs.query({
        'active': true,
        'lastFocusedWindow': true
      }, function(tabs) {
        url = tabs[0].url;
        p.innerText = url;
        // CONTRACT USE BEGINNING
        // CONTRACT USE END */
      });
      const p = document.getElementById('status');

    }, false);
  }
}

export function PrintInfo(data: string) {
  console.log("Let's load this ledger")
  let cot = Cothority.network.Roster
  const r = cot.fromTOML(data)
  const rpc = new Cothority.status.StatusRPC(r);
  const p = document.getElementById('status');
  rpc.getStatus(0).then(
    (r) => {
      p.innerText = r.toString();
    },
    (e) => p.innerText = "something went wrong. Did you start the conodes ?" + e,
  );
}

const roster = `[[servers]]
Address = "tls://188.166.35.173:7770"
Url = "https://wookiee.ch/conode"
Suite = "Ed25519"
Public = "a59fc58c0a445b70dcd57e01603a714a2ee99c1cc14ca71780383abada5d7143"
Description = "Wookiee's Cothority"
[servers.Services]
 [servers.Services.ByzCoin]
   Public = "70c192537778a53abb9315979f48e170da9182b324c7974462cbdde90fc0c51d440e2de266a81fe7a3d9d2b6665ef07ba3bbe8df027af9b8a3b4ea6569d7f72a41f0dfe4dc222aa8fd4c99ced2212d7d1711267f66293732c88e8d43a2cf6b3e2e1cd0c57b8f222a73a393e70cf81e53a0ce8ed2a426e3b0fa6b0da30ff27b1a"
   Suite = "bn256.adapter"
 [servers.Services.Skipchain]
   Public = "63e2ed93333bd0888ed2b5e51b5e2544831b4d79dead571cf67604cdd96bc0212f68e582468267697403d7ed418e70ed9fcb01940e4c603373994ef00c04542c24091939bddca515381e0285ab805826cec457346be482e687475a973a20fca48f16c76e352076ccc0c866d7abb3ac50d02f9874d065f85404a0127efc1acf49"
   Suite = "bn256.adapter"`

// ----------------------------------------------------------------------------
// The following functions are called from the view and responsible for parsing
// the arguments and then calling the appropriate method on the Handler class.

export function initRoster(e: Event) {
  try {
      var handler = Handler.getInstance();
      const fr = new FileReader();
      fr.onload = function(evt) {
          handler.LoadRoster(evt.target.result.toString())
      }
      const target = e.target as HTMLInputElement;
      const file: File = (target.files as FileList)[0];
      fr.readAsText(file);
      // Needed so that we can reload a same file multiple times
      target.value = "";
  } catch (e) {
      Handler.prependLog("failed to initialize the roster: " + e)
  }
}

export function displayStatus() {
  try {
      var r: string;
      if ((r = Handler.checkRoster()) != "") {
          Handler.prependLog(r)
          return
      }
      var handler = Handler.getInstance();
      const div = document.createElement("div")
      if (Handler.roster === undefined) {
          Handler.prependLog("handler has not been initialized");
          return
      }
      Handler.roster.list.forEach(element => {
          var p = document.createElement("p")
          p.innerText = element.address + ", " + element.description
          div.appendChild(p);
      });
      Handler.prependLog(div);
  } catch (e) {
      Handler.prependLog("failed to display status: " + e)
  }
}

export function getDarc(scidID: string) {
  try {
      var r: string = Handler.checkRoster();
      if (r != "") {
          Handler.prependLog(r)
          return
      }
      const scidHolder = document.getElementById(scidID) as HTMLInputElement;
      const scidStr =  scidHolder.value;
      if (scidStr == "") {
          Handler.prependLog("please enter a skipchain id")
          return
      }
      Handler.getInstance().SetDarc(Buffer.from(hexStringToByte(scidStr)))
  } catch (e) {
      Handler.prependLog("failed to set DARC: " + e)
  }
}

export function loadSigner(iID: string) {
  try {
      var r: string = Handler.checkRoster() || Handler.checkDarc();
      if (r!= "") {
          Handler.prependLog(r)
          return
      }
      const signerHolder = document.getElementById(iID) as HTMLInputElement
      const signerStr = signerHolder.value
      if (signerStr == "") {
          Handler.prependLog("please provide a signer")
          return
      }

      Handler.getInstance().SetSigner(Buffer.from(hexStringToByte(signerStr)))
  } catch (e) {
      Handler.prependLog("failed to set the signer: " + e)
  }
}

export function addRule(rID: string) {
  try {
      var r: string = Handler.checkRoster() || Handler.checkDarc() || Handler.checkSigner();
      if (r != "") {
          Handler.prependLog(r)
          return
      }
      const ruleHolder = document.getElementById(rID) as HTMLInputElement
      const ruleStr = ruleHolder.value
      if (ruleStr == "") {
          Handler.prependLog("please provide a rule")
          return
      }
      Handler.getInstance().AddRule(ruleStr);
  } catch (e) {
      Handler.prependLog("failed to add rule on DARC: " + e)
  }
}

export function spawnKV(keyID: string, valueID: string) {
  try {
      var r: string = Handler.checkRoster() || Handler.checkDarc() || Handler.checkSigner();
      if (r != "") {
          Handler.prependLog(r)
          return
      }
      const keyHolder = document.getElementById(keyID) as HTMLInputElement
      const valueHolder = document.getElementById(valueID) as HTMLInputElement
      const keyStr = keyHolder.value
      if (keyStr == "") {
          Handler.prependLog("please provide a key")
          return
      }
      const valueStr = valueHolder.value
      if (valueStr == "") {
          Handler.prependLog("please provide a value. Empty value is not allowed in spawn")
          return
      }
      Handler.getInstance().SpawnKV(keyStr, valueStr);
  } catch (e) {
      Handler.prependLog("failed to spawn keyValue instance: " + e)
  }
}

export function printKV(instIDID: string) {
  try {
    var r: string = Handler.checkRoster() || Handler.checkDarc() || Handler.checkSigner();
    if (r != "") {
        Handler.prependLog(r)
        return
    }
    const instIDHolder = document.getElementById(instIDID) as HTMLInputElement
    const instIDStr = instIDHolder.value
    if (instIDStr == "") {
        Handler.prependLog("please provide an instance id")
        return
    }

      Handler.getInstance().PrintKV(Buffer.from(instIDStr, "hex"));
  } catch (e) {
      Handler.prependLog("failed to print keyValue instance: " + e)
  }
}

// ----------------------------------------------------------------------------
// The Handler class is a singleton that offers methods to talk to the cothority
// librairy.

class Handler {
  private static instance: Handler = new Handler();
  private static statusHolder: HTMLElement
  private static loaderHolder: HTMLElement

  static roster: Cothority.network.Roster
  static darc: Cothority.darc.Darc
  static signer: Cothority.darc.SignerEd25519
  static logCounter = 0
  static scid: Buffer // Skip Chain ID

  private constructor() {
      
  }

  static getInstance(): Handler {
      return Handler.instance;
  }

  static prependLog(...nodes: (Node | string)[]) {
      var wrapper = document.createElement("pre")
      var contentWrapper = document.createElement("div")
      var infos = document.createElement("div")
      infos.append(Handler.logCounter + "")
      contentWrapper.append(...nodes)
      wrapper.append(infos, contentWrapper)
      if (Handler.statusHolder == undefined) {
          Handler.statusHolder = document.getElementById("status");
      }
      Handler.statusHolder.prepend(wrapper);
      Handler.logCounter++;
  }

  static checkRoster(): string {
      if (Handler.roster === undefined) {
          return "Roster not set. Please load a roster first"
      }
      return ""
  }

  static checkDarc(): string {
      if (Handler.darc === undefined) {
          return "DARC not set. Please load a DARC first"
      }
      return ""
  }

  static checkSigner(): string {
      if (Handler.signer === undefined) {
          return "Signer not set. Please set a signer first"
      }
      return ""
  }

  static startLoader() {
      if (Handler.loaderHolder === undefined) {
          Handler.loaderHolder = document.getElementById("loader")
      }
      Handler.loaderHolder.classList.add("loading")
  }

  static stopLoader() {
      if (Handler.loaderHolder === undefined) {
          Handler.loaderHolder = document.getElementById("loader")
      }
      Handler.loaderHolder.classList.remove("loading")
  }

  LoadRoster(data: string) {
      Handler.startLoader()
      const roster = Cothority.network.Roster.fromTOML(data)
      const rpc = new Cothority.status.StatusRPC(roster)
      rpc.getStatus(0).then(
          (r) => {
              Handler.roster = roster
              Handler.prependLog("roster loaded!")
          },
          (e) => {
              Handler.prependLog("failed to load roster: " + e)
          }
      ).finally(
          () => Handler.stopLoader()
      )
  }

  SetDarc(scid: Buffer) {
      Handler.startLoader()
      Handler.prependLog("loading the genesis Darc and scid '" + scid.toString("hex") + "'...")
      const rpc = Cothority.byzcoin.ByzCoinRPC.fromByzcoin(Handler.roster, scid)
      rpc.then(
          (r) => {
              Handler.darc = r.getDarc()
              Handler.scid = scid
              Handler.prependLog("darc loaded:\n" + Handler.darc.toString())
          },
          (e) => {
              Handler.prependLog("failed to get the genesis darc: " + e)
          }
      ).finally(
          () => Handler.stopLoader()
      )
  }

  SetSigner(sid: Buffer) {
      Handler.prependLog("setting the signer with: '" + sid.toString("hex") + "'...")
      try {
          var signer = Cothority.darc.SignerEd25519.fromBytes(sid)
          Handler.signer = signer
      } catch(e) {
          Handler.prependLog("failed to create signer: " + e)
      }
      Handler.prependLog("signer '" + signer.toString() + "' set")
  }

  AddRule(ruleStr: string) {
      Handler.startLoader();
      Handler.prependLog("setting the rules " + ruleStr + "...")
      const rpc = Cothority.byzcoin.ByzCoinRPC.fromByzcoin(Handler.roster, Handler.scid)
      rpc.then(
          (r) => {
              var darc = r.getDarc()

              Handler.prependLog("RPC created, getting the darc...")
              Cothority.contracts.darc.DarcInstance.fromByzcoin(r, darc.getBaseID()).then(
                  (darcInstance) => {
                      const evolveDarc = darc.evolve();
                      evolveDarc.addIdentity(ruleStr, Handler.signer, Cothority.darc.Rule.OR)
                      Handler.prependLog("rule '" + ruleStr + "' added on temporary darc...")
                      const evolveInstance = darcInstance.evolveDarcAndWait(evolveDarc, [Handler.signer], 10).then(
                          (evolvedDarcInstance) => {
                              Handler.prependLog("darc instance evolved:\n" + evolvedDarcInstance.darc.toString())
                          },
                          (e) => {
                              Handler.prependLog("failed to evolve the darc instance: " + e)
                          }
                      ).finally(
                          () => Handler.stopLoader()
                      )
                  },
                  (e) => {
                      Handler.stopLoader()
                      Handler.prependLog("failed to get the darc instance")
                  }
              )
          },
          (e) => {
              Handler.stopLoader()
              Handler.prependLog("failed to create RPC: " + e)
          }
      )
  }

  SpawnKV(URLWebPage: string) {
    //Passer structure en argument encodé (.encode)

    //La "clé" peut être hardcodée
      Handler.startLoader()
      Handler.prependLog("creating an RPC to spawn a new key value instance...")
      const rpc = Cothority.byzcoin.ByzCoinRPC.fromByzcoin(Handler.roster, Handler.scid)
      rpc.then(
          (r) => {
              Handler.prependLog("RPC created, we now send a spawn:keyValue request...")
              //TODO
              WebPageInstance.spawn(r, Handler.darc.getBaseID(), [Handler.signer], URLWebPage, Buffer.from(valueStr)).then(
                  (webPageInstance: WebPageInstance) => {
                      // Handler.prependLog("Key value instance spawned: " + webPageInstance)
                      Handler.prependLog("Key value instance spawned: \n" + webPageInstance.toString() + "\nInstance ID: " + webPageInstance.id.toString("hex"))
                  },
                  (e: Error) => {
                      console.error(e);
                      Handler.prependLog("failed to spawn the key value instance: " + e)
                  }
              ).finally(
                  () => Handler.stopLoader()
              )
          },
          (e) => {
              Handler.stopLoader()
              Handler.prependLog("failed to create RPC: " + e)
          }
      )
  }

  PrintKV(instIDStr: Buffer) {
      Handler.startLoader()
      Handler.prependLog("creating an RPC to get the key value instance...")
      const rpc = Cothority.byzcoin.ByzCoinRPC.fromByzcoin(Handler.roster, Handler.scid)
      rpc.then(
          (r) => {
              Handler.prependLog("RPC created, we now send a get proof request...")
              r.getProofFromLatest(instIDStr).then(
                  (proof) => {
                      Handler.prependLog("got the proof, let's check it...")
                      if (!proof.exists(instIDStr)) {
                          Handler.prependLog("this is not a proof of existence... aborting!")
                          return
                      }
                      if (!proof.matchContract(WebPageInstance.contractID)) {
                          Handler.prependLog("this is not a proof for the keyValue contrac... aborting!")
                          return
                      }
                      Handler.prependLog("ok, now let's decode it...")
                      var contractWebPageData = ContractWebPageData.decode(proof.value);
                      console.log(contractWebPageData)
                      Handler.prependLog("here is the key value instance: \n" + contractWebPageData.toString())
                  },
                  (e) => {
                      console.error(e)
                      Handler.prependLog("failed to get the contract web page instance: " + e)
                  }
              ).finally(
                  () => Handler.stopLoader()
              )
          },
          (e) => {
              Handler.stopLoader()
              Handler.prependLog("failed to create RPC: " + e)
          }
      )
  }

}

// Transforms an hexadecimal string to its byte representation. This is used
// when reading inputs given from the user, which generally come as hex strings.
function hexStringToByte(str: string) {
  if (!str) {
    return new Uint8Array();
  }
  
  var a = [];
  for (var i = 0, len = str.length; i < len; i+=2) {
    a.push(parseInt(str.substr(i,2),16));
  }
  
  return new Uint8Array(a);
}
