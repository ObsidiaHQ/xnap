import {
  SnapComponent,
  Container,
  Box,
  Heading,
  Copyable,
  Text,
  Footer,
  Button,
} from '@metamask/snaps-sdk/jsx';

type CredentialsProps = {
  address: string;
  publicKey: string;
  secretKey: string;
};

export const ShowKeys: SnapComponent<CredentialsProps> = ({
  address,
  publicKey,
  secretKey,
}) => {
  return (
    <Container>
      <Box>
        <Heading size='md'>Account Credentials</Heading>
        <Text>Nano address:</Text>
        <Copyable value={address} />
        <Text>Public key:</Text>
        <Copyable value={publicKey} />
        <Text>Private key:</Text>
        <Copyable value={secretKey} sensitive />
      </Box>
      <Footer>
        <Button name="back">Close</Button>
      </Footer>
    </Container>
  );
};