import { Card, Image, Row, SnapComponent } from "@metamask/snaps-sdk/jsx";
import { createJazzicon, truncateAddress } from "../lib/utils";

export const Address: SnapComponent<{ address: string, prefix?: string, balance?: string, compact?: boolean }> = ({ address, prefix, balance, compact = true }) => {
  return compact ? (
    <Row label={(prefix || '') + truncateAddress(address)}>
      <Image src={createJazzicon(address, 24)} />
    </Row>
  ) : (
    <Card
      image={createJazzicon(address, 20)}
      title={prefix || ''}
      value={truncateAddress(address)}
      extra={(balance || '0') + ' XNO'}
    />
  );
};