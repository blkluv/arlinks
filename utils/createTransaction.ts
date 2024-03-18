
import {ArweaveWallet} from "@/types/ArweaveWallet";
import {Tag, Arweave, Transaction, CreateTransactionInterface, DispatchResult} from "@/types";



/*
Create new Arweave transaction. Accepts {name, value}[] Tags and initialized Arweave instance as args.
 */
export async function createTransaction({tags, arweave}: {tags: Tag[], arweave: Arweave}): Promise<Transaction> {
    const txSettings = {} as Partial<CreateTransactionInterface>
    txSettings.data = " ";
    txSettings.target = '';
    txSettings.quantity = '0';
    txSettings.reward = undefined;

    // @ts-ignore
    const transaction = await arweave.createTransaction(txSettings)
    for (const tag of tags) { transaction.addTag(tag.name, tag.value) }

    return transaction;
}

export async function dispatchTransaction({transaction, wallet}: {transaction: Transaction, wallet: ArweaveWallet}): Promise<DispatchResult|undefined> {
    const permissions = await wallet.getPermissions();
    if(!permissions.includes("DISPATCH")) {
        await wallet.connect(["DISPATCH"])
    }
    const result = await wallet.dispatch(transaction);
    console.log(result.id)
    return {id: result.id, type: result.type}
}