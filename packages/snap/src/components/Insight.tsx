import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Divider, Heading, Section, Text } from '@metamask/snaps-sdk/jsx';
import { Address } from './Address';
import { InsightProps } from '../interface';

export const Insight: SnapComponent<InsightProps> = ({ from, to, value, origin }) => {
  return (
    <Box>
      {origin ? <Box><Text color='muted'>Origin: {origin}</Text><Divider /></Box> : <Text> </Text>}
      <Heading>Sending {value} XNO</Heading>
      <Section>
        <Address address={from} prefix='From: '></Address>
      </Section>
      <Section>
        <Address address={to} prefix='To: '></Address>
      </Section>
    </Box>
  );
};