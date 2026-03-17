import { Button, Card, Image, Row, SnapComponent } from "@metamask/snaps-sdk/jsx";
import { createJazzicon, truncateAddress } from "../lib/utils";

type AddressProps = {
  address: string;
  alias?: string | null;
  prefix?: string;
  balance?: string;
  compact?: boolean;
  insufficient?: boolean;
  onClickName?: string;
};

export const Address: SnapComponent<AddressProps> = ({ address, alias, prefix, balance, compact = true, insufficient = false, onClickName }) => {
  const balanceText = (balance || '0') + ' XNO';
  const compactLabel = (prefix || '') + truncateAddress(address);

  if (compact && onClickName) {
    return (
      <Button name={onClickName}>
        <Image src={createJazzicon(address, 24)} />{'\u00A0\u00A0'}{compactLabel}
      </Button>
    );
  }

  return compact ? (
    <Row label={compactLabel} tooltip={alias || undefined}>
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