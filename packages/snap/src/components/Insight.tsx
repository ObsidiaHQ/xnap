import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Divider, Heading, Italic, Section, Text } from '@metamask/snaps-sdk/jsx';
import { Address } from './';
import { rawToNano } from '../lib/utils';

type InsightProps = {
  from: string;
  to: string;
  value: string;
  origin: string | null;
  balance?: string;
  alias: string | null;
};

export const Insight: SnapComponent<InsightProps> = ({ from, to, value, origin, balance, alias }) => {
  const insufficient = Number(value) > Number(rawToNano(balance));
  return (
    <Box>
      {origin ? <Box><Text color='muted'>Origin: {origin}</Text><Divider /></Box> : null}
      <Heading size='md'>Sending {value} XNO</Heading>
      <Section>
        <Address address={from} prefix='From: ' balance={rawToNano(balance)} compact={false} insufficient={insufficient}></Address>
      </Section>
      {/* TODO: move to address when <Text> is supported in description */}
      {insufficient ? <Text color='warning' alignment='end'><Italic>Insufficient funds</Italic></Text> : null}
      <Section>
        <Address address={to} prefix='To: ' alias={alias}></Address>
      </Section>
      <Divider />
      <Text>Do you want to approve this transaction?</Text>
    </Box>
  );
};