import {
  SnapComponent,
  Container,
  Box,
  Heading,
  Button,
  Footer,
  Image,
} from '@metamask/snaps-sdk/jsx';
import { BackupIcon, ExplorerIcon, RpcIcon } from '../../images/icons';

export const SettingsPage: SnapComponent<{ defaultRpc: string, blockExplorer: { name: string, endpoint: string } }> = ({ defaultRpc, blockExplorer }) => {
  return (
    <Container>
      <Box>
        <Heading size='md'>Settings</Heading>
        <Box direction='horizontal' alignment='space-between'>
          <Box direction='horizontal'>
            <Image src={RpcIcon} alt='Explorer' />
            <Heading>RPC</Heading>
          </Box>
          <Button name="switch-rpc">{defaultRpc ? defaultRpc : 'Not set'}</Button>
        </Box>

        <Box direction='horizontal' alignment='space-between'>
          <Box direction='horizontal'>
            <Image src={ExplorerIcon} alt='Explorer' />
            <Heading>Block Explorer</Heading>
          </Box>
          <Button name="switch-block-explorer">{blockExplorer.name ? blockExplorer.name : 'Not set'}</Button>
        </Box>

        <Box direction='horizontal' alignment='space-between'>
          <Box direction='horizontal'>
            <Image src={BackupIcon} alt='Explorer' />
            <Heading>Backup</Heading>
          </Box>
          <Button name="show-keys-warning">Show key pair</Button>
        </Box>
      </Box>
      <Footer>
        <Button name="back">Close</Button>
      </Footer>
    </Container>
  );
};