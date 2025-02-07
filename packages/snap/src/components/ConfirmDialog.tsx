import {
  Container,
  Box,
  Heading,
  Footer,
  Button,
  Text,
  Spinner,
} from '@metamask/snaps-sdk/jsx';

export const ConfirmDialog = ({question, event, loading}: {question: string, event: string, loading?: boolean}) => {
  return (
    <Container>
      <Box>
        <Heading size='md'>Approve action</Heading>
        <Text>{question}</Text>
        {loading ? <Spinner /> : null}
      </Box>
      <Footer>
        <Button name="back">
          Reject
        </Button>
        <Button name={event}>
          Approve
        </Button>
      </Footer>
    </Container>
  );
};