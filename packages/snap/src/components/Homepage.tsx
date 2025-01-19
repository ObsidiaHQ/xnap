import { Box, Button, Container, Divider, Heading, Image, SnapComponent, Text } from "@metamask/snaps-sdk/jsx"
import { Accounts, Transaction, Transactions, Address } from "./";
import sendIcon from "../../images/send.svg";
import qrcIcon from "../../images/qrcode.svg";

type HomepageProps = {
  active: string;
  accounts: any[],
  txs: Transaction[],
  defaultRpc: string
}

export const Homepage: SnapComponent<HomepageProps> = ({ txs, accounts, active, defaultRpc }) => {
  return (
    <Container>
      <Box>
        <Address address={active} prefix="Account: "></Address>

        <Heading size='lg'>123.45 XNO</Heading>

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
        
      </Box>
    </Container>
  )
}