import { Snap, MetamaskXNORpcRequest, RpcEndpoint } from './lib/interfaces';
import { SnapError, RequestErrors } from './errors';
import {
  UserInputEventType,
  type OnHomePageHandler,
  type OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { Homepage } from './components/';
import { confirmReceive, confirmSend, receivePage, selectAccount, selectRpc, sendPage, showKeys, showKeysConfirmation } from './lib/handlers';
import { AccountManager } from './lib/account-manager';
import { StateManager, STORE_KEYS } from './lib/state-manager';
import { RpcEndpoints } from './lib/constants';
import { accountHistory, accountInfo } from './lib/rpc';

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
      return { result: (await confirmSend({ ...request.params, origin })) };
    default:
      throw SnapError.of(RequestErrors.MethodNotSupport);
  }
};

export const onHomePage: OnHomePageHandler = async () => {
  await AccountManager.initialize();
  const [accounts, active, defaultRpc] = await Promise.all([
    AccountManager.getAccounts(),
    AccountManager.getActiveAccount(),
    StateManager.getState(STORE_KEYS.DEFAULT_RPC)
  ]);
  const [activeInfo, txs] = await Promise.all([
    accountInfo(active?.address),
    accountHistory(active?.address)
  ]);
  
  active!.balance = activeInfo.confirmed_balance;
  active!.receivable = activeInfo.confirmed_receivable;
  
  return {
    content: <Homepage 
      txs={txs} 
      accounts={accounts} 
      defaultRpc={defaultRpc?.name!} 
    />,
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
      case 'add-account':
        await AccountManager.addAccount();
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <Homepage txs={await accountHistory()} accounts={await AccountManager.getAccounts()} defaultRpc={(await StateManager.getState(STORE_KEYS.DEFAULT_RPC))?.name!} />,
          },
        });
        break;
      case 'switch-account':
        await selectAccount(id);
        break;
      case 'switch-rpc':
        await selectRpc(id);
        break;
      case 'receive-funds':
          await confirmReceive();
          break;
      case 'back':
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <Homepage txs={await accountHistory()} accounts={await AccountManager.getAccounts()} defaultRpc={(await StateManager.getState(STORE_KEYS.DEFAULT_RPC))?.name!} />,
          },
        });
        break;
    }
  }
  if (event.type === UserInputEventType.FormSubmitEvent) {
    switch (event.name) {
      case 'send-xno-form':
        const { value, to, selectedAddress } = event.value as { value: string, to: string, selectedAddress: string };
        await confirmSend({ value, to, from: selectedAddress, origin: null });
        break;
      case 'switch-account-form':
        const account = (await AccountManager.getAccounts()).find(acc => acc.address === event.value.selectedAddress);
        await AccountManager.setActiveAccount(account!);
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <Homepage txs={await accountHistory()} accounts={await AccountManager.getAccounts()} defaultRpc={(await StateManager.getState(STORE_KEYS.DEFAULT_RPC))?.name!} />,
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
            ui: <Homepage txs={await accountHistory()} accounts={await AccountManager.getAccounts()} defaultRpc={(await StateManager.getState(STORE_KEYS.DEFAULT_RPC))?.name!} />,
          },
        });
        break;
    }

  }
};
