import Signer from "@dedis/cothority/darc/signer";
import ByzCoinRPC from "@dedis/cothority/byzcoin/byzcoin-rpc";
import ClientTransaction, { Argument, Instruction } from "@dedis/cothority/byzcoin/client-transaction";
import Instance, { InstanceID } from "@dedis/cothority/byzcoin/instance";
import {ContractWebPageData} from "./ContractWebPageData"

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

    toStringForUsers(): string {
        var res: string = "";
        res += this.contractWebPageData.toStringForUsers()
        return res;
    }
}