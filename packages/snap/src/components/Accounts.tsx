import { Box, Button, Heading, Image, SnapComponent } from "@metamask/snaps-sdk/jsx";
import { Address } from "./Address";
import { Account } from "libnemo";
import addIcon from "../../images/add.svg";

type Accounts = {
    accounts: Pick<Account, 'address'>[]
}

export const Accounts: SnapComponent<Accounts> = ({ accounts }) => {
  return (
    <Box>
      <Box direction="horizontal" alignment="space-between">
        <Box direction="horizontal">
          <Heading>Accounts</Heading>
          <Button name="switch-account">
            switch
          </Button>
        </Box>
        <Button name="add-account">
          <Image src={addIcon} alt='Add account' />
        </Button>
      </Box>
      {accounts.map((account) => (
        <Address address={account.address}></Address>
      ))}
    </Box>
  );
};