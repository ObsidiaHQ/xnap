import {
  UserInputEventType,
  type OnHomePageHandler,
  type OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { Snap, MetamaskXNORpcRequest, RpcEndpoint } from './lib/interfaces';
import { SnapError, RequestErrors } from './errors';
import { sendConfirmation, receiveConfirmation, receiveFunds, receivePage, refreshHomepage, selectAccount, selectRpc, sendFunds, sendPage, showKeys, showKeysConfirmation } from './lib/handlers';
import { AccountManager } from './lib/account-manager';
import { StateManager, STORE_KEYS } from './lib/state-manager';
import { RpcEndpoints } from './lib/constants';
import { ConfirmDialog } from './components';

declare let snap: Snap;

export type RpcRequest = {
  origin: string;
  request: MetamaskXNORpcRequest;
};

export const onRpcRequest = async ({ origin, request }: RpcRequest) => {
  await AccountManager.initialize();
  switch (request.method) {
    case 'xno_getCurrentAddress':
      const address = (await AccountManager.getActiveAccount())?.address;
      return { address };
    case 'xno_makeTransaction':
      const { confirmed, from, to, value } = await sendConfirmation({ ...request.params, origin });
      if (confirmed) {
        const hash = await sendFunds({ from, to, value, origin });
        return { result: hash };
      }
      return { result: null };
    default:
      throw SnapError.of(RequestErrors.MethodNotSupport);
  }
};

export const onHomePage: OnHomePageHandler = async () => {
  await AccountManager.initialize();

  return {
    content: await refreshHomepage(),
  };
};

/**
 * Handle incoming user events coming from the Snap interface.
 *
 * @param params - The event parameters.
 * @param params.id - The Snap interface ID where the event was fired.
 * @param params.event - The event object containing the event type, name and value.
 */
export const onUserInput: OnUserInputHandler = async ({ event, id, context }) => {
  if (event.type === UserInputEventType.ButtonClickEvent) {
    switch (event.name) {
      case 'add-account':
        await AccountManager.addAccount();
      case 'back':
      case 'refresh-txs':
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: await refreshHomepage(),
          },
        });
        break;
      case 'show-keys-warning':
        await showKeysConfirmation(id);
        break;
      case 'show-keys':
        await showKeys(id);
        break;
      case 'send-page':
        await sendPage(id);
        break;
      case 'receive-page':
        await receivePage(id);
        break;
      case 'switch-account':
        await selectAccount(id);
        break;
      case 'switch-rpc':
        await selectRpc(id);
        break;
      case 'receive-funds-confirm':
        await receiveConfirmation(id);
        break;
      case 'receive-funds':
        // First show loading dialog
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <ConfirmDialog question='Do you want to receive the funds?' event='receive-funds' loading={true} />,
          },
        });

        try {
          // Wait for receiveFunds to complete
          await receiveFunds();
          // Then refresh the homepage
          await snap.request({
            method: 'snap_updateInterface',
            params: {
              id,
              ui: await refreshHomepage(),
            },
          });
        } catch (error) {
          // Optionally handle errors by showing an error dialog
          console.error('Error receiving funds:', error);
          await snap.request({
            method: 'snap_updateInterface',
            params: {
              id,
              ui: await refreshHomepage(),
            },
          });
        }
        break;
    }
  }
  if (event.type === UserInputEventType.FormSubmitEvent) {
    switch (event.name) {
      case 'send-xno-form':
        const formValue = event.value as { value: string, to: string, selectedAddress: string };
        const { confirmed, from, to, value } = await sendConfirmation({
          value: formValue.value,
          to: formValue.to,
          from: formValue.selectedAddress,
          origin: null
        });

        if (confirmed) {
          try {
            await sendFunds({ from, to, value, origin: null });
          } catch (error) {
            console.error('Error sending transaction:', error);
          }
        }
        break;
      case 'switch-account-form':
        const account = (await AccountManager.getAccounts()).find(acc => acc.address === event.value.selectedAddress);
        await AccountManager.setActiveAccount(account!);
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: await refreshHomepage(),
          },
        });
        break;
      case 'switch-rpc-form':
        const { api, auth, selectedRpc } = event.value as { api?: string, auth?: string, selectedRpc: string };
        const selected = RpcEndpoints.find(opt => opt.value === selectedRpc) || {} as RpcEndpoint;

        if (selectedRpc === 'custom') {
          selected.name = 'Custom';
          selected.value = selectedRpc;
          selected.api = api || 'Not set';
          selected.auth = auth!;
        }

        await StateManager.setState(STORE_KEYS.DEFAULT_RPC, selected);
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: await refreshHomepage(),
          },
        });
        break;
    }

  }
};
