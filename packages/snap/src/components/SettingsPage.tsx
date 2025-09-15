import {
  SnapComponent,
  Container,
  Box,
  Heading,
  Button,
  Footer,
  Image,
  Form,
  Text,
  Link,
  Divider,
  Checkbox,
} from '@metamask/snaps-sdk/jsx';
import { BackupIcon, ExplorerIcon, RpcIcon, IdIcon } from '../../images/icons';
import { XnapButtonEvents, XnapFormEvents } from '../lib/constants';

export const SettingsPage: SnapComponent<{ defaultRpc: string, blockExplorer: { name: string, endpoint: string }, aliasSupport: boolean }> = ({ defaultRpc, blockExplorer, aliasSupport }) => {
  return (
    <Container>
      <Box>
        <Heading size='md'>Settings</Heading>
        <Box direction='horizontal' alignment='space-between'>
          <Image src={RpcIcon} alt='RPC' />
          <Button name={XnapButtonEvents.SWITCH_RPC}>{defaultRpc ? defaultRpc : 'Not set'}</Button>
        </Box>

        <Box direction='horizontal' alignment='space-between'>
          <Image src={ExplorerIcon} alt='Block explorer' />
          <Button name={XnapButtonEvents.SWITCH_BLOCK_EXPLORER}>{blockExplorer.name ? blockExplorer.name : 'Not set'}</Button>
        </Box>

        <Form name={XnapFormEvents.SETTINGS_FORM}>
          <Box direction='horizontal' alignment='space-between'>
            <Image src={IdIcon} alt='Alias support' />
            <Checkbox name="aliasSupport" variant="toggle" checked={aliasSupport} />
          </Box>
          <Text color='muted' size='sm'>
            Aliases are resolved through <Link href="https://github.com/mistakia/nano-community/blob/cae1dd3938fa1ca3e51c8d672187294bf3bcc8da/docs/getting-started-devs/integrations.md#nano-internet-identifiers">Nano Internet Identifiers</Link>.
            This requires sending requests to alias domains that may record your IP address.
          </Text>
          <Button type="submit">Save</Button>
        </Form>

        <Divider />

        <Box direction='horizontal' alignment='space-between'>
          <Image src={BackupIcon} alt='Explorer' />
          <Button name={XnapButtonEvents.SHOW_KEYS_CONFIRM}>Show key pair</Button>
        </Box>
      </Box>
      <Footer>
        <Button name={XnapButtonEvents.BACK}>Close</Button>
      </Footer>
    </Container>
  );
};