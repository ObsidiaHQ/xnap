import {
  SnapComponent,
  Selector,
  SelectorOption,
  Card,
} from '@metamask/snaps-sdk/jsx';
import { createJazzicon, truncateAddress } from '../lib/utils';
import { Account } from '../lib/interfaces';

export const AccountSelector: SnapComponent<{ accounts: Account[], active: string }> = ({ accounts, active }) => {
  return (
    <Selector name="selectedAddress" title="Select an account">
      {accounts.map((account, index) => (
        <SelectorOption value={account.address!}>
          <Card
            image={createJazzicon(account.address!, 20)}
            title={(index + 1) + "." + (account.address === active ? ' ⭐' : '')}
            value={truncateAddress(account.address!)}
            extra={(account.balance || '0') + ' XNO'}
          />
        </SelectorOption>
      ))}
    </Selector>
  );
};