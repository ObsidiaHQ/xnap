import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Divider, Heading, Italic, Section, Text } from '@metamask/snaps-sdk/jsx';
import { Address } from './';
import { InsightProps } from '../lib/types';
import { rawToNano } from '../lib/utils';

export const Insight: SnapComponent<InsightProps> = ({ from, to, value, origin, balance, alias }) => {
  return (
    <Box>
      {origin ? <Box><Text color='muted'>Origin: {origin}</Text><Divider /></Box> : null}
      <Heading size='md'>Sending {value} XNO</Heading>
      <Section>
        <Address address={from} prefix='From: ' balance={rawToNano(balance)} compact={false}></Address>
      </Section>
      {/* TODO: move to address when <Text> is supported in description */}
      {Number(value) > Number(rawToNano(balance)) ? <Text color='warning' alignment='end'><Italic>Insufficient funds</Italic></Text> : null}
      <Section>
        <Address address={to} prefix='To: ' alias={alias!}></Address>
      </Section>
      <Divider />
      <Text>Do you want to approve this transaction?</Text>
    </Box>
  );
};