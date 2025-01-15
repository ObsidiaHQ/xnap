
import { Snap } from '../interface';
import { Tools, Account } from 'libnemo'
import { BIP44Node, SLIP10Node } from '@metamask/key-tree';
import { remove0x } from '@metamask/utils';
import { Heading, Button, Box, Text, Copyable } from '@metamask/snaps-sdk/jsx';
import { StateManager } from '../state-manager';

declare let snap: Snap;

export async function getAccount(): Promise<Account> {
  let nanoNode = await StateManager.getState('nanoNode') as BIP44Node;
  
  if (!nanoNode) {
    nanoNode = (await snap.request({
      method: 'snap_getBip32Entropy',
      params: {
        path: ["m", "44'", "165'"],
        curve: "ed25519",
      },
    })) as BIP44Node; 
    await StateManager.setState("nanoNode", nanoNode);
  }

  const index = 0;
  const nanoSlip10Node = await SLIP10Node.fromJSON(nanoNode);
  const accountKey = await nanoSlip10Node.derive([`slip10:${index}'`]);
  const privKey = remove0x(accountKey.toJSON().privateKey);

  const account = await Account.fromPrivateKey(privKey);

  return account;
}

export async function getAddress(): Promise<string> {
  const account = await getAccount();

  if (!account?.address) {
    throw new Error('Address not found');
  }

  return account.address;
};

export async function getTransactions(
  snap: Snap,
): Promise<any[]> {
  const address = await getAddress();
  const res = await fetch('https://rpc.nano.to', {
    method: 'POST',
    body: JSON.stringify({
      action: 'account_history',
      account: address,
      count: '30',
    }),
  });
  return (res.json() as any).history;
}

export async function getBalance(origin: string, snap: Snap): Promise<bigint> {
  const account = await getAccount();
  return account.balance;
}

export async function makeTransaction(snap: Snap, params: any): Promise<number> { 
  const amount = await snap.request({
    method: "snap_dialog",
    params: {
      type: "prompt",
      content: (
        <Box>
          <Heading>Send nano to this address: {params.to}</Heading>
          <Form name="send-form">
            <Field label="Amount">
              <Input type='number' name="amount" value="5" />
            </Field>
            <Button type="submit">Submit</Button>
          </Form>
        </Box>
      ),
    },
  });
  return amount as number;
}