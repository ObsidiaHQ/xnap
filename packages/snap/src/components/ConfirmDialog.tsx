import {
  Container,
  Box,
  Heading,
  Footer,
  Button,
  Text,
  Spinner,
} from '@metamask/snaps-sdk/jsx';
import { XnapButtonEventName, XnapButtonEvents } from '../lib/constants';

export const ConfirmDialog = ({question, event, loading}: {question: string, event: XnapButtonEventName, loading?: boolean}) => {
  return (
    <Container>
      <Box>
        <Heading size='md'>Approve action</Heading>
        <Text>{question}</Text>
        {loading ? <Spinner /> : null}
      </Box>
      <Footer>
        <Button name={XnapButtonEvents.BACK}>
          Reject
        </Button>
        <Button name={event}>
          Approve
        </Button>
      </Footer>
    </Container>
  );
};