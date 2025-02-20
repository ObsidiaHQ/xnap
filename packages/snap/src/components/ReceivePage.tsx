import {
  SnapComponent,
  Container,
  Box,
  Heading,
  Image,
  Copyable,
  Text,
  Button,
  Footer,
} from '@metamask/snaps-sdk/jsx';
import { XnapButtonEvents } from '../lib/constants';

export const ReceivePage: SnapComponent<{ qr: string, address: string }> = ({ qr, address }) => {
  return (
    <Container>
      <Box>
        <Heading size='md'>Receive</Heading>
        <Image src={qr} />
        <Text>Address:</Text>
        <Copyable value={address} />
      </Box>
      <Footer>
        <Button name={XnapButtonEvents.BACK}>Close</Button>
      </Footer>
    </Container>
  );
};