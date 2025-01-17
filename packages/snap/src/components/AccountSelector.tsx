import {
  SnapComponent,
  Selector,
  SelectorOption,
  Card,
} from '@metamask/snaps-sdk/jsx';
import { createJazzicon, truncateAddress } from '../utils';
import { Account } from 'libnemo';

type Accounts = {
    accounts: Pick<Account, 'address'>[],
    active: string;
}

export const AccountSelector: SnapComponent<Accounts> = ({ accounts, active }) => {
  return (
    <Selector name="selectedAddress" title="Select an account">
      {accounts.map((account, index) => (
        <SelectorOption value={account.address!}>
          <Card
            image={createJazzicon(account.address!, 20)}
            title={(index + 1) + "." + (account.address === active ? ' ⭐' : '')}
            value={truncateAddress(account.address!)}
          />
        </SelectorOption>
      ))}
    </Selector>
  );
};