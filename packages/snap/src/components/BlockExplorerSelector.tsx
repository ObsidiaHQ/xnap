import {
  SnapComponent,
  Selector,
  SelectorOption,
  Card,
  Container,
  Box,
  Heading,
  Form,
  Button,
  Divider,
} from '@metamask/snaps-sdk/jsx';
import { XnapButtonEvents, XnapFormEvents } from '../lib/constants';
import { BlockExplorer } from '../lib/types';

export const BlockExplorerSelector: SnapComponent<{ explorers: BlockExplorer[], active: BlockExplorer }> = ({ explorers, active }) => {
  return (
    <Container>
      <Box>
        <Heading>Select an explorer</Heading>
        <Form name={XnapFormEvents.SWITCH_EXPLORER_FORM}>
          <Selector name="selectedExplorer" title="Select an explorer">
            {explorers.map((explorer) => (
              <SelectorOption value={explorer.name}>
                <Card
                  title={(explorer.name === active.name ? '⭐ ' + explorer.name : explorer.name)}
                  value=""
                  description={explorer.endpoint}
                />
              </SelectorOption>
            ))}
          </Selector>
          <Divider />
          <Box alignment="space-around" direction="horizontal">
            <Button name={XnapButtonEvents.BACK}>Back</Button>
            <Button type="submit">Select</Button>
          </Box>
        </Form>
      </Box>
    </Container>

  );
};