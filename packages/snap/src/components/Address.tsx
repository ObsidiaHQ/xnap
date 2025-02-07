import { Card, Image, Row, SnapComponent } from "@metamask/snaps-sdk/jsx";
import { createJazzicon, truncateAddress } from "../lib/utils";

type AddressProps = {
  address: string;
  alias?: string;
  prefix?: string;
  balance?: string;
  compact?: boolean;
};

export const Address: SnapComponent<AddressProps> = ({ address, alias, prefix, balance, compact = true }) => {
  return compact ? (
    <Row label={(prefix || '') + truncateAddress(address)} tooltip={alias || ''}>
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