import {
    SnapComponent,
    Selector,
    SelectorOption,
    Card,
    Container,
    Box,
    Heading,
    Form,
    Button,
    Divider,
} from '@metamask/snaps-sdk/jsx';

export const BlockExplorerSelector: SnapComponent<{ explorers: any, active: any }> = ({ explorers, active }) => {
    return (
        <Container>
            <Box>
                <Heading>Select an explorer</Heading>
                <Form name="switch-explorer-form">
                    <Selector name="selectedExplorer" title="Select an explorer">
                        {explorers.map((explorer: any) => (
                            <SelectorOption value={explorer.name}>
                                <Card
                                    title={(explorer.name === active.name ? '⭐ ' + explorer.name : explorer.name)}
                                    value=""
                                    description={explorer.endpoint}
                                />
                            </SelectorOption>
                        ))}
                    </Selector>
                    <Divider />
                    <Box alignment="space-around" direction="horizontal">
                        <Button name="back">Back</Button>
                        <Button type="submit" name="submit">
                            Select
                        </Button>
                    </Box>
                </Form>
            </Box>
        </Container>

    );
};