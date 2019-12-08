import * as Cothority from "@dedis/cothority";
import { ContractWebPageData } from "./ContractWebPageData"
import { Handler } from "./Handler";
import { displayErrorForUser } from "./AlineUtilities"

// ----------------------------------------------------------------------------
// The following functions are called from the view and responsible for parsing
// the arguments and then calling the appropriate method on the Handler class.

export function initRoster(e: Event) {
  try {
    var handler = Handler.getInstance();
    const fr = new FileReader();
    fr.onload = function (evt) {
      handler.LoadRoster(evt.target.result.toString())
    }
    const target = e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    fr.readAsText(file);
    
    // Needed so that we can reload a same file multiple times
    target.value = "";
  } catch (e) {
    console.log("failed to initialize the roster: " + e)
    displayErrorForUser()
    throw "A problem occured."
  }
}

export async function displayStatus() {
  try {
    var r: string;
    if ((r = Handler.checkRoster()) != "") {
      console.log(r)
      return
    }
    var handler = Handler.getInstance();
    const div = document.createElement("div")
    if (Handler.roster === undefined) {
      console.log("handler has not been initialized");
      displayErrorForUser();
      throw "A problem occured."
    }
    Handler.roster.list.forEach(element => {
      var p = document.createElement("p")
      console.log(element.address + ", " + element.description)
      div.appendChild(p);
    });
    console.log(div);
  } catch (e) {
    console.log("failed to display status: " + e)
    displayErrorForUser()
    throw "A problem occured."
  }
}

export async function getDarc(scidID: string) {
  try {
    var r: string = Handler.checkRoster();
    if (r != "") {
      console.log(r)
      displayErrorForUser()
      throw "A problem occured."
    }
    // Pass skipchain id using this method with Buffer.from...
    await Handler.getInstance().SetDarc(Buffer.from(hexStringToByte(scidID)))
  } catch (e) {
    console.log("failed to set DARC: " + e)
    displayErrorForUser()
    throw "A problem occured."
  }
}

export async function loadSigner(signerID: string) {
  try {
    var r: string = Handler.checkRoster() || Handler.checkDarc();
    if (r != "") {
      console.log(r)
      displayErrorForUser()
      throw "A problem occured."
    }
    await Handler.getInstance().SetSigner(Buffer.from(hexStringToByte(signerID)))
  } catch (e) {
    console.log("failed to set the signer: " + e)
    displayErrorForUser()
    throw "A problem occured."
  }
}

export async function addRule(ruleID: string) {
  try {
    var r: string = Handler.checkRoster() || Handler.checkDarc() || Handler.checkSigner();
    if (r != "") {
      console.log(r)
      displayErrorForUser()
      throw "A problem occured."
    }
    await Handler.getInstance().AddRule(ruleID);
  } catch (e) {
    console.log("failed to add rule on DARC: " + e)
    displayErrorForUser()
    throw "A problem occured."
  }
}

export async function spawnWebPage(contractWebPageData: ContractWebPageData) {
  try {
    var r: string = Handler.checkRoster() || Handler.checkDarc() || Handler.checkSigner();
    if (r != "") {
      console.log(r)
      displayErrorForUser()
      throw "A problem occured."
    }
    await Handler.getInstance().SpawnWebPage(contractWebPageData).then(
      (r) => {
        displayErrorForUser()
        throw "A problem occured."
      }
    ).catch(
      (e) => {
        console.log("Failed to get the instance ID: " + e)
        displayErrorForUser()
      }
    )
  } catch (e) {
    console.log("Failed to spawn webPage instance: " + e)
    displayErrorForUser()
    throw "A problem occured."
  }
}

export function printWebPageContract(instIDID: string) {
  try {
    var r: string = Handler.checkRoster() || Handler.checkDarc() || Handler.checkSigner();
    if (r != "") {
      console.log(r)
      displayErrorForUser();
      return
    }
    const instIDHolder = document.getElementById(instIDID) as HTMLInputElement
    const instIDStr = instIDHolder.value
    if (instIDStr == "") {
      Handler.prependLog("please provide an instance id")
      displayErrorForUser();
      throw "A problem occured."
    }

    Handler.getInstance().PrintWebPage(Buffer.from(instIDStr, "hex"));
  } catch (e) {
    Handler.prependLog("failed to print webPage instance: " + e)
    displayErrorForUser();
    throw "A problem occured."
  }
}


export function PrintInfo(data: string) {
  console.log("Let's load this ledger")
  let cot = Cothority.network.Roster
  const r = cot.fromTOML(data)
  const rpc = new Cothority.status.StatusRPC(r);
  rpc.getStatus(0).then(
    (r) => {
      console.log(r.toString())
      displayErrorForUser()
      throw "A problem occured."
    },
    (e) => {
      console.log("something went wrong. Did you start the conodes ?" + e)
      displayErrorForUser()
      throw "A problem occured."
    }
  );
}

// Transform an hexadecimal string to its byte representation. This is used
// when reading inputs given from the user, which generally come as hex strings.

export function hexStringToByte(str: string) {
  if (!str) {
    return new Uint8Array();
  }

  var a = [];
  for (var i = 0, len = str.length; i < len; i += 2) {
    a.push(parseInt(str.substr(i, 2), 16));
  }

  return new Uint8Array(a);
}