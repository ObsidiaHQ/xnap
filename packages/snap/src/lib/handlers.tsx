import { Snap, InsightProps } from './interfaces';
import { SendPage, ShowKeysConfirmation, ShowKeys, ReceivePage, Insight, AccountSelector, RpcSelector } from '../components';
import { renderSVG } from 'uqr';
import { DialogType } from '@metamask/snaps-sdk';
import { AccountManager } from './account-manager';
import { Box, Button, Container, Divider, Footer, Form, Heading } from '@metamask/snaps-sdk/jsx';
import { ServerOptions } from './constants';
import { StateManager, STORE_KEYS } from './state-manager';

declare let snap: Snap;

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

  const result: boolean = await snap.request({
    method: 'snap_dialog',
    params: {
      type: DialogType.Confirmation,
      content: <Insight from={tx.from || from!.address!} to={tx.to} value={tx.value} origin={tx.origin} />,
    },
  });
  return result;
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
              <AccountSelector accounts={await AccountManager.getAccounts() as any} active={(await AccountManager.getActiveAccount())!.address!} />
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
        <RpcSelector options={ServerOptions} active={(await StateManager.getState(STORE_KEYS.DEFAULT_RPC))} />
      ),
    },
  });
}