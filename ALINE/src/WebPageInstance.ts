import Signer from "@dedis/cothority/darc/signer";
import ByzCoinRPC from "@dedis/cothority/byzcoin/byzcoin-rpc";
import ClientTransaction, { Argument, Instruction } from "@dedis/cothority/byzcoin/client-transaction";
import Instance, { InstanceID } from "@dedis/cothority/byzcoin/instance";
import { EMPTY_BUFFER, registerMessage } from "@dedis/cothority/protobuf";

import { addJSON } from '@dedis/cothority/protobuf';
import models from "../src/protobuf/models.json";
//Importer relativement

import { Message, Properties } from "protobufjs/light";

/**
 * This class offers a wrapper around the cothority library to spawn and update
 * a keyValue contract.
 */
export class WebPageInstance extends Instance {
    static readonly contractID = "webPage";
    contractWebPageData: ContractWebPageData;

    static async spawn(bc: ByzCoinRPC, darcID: InstanceID, signers: Signer[], webPageArgsEncoded: Buffer): Promise<WebPageInstance> {
        
        const arg = new Argument({
            name:  "webPageArgs",
            value: webPageArgsEncoded,
        });
        const inst = Instruction.createSpawn(darcID, WebPageInstance.contractID, [arg]);

        const ctx = ClientTransaction.make(bc.getProtocolVersion(), inst);
        await ctx.updateCounters(bc, [signers])
        ctx.signWith([signers]);

        await bc.sendTransactionAndWait(ctx, 10);
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
        //TODO: My type not recognized
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
 * This class declares a message to encode/decode the content of a keyValue
 * instance, namely a KeyValueData struct. It follows the definition of the
 * keyvalue.proto.
 */
export class ContractWebPageData extends Message<ContractWebPageData> {
    URLWebPage: string;
    Content: Uint8Array;
    Selector: string;
    CreationDate: string;
    TextOnly: boolean;

    constructor(props?: Properties<ContractWebPageData>) {
        super(props);

        this.URLWebPage = this.URLWebPage || "No URL has been found.";
        this.Content = this.Content || EMPTY_BUFFER;
        this.Selector = this.Selector|| "No selector has been found";
        this.CreationDate = this.CreationDate || "No creation date has been found";
        this.TextOnly = this.TextOnly || true;

    }

    static register() {
        registerMessage("KeyValueData", ContractWebPageData, KeyValue);
    }

    toString(): string {
        var res: string = "";
        res += "contractWebPageData:\n";
        res += "URL: " + this.URLWebPage;
        res += "\n";
        res += "Content: " + this.Content;
        res += "\n";
        res += "Selector: " + this.Selector;
        res += "\n";
        res += "Creation Date: " + this.CreationDate;
        res += "\n";
        res += "Text Only: " + this.TextOnly;
        res += "\n";
        return res;
    }
}

export class KeyValue extends Message<KeyValue> {
    key: string;
    value: Buffer;

    constructor(props?: Properties<KeyValue>) {
        super(props);

        this.key = this.key || "default";
        this.value = Buffer.from(this.value || EMPTY_BUFFER)
    }

    static register() {
        registerMessage("KeyValue", KeyValue);
    }
}

// Here we update the model with our models.json containing the definition of
// the keyValueData and we register our messages classes, so that protobuf can
// encore and decode it.
addJSON(models)
ContractWebPageData.register()
