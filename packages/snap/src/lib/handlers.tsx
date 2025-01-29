import { Snap, InsightProps } from './interfaces';
import { SendPage, ShowKeysConfirmation, ShowKeys, ReceivePage, Insight, AccountSelector, RpcSelector, Address, Homepage } from '../components';
import { renderSVG } from 'uqr';
import { DialogType, NotificationType } from '@metamask/snaps-sdk';
import { AccountManager } from './account-manager';
import { Box, Button, Container, Divider, Form, Heading, Row, Text } from '@metamask/snaps-sdk/jsx';
import { RpcEndpoints } from './constants';
import { StateManager, STORE_KEYS } from './state-manager';
import { accountBalance, accountHistory, accountInfo, generateReceive, generateSend } from './rpc';

declare let snap: Snap;

export async function refreshHomepage() {
  const [accounts, active, defaultRpc] = await Promise.all([
    AccountManager.getAccounts(),
    AccountManager.getActiveAccount(),
    StateManager.getState(STORE_KEYS.DEFAULT_RPC)
  ]);
  const [activeInfo, txs] = await Promise.all([
    accountInfo(active?.address!),
    accountHistory(active?.address)
  ]);
  
  active!.balance = activeInfo?.confirmed_balance!;
  active!.receivable = activeInfo?.confirmed_receivable!;
  
  return <Homepage 
    txs={txs} 
    accounts={accounts} 
    defaultRpc={defaultRpc?.name!} 
  />;
}

export async function showKeysConfirmation(id: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: <ShowKeysConfirmation />,
    },
  });
}

export async function showKeys(id: string) {
  const account = await AccountManager.getActiveAccount();

  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: (
        <ShowKeys
          address={account!.address!.toString()}
          publicKey={account!.publicKey!.toString()}
          secretKey={account!.privateKey!.toString()}
        />
      ),
    },
  });
}

export async function sendPage(id: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: <SendPage accounts={await AccountManager.getAccounts() as any} active={(await AccountManager.getActiveAccount())!.address!}  />,
    },
  });
}

export async function confirmSend(tx: InsightProps) {
  const from = await AccountManager.getActiveAccount();

  const props = {
    ...tx,
    from: tx.from || from?.address!,
    balance: (await accountBalance(tx.from || from?.address))!
  }

  const confirmed: boolean = await snap.request({
    method: 'snap_dialog',
    params: {
      type: DialogType.Confirmation,
      content: <Insight {...props} />,
    },
  });

  if (confirmed) {
    const hash = await generateSend(from!, props.to, props.value);
    if (hash) {
      await notifyUser(hash, props.value, props.to);
    }
  }

  return confirmed;
}

export async function confirmReceive() {
  // const from = await AccountManager.getActiveAccount();

  // const props = {
  //   ...tx,
  //   from: tx.from || from?.address!,
  //   balance: await accountBalance(tx.from || from?.address)
  // }

  // TODO: make interface
  const confirmed: boolean = await snap.request({
    method: 'snap_dialog',
    params: {
      type: DialogType.Confirmation,
      content: <Text>Do you want to receive the funds?</Text>,
    },
  });

  // if (confirmed) {
  //   const hash = await generateReceive();
  //   if (hash) {
  //     await notifyUser(hash, props.value, props.to);
  //   }
  // }

  return confirmed;
}

export async function receivePage(id: string) {
  const account = await AccountManager.getActiveAccount();
  const qr = renderSVG(account!.address!);

  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: <ReceivePage qr={qr} address={account!.address!} />,
    },
  });
}

export async function selectAccount(id: string) {
  await snap.request({
    method: "snap_updateInterface",
    params: {
      id,
      ui: (
        <Container>
          <Box>
            <Heading>Select an account</Heading>
            <Form name="switch-account-form">
              <AccountSelector accounts={await AccountManager.getAccounts() as any} />
              <Divider />
              <Box alignment="space-around" direction="horizontal">
                <Button name="back">Back</Button>
                <Button type="submit" name="submit">
                  Select
                </Button>
              </Box>
            </Form>
          </Box>
        </Container>
      ),
    },
  });
}

export async function selectRpc(id: string) {
  await snap.request({
    method: "snap_updateInterface",
    params: {
      id,
      ui: (
        <RpcSelector options={RpcEndpoints} active={(await StateManager.getState(STORE_KEYS.DEFAULT_RPC))} />
      ),
    },
  });
}

export async function notifyUser(hash: string, amount: string, to: string) {
  await snap.request({
    method: 'snap_notify',
    params: {
      type: NotificationType.Native,
      message: `Successfully sent ${amount}.`,
    },
  });

  await snap.request({
    method: 'snap_notify',
    params: {
      type: NotificationType.InApp,
      message: `Successfully sent ${amount}.`,
      title: 'Hello World!',
      content: (
        <Box>
          <Row
            label="From"
            variant="warning"
            tooltip="This address has been deemed dangerous."
          >
            <Address address={to} />
          </Row>
        </Box>
      ),
      footerLink: { text: 'View on explorer', href: `https://blocklattice.io/block/${hash}` },
    },
  });
}