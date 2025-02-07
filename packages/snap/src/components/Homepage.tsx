import { Box, Button, Container, Divider, Heading, Image, Link, SnapComponent, Text } from "@metamask/snaps-sdk/jsx"
import { Accounts, Transactions, Address } from "./";
import { SendIcon, QRCodeIcon, ReceiveIcon } from "../../images/icons";
import { Account, Transaction } from "../lib/interfaces";
import { rawToNano } from "../lib/utils";

type HomepageProps = {
  accounts: Account[];
  txs: Transaction[];
  defaultRpc: string;
  blockExplorer: { name: string, endpoint: string };
}

const hasReceiveable = (rec: string | undefined) => rec && rec !== '0';

export const Homepage: SnapComponent<HomepageProps> = ({ txs, accounts, defaultRpc, blockExplorer }) => {
  const active = accounts.find(acc => acc.active)!;
  return (
    <Container>
      <Box>
        <Address address={active.address} prefix="Account: "></Address>

        <Box direction='horizontal'>
          <Heading size='lg'>{rawToNano(active.balance)} XNO</Heading>
          {hasReceiveable(active.receivable) ? (<Button name="receive-funds-confirm"><Image src={ReceiveIcon}></Image> {rawToNano(active.receivable!)}</Button>) : null}
        </Box>

        <Box direction='horizontal' alignment='space-around'>
          <Box alignment='center'>
            <Button name='send-page'>
              <Image src={SendIcon} alt='Send nano' />
            </Button>
            <Text color='alternative'>Send</Text>
          </Box>

          <Box alignment='center'>
            <Button name='receive-page'>
              <Image src={QRCodeIcon} alt='Receive nano' />
            </Button>
            <Text color='alternative'>Receive</Text>
          </Box>
        </Box>

        <Divider />

        <Transactions txs={txs}></Transactions>

        <Accounts accounts={accounts}></Accounts>

        <Divider />
        
        <Box direction='horizontal' alignment='center'>
          <Button name="settings-page">Settings & Backup</Button>
        </Box>

        <Divider />

        <Text alignment="center"><Link href={blockExplorer.endpoint + active.address}>View on block explorer</Link></Text>
      </Box>
    </Container>
  )
}