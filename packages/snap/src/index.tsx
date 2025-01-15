import { Snap, MetamaskXNORpcRequest } from './interface';
import { nano } from './rpc';
import { SnapError, RequestErrors } from './errors';
import {
  UserInputEventType,
  type OnHomePageHandler,
  type OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { Homepage, Transaction } from './components/';
import { confirmSend, receivePage, sendPage, showKeys, showKeysConfirmation } from './rpc/handlers';
import { getAddress } from './rpc/nano';

declare let snap: Snap;

export type RpcRequest = {
  origin: string;
  request: MetamaskXNORpcRequest;
};

export const onRpcRequest = async ({ origin, request }: RpcRequest) => {
  switch (request.method) {
    case 'xno_getCurrentAddress':
      return { address: (await nano.getAddress()) };
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
  const accounts = [
    {
      name: "Account 1",
      address: "nano_1d19hmdmcwadysdphqkksd43sy6jqd98fydpeq7e5su87rhkkmexxaojm9m3"
    },
    {
      name: "Account 2",
      address: "nano_38a7gdnswrx3ep9pb9j1at5cnwx56dpiu7h5sr4hkaawoi4dr1pqbb8ozdwt"
    }
  ];
  let txs: Transaction[] = [
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

  return {
    content: <Homepage txs={txs} accounts={accounts} />,
  };
};

/**
 * Handle incoming user events coming from the Snap interface.
 *
 * @param params - The event parameters.
 * @param params.id - The Snap interface ID where the event was fired.
 * @param params.event - The event object containing the event type, name and
 * value.
 * @see https://docs.metamask.io/snaps/reference/exports/#onuserinput
 */
export const onUserInput: OnUserInputHandler = async ({ event, id, context }) => {
  if (event.type === UserInputEventType.ButtonClickEvent) {
    switch (event.name) {
      case 'show-keys-warning':
        await showKeysConfirmation();
        break;
      case 'show-keys':
        await showKeys(id);
        break;
      case 'send-page':
        await sendPage(id);
        break;
      case 'receive-page':
        await receivePage();
        break;
    }
  }
  if (event.type === UserInputEventType.FormSubmitEvent && event.name === 'send-xno-form') {
    const { value, to } = event.value as { value: string, to: string };
    const from = await getAddress();

    await confirmSend({ value, to, from, origin: null });
  }
};
