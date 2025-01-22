import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Divider, Heading, Italic, Section, Text } from '@metamask/snaps-sdk/jsx';
import { Address } from './';
import { InsightProps } from '../lib/interfaces';

export const Insight: SnapComponent<InsightProps> = ({ from, to, value, origin, balance }) => {
  return (
    <Box>
      {origin ? <Box><Text color='muted'>Origin: {origin}</Text><Divider /></Box> : null}
      <Heading>Sending {value} XNO</Heading>
      <Section>
        <Address address={from} prefix='From: ' balance={balance!} compact={false}></Address>
      </Section>
      <Section>
        <Address address={to} prefix='To: '></Address>
      </Section>
      <Divider />
      <Text>Do you want to sign this transaction?</Text>
    </Box>
  );
};