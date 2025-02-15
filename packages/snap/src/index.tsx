import {
  UserInputEventType,
  type OnHomePageHandler,
  type OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { SnapError, RequestErrors } from './errors';
import { RpcRequest } from './lib/types';
import { AccountManager } from './lib/account-manager';
import { XnapButtonEventName, XnapFormEventName } from './lib/constants';
import { handleButtonEvent, handleFormEvent, XnapRPC } from './lib/xnap-rpc';
import { updatedHomepage } from './lib/handlers';

export const onRpcRequest = async ({ origin, request }: RpcRequest) => {
  await AccountManager.initialize();
  switch (request.method) {
    case 'xno_getCurrentAddress':
      return XnapRPC.getCurrentAddress();
    case 'xno_makeTransaction':
      return XnapRPC.makeTransaction(request.params, origin);
    case 'xno_signMessage':
      return XnapRPC.signMessage(request.params, origin);
    default:
      throw SnapError.of(RequestErrors.MethodNotFound);
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