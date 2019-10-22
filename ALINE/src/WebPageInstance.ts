import ByzCoinRPC from "@dedis/cothority/byzcoin/byzcoin-rpc";
import ClientTransaction, { Argument, Instruction } from "@dedis/cothority/byzcoin/client-transaction";
import Instance, { InstanceID } from "@dedis/cothority/byzcoin/instance";

export default class WebPageInstance extends Instance {
    static readonly contractID = "webPage";
    static readonly argument = "url";

    /**
     * Spawn a value instance from a darc id
     *
     * @param bc        The RPC to use
     * @param darcID    The darc instance ID
     * @param signers   The list of signers for the transaction
     * @param URL    The value to be put in the value instance
     * @returns a promise that resolves with the new instance
     */
    static async spawn(
        bc: ByzCoinRPC,
        darcID: InstanceID,
        signers: Signer[],
        value: Buffer,
    ): Promise<ValueInstance> {
        const inst = Instruction.createSpawn(
            darcID,
            ValueInstance.contractID,
            [new Argument({name: ValueInstance.argumentValue, value})],
        );
        await inst.updateCounters(bc, signers);

        const ctx = ClientTransaction.make(bc.getProtocolVersion(), inst);
        ctx.signWith([signers]);

        await bc.sendTransactionAndWait(ctx, 10);

        return ValueInstance.fromByzcoin(bc, ctx.instructions[0].deriveId());
    }
}
