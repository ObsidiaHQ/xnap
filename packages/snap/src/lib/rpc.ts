import { ReceiveBlock, SendBlock, Tools } from "libnemo";
import { AccountManager } from "./account-manager";
import { Account, Transaction, TxType } from "./interfaces";
import { formatRelativeDate, getRandomRepresentative, uint8ArrayToHex } from "./utils";
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
    return await request(RpcAction.ACCOUNT_INFO, { account, receivable: true, include_confirmed: true }).then(res => res?.confirmed_balance || '0');
}

export async function blocksInfo(blocks: string[]) {
    return await request(RpcAction.BLOCKS_INFO, { hashes: blocks, pending: true, source: true });
}

export async function receivables(account: string) {
    if (!account) return {};
    return request(RpcAction.RECEIVABLE, { account, source: true, include_only_confirmed: true, sorting: true }).then((res) => res?.blocks || {});
}

export async function process(block: any, subtype: TxType) {
    return await request(RpcAction.PROCESS, { block, watch_work: 'false', subtype, json_block: 'true' });
}

export async function generateSend(walletAccount: Account, toAddress: string, nanoAmount: string): Promise<string | undefined> {
    const fromAccount = await accountInfo(walletAccount.address);
    if (!fromAccount) throw new Error(`Unable to get account information for ${walletAccount.address}`);

    const representative = fromAccount.confirmed_representative || getRandomRepresentative();

    const work = (await generateWork(fromAccount.confirmed_frontier!))?.work;
    const send = new SendBlock(walletAccount.address, fromAccount.confirmed_balance, toAddress, await Tools.convert(nanoAmount, 'nano', 'raw'), representative, fromAccount.confirmed_frontier!, work)
    await send.sign(walletAccount.privateKey!);

    return process(send.json(), 'send').then(res => res?.hash);
}

export async function generateReceive(): Promise<number> {
    const activeAccount = (await AccountManager.getActiveAccount())!;
    const account = await accountInfo(activeAccount.address);
    const readyBlocks = (await receivables(activeAccount.address));
    if (!account) throw new Error(`Unable to get account information for ${activeAccount.address}`);

    const representative = account.confirmed_representative || getRandomRepresentative();

    const receivablesRes = [];
    for (const hash of Object.keys(readyBlocks)) {
        const block = new ReceiveBlock(
            activeAccount.address,
            account.confirmed_balance,
            hash,
            readyBlocks[hash]?.amount!,
            representative,
            account.confirmed_frontier,
        );
        block.work = (await generateWork(account.confirmed_frontier))?.work!;
        await block.sign(activeAccount.privateKey!);
        const processedHash = await process(block.json(), 'receive');
        if (processedHash?.hash) receivablesRes.push(processedHash);
        account.confirmed_frontier = uint8ArrayToHex(await block.hash());
        account.confirmed_balance = block.balance.toString();
    }

    return receivablesRes.length;
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

    return await request(RpcAction.WORK_GENERATE, { hash }, { timeout: 30000 });
}