import {
    SnapComponent,
    Container,
    Box,
    Heading,
    Image,
    Copyable,
    Text,
} from '@metamask/snaps-sdk/jsx';

type ReceiveProps = {
    qr: string;
    address: string;
}

export const ReceivePage: SnapComponent<ReceiveProps> = ({ qr, address }) => {
    return (
        <Container>
            <Box>
                <Heading>Receive</Heading>
                <Image src={qr} />
                <Text>Address:</Text>
                <Copyable value={address} />
            </Box>
        </Container>
    );
};