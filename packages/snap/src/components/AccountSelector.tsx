import {
  SnapComponent,
  Selector,
  SelectorOption,
  Card,
} from '@metamask/snaps-sdk/jsx';
import { createJazzicon, rawToNano, truncateAddress } from '../lib/utils';
import { Account } from '../lib/types';

export const AccountSelector: SnapComponent<{ accounts: Account[] }> = ({ accounts }) => {
  const orderedAccounts = [...accounts].sort(
    (a, b) => Number(Boolean(b.active)) - Number(Boolean(a.active)),
  );

  return (
    <Selector name="selectedAddress" title="Select an account">
      {orderedAccounts.map((account, index) => (
        <SelectorOption value={account.address} key={account.address}>
          <Card
            image={createJazzicon(account.address, 20)}
            title={(index + 1) + "." + (account.active ? ' ⭐' : '')}
            value={truncateAddress(account.address)}
            extra={rawToNano(account.balance) + ' XNO'}
          />
        </SelectorOption>
      ))}
    </Selector>
  );
};