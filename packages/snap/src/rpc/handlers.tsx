import { Snap, InsightProps } from '../interface';
import { SendPage, ShowKeysConfirmation, ShowKeys, ReceivePage, Insight, AccountSelector } from '../components';
import { renderSVG } from 'uqr';
import { DialogType } from '@metamask/snaps-sdk';
import { AccountManager } from './account-manager';
import { Box, Heading } from '@metamask/snaps-sdk/jsx';

declare let snap: Snap;

export async function showKeysConfirmation() {
  await snap.request({
    method: 'snap_dialog',
    params: {
      content: <ShowKeysConfirmation />,
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
      ui: <SendPage accounts={await AccountManager.getAccounts() as any} />,
    },
  });
}

export async function confirmSend(tx: InsightProps) {
  const from = await AccountManager.getActiveAccount();

  console.log("from", from)

  const result: boolean = await snap.request({
    method: 'snap_dialog',
    params: {
      type: DialogType.Confirmation,
      content: <Insight from={tx.from || from!.address!} to={tx.to} value={tx.value} origin={tx.origin} />,
    },
  });
  return result;
}

export async function receivePage() {
  const account = await AccountManager.getActiveAccount();
  const qr = renderSVG(account!.address!);

  await snap.request({
    method: 'snap_dialog',
    params: {
      type: DialogType.Alert,
      content: <ReceivePage qr={qr} address={account!.address!} />,
    },
  });
}

export async function selectAccount() {
  const interfaceId = await snap.request({
    method: "snap_createInterface",
    params: {
      ui: (
        <Box>
          <Heading>Select an account</Heading>
          <AccountSelector accounts={await AccountManager.getAccounts() as any} />
        </Box>
      ),
    },
  });
  
  await snap.request({
    method: 'snap_dialog',
    params: {
      id: interfaceId,
    },
  });
}