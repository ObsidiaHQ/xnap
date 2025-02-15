import { DialogType, NotificationType } from '@metamask/snaps-sdk';
import { Box, Button, Container, Copyable, Divider, Form, Heading, Section, Text } from '@metamask/snaps-sdk/jsx';
import { renderSVG } from 'uqr';
import { Tools } from 'libnemo';
import { Snap, TxConfirmation, RpcEndpoint, BlockExplorer } from './types';
import { SendPage, ShowKeys, ReceivePage, Insight, AccountSelector, RpcSelector, Homepage, ConfirmDialog, BlockExplorerSelector, SettingsPage, Address } from '../components';
import { AccountManager } from './account-manager';
import { BlockExplorers, RpcEndpoints, StoreKeys } from './constants';
import { StateManager } from './state-manager';
import { accountBalance, accountHistory, processReceiveBlocks, processSendBlock, resolveNanoIdentifier } from './nano-rpc';
import { getRandomBlockExplorer, isNanoIdentifier } from './utils';
import { RequestErrors, SnapError } from '../errors';

declare let snap: Snap;

export async function updatedHomepage() {
  const [accounts, active, blockExplorer] = await Promise.all([
    AccountManager.getAccounts(),
    AccountManager.getActiveAccount(),
    StateManager.getState(StoreKeys.DEFAULT_BLOCK_EXPLORER)
  ]);
  const [activeBalance, txs] = await Promise.all([
    accountBalance(active.address),
    accountHistory(active.address),
  ]);

  active.balance = activeBalance?.balance;
  active.receivable = activeBalance?.receivable;

  return <Homepage
    txs={txs}
    accounts={accounts}
    blockExplorer={blockExplorer!}
  />;
}

export async function refreshHomepage(id: string) {
  return snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: await updatedHomepage(),
    },
  });
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
          address={account.address}
          publicKey={account.publicKey}
          secretKey={account.privateKey || 'No private key'}
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
      ui: <SendPage accounts={await AccountManager.getAccounts()} />,
    },
  });
}

export async function sendConfirmation(tx: {
  to: string,
  value: string,
  from?: string,
  origin?: string
}): Promise<TxConfirmation> {
  const senderAddress = tx.from || (await AccountManager.getActiveAccount()).address;

  const recepient = isNanoIdentifier(tx.to)
    ? await resolveNanoIdentifier(tx.to)
    : { resolved: tx.to, identifier: null };

  const { balance } = await accountBalance(senderAddress);

  const dialogProps = {
    from: senderAddress,
    to: recepient.resolved,
    value: tx.value,
    origin: tx.origin || null,
    alias: recepient.identifier,
    balance
  };

  const confirmed: boolean = await snap.request({
    method: 'snap_dialog',
    params: {
      type: DialogType.Confirmation,
      content: <Insight {...dialogProps} />,
    },
  });

  return {
    from: senderAddress,
    to: recepient.resolved,
    value: tx.value,
    confirmed
  };
}

/**
 * ⚠️ This function must ONLY be called AFTER user confirmation! ⚠️
 */
export async function sendFunds(tx: { to: string, value: string, from: string }) {
  let from = await AccountManager.getAccountByAddress(tx.from);
  if (!from)
    throw new Error('Account not found');

  const hash = await processSendBlock(from, tx.to, tx.value);
  if (hash)
    await notifyUser(`Successfully sent ${tx.value} XNO.`);

  return hash;
}

export const handleSendXnoForm = async (formValue: { value: string, to: string, selectedAddress: string }) => {
  const { confirmed, from, to, value } = await sendConfirmation({
    value: formValue.value,
    to: formValue.to,
    from: formValue.selectedAddress
  });

  if (confirmed) {
    try {
      await sendFunds({ from, to, value });
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  }
};

export async function receivePage(id: string) {
  const account = await AccountManager.getActiveAccount();
  const qr = renderSVG(account.address);

  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: <ReceivePage qr={qr} address={account.address} />,
    },
  });
}

export async function settingsPage(id: string) {
  const [defaultRpc, blockExplorer, aliasSupport] = await Promise.all([
    StateManager.getState(StoreKeys.DEFAULT_RPC),
    StateManager.getState(StoreKeys.DEFAULT_BLOCK_EXPLORER),
    StateManager.getState(StoreKeys.ALIAS_SUPPORT)
  ]);

  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: <SettingsPage defaultRpc={defaultRpc?.name!} blockExplorer={blockExplorer!} aliasSupport={!!aliasSupport} />
    },
  });
}

export async function receiveFundsConfirmation(id: string) {
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
  const processed = await processReceiveBlocks();
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
        <RpcSelector options={RpcEndpoints} active={(await StateManager.getState(StoreKeys.DEFAULT_RPC))} />
      ),
    },
  });
}

export async function selectBlockExplorer(id: string) {
  await snap.request({
    method: "snap_updateInterface",
    params: {
      id,
      ui: (
        <BlockExplorerSelector explorers={BlockExplorers} active={(await StateManager.getState(StoreKeys.DEFAULT_BLOCK_EXPLORER))!} />
      ),
    },
  });
}

export async function signConfirmation(message: string, origin: string) {
  const active = await AccountManager.getActiveAccount();

  if (!active || !active.privateKey || !active.address)
    throw SnapError.of(RequestErrors.ResourceNotFound);

  const confirmed: boolean = await snap.request({
    method: 'snap_dialog',
    params: {
      type: DialogType.Confirmation,
      content: (
        <Box>
          {origin ? <Box><Text color='muted'>Origin: {origin}</Text><Divider /></Box> : null}

          <Heading size='md'>Signature request</Heading>

          <Section>
            <Address address={active.address} prefix="Signing account: "></Address>
          </Section>

          <Divider />

          <Text color='warning'>Only sign this message if you fully understand the content of it and trust the requesting site.</Text>
          <Text>Message:</Text>
          <Copyable value={message} />
        </Box>
      ),
    },
  });

  return confirmed;
}

/**
 * ⚠️ This function must ONLY be called AFTER user confirmation! ⚠️
 */
export async function signMessage(message: string) {
  const active = await AccountManager.getActiveAccount();

  if (!active || !active.privateKey || !active.address)
    throw SnapError.of(RequestErrors.ResourceNotFound);

  return await Tools.sign(active.privateKey, message);
}

export const handleReceiveFunds = async (id: string) => {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: <ConfirmDialog question='Do you want to receive the funds?' event='receive-funds' loading={true} />,
    },
  });

  receiveFunds().then(() => {
    refreshHomepage(id);
  }).catch(() => {
    throw new Error('Error receiving funds');
  }).finally(() => {
    refreshHomepage(id);
  });
};

export const handleSwitchAccountForm = async (value: { selectedAddress: string }, id: string) => {
  const account = (await AccountManager.getAccounts()).find(acc => acc.address === value.selectedAddress);
  if (!account)
    throw new Error('Selected account not found');

  await AccountManager.setActiveAccount(account);
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: await updatedHomepage(),
    },
  });
};

export const handleSwitchRpcForm = async (value: { api?: string, auth?: string, selectedRpc: string }, id: string) => {
  const { api, auth, selectedRpc } = value;
  const selected = RpcEndpoints.find(opt => opt.value === selectedRpc) as RpcEndpoint;

  if (!api)
    throw new Error('API is required');

  if (selectedRpc === 'custom') {
    selected.name = 'Custom';
    selected.value = 'custom';
    selected.api = api;
    selected.auth = auth || null;
  }

  await StateManager.setState(StoreKeys.DEFAULT_RPC, selected);
  await refreshHomepage(id);
};

export const handleSwitchExplorerForm = async (value: { selectedExplorer: string }, id: string) => {
  const explorer = BlockExplorers.find(opt => opt.name === value.selectedExplorer) as BlockExplorer;
  await StateManager.setState(StoreKeys.DEFAULT_BLOCK_EXPLORER, explorer);
  await refreshHomepage(id);
};

export const handleSettingsForm = async (value: { aliasSupport: boolean }, id: string) => {
  await StateManager.setState(StoreKeys.ALIAS_SUPPORT, value.aliasSupport);
  await refreshHomepage(id);
};

export async function notifyUser(message: string) {
  const [account, blockExplorer] = await Promise.all([
    AccountManager.getActiveAccount(),
    StateManager.getState(StoreKeys.DEFAULT_BLOCK_EXPLORER) || getRandomBlockExplorer()
  ]);

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
      footerLink: { text: 'View on explorer', href: `${blockExplorer?.endpoint}${account?.address}` },
    },
  });
}