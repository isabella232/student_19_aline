import Signer from "@dedis/cothority/darc/signer";
import ByzCoinRPC from "@dedis/cothority/byzcoin/byzcoin-rpc";
import ClientTransaction, { Argument, Instruction } from "@dedis/cothority/byzcoin/client-transaction";
import Instance, { InstanceID } from "@dedis/cothority/byzcoin/instance";
import { addJSON, EMPTY_BUFFER, registerMessage } from "@dedis/cothority/protobuf";
import models from "../src/protobuf/models.json";
import { Message, Properties } from "protobufjs/light";

/**
 * This class offers a wrapper around the cothority library to spawn and update
 * a webPage contract.
 */
export class WebPageInstance extends Instance {
    static readonly contractID = "webPage";
    contractWebPageData: ContractWebPageData;

    static async spawn(bc: ByzCoinRPC, darcID: InstanceID, signers: Signer[], key: string, webPageArgsEncoded: Buffer): Promise<WebPageInstance> {
        
        const arg = new Argument({
            name:  "webPageArgs",
            value: webPageArgsEncoded,
        });
        const inst = Instruction.createSpawn(darcID, WebPageInstance.contractID, [arg]);
        await inst.updateCounters(bc, signers);

        const ctx = ClientTransaction.make(bc.getProtocolVersion(), inst);
        ctx.signWith([signers]);

        await bc.sendTransactionAndWait(ctx, 10)

        return WebPageInstance.fromByzcoin(bc, ctx.instructions[0].deriveId(), 10);
    }

    static create(bc: ByzCoinRPC, instanceID: InstanceID, darcID: InstanceID, 
        data: Buffer): WebPageInstance {

        return new WebPageInstance(bc, new Instance({
            contractID: WebPageInstance.contractID,
            darcID,
            data: data,
            id: instanceID,
        }));
    }

    static async fromByzcoin(bc: ByzCoinRPC, iid: InstanceID, 
        waitMatch: number = 0, interval: number = 1000):Promise<WebPageInstance> {

        return new WebPageInstance(bc, await Instance.fromByzcoin(bc, iid, 
            waitMatch, interval));
    }

    constructor(private rpc: ByzCoinRPC, inst: Instance) {
        super(inst);
        if (inst.contractID.toString() !== WebPageInstance.contractID) {
            throw new Error(`mismatch contract name: ${inst.contractID} vs 
            ${WebPageInstance.contractID}`);
        }
        this.contractWebPageData = ContractWebPageData.decode(inst.data)
    }


    toString(): string {
        var res: string = "";
        res += "WebPageInstance:\n";
        res += this.contractWebPageData.toString()
        return res;
    }
}

/**
 * This class declares a message to encode/decode the content of a webPage
 * instance, namely a ContractWebPageData struct.
 */
export class ContractWebPageData extends Message<ContractWebPageData> {
    URLWebPage: string;
    HashedContent: Buffer;
    Selector: string;
    CreationDate: string;
    TextOnly: boolean;

    constructor(props?: Properties<ContractWebPageData>) {
        super(props);

        this.URLWebPage = this.URLWebPage || "No URL has been found.";
        this.HashedContent = Buffer.from(this.HashedContent || EMPTY_BUFFER);
        this.Selector = this.Selector|| "No selector has been found";
        this.CreationDate = this.CreationDate || "No creation date has been found";
        this.TextOnly = this.TextOnly || true;

    }

    static register() {
        registerMessage("ContractWebPageData", ContractWebPageData);
    }

    toString(): string {
        var res: string = "";
        res += "contractWebPageData:\r\n";
        res += "\r\n";
        res += "URL: " + this.URLWebPage;
        res += "\r\n";
        res += "Hashed content: " + this.HashedContent.toString("hex");
        res += "\r\n";
        res += "Selector: " + this.Selector;
        res += "\r\n";
        res += "Creation Date: " + this.CreationDate;
        res += "\r\n";
        res += "Text Only: " + this.TextOnly;
        res += "\r\n";
        return res;
    }
}

// Here we update the model with our models.json containing the definition of
// the ContractWebPageData and we register our messages classes, so that protobuf can
// encore and decode it.
addJSON(models)
ContractWebPageData.register()
