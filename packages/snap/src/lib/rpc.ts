import { ReceiveBlock, SendBlock, Tools } from "libnemo";
import { AccountManager } from "./account-manager";
import { Account, RequestOptions, RpcAccountHistory, RpcAccountInfo, RpcResponseTypeMap, TxType } from "./types";
import { delay, formatRelativeDate, getRandomRepresentative, isValidAddress, nanoAddressToHex, uint8ArrayToHex } from "./utils";
import { RpcAction, ZERO_HASH, StoreKeys } from "./constants";
import { StateManager } from "./state-manager";
import { RequestError } from "../errors/";

export async function accountInfo(account: string): Promise<RpcAccountInfo | null> {
    return await request(RpcAction.ACCOUNT_INFO, { account, receivable: true, include_confirmed: true });
}

export async function accountHistory(account?: string, count = 5, raw = false, offset = 0, reverse = false): Promise<RpcAccountHistory[]> {
    if (!isValidAddress(account))
        account = (await AccountManager.getActiveAccount())?.address;

    return await request(RpcAction.ACCOUNT_HISTORY, { account, count, raw, offset, reverse }).then(res => (res?.history || []).map((tx) => ({
        ...tx,
        local_timestamp: formatRelativeDate(tx.local_timestamp),
    })));
}

export async function accountBalance(account?: string): Promise<{ balance: string, receivable: string }> {
    if (!isValidAddress(account))
        return { balance: '0', receivable: '0' };
    return await request(RpcAction.ACCOUNT_BALANCE, { account }).then(res => ({ balance: res?.balance || '0', receivable: res?.receivable || '0' }));
}

export async function blocksInfo(blocks: string[]): Promise<{ blocks: any, error?: string } | null> {
    return await request(RpcAction.BLOCKS_INFO, { hashes: blocks, pending: true, source: true });
}

export async function receivables(account?: string): Promise<Record<string, { amount: string, source: string }>> {
    if (!isValidAddress(account))
        return {};
    return request(RpcAction.RECEIVABLE, { account, source: true, include_only_confirmed: true, sorting: true }).then((res) => res?.blocks || {});
}

export async function process(block: any, subtype: TxType): Promise<{ hash: string, error?: string } | null> {
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

export async function generateWork(hash: string): Promise<{ work: string, hash: string } | null> {
    return await request(RpcAction.WORK_GENERATE, { hash }, { timeout: 45000 }).then(res => {
        return (typeof res?.work === 'string' && res?.work.length === 16 && /^[0-9A-F]+$/i.test(res.work)) ? res : null;
    }).catch(() => {
        return null;
    });
}

export async function resolveNanoIdentifier(identifier: string): Promise<{ resolved: string; alias: string }> {
    const defaultResponse = { resolved: 'Error resolving alias', alias: identifier };

    try {
        const aliasSupport = await StateManager.getState(StoreKeys.ALIAS_SUPPORT);
        if (!aliasSupport) {
            return { ...defaultResponse, resolved: 'Alias support is disabled' };
        }

        const [_, localPart, domain] = identifier.split('@');
        if (!localPart || !domain) {
            return { ...defaultResponse, resolved: 'Invalid alias' };
        }

        const response = await fetch(
            `https://${domain}/.well-known/nano-currency.json?names=${localPart}`
        );

        if (!response.ok) return defaultResponse;

        const data = await response.json();
        const name = data.names?.find((n: any) => n.name === localPart);

        return {
            alias: identifier,
            resolved: name?.address && isValidAddress(name.address)
                ? name.address
                : 'Invalid address in response'
        };
    } catch (error) {
        return defaultResponse;
    }
}

async function request<T extends RpcAction>(
    action: T,
    data: any,
    options: RequestOptions = {}
): Promise<RpcResponseTypeMap[T] | null> {
    const {
        maxRetries = 3,
        timeout = 20000,
        skipError = false
    } = options;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await executeRequest(action, data, timeout);
        } catch (error: any) {
            const isLastAttempt = attempt === maxRetries - 1;

            if (error instanceof RequestError && error.isValidationFailure) {
                if (!skipError) throw error;
                return null;
            }

            if (isLastAttempt) {
                if (!skipError) throw error;
                return null;
            }

            await delay(Math.min(1000 * Math.pow(2, attempt), 10000));
        }
    }

    return null;
}

async function executeRequest(
    action: string,
    data: any,
    timeout: number
): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const defaultRpc = await StateManager.getState(StoreKeys.DEFAULT_RPC);
    if (!defaultRpc) return null;

    try {
        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(defaultRpc.auth && { Authorization: defaultRpc.auth })
            },
            body: JSON.stringify({ ...data, action }),
            signal: controller.signal
        };

        const response = await fetch(defaultRpc.api, options);

        if (!response.ok) {
            throw new RequestError(
                `HTTP error! status: ${response.status}`,
                response.status
            );
        }

        const result = await response.json();

        // Validate response
        if (!result || typeof result !== 'object') {
            throw new RequestError('Invalid response format', undefined, true, 'Invalid response format');
        }

        return result;
    } finally {
        clearTimeout(timeoutId);
    }
}