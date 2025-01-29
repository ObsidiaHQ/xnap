import { ReceiveBlock, Rpc, SendBlock, Tools } from "libnemo";
import { AccountManager } from "./account-manager";
import { Account, Transaction, TxType } from "./interfaces";
import { StateManager, STORE_KEYS } from "./state-manager";
import { formatRelativeDate, getRandomRepresentative } from "./utils";
import { request } from "./request";
import { RpcAction } from "./constants";

export async function accountInfo(account: string) {
    return await request(RpcAction.ACCOUNT_INFO, { account, receivable: true, include_confirmed: true });
}

export async function accountHistory(account?: string, count = 5, raw = false, offset = 0, reverse = false): Promise<Transaction[]> {
    if (!account) {
        account = (await AccountManager.getActiveAccount())?.address;
    };

    return await request(RpcAction.ACCOUNT_HISTORY, { account, count, raw, offset, reverse }).then(res => (res?.history || []).map((tx) => ({
        ...tx,
        time: formatRelativeDate(tx.local_timestamp),
    })));
}

export async function accountBalance(account?: string) {
    if (!account) return '0';
    return await request(RpcAction.ACCOUNT_INFO, { account, receivable: true, include_confirmed: true }).then(res => res?.confirmed_balance);
}

export async function blocksInfo(blocks: string[]) {
    return await request(RpcAction.BLOCKS_INFO, { hashes: blocks, pending: true, source: true });
}

export async function receivables(account: string) {
    return await request(RpcAction.RECEIVABLE, { account, source: true, include_only_confirmed: true, sorting: true });
}

export async function process(block: any, subtype: TxType) {
    return await request(RpcAction.PROCESS, { block, watch_work: 'false', subtype });
}

export async function generateSend(walletAccount: Account, toAddress: string, nanoAmount: string): Promise<string> {
    const fromAccount = await accountInfo(walletAccount.address);
    if (!fromAccount) throw new Error(`Unable to get account information for ${walletAccount.address}`);

    //await validateAccount(fromAccount, walletAccount.publicKey);

    const representative = fromAccount.confirmed_representative || getRandomRepresentative();

    const rpc = new Rpc((await StateManager.getState(STORE_KEYS.DEFAULT_RPC))?.api!);
    const work = (await generateWork(fromAccount.confirmed_frontier!))?.work;
    const send = new SendBlock(walletAccount.address, fromAccount.confirmed_balance, toAddress, await Tools.convert(nanoAmount, 'nano', 'raw'), representative, fromAccount.confirmed_frontier!, work)
    await send.sign(walletAccount.privateKey!);

    // if (!workPool.workExists(fromAccount.confirmed_frontier)) {
    //     notifications.sendInfo(`Generating Proof of Work...`, { identifier: 'pow', length: 0 });
    // }

    //this.workPool.addWorkToCache(processResponse.hash, 1); // Add new hash into the work pool, high PoW threshold for send block
    //this.workPool.removeFromCache(fromAccount.confirmed_frontier);

    return send.process(rpc);
}

export async function generateReceive(fromAddress: string, nanoAmount: string): Promise<void> {
    const activeAccount = (await AccountManager.getActiveAccount())!;
    const account = await accountInfo(activeAccount.address);
    const readyBlocks = (await receivables(activeAccount.address))?.blocks!;
    if (!account) throw new Error(`Unable to get account information for ${activeAccount.address}`);

    //await validateAccount(fromAccount, walletAccount.publicKey);

    const representative = account.confirmed_representative || getRandomRepresentative();
    //rewrite: needs to be one by one - awaited
    const rpc = new Rpc((await StateManager.getState(STORE_KEYS.DEFAULT_RPC))?.api!);
    const pows = Object.keys(readyBlocks).map(hash => generateWork(hash));
    const powResults = await Promise.all(pows);
    const receivableBlocks = Object.keys(readyBlocks).map(async (hash) => new ReceiveBlock(
        activeAccount.address, 
        account.confirmed_balance, 
        readyBlocks[hash]?.source!, 
        await Tools.convert(nanoAmount, 'nano', 'raw'), 
        representative, 
        account.confirmed_frontier, 
        powResults.find(pow => pow?.hash === hash)?.hash)
    );

    //await receive.sign(activeAccount.privateKey!);

    //return receive.process(rpc);
}

export async function generateWork(hash: string, workServer = '') {
    const validateResponse = (res: any) => {
        if (res.work == null) {
            return {
                err: `Missing field "work".`,
            };
        };

        if (typeof res.work !== 'string') {
            return {
                err: `Invalid type of field "work", expected "string", got "${typeof res.work}".`,
            };
        };

        if (res.work.length !== 16) {
            return {
                err: `Invalid length of field "work", expected 16, got ${res.work.length}.`,
            };
        };

        if (/^[0-9A-F]+$/i.test(res.work) === false) {
            return {
                err: `Invalid contents of field "work", expected hex characters.`,
            };
        };

        return {
            err: null,
        };
    };

    return await request(RpcAction.WORK_GENERATE, { hash });
}