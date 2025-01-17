import { Snap, MetamaskXNORpcRequest } from './interface';
import { SnapError, RequestErrors } from './errors';
import {
  UserInputEventType,
  type OnHomePageHandler,
  type OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { Homepage, Transaction } from './components/';
import { confirmSend, receivePage, selectAccount, sendPage, showKeys, showKeysConfirmation } from './rpc/handlers';
import { AccountManager } from './rpc/account-manager';

declare let snap: Snap;
const txs: Transaction[] = [
  {
    value: "1.23",
    to: "nano_1d19hmdmcwadysdphqkksd43sy6jqd98fydpeq7e5su87rhkkmexxaojm9m3",
    from: "nano_1jhfpsng3xnu3wzm54euggckh9u9zawtdreixjcb79ckfnq7recagsdby1t3",
    type: "receive",
    date: "2024-04-11",
  },
  {
    value: "3.214",
    to: "nano_1iawmcfwmmdyr7xmnordt71gpnhnao8rsk4nywq5khtmedocaj6bafk4fb8h",
    from: "nano_1d19hmdmcwadysdphqkksd43sy6jqd98fydpeq7e5su87rhkkmexxaojm9m3",
    type: "send",
    date: "2025-01-11",
  },
  {
    value: "7.31",
    to: "nano_1udqw9crgb79ir5eknua1cy8gdjmdyf8pfhxzpgrj5e111h3d51w1ccyuoqe",
    from: "nano_1d19hmdmcwadysdphqkksd43sy6jqd98fydpeq7e5su87rhkkmexxaojm9m3",
    type: "send",
    date: "2025-01-13",
  },
  {
    value: "1.314",
    to: "nano_3po1yrun1qrproqtq699p748ymduwp856qsk64x4yftca7onp5t1t81mxeeu",
    from: "nano_1d19hmdmcwadysdphqkksd43sy6jqd98fydpeq7e5su87rhkkmexxaojm9m3",
    type: "send",
    date: "2025-01-12",
  }
];

export type RpcRequest = {
  origin: string;
  request: MetamaskXNORpcRequest;
};

export const onRpcRequest = async ({ origin, request }: RpcRequest) => {
  await AccountManager.initialize();

  switch (request.method) {
    case 'xno_getCurrentAddress':
      return { address: (await AccountManager.getActiveAccount())!.address };
    // case 'xno_getTransactions':
    //   return nano.getTransactions(origin);
    // case 'xno_getCurrentBalance':
    //   return nano.getBalance(origin, snap);
    case 'xno_makeTransaction':
      return { result: (await confirmSend({ ...request.params, origin })) };
    default:
      throw SnapError.of(RequestErrors.MethodNotSupport);
  }
};

export const onHomePage: OnHomePageHandler = async () => {
  await AccountManager.initialize();

  return {
    content: <Homepage txs={txs} accounts={await AccountManager.getAccounts()} active={(await AccountManager.getActiveAccount())!.address!}  />,
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
            ui: <Homepage txs={txs} accounts={await AccountManager.getAccounts()} active={(await AccountManager.getActiveAccount())!.address!}  />,
          },
        });
        break;
      case 'switch-account':
        await selectAccount(id);
        break;
      case 'back':
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <Homepage txs={txs} accounts={await AccountManager.getAccounts()} active={(await AccountManager.getActiveAccount())!.address!} />,
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
        await AccountManager.setActiveAccount(event.value.selectedAddress as string);
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <Homepage txs={txs} accounts={await AccountManager.getAccounts()} active={event.value.selectedAddress as string} />,
          },
        });
        break;
    }

  }
};
