import {
  SnapComponent,
  Selector,
  SelectorOption,
  Card,
} from '@metamask/snaps-sdk/jsx';
import { createJazzicon, truncateAddress } from '../utils';
import { Account } from 'libnemo';

type Accounts = {
    accounts: Pick<Account, 'address'>[]
}

export const AccountSelector: SnapComponent<Accounts> = ({ accounts }) => {
  return (
    <Selector name="account-selected" title="Select an account">
      {accounts.map((account) => (
        <SelectorOption value={account.address!}>
          <Card
            image={createJazzicon(account.address!, 20)}
            title={""}
            value={truncateAddress(account.address!)}
          />
        </SelectorOption>
      ))}
    </Selector>
  );
};