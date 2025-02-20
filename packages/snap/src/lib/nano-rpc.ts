import { ReceiveBlock, SendBlock, Tools } from 'libnemo';

import { RequestError, RequestErrors, SnapError } from '../errors';
import { AccountManager } from './account-manager';
import { RpcAction, ZERO_HASH, StoreKeys } from './constants';
import { StateManager } from './state-manager';
import type {
  Account,
  NanoAlias,
  RequestOptions,
  RpcAccountHistory,
  RpcAccountInfo,
  RpcActionParamsMap,
  RpcResponseTypeMap,
} from './types';
import {
  delay,
  formatRelativeDate,
  getRandomRepresentative,
  isNanoIdentifier,
  isValidAddress,
  nanoAddressToHex,
  uint8ArrayToHex,
} from './utils';

/**
 * gets account info for given account address
 * @link https://docs.nano.org/commands/rpc-protocol/#account_info
 * @param account
 */
export async function accountInfo(account: string): Promise<RpcAccountInfo | null> {
  return request(RpcAction.ACCOUNT_INFO, { account, receivable: true, include_confirmed: true });
}

/**
 * gets account history for given account address
 * @link https://docs.nano.org/commands/rpc-protocol/#account_history
 * @param account
 * @param count
 * @param raw
 * @param offset
 * @param reverse
 */
export async function accountHistory(
  account?: string,
  count = 5,
  raw = false,
  offset = 0,
  reverse = false,
): Promise<RpcAccountHistory[]> {
  if (!account || !isValidAddress(account)) {
    account = (await AccountManager.getActiveAccount())?.address;
  }

  return request(RpcAction.ACCOUNT_HISTORY, { account, count, raw, offset, reverse }).then((res) =>
    (res?.history || []).map((tx) => ({
      ...tx,
      local_timestamp: formatRelativeDate(tx.local_timestamp),
    })),
  );
}

/**
 * gets account balance for given account address
 * @link https://docs.nano.org/commands/rpc-protocol/#account_balance
 * @param account
 */
export async function accountBalance(account?: string): Promise<{ balance: string; receivable: string }> {
  if (!account || !isValidAddress(account)) {
    return { balance: '0', receivable: '0' };
  }
  return request(RpcAction.ACCOUNT_BALANCE, { account }).then((res) => ({
    balance: res?.balance || '0',
    receivable: res?.receivable || '0',
  }));
}

/**
 * gets blocks info for given blocks array
 * @link https://docs.nano.org/commands/rpc-protocol/#blocks_info
 * @param blocks
 */
export async function blocksInfo(blocks: string[]): Promise<{ blocks: any; error?: string } | null> {
  return request(RpcAction.BLOCKS_INFO, { hashes: blocks, pending: true, source: true });
}

/**
 * gets receivable blocks for given account address
 * @link https://docs.nano.org/commands/rpc-protocol/#receivable
 * @param account
 */
export async function receivables(account?: string): Promise<Record<string, { amount: string; source: string }>> {
  if (!account || !isValidAddress(account)) {
    return {};
  }
  return request(RpcAction.RECEIVABLE, { account, source: true, include_only_confirmed: true, sorting: true }).then(
    (res) => res?.blocks || {},
  );
}

/**
 * processes a send block for given wallet account, to address and nano amount
 * @link https://docs.nano.org/commands/rpc-protocol/#process
 * @param walletAccount
 * @param toAddress
 * @param nanoAmount
 */
export async function processSendBlock(
  walletAccount: Account | null,
  toAddress: string,
  nanoAmount: string,
): Promise<string | undefined> {
  if (
    !walletAccount ||
    !isValidAddress(walletAccount.address) ||
    !isValidAddress(toAddress) ||
    !walletAccount.privateKey
  ) {
    throw SnapError.of(RequestErrors.ResourceNotFound);
  }

  const fromAccount = await accountInfo(walletAccount.address);
  if (!fromAccount || fromAccount.error) {
    throw SnapError.of(RequestErrors.ResourceUnavailable);
  }

  nanoAmount = await Tools.convert(nanoAmount, 'nano', 'raw');

  if (BigInt(fromAccount.confirmed_balance) < BigInt(nanoAmount)) {
    throw SnapError.of(RequestErrors.InvalidParams);
  }

  const representative = fromAccount.confirmed_representative || getRandomRepresentative();

  const work = (await generateWork(fromAccount.confirmed_frontier))?.work;
  if (!work) {
    throw SnapError.of(RequestErrors.WorkGenerationFailed);
  }

  const send = new SendBlock(
    walletAccount.address,
    fromAccount.confirmed_balance,
    toAddress,
    nanoAmount,
    representative,
    fromAccount.confirmed_frontier,
    work,
  );
  await send.sign(walletAccount.privateKey);

  return request(RpcAction.PROCESS, {
    block: send.json(),
    watch_work: 'false',
    subtype: 'send',
    json_block: 'true',
  }).then((res) => res?.hash);
}

/**
 * processes receive blocks for active account
 * @link https://docs.nano.org/commands/rpc-protocol/#process
 */
export async function processReceiveBlocks(): Promise<number> {
  const activeAccount = await AccountManager.getActiveAccount();
  const activeAccountPubKey = nanoAddressToHex(activeAccount.address);
  const activeInfo = await accountInfo(activeAccount.address);
  const readyBlocks = await receivables(activeAccount.address);

  if (!activeInfo) {
    throw SnapError.of(RequestErrors.ResourceUnavailable);
  }
  if (!activeAccount.privateKey) {
    throw SnapError.of(RequestErrors.ResourceNotFound);
  }
  if (!Object.keys(readyBlocks).length) {
    return 0;
  }

  const representative = activeInfo.confirmed_representative || getRandomRepresentative();

  let currentFrontier = activeInfo.confirmed_frontier || ZERO_HASH;
  let currentBalance = BigInt(activeInfo.confirmed_balance || '0');
  const processedHashes: string[] = [];

  try {
    for (const hash of Object.keys(readyBlocks)) {
      const amount = BigInt(readyBlocks[hash]?.amount || '0');
      const block = new ReceiveBlock(
        activeAccount.address,
        currentBalance.toString(),
        hash,
        amount.toString(),
        representative,
        currentFrontier,
      );

      block.work =
        (await generateWork(currentFrontier === ZERO_HASH ? activeAccountPubKey : currentFrontier))?.work || '';
      if (!block.work) {
        throw SnapError.of(RequestErrors.WorkGenerationFailed);
      }

      await block.sign(activeAccount.privateKey);
      const processedRes = await request(RpcAction.PROCESS, {
        block: block.json(),
        watch_work: 'false',
        subtype: 'receive',
        json_block: 'true',
      });

      if (processedRes?.hash) {
        processedHashes.push(processedRes.hash);
        currentFrontier = uint8ArrayToHex(await block.hash());
        currentBalance += amount;
      }
    }

    return processedHashes.length;
  } catch {
    throw SnapError.of(RequestErrors.TransactionFailed);
  }
}

/**
 * generates work for given hash
 * @link https://docs.nano.org/commands/rpc-protocol/#work_generate
 * @param hash
 */
export async function generateWork(hash: string): Promise<{ work: string; hash: string } | null> {
  return request(RpcAction.WORK_GENERATE, { hash }, { timeout: 45000 })
    .then((res) => {
      return typeof res?.work === 'string' && res?.work.length === 16 && /^[0-9A-F]+$/i.test(res.work) ? res : null;
    })
    .catch(() => {
      return null;
    });
}

/**
 * resolves given nano identifier to an address
 * @param identifier of format `@localPart@domain`
 */
export async function resolveNanoIdentifier(identifier: string): Promise<{ resolved: string; identifier: string }> {
  const aliasSupport = await StateManager.getState(StoreKeys.ALIAS_SUPPORT);
  if (!aliasSupport) {
    return { identifier, resolved: 'Alias support is disabled' };
  }

  if (!isNanoIdentifier(identifier)) {
    return { identifier, resolved: 'Invalid alias' };
  }

  const [_, localPart, domain] = identifier.split('@');

  return request(
    RpcAction.RESOLVE_ALIAS,
    { aliasDomain: `https://${domain}/.well-known/nano-currency.json?names=${localPart}` },
    { timeout: 5000, maxRetries: 1 },
  ).then((res) => {
    if (!res) {
      return { identifier, resolved: 'Error resolving alias' };
    }

    const name = res.names?.find((n: NanoAlias) => n.name === localPart);

    return {
      identifier,
      resolved: name?.address && isValidAddress(name.address) ? name.address : 'Error resolving alias',
    };
  });
}

/**
 * requests given action with given data and options with retries and timeout
 * @param action
 * @param data
 * @param options
 */
async function request<T extends RpcAction>(
  action: T,
  data: RpcActionParamsMap[T],
  options: RequestOptions = {},
): Promise<RpcResponseTypeMap[T] | null> {
  const { maxRetries = 3, timeout = 20000, skipError = false } = options;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await executeRequest(action, data, timeout);
    } catch (error: unknown) {
      const isLastAttempt = attempt === maxRetries - 1;

      if (error instanceof RequestError && error.isValidationFailure) {
        if (!skipError) {
          throw error;
        }
        return null;
      }

      if (isLastAttempt) {
        if (!skipError) {
          throw error;
        }
        return null;
      }

      await delay(Math.min(1000 * Math.pow(2, attempt), 10000));
    }
  }

  return null;
}

/**
 * executes actual request
 * @param action
 * @param data
 * @param timeout
 */
async function executeRequest<T extends RpcAction>(
  action: T,
  data: RpcActionParamsMap[T],
  timeout: number,
): Promise<RpcResponseTypeMap[T] | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const isAliasRequest = action === RpcAction.RESOLVE_ALIAS;

  const defaultRpc = (await StateManager.getState(StoreKeys.DEFAULT_RPC));
  if (!isAliasRequest && !defaultRpc) {
    return null;
  }

  try {
    const options: RequestInit = isAliasRequest
      ? {}
      : {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(defaultRpc?.auth && { Authorization: defaultRpc.auth }),
          },
          body: JSON.stringify({ ...data, action }),
          signal: controller.signal,
        };

    const endpoint = isAliasRequest ? (data as { aliasDomain: string }).aliasDomain : defaultRpc?.api;
    if (!endpoint) {
      return null;
    }

    const response = await fetch(endpoint, options);
    if (!response.ok) {
      throw new RequestError(`HTTP error! status: ${response.status}`, response.status);
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
