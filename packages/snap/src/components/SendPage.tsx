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
import { AccountSelector } from './AccountSelector';
import { Account } from 'libnemo';

type Accounts = {
    accounts: Pick<Account, 'address'>[],
    active: string;
}

export const SendPage: SnapComponent<Accounts> = ({ accounts, active }) => {
  return (
    <Container>
      <Box>
        <Heading>Send nano</Heading>
        <Form name="send-xno-form">
          <Field label="Account">
            <AccountSelector accounts={accounts} active={active} />
          </Field>
          <Field label="Amount (XNO)">
            <Input name="value" placeholder="2.5" type='number' min={0} />
          </Field>
          <Field label="Recipient">
            <Input name="to" placeholder="nano_123.." />
          </Field>
          <Divider />
          <Box alignment="space-around" direction="horizontal">
            <Button name="back">Back</Button>
            <Button type="submit" name="submit">
              Continue
            </Button>
          </Box>
        </Form>
      </Box>
    </Container>
  );
};