import { Box, Button, Container, Divider, Heading, Image, SnapComponent, Text } from "@metamask/snaps-sdk/jsx"
import { Accounts, Transaction, Transactions, Address } from "./";
import sendIcon from "../../images/send.svg";
import qrcIcon from "../../images/qrcode.svg";
import { Account } from "libnemo";

type HomepageProps = {
  accounts: any[],
  txs: Transaction[],
}

export const Homepage: SnapComponent<HomepageProps> = ({ txs, accounts }) => {
  return (
    <Container>
      <Box>
        <Address address={accounts[0]?.address || ''} prefix="Account: "></Address>

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

        <Heading>Backup</Heading>
        <Button name="show-keys-warning">Show key pair</Button>
      </Box>
    </Container>
  )
}