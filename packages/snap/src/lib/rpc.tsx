
// import { Snap } from '../interface';
// import { Tools, Account } from 'libnemo'
// import { BIP44Node, SLIP10Node } from '@metamask/key-tree';
// import { assert, remove0x } from '@metamask/utils';
// import { Heading, Button, Box, Text, Copyable } from '@metamask/snaps-sdk/jsx';
// import { StateManager } from '../state-manager';

import { AccountManager } from "./account-manager";
import { Transaction } from "./interfaces";
import { StateManager, STORE_KEYS } from "./state-manager";
import { formatRelativeDate, rawToNano } from "./utils";

// declare let snap: Snap;

// export async function initHDNode(): Promise<void> {
//   let nanoNode = await StateManager.getState('nanoNode') as BIP44Node;

//   if (!nanoNode) {
//     nanoNode = (await snap.request({
//       method: 'snap_getBip32Entropy',
//       params: {
//         path: ["m", "44'", "165'"],
//         curve: "ed25519",
//       },
//     })) as BIP44Node; 
//     await StateManager.setState("nanoNode", nanoNode);
//     await StateManager.setState("accounts", []);
//     await StateManager.setState("currentAccountIndex", 0);
//   }
// }

// export async function getAccount(): Promise<Account> {
//   initHDNode();

//   let currentAccountIndex = await StateManager.getState('currentAccountIndex') as number;
//   const accounts = await StateManager.getState('accounts') as Account[];

//   if (!accounts?.length) {
//     const newAccount = await addAccount();
//     accounts.push(newAccount);
//   }

//   if (!currentAccountIndex && currentAccountIndex !== 0) {
//     await StateManager.setState("currentAccountIndex", 0);
//     currentAccountIndex = 0;
//   }

//   return accounts[currentAccountIndex] as Account;
// }

// export async function addAccount(): Promise<Account> {
//   initHDNode();

//   let nanoNode = await StateManager.getState('nanoNode') as BIP44Node;
//   const accounts = await StateManager.getState('accounts') as Account[];

//   const nanoSlip10Node = await SLIP10Node.fromJSON(nanoNode);
//   const accountKey = await nanoSlip10Node.derive([`slip10:${accounts.length + 1}'`]);

//   const privKey = remove0x(accountKey.toJSON().privateKey || '');

//   const account = await Account.fromPrivateKey(privKey);

//   accounts.push(account);

//   await StateManager.setState('accounts', accounts);

//   return account;
// }

// export async function switchAccount(index: number): Promise<Account> {
//   initHDNode();

//   await StateManager.setState("currentAccountIndex", index);
//   const accounts = await StateManager.getState('accounts') as Account[];

//   return accounts[index] as Account;
// }

// export async function getAddress(): Promise<string> {
//   const account = await getAccount();

//   if (!account?.address) {
//     throw new Error('Address not found');
//   }

//   return account.address;
// };

// export async function getTransactions(
//   snap: Snap,
// ): Promise<any[]> {
//   const address = await getAddress();
//   const res = await fetch('https://rpc.nano.to', {
//     method: 'POST',
//     body: JSON.stringify({
//       action: 'account_history',
//       account: address,
//       count: '30',
//     }),
//   });
//   return (res.json() as any).history;
// }

// export async function getBalance(origin: string, snap: Snap): Promise<bigint | undefined> {
//   const account = await getAccount();
//   return account.balance;
// }

// export async function makeTransaction(snap: Snap, params: any): Promise<number> { 
//   const amount = await snap.request({
//     method: "snap_dialog",
//     params: {
//       type: "prompt",
//       content: (
//         <Box>
//           <Heading>Send nano to this address: {params.to}</Heading>
//           <Form name="send-form">
//             <Field label="Amount">
//               <Input type='number' name="amount" value="5" />
//             </Field>
//             <Button type="submit">Submit</Button>
//           </Form>
//         </Box>
//       ),
//     },
//   });
//   return amount as number;
// }

type HistoryResponse = {
    account: string;
    amount: string;
    local_timestamp: string;
    type: 'receive' | 'send' | 'other';
    hash: string;
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

export async function accountInfo(account: string): Promise<any> {
    if (!account) return {};
    return await request('account_info', { account, pending: true, representative: true, weight: true }, false).then(res => res.json());
}

export async function accountHistory(account?: string, count = 5, raw = false, offset = 0, reverse = false): Promise<Transaction[]> {
    if (!account) {
        account = (await AccountManager.getActiveAccount())?.address;
    };
    
    return await request('account_history', { account, count, raw, offset, reverse }, false).then(res => res.json()).then(res => (res.history || []).map((tx: HistoryResponse) => ({
        ...tx,
        amount: rawToNano(tx.amount),
        time: formatRelativeDate(tx.local_timestamp),
    })));
}

export async function accountBalance(account?: string): Promise<string> {
    if (!account) return '0';
    return await request('account_info', { account, pending: true }, false).then(res => res.json()).then(res => rawToNano(res.balance));
}