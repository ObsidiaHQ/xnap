import {
  SnapComponent,
  Selector,
  SelectorOption,
  Card,
} from '@metamask/snaps-sdk/jsx';
import { createJazzicon, rawToNano, truncateAddress } from '../lib/utils';
import { Account } from '../lib/types';

export const AccountSelector: SnapComponent<{ accounts: Account[] }> = ({ accounts }) => {
  return (
    <Selector name="selectedAddress" title="Select an account">
      {accounts.map((account, index) => (
        <SelectorOption value={account.address!}>
          <Card
            image={createJazzicon(account.address!, 20)}
            title={(index + 1) + "." + (account.active ? ' ⭐' : '')}
            value={truncateAddress(account.address!)}
            extra={rawToNano(account.balance) + ' XNO'}
          />
        </SelectorOption>
      ))}
    </Selector>
  );
};