import { Box, Button, Container, Divider, Heading, Image, Link, SnapComponent, Text } from "@metamask/snaps-sdk/jsx"
import { Accounts, Transactions, Address } from "./";
import { SendIcon, QRCodeIcon, ReceiveIcon } from "../../images/icons";
import { Account, RpcAccountHistory } from "../lib/types";
import { rawToNano } from "../lib/utils";
import { XnapButtonEvents } from "../lib/constants";

type HomepageProps = {
  accounts: Account[];
  txs: RpcAccountHistory[];
  blockExplorer: { name: string, endpoint: string };
}

const hasReceiveable = (rec: string | undefined) => rec && rec !== '0';

export const Homepage: SnapComponent<HomepageProps> = ({ txs, accounts, blockExplorer }) => {
  const active = accounts.find(acc => acc.active) as Account;
  return (
    <Container>
      <Box>
        <Address address={active.address} prefix="Account: "></Address>

        <Box direction='horizontal'>
          <Heading size='lg'>{rawToNano(active.balance)} XNO</Heading>
          {hasReceiveable(active.receivable) ? (<Button name={XnapButtonEvents.RECEIVE_FUNDS_CONFIRM}><Image src={ReceiveIcon}></Image> {rawToNano(active.receivable)}</Button>) : null}
        </Box>

        <Box direction='horizontal' alignment='space-around'>
          <Box alignment='center'>
            <Button name={XnapButtonEvents.SEND_PAGE}>
              <Image src={SendIcon} alt='Send nano' />
            </Button>
            <Text color='alternative'>Send</Text>
          </Box>

          <Box alignment='center'>
            <Button name={XnapButtonEvents.RECEIVE_PAGE}>
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
          <Button name={XnapButtonEvents.SETTINGS_PAGE}>Settings & Backup</Button>
        </Box>

        <Divider />

        <Text alignment="center"><Link href={blockExplorer.endpoint + active.address}>View on block explorer</Link></Text>
      </Box>
    </Container>
  )
}