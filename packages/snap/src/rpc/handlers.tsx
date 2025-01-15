import { getAccount, getAddress } from './nano';
import { Snap, InsightProps } from '../interface';
import { SendPage, ShowKeysConfirmation, ShowKeys, ReceivePage, Insight } from '../components';
import { renderSVG } from 'uqr';
import { DialogType } from '@metamask/snaps-sdk';

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
  const account = await getAccount();

  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: (
        <ShowKeys
          address={account.address?.toString()}
          publicKey={account.publicKey?.toString()}
          secretKey={account.privateKey?.toString() || ''}
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
      ui: <SendPage />,
    },
  });
}

export async function confirmSend(tx: InsightProps) {
  const from = await getAddress();

  const result: boolean = await snap.request({
    method: 'snap_dialog',
    params: {
      type: DialogType.Confirmation,
      content: <Insight from={tx.from || from} to={tx.to} value={tx.value} origin={tx.origin} />,
    },
  });
  return result;
}

export async function receivePage() {
  const address = await getAddress();
  const qr = renderSVG(address);

  await snap.request({
    method: 'snap_dialog',
    params: {
      type: DialogType.Alert,
      content: <ReceivePage qr={qr} address={address} />,
    },
  });
}