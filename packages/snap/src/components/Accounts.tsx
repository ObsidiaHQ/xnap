import { Box, Heading, SnapComponent } from "@metamask/snaps-sdk/jsx";
import { Address } from "./Address";

type Accounts = {
    accounts: {
        name: string;
        address: string;
    }[]
}

export const Accounts: SnapComponent<Accounts> = ({ accounts }) => {
  return (
    <Box>
      <Heading>Accounts</Heading>
      {accounts.map((account) => (
        <Address address={account.address}></Address>
      ))}
    </Box>
  );
};