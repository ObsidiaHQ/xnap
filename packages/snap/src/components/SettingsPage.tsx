import {
  SnapComponent,
  Container,
  Box,
  Heading,
  Button,
  Footer,
  Image,
  Form,
  Dropdown,
  Option,
  Text,
  Link,
  Divider,
} from '@metamask/snaps-sdk/jsx';
import { BackupIcon, ExplorerIcon, RpcIcon, IdIcon } from '../../images/icons';

export const SettingsPage: SnapComponent<{ defaultRpc: string, blockExplorer: { name: string, endpoint: string } }> = ({ defaultRpc, blockExplorer }) => {
  return (
    <Container>
      <Box>
        <Heading size='md'>Settings</Heading>
        <Box direction='horizontal' alignment='space-between'>
          <Box direction='horizontal'>
            <Image src={RpcIcon} alt='RPC' />
            <Heading>RPC</Heading>
          </Box>
          <Button name="switch-rpc">{defaultRpc ? defaultRpc : 'Not set'}</Button>
        </Box>

        <Box direction='horizontal' alignment='space-between'>
          <Box direction='horizontal'>
            <Image src={ExplorerIcon} alt='Block explorer' />
            <Heading>Block explorer</Heading>
          </Box>
          <Button name="switch-block-explorer">{blockExplorer.name ? blockExplorer.name : 'Not set'}</Button>
        </Box>

        <Form name="settings-form">
          <Box direction='horizontal'>
            <Image src={IdIcon} alt='Alias support' />
            <Heading>Alias support</Heading>
          </Box>
          <Dropdown name="aliasSupport">
            <Option value="false">Disabled</Option>
            <Option value="true">Enabled</Option>
          </Dropdown>
          <Text color='muted'>
            Aliases are resolved through <Link href="https://github.com/mistakia/nano-community/blob/cae1dd3938fa1ca3e51c8d672187294bf3bcc8da/docs/getting-started-devs/integrations.md#nano-internet-identifiers">Nano Internet Identifiers</Link>.
            This requires sending requests to alias domains that may record your IP address.
          </Text>
          <Button type="submit">Save</Button>
        </Form>

        <Divider />

        <Box direction='horizontal' alignment='space-between'>
          <Box direction='horizontal'>
            <Image src={BackupIcon} alt='Explorer' />
            <Heading>Backup</Heading>
          </Box>
          <Button name="show-keys-confirm">Show key pair</Button>
        </Box>
      </Box>
      <Footer>
        <Button name="back">Close</Button>
      </Footer>
    </Container>
  );
};