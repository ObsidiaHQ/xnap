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

export const SettingsPage: SnapComponent<{ defaultRpc: string, blockExplorer: { name: string, endpoint: string }, aliasSupport: boolean }> = ({ defaultRpc, blockExplorer, aliasSupport }) => {
  return (
    <Container>
      <Box>
        <Heading size='md'>Settings</Heading>
        <Box direction='horizontal' alignment='space-between'>
          <Image src={RpcIcon} alt='RPC' />
          <Button name="switch-rpc">{defaultRpc ? defaultRpc : 'Not set'}</Button>
        </Box>

        <Box direction='horizontal' alignment='space-between'>
          <Image src={ExplorerIcon} alt='Block explorer' />
          <Button name="switch-block-explorer">{blockExplorer.name ? blockExplorer.name : 'Not set'}</Button>
        </Box>

        <Form name="settings-form">
          <Box direction='horizontal' alignment='space-between'>
            <Image src={IdIcon} alt='Alias support' />
            <Checkbox name="aliasSupport" variant="toggle" checked={aliasSupport} />
          </Box>
          <Text color='muted'>
            Aliases are resolved through <Link href="https://github.com/mistakia/nano-community/blob/cae1dd3938fa1ca3e51c8d672187294bf3bcc8da/docs/getting-started-devs/integrations.md#nano-internet-identifiers">Nano Internet Identifiers</Link>.
            This requires sending requests to alias domains that may record your IP address.
          </Text>
          <Button type="submit">Save</Button>
        </Form>

        <Divider />

        <Box direction='horizontal' alignment='space-between'>
          <Image src={BackupIcon} alt='Explorer' />
          <Button name="show-keys-confirm">Show key pair</Button>
        </Box>
      </Box>
      <Footer>
        <Button name="back">Close</Button>
      </Footer>
    </Container>
  );
};