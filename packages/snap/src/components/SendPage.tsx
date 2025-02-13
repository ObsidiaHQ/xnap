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
import { AccountSelector } from './';
import { Account } from '../lib/types';
import { XnapButtonEvents, XnapFormEvents } from '../lib/constants';

export const SendPage: SnapComponent<{ accounts: Account[], active: string }> = ({ accounts, active }) => {
  return (
    <Container>
      <Box>
        <Heading size='md'>Send nano</Heading>
        <Form name={XnapFormEvents.SEND_XNO_FORM}>
          <Field label="Account">
            <AccountSelector accounts={accounts} />
          </Field>
          <Field label="Amount (XNO)">
            <Input name="value" placeholder="2.5" type='number' />
          </Field>
          <Field label="Recipient">
            <Input name="to" placeholder="nano_123.." />
          </Field>
          <Divider />
          <Box alignment="space-around" direction="horizontal">
            <Button name={XnapButtonEvents.BACK}>Back</Button>
            <Button type="submit">Continue</Button>
          </Box>
        </Form>
      </Box>
    </Container>
  );
};