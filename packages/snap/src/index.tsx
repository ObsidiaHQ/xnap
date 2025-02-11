import {
  UserInputEventType,
  type OnHomePageHandler,
  type OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { SnapError, RequestErrors } from './errors';
import { RpcRequest } from './lib/interfaces';
import { AccountManager } from './lib/account-manager';
import { XnapButtonEventName, XnapButtonEvents, XnapFormEventName, XnapFormEvents } from './lib/constants';
import {
  signMessage,
  sendConfirmation,
  receiveFundsConfirmation,
  receivePage,
  updatedHomepage,
  selectAccount,
  selectRpc,
  sendFunds,
  sendPage,
  showKeys,
  showKeysConfirmation,
  selectBlockExplorer,
  settingsPage,
  refreshHomepage,
  handleReceiveFunds,
  handleSendXnoForm,
  handleSwitchAccountForm,
  handleSwitchRpcForm,
  handleSwitchExplorerForm,
  handleSettingsForm
} from './lib/handlers';
import { createJazzicon } from './lib/utils';

export const onRpcRequest = async ({ origin, request }: RpcRequest) => {
  await AccountManager.initialize();
  switch (request.method) {
    case 'xno_getCurrentAddress':
      const address = (await AccountManager.getActiveAccount())?.address || undefined;
      const icon = address ? await createJazzicon(address, 64) : undefined;
      return { address, icon };
    case 'xno_makeTransaction':
      const { confirmed, from, to, value } = await sendConfirmation({ ...request.params, origin });
      if (!confirmed) {
        return { result: null };
      }
      const hash = await sendFunds({ from, to, value, origin });
      return { result: hash };
    case 'xno_signMessage':
      const { message } = request.params;
      const signature = await signMessage(message, origin);
      return { result: signature };
    default:
      throw SnapError.of(RequestErrors.MethodNotSupport);
  }
};

export const onHomePage: OnHomePageHandler = async () => {
  await AccountManager.initialize();
  return { content: await updatedHomepage() };
};

export const onUserInput: OnUserInputHandler = async ({ event, id }) => {
  if (event.type === UserInputEventType.ButtonClickEvent) {
    await handleButtonEvent(id, event.name as XnapButtonEventName);
  } else if (event.type === UserInputEventType.FormSubmitEvent) {
    await handleFormEvent(id, event.name as XnapFormEventName, event.value);
  }
};

const handleButtonEvent = async (id: string, name?: XnapButtonEventName) => {
  if (!name) return;
  switch (name) {
    case XnapButtonEvents.ADD_ACCOUNT:
      await AccountManager.addAccount();
    // fall through
    case XnapButtonEvents.BACK:
    case XnapButtonEvents.REFRESH_TXS:
      await refreshHomepage(id);
      break;
    case XnapButtonEvents.SHOW_KEYS_CONFIRM:
      await showKeysConfirmation(id);
      break;
    case XnapButtonEvents.SHOW_KEYS:
      await showKeys(id);
      break;
    case XnapButtonEvents.SEND_PAGE:
      await sendPage(id);
      break;
    case XnapButtonEvents.RECEIVE_PAGE:
      await receivePage(id);
      break;
    case XnapButtonEvents.SETTINGS_PAGE:
      await settingsPage(id);
      break;
    case XnapButtonEvents.SWITCH_ACCOUNT:
      await selectAccount(id);
      break;
    case XnapButtonEvents.SWITCH_RPC:
      await selectRpc(id);
      break;
    case XnapButtonEvents.SWITCH_BLOCK_EXPLORER:
      await selectBlockExplorer(id);
      break;
    case XnapButtonEvents.RECEIVE_FUNDS_CONFIRM:
      await receiveFundsConfirmation(id);
      break;
    case XnapButtonEvents.RECEIVE_FUNDS:
      await handleReceiveFunds(id);
      break;
  }
};

const handleFormEvent = async (id: string, name: XnapFormEventName, value: any) => {
  switch (name) {
    case XnapFormEvents.SEND_XNO_FORM:
      await handleSendXnoForm(value);
      break;
    case XnapFormEvents.SWITCH_ACCOUNT_FORM:
      await handleSwitchAccountForm(value, id);
      break;
    case XnapFormEvents.SWITCH_RPC_FORM:
      await handleSwitchRpcForm(value, id);
      break;
    case XnapFormEvents.SWITCH_EXPLORER_FORM:
      await handleSwitchExplorerForm(value, id);
      break;
    case XnapFormEvents.SETTINGS_FORM:
      await handleSettingsForm(value, id);
      break;
  }
};