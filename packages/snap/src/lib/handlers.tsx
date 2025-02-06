import { DialogType, NotificationType } from '@metamask/snaps-sdk';
import { Box, Button, Container, Divider, Form, Heading, Text } from '@metamask/snaps-sdk/jsx';
import { renderSVG } from 'uqr';
import { Snap, InsightProps, TxConfirmation } from './interfaces';
import { SendPage, ShowKeys, ReceivePage, Insight, AccountSelector, RpcSelector, Homepage, ConfirmDialog } from '../components';
import { AccountManager } from './account-manager';
import { RpcEndpoints } from './constants';
import { StateManager, STORE_KEYS } from './state-manager';
import { accountBalance, accountHistory, accountInfo, generateReceiveBlock, generateSendBlock, receivables } from './rpc';

declare let snap: Snap;

export async function refreshHomepage() {
  const [accounts, active, defaultRpc] = await Promise.all([
    AccountManager.getAccounts(),
    AccountManager.getActiveAccount(),
    StateManager.getState(STORE_KEYS.DEFAULT_RPC)
  ]);
  const [activeInfo, txs, receivableBlocks] = await Promise.all([
    accountInfo(active?.address!),
    accountHistory(active?.address),
    receivables(active?.address)
  ]);

  active!.balance = activeInfo?.confirmed_balance!;
  active!.receivable = Object.values(receivableBlocks).reduce((acc, block) => acc + BigInt(block.amount), BigInt(0)).toString();

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
      ui: <ConfirmDialog question='Are you sure you want to reveal your account credentials?' event='show-keys' />,
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
      ui: <SendPage accounts={await AccountManager.getAccounts() as any} active={(await AccountManager.getActiveAccount())!.address!} />,
    },
  });
}

export async function sendConfirmation(tx: InsightProps): Promise<TxConfirmation> {
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

  return { from: props.from, to: props.to, value: props.value, confirmed };
}

/**
 * ⚠️ This function must ONLY be called AFTER user confirmation! ⚠️
 */
export async function sendFunds(tx: InsightProps) {
  let from = await AccountManager.getAccountByAddress(tx.from);
  if (!from) {
    from = await AccountManager.getActiveAccount();
  }
  const hash = await generateSendBlock(from!, tx.to, tx.value);
  if (hash) {
    await notifyUser(`Successfully sent ${tx.value} XNO.`);
  }
  return hash;
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

export async function receiveConfirmation(id: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: <ConfirmDialog question='Do you want to receive the funds?' event='receive-funds' />,
    },
  });
}

/**
 * ⚠️ This function must ONLY be called AFTER user confirmation! ⚠️
 */
export async function receiveFunds() {
  const processed = await generateReceiveBlock();
  if (processed) {
    await notifyUser(`Successfully received ${processed} transaction(s).`);
  }
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

export async function notifyUser(message: string) {
  const account = await AccountManager.getActiveAccount();
  await snap.request({
    method: 'snap_notify',
    params: {
      type: NotificationType.Native,
      message,
    },
  });

  await snap.request({
    method: 'snap_notify',
    params: {
      type: NotificationType.InApp,
      message,
      title: 'Confirmation',
      content: (
        <Box>
          <Text color='success'>{message}</Text>
        </Box>
      ),
      footerLink: { text: 'View on explorer', href: `https://blocklattice.io/account/${account?.address}` },
    },
  });
}