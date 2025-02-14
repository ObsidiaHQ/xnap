import { Card, Image, Row, SnapComponent } from "@metamask/snaps-sdk/jsx";
import { createJazzicon, truncateAddress } from "../lib/utils";

type AddressProps = {
  address: string;
  alias?: string | null;
  prefix?: string;
  balance?: string;
  compact?: boolean;
  insufficient?: boolean;
};

export const Address: SnapComponent<AddressProps> = ({ address, alias, prefix, balance, compact = true, insufficient = false }) => {
  const balanceText = (balance || '0') + ' XNO';
  return compact ? (
    <Row label={(prefix || '') + truncateAddress(address)} tooltip={alias || undefined}>
      <Image src={createJazzicon(address, 24)} />
    </Row>
  ) : (
    <Card
      image={createJazzicon(address, 20)}
      title={prefix || ''}
      value={truncateAddress(address)}
      extra={(insufficient ? '⚠️ ' : '') + balanceText}
    />
  );
};