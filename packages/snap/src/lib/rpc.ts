import { ReceiveBlock, SendBlock, Tools } from "libnemo";
import { AccountManager } from "./account-manager";
import { Account, Transaction, TxType } from "./types";
import { formatRelativeDate, getRandomRepresentative, isValidAddress, nanoAddressToHex, uint8ArrayToHex } from "./utils";
import { request } from "./request";
import { RpcAction, ZERO_HASH, StoreKeys } from "./constants";
import { StateManager } from "./state-manager";

export async function accountInfo(account: string) {
    return await request(RpcAction.ACCOUNT_INFO, { account, receivable: true, include_confirmed: true });
}

export async function accountHistory(account?: string, count = 5, raw = false, offset = 0, reverse = false): Promise<Transaction[]> {
    if (!isValidAddress(account)) {
        account = (await AccountManager.getActiveAccount())?.address;
    };

    return await request(RpcAction.ACCOUNT_HISTORY, { account, count, raw, offset, reverse }).then(res => (res?.history || []).map((tx) => ({
        ...tx,
        time: formatRelativeDate(tx.local_timestamp),
    })));
}

export async function accountBalance(account?: string) {
    if (!isValidAddress(account)) return '0';
    return await request(RpcAction.ACCOUNT_INFO, { account, receivable: true, include_confirmed: true }).then(res => res?.confirmed_balance || '0');
}

export async function blocksInfo(blocks: string[]) {
    return await request(RpcAction.BLOCKS_INFO, { hashes: blocks, pending: true, source: true });
}

export async function receivables(account?: string) {
    if (!isValidAddress(account)) return {};
    return request(RpcAction.RECEIVABLE, { account, source: true, include_only_confirmed: true, sorting: true }).then((res) => res?.blocks || {});
}

export async function process(block: any, subtype: TxType) {
    return await request(RpcAction.PROCESS, { block, watch_work: 'false', subtype, json_block: 'true' });
}

export async function generateSendBlock(walletAccount: Account | null, toAddress: string, nanoAmount: string): Promise<string | undefined> {
    if (!walletAccount || !isValidAddress(walletAccount.address) || !isValidAddress(toAddress))
        throw new Error(`Invalid wallet address`);

    const fromAccount = await accountInfo(walletAccount.address);
    if (!fromAccount || fromAccount.error)
        throw new Error(`Unable to get account information for ${walletAccount.address}`);

    nanoAmount = await Tools.convert(nanoAmount, 'nano', 'raw');

    if (BigInt(fromAccount.confirmed_balance) < BigInt(nanoAmount))
        throw new Error(`Insufficient balance`);

    const representative = fromAccount.confirmed_representative || getRandomRepresentative();

    const work = (await generateWork(fromAccount.confirmed_frontier!))?.work;
    const send = new SendBlock(walletAccount.address, fromAccount.confirmed_balance, toAddress, nanoAmount, representative, fromAccount.confirmed_frontier!, work)
    await send.sign(walletAccount.privateKey!);

    return process(send.json(), 'send').then(res => res?.hash);
}

export async function generateReceiveBlock(): Promise<number> {
    const activeAccount = (await AccountManager.getActiveAccount())!;
    const activeAccountPubKey = nanoAddressToHex(activeAccount.address);
    const activeInfo = await accountInfo(activeAccount.address);
    const readyBlocks = await receivables(activeAccount.address);

    if (!activeInfo) throw new Error(`Unable to get account information for ${activeAccount.address}`);
    if (!Object.keys(readyBlocks).length) return 0;

    const representative = activeInfo.confirmed_representative || getRandomRepresentative();

    let currentFrontier = activeInfo.confirmed_frontier || ZERO_HASH;
    let currentBalance = BigInt(activeInfo.confirmed_balance || '0');
    const processedHashes = [];

    try {
        for (const hash of Object.keys(readyBlocks)) {
            const amount = BigInt(readyBlocks[hash]?.amount!);
            const block = new ReceiveBlock(
                activeAccount.address,
                currentBalance.toString(),
                hash,
                amount.toString(),
                representative,
                currentFrontier
            );

            block.work = (await generateWork(currentFrontier === ZERO_HASH ? activeAccountPubKey : currentFrontier))?.work!;
            await block.sign(activeAccount.privateKey!);
            const processedHash = await process(block.json(), 'receive');

            if (processedHash?.hash) {
                processedHashes.push(processedHash);
                currentFrontier = uint8ArrayToHex(await block.hash());
                currentBalance += amount;
            }
        }

        return processedHashes.length;
    } catch (error) {
        console.error('Error processing receive blocks:', error);
        throw error;
    }
}

export async function generateWork(hash: string) {
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

    return await request(RpcAction.WORK_GENERATE, { hash }, { timeout: 40000 });
}

export async function resolveNanoIdentifier(identifier: string): Promise<{ address: string, alias: string }> {
    try {
        const res: { address: string, alias: string } = { address: '', alias: identifier };
        const aliasSupport = await StateManager.getState(StoreKeys.ALIAS_SUPPORT);

        if (!aliasSupport) {
            res.address = 'Alias support is disabled';
            return res;
        }

        const [_, localPart, domain] = identifier.split('@');
        if (!localPart || !domain) {
            res.address = 'Invalid alias';
            return res;
        }

        const wellKnownUrl = `https://${domain}/.well-known/nano-currency.json?names=${localPart}`;
        const response = await fetch(wellKnownUrl);

        if (response.ok) {
            const data = await response.json();
            const name = data.names?.find((n: any) => n.name === localPart);
            if (name?.address && isValidAddress(name.address)) {
                res.address = name.address;
                return res;
            }
        }

        res.address = 'Error resolving alias';
        return res;

    } catch (error) {
        return { address: 'Error resolving alias', alias: identifier };
    }
}
