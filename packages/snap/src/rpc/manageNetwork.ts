// import { BitcoinNetwork, Snap } from '../interface';
// import { RequestErrors, SnapError } from "../errors";
// import { heading, panel, text } from "@metamask/snaps-ui";
// import { StateManager } from '../state-manager';

// export async function manageNetwork(origin: string, snap: Snap, action: 'get' | 'set', target?: BitcoinNetwork): Promise<string | void> {
//   switch (action) {
//     case 'get':
//       return StateManager.getState("network");
//     case 'set':
//       const result = await snap.request({
//         method: 'snap_dialog',
//         params: {
//           type: 'confirmation',
//           content: panel([
//             heading('Switch your network'),
//             text(`Do you want to allow ${origin} to switch Bitcoin network to ${target}?`),
//           ]),
//         },
//       });
//       if (result) {
//         await StateManager.setState("network", target)
//         return target;
//       } else {
//         return "";
//       }
//     default:
//       throw SnapError.of(RequestErrors.ActionNotSupport);
//   }
// }
