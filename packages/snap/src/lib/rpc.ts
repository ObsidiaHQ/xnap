import { Rpc, SendBlock, Tools } from "libnemo";
import { AccountManager } from "./account-manager";
import { RepAccounts } from "./constants";
import { Account, Transaction, TxType } from "./interfaces";
import { StateManager, STORE_KEYS } from "./state-manager";
import { formatRelativeDate, rawToNano } from "./utils";

type RpcAccountHistory = {
    account: string;
    amount: string;
    local_timestamp: string;
    type: TxType;
    hash: string;
}

type RpcAccountInfo = {
    confirmed_frontier: string,
    confirmed_receivable: string,
    confirmed_representative: string,
    confirmed_balance: string,
    modified_timestamp: string,
}

export function getRandomRepresentative() {
    return RepAccounts[Math.floor(Math.random() * RepAccounts.length)]!;
}

async function request(action: string, data: any, skipError: boolean, url = '', validateResponse?: Function): Promise<any> {
    const defaultRpc = await StateManager.getState(STORE_KEYS.DEFAULT_RPC);
    data.action = action;
    const apiUrl = url === '' ? defaultRpc?.api : url;
    if (!apiUrl) {
        return;
    }

    let options: any = {
        "responseType": "application/json",
        "Content-Type": "application/json"
    };

    if (!defaultRpc?.auth && defaultRpc?.auth !== '') {
        options = { ...options, Authorization: defaultRpc?.auth }
    }

    return fetch(apiUrl, { method: 'post', body: JSON.stringify(data) })
        .then(res => {
            if (typeof validateResponse === 'function') {
                const { err } = validateResponse(res);
                const isValidResponse = (err == null);

                if (isValidResponse === false) {
                    throw {
                        isValidationFailure: true,
                        status: 500,
                        reason: err,
                        res,
                    };
                };
            };

            return res;
        })
        .catch(async err => {
            if (skipError) return;

            if (err.isValidationFailure === true) {
                console.log(
                    'Node response failed validation.',
                    err.reason,
                    err.res
                );
            } else {
                console.log('Node responded with error', err.status);
            }

            throw err;
        });
}

export async function accountInfo(account?: string): Promise<RpcAccountInfo> {
    if (!account) return {} as RpcAccountInfo;
    return await request('account_info', { account, receivable: true, include_confirmed: true }, false).then(res => res?.json());
}

export async function accountHistory(account?: string, count = 5, raw = false, offset = 0, reverse = false): Promise<Transaction[]> {
    if (!account) {
        account = (await AccountManager.getActiveAccount())?.address;
    };

    return await request('account_history', { account, count, raw, offset, reverse }, false).then(res => res?.json()).then(res => (res?.history || []).map((tx: RpcAccountHistory) => ({
        ...tx,
        amount: rawToNano(tx.amount),
        time: formatRelativeDate(tx.local_timestamp),
    })));
}

export async function accountBalance(account?: string): Promise<string> {
    if (!account) return '0';
    return await request('account_info', { account, receivable: true, include_confirmed: true }, false).then(res => res?.json()).then(res => rawToNano(res?.confirmed_balance));
}

export async function process(block: any, subtype: TxType): Promise<{ hash: string, error?: string }> {
    return await request('process', { block, watch_work: 'false', subtype }, false).then(res => res?.json());
}

export async function generateSend(walletAccount: Account, toAddress: string, nanoAmount: string): Promise<string> {
    const fromAccount = await accountInfo(walletAccount.address);
    if (!fromAccount) throw new Error(`Unable to get account information for ${walletAccount.address}`);

    //await validateAccount(fromAccount, walletAccount.publicKey);

    const representative = fromAccount.confirmed_representative || getRandomRepresentative();

    const rpc = new Rpc((await StateManager.getState(STORE_KEYS.DEFAULT_RPC))?.api!);
    const work = (await generateWork(fromAccount.confirmed_frontier)).work;
    const send = new SendBlock(walletAccount.address, fromAccount.confirmed_balance, toAddress, await Tools.convert(nanoAmount, 'nano', 'raw'), representative, fromAccount.confirmed_frontier, work)
    await send.sign(walletAccount.privateKey!);

    // if (!workPool.workExists(fromAccount.confirmed_frontier)) {
    //     notifications.sendInfo(`Generating Proof of Work...`, { identifier: 'pow', length: 0 });
    // }

    //this.workPool.addWorkToCache(processResponse.hash, 1); // Add new hash into the work pool, high PoW threshold for send block
    //this.workPool.removeFromCache(fromAccount.confirmed_frontier);

    return send.process(rpc);
}

export async function generateWork(hash: string, workServer = ''): Promise<{ work: string, hash: string }> {
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

    return await request('work_generate', { hash }, workServer !== '', workServer).then(res => res?.json());
}