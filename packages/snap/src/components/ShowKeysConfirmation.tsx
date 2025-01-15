import {
  Container,
  Box,
  Heading,
  Footer,
  Button,
  Text,
} from '@metamask/snaps-sdk/jsx';

export const ShowKeysConfirmation = () => {
  return (
    <Container>
      <Box>
        <Heading>Warning</Heading>
        <Text>Are you sure you want to reveal your account credentials?</Text>
      </Box>
      <Footer>
        <Button name="show-keys" type="button">
          Yes
        </Button>
      </Footer>
    </Container>
  );
};