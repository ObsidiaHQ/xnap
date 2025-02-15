import { RequestErrors, SnapError } from '../errors';
import { AccountManager } from './account-manager';
import type { XnapButtonEventName, XnapFormEventName } from './constants';
import { XnapButtonEvents, XnapFormEvents } from './constants';
import {
  receivePage,
  refreshHomepage,
  selectAccount,
  settingsPage,
  sendConfirmation,
  sendFunds,
  sendPage,
  showKeys,
  showKeysConfirmation,
  signConfirmation,
  signMessage,
  selectRpc,
  selectBlockExplorer,
  receiveFundsConfirmation,
  handleReceiveFunds,
  handleSendXnoForm,
  handleSwitchAccountForm,
  handleSwitchRpcForm,
  handleSwitchExplorerForm,
  handleSettingsForm,
} from './handlers';
import { createJazzicon, isNanoIdentifier, isValidAddress, isValidAmount } from './utils';

export class XnapRPC {
  static async getCurrentAddress() {
    const address = (await AccountManager.getActiveAccount())?.address;
    if (!address) {
      throw SnapError.of(RequestErrors.ResourceNotFound);
    }
    const icon = await createJazzicon(address, 64);
    return { address, icon };
  }

  static async makeTransaction({ to, value }: { to: string; value: string }, origin: string) {
    if ((!isNanoIdentifier(to) && !isValidAddress(to)) || !isValidAmount(value)) {
      throw SnapError.of(RequestErrors.InvalidParams);
    }

    const confirmRes = await sendConfirmation({ to, value, origin });
    if (!confirmRes.confirmed) {
      throw SnapError.of(RequestErrors.UserRejectedRequest);
    }

    const hash = await sendFunds({
      from: confirmRes.from,
      to: confirmRes.to,
      value: confirmRes.value,
    });
    return { result: hash };
  }

  static async signMessage({ message }: { message: string }, origin: string) {
    if (!message || typeof message !== 'string') {
      throw SnapError.of(RequestErrors.InvalidParams);
    }

    const confirmed = await signConfirmation(message, origin);
    if (!confirmed) {
      throw SnapError.of(RequestErrors.UserRejectedRequest);
    }

    return { result: await signMessage(message) };
  }
}

// helper function for handling button events
export const handleButtonEvent = async (id: string, name?: XnapButtonEventName) => {
  if (!name) {
    return;
  }
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

// helper function for handling form events
export const handleFormEvent = async (id: string, name: XnapFormEventName, value: any) => {
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
