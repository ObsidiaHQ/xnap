import { Box, Button, Heading, Image, SnapComponent } from "@metamask/snaps-sdk/jsx";
import { Address } from "./";
import { Account } from "../lib/types";
import { AddIcon } from "../../images/icons";

export const Accounts: SnapComponent<{ accounts: Account[] }> = ({ accounts }) => {
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
          <Image src={AddIcon} alt='Add account' />
        </Button>
      </Box>
      {accounts.map((account) => (
        <Address address={account.address}></Address>
      ))}
    </Box>
  );
};