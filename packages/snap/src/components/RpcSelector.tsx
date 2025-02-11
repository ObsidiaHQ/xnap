import {
  SnapComponent,
  Selector,
  SelectorOption,
  Card,
  Box,
  Form,
  Divider,
  Button,
  Heading,
  Container,
  Input,
  Field,
  Text,
  Link,
} from '@metamask/snaps-sdk/jsx';
import { RpcEndpoint } from '../lib/types';

type Options = {
  options: RpcEndpoint[],
  active: RpcEndpoint | null,
}

export const RpcSelector: SnapComponent<Options> = ({ options, active }) => {
  return (
    <Container>
      <Box>
        <Heading>Select an RPC endpoint</Heading>
        <Form name="switch-rpc-form">
          <Selector name="selectedRpc" title="Select an RPC endpoint">
            {options.map((option) => (
              <SelectorOption value={option.value}>
                <Card
                  value=''
                  title={(option.name) + (option.value === active?.value ? ' ⭐' : '')}
                  description={option.api}
                />
              </SelectorOption>
            ))}
            <SelectorOption value='custom'>
              <Card
                value=''
                title={'Custom' + (active?.value === 'custom' ? ' ⭐' : '')}
                description={(active?.value === 'custom') ? active?.api : ''}
              />
            </SelectorOption>
          </Selector>
          <Divider />
          <Text color='alternative'>Custom configuration:</Text>
          <Field label='Server'>
            <Input name="api" value={active?.api || ''} />
          </Field>
          <Text color='muted'>
            Enter a valid <Link href="https://docs.nano.org/commands/rpc-protocol/">nano RPC endpoint</Link> or an API compliant with it.
          </Text>
          <Field label='Authorization'>
            <Input name="auth" value={active?.auth || ''} placeholder='Optional' />
          </Field>
          <Text color='muted'>Enter a valid Authorization header, for example: Basic xyz..</Text>
          <Divider />
          <Box alignment="space-around" direction="horizontal">
            <Button name="back">Back</Button>
            <Button type="submit" name="submit">
              Save
            </Button>
          </Box>
        </Form>
      </Box>
    </Container>
  );
};