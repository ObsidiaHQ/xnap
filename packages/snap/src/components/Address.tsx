import { Image, Row, SnapComponent } from "@metamask/snaps-sdk/jsx";
import { createJazzicon, truncateAddress } from "../utils";

type Address = {
  address: string;
  prefix?: string;
}

export const Address: SnapComponent<Address> = ({ address, prefix }) => {
  return (
    <Row label={(prefix || '') + truncateAddress(address)}>
      <Image src={createJazzicon(address, 24)} />
    </Row>
  );
};