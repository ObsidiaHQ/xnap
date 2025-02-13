import { Box, Button, Heading, Image, SnapComponent } from "@metamask/snaps-sdk/jsx";
import { Address } from "./";
import { Account } from "../lib/types";
import { AddIcon } from "../../images/icons";
import { XnapButtonEvents } from "../lib/constants";

export const Accounts: SnapComponent<{ accounts: Account[] }> = ({ accounts }) => {
  return (
    <Box>
      <Box direction="horizontal" alignment="space-between">
        <Box direction="horizontal">
          <Heading>Accounts</Heading>
          <Button name={XnapButtonEvents.SWITCH_ACCOUNT}>
            switch
          </Button>
        </Box>
        <Button name={XnapButtonEvents.ADD_ACCOUNT}>
          <Image src={AddIcon} alt='Add account' />
        </Button>
      </Box>
      {accounts.map((account) => (
        <Address address={account.address}></Address>
      ))}
    </Box>
  );
};