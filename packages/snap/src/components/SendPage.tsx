import {
  SnapComponent,
  Container,
  Box,
  Heading,
  Form,
  Field,
  Input,
  Button,
  Divider,
} from '@metamask/snaps-sdk/jsx';

export const SendPage: SnapComponent = () => {
  return (
    <Container>
      <Box>
        <Heading>Send nano</Heading>
        <Form name="send-xno-form">
          <Field label="Amount (XNO)">
            <Input name="value" placeholder="2.5" type='number' min={0} />
          </Field>
          <Field label="Recipient">
            <Input name="to" placeholder="nano_123.." />
          </Field>
          <Divider />
          <Box center>
            <Button type="submit" name="submit">
              Continue
            </Button>
          </Box>
        </Form>
      </Box>
    </Container>
  );
};