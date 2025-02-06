import { Box, Button, Container, Divider, Heading, Image, Link, SnapComponent, Text } from "@metamask/snaps-sdk/jsx"
import { Accounts, Transactions, Address } from "./";
import sendIcon from "../../images/send.svg";
import qrcIcon from "../../images/qrcode.svg";
import receiveIcon from "../../images/receive.svg";
import { Account, Transaction } from "../lib/interfaces";
import { rawToNano } from "../lib/utils";

type HomepageProps = {
  accounts: Account[];
  txs: Transaction[];
  defaultRpc: string;
}

const hasReceiveable = (rec: string | undefined) => rec && rec !== '0';

export const Homepage: SnapComponent<HomepageProps> = ({ txs, accounts, defaultRpc }) => {
  const active = accounts.find(acc => acc.active)!;
  return (
    <Container>
      <Box>
        <Address address={active.address} prefix="Account: "></Address>

        <Box direction='horizontal'>
          <Heading size='lg'>{rawToNano(active.balance)} XNO</Heading>
          {hasReceiveable(active.receivable) ? (<Button name="receive-funds-confirm"><Image src={receiveIcon}></Image> {rawToNano(active.receivable!)}</Button>) : null}
        </Box>

        <Box direction='horizontal' alignment='space-around'>
          <Box alignment='center'>
            <Button name='send-page'>
              <Image src={sendIcon} alt='Send nano' />
            </Button>
            <Text color='alternative'>Send</Text>
          </Box>

          <Box alignment='center'>
            <Button name='receive-page'>
              <Image src={qrcIcon} alt='Receive nano' />
            </Button>
            <Text color='alternative'>Receive</Text>
          </Box>
        </Box>

        <Divider />

        <Transactions txs={txs}></Transactions>

        <Accounts accounts={accounts}></Accounts>

        <Divider />

        <Box direction='horizontal' alignment='space-between'>
          <Heading>Default RPC</Heading>
          <Button name="switch-rpc">{defaultRpc ? defaultRpc : 'Not set'}</Button>
        </Box>
        <Box direction='horizontal' alignment='space-between'>
          <Heading>Backup</Heading>
          <Button name="show-keys-warning">Show key pair</Button>
        </Box>

        <Divider />

        <Text alignment="center"><Link href={'https://blocklattice.io/account/' + active.address}>View on block explorer</Link></Text>
      </Box>
    </Container>
  )
}