import { Box, Button, Card, Heading, Image, Section, SnapComponent } from "@metamask/snaps-sdk/jsx";
import { createJazzicon, formatRelativeDate, truncateAddress } from "../utils";
import refreshIcon from "../../images/refresh.svg";

type Transactions = {
  txs: Transaction[]
}

export type Transaction = {
  to: string;
  from: string;
  type: 'send' | 'receive' | 'other';
  value: string;
  date: string;
  natricon?: string;
}

export const Transactions: SnapComponent<Transactions> = ({ txs }) => {
  return (
    <Box>
      <Box direction="horizontal" alignment="space-between">
        <Heading>Activity</Heading>
        <Button name="refresh-txs">
          <Image src={refreshIcon} alt='refresh' />
        </Button>
      </Box>
      {txs.map((tx) => {
        return (
          <Section>
            <Card
              image={createJazzicon(tx.type === 'receive' ? tx.from : tx.to, 20)}
              title={tx.type === 'receive' ? truncateAddress(tx.from) : truncateAddress(tx.to)}
              description={formatRelativeDate(tx.date)}
              value={tx.value}
              extra={tx.type}
            />
          </Section>
        )
      })}
    </Box>
  );
};