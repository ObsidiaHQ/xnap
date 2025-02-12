import { Box, Button, Card, Heading, Image, Section, SnapComponent, Text } from "@metamask/snaps-sdk/jsx";
import { createJazzicon, rawToNano, truncateAddress } from "../lib/utils";
import { RefreshIcon } from "../../images/icons";
import { RpcAccountHistory } from "../lib/types";

export const Transactions: SnapComponent<{ txs: RpcAccountHistory[] }> = ({ txs }) => {
  return (
    <Box>
      <Box direction="horizontal" alignment="space-between">
        <Heading>Activity</Heading>
        <Button name="refresh-txs">
          <Image src={RefreshIcon} alt='refresh' />
        </Button>
      </Box>
      {txs?.length ? txs.map((tx) => {
        return (
          <Section>
            <Card
              image={createJazzicon(tx.account, 20)}
              title={truncateAddress(tx.account)}
              description={tx.local_timestamp}
              value={rawToNano(tx.amount)}
              extra={tx.type}
            />
          </Section>
        )
      }) : <Text color="muted" alignment="center">No transactions found.</Text>}
    </Box>
  );
};