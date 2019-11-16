import * as Cothority from "@dedis/cothority";
import {WebPageInstance, ContractWebPageData} from "./WebPageInstance";

// ----------------------------------------------------------------------------
// The Handler class is a singleton that offers methods to talk to the cothority
// library.

export class Handler {
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
  
    async LoadRoster(data: string) {
        Handler.startLoader()
        const roster = Cothority.network.Roster.fromTOML(data)
        const rpc = new Cothority.status.StatusRPC(roster)
        await rpc.getStatus(0).then(
            (r) => {
                Handler.roster = roster
                Handler.prependLog("roster loaded!")
                Handler.prependLog("Here is the content of Handler.roster: " + Handler.roster)
            },
            (e) => {
                Handler.prependLog("failed to load roster: " + e)
            }
        ).finally(
            () => Handler.stopLoader()
        )
    }
  
    async SetDarc(scid: Buffer) {
        Handler.startLoader()
        Handler.prependLog("loading the genesis Darc and scid '" + scid.toString("hex") + "'...")
        const rpc = Cothority.byzcoin.ByzCoinRPC.fromByzcoin(Handler.roster, scid)
        await rpc.then(
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
  
    async AddRule(ruleStr: string) {
        Handler.startLoader();
        Handler.prependLog("setting the rules " + ruleStr + "...")
        const rpc = Cothority.byzcoin.ByzCoinRPC.fromByzcoin(Handler.roster, Handler.scid)
        await rpc.then(
          async (r) => {
                var darc = r.getDarc()
  
                Handler.prependLog("RPC created, getting the darc...")
                await Cothority.contracts.darc.DarcInstance.fromByzcoin(r, darc.getBaseID()).then(
                  async (darcInstance) => {
                        const evolveDarc = darc.evolve();
                        evolveDarc.addIdentity(ruleStr, Handler.signer, Cothority.darc.Rule.OR)
                        Handler.prependLog("rule '" + ruleStr + "' added on temporary darc...")
                        await darcInstance.evolveDarcAndWait(evolveDarc, [Handler.signer], 10).then(
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
  
    async SpawnWebPage(contractWebPageData: ContractWebPageData) {
        Handler.startLoader()
        Handler.prependLog("creating an RPC to spawn a new web page instance...")
        const rpc = Cothority.byzcoin.ByzCoinRPC.fromByzcoin(Handler.roster, Handler.scid)
        let webPageInstanceID : string = "NO ID COULD HAVE BEEN RETRIEVED."
        return await rpc.then(
          async (r) => {
                Handler.prependLog("RPC created, we now send a spawn:webPage request...")
                await WebPageInstance.spawn(r, Handler.darc.getBaseID(), [Handler.signer], "webPageArgs", Buffer.from(ContractWebPageData.encode(contractWebPageData).finish())).then(
                  (webPageInstance: WebPageInstance) => {
                        // Handler.prependLog("Web page instance spawned: " + webPageInstance)
                        Handler.prependLog("Web Pageinstance spawned: \n" + webPageInstance.toString() + "\nInstance ID: " + webPageInstance.id.toString("hex"))
                        webPageInstanceID = webPageInstance.id.toString("hex")
                      },
                    (e: Error) => {
                        console.error(e);
                        Handler.prependLog("failed to spawn the web page instance: " + e)
                        Promise.reject(e)
                      }
                ).finally(
                    () => {
                        Handler.stopLoader()
                        Promise.resolve(webPageInstanceID)
                    }
                )
            },
            (e) => {
                Handler.stopLoader()
                Handler.prependLog("failed to create RPC: " + e)
                Promise.reject(e)
              }
        )
  
    }
  
    PrintWebPage(instIDStr: Buffer) {
        Handler.startLoader()
        Handler.prependLog("creating an RPC to get the web page instance...")
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
                            Handler.prependLog("this is not a proof for the webPage contrac... aborting!")
                            return
                        }
                        Handler.prependLog("ok, now let's decode it...")
                        var contractWebPageData = ContractWebPageData.decode(proof.value);
                        console.log(contractWebPageData)
                        Handler.prependLog("here is the web page instance: \n" + contractWebPageData.toString())
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