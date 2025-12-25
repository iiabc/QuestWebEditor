import { Switch, SwitchProps, Group, Text, Badge } from '@mantine/core';

export function FormSwitch(props: SwitchProps) {
    const renderLabel = () => {
        if (typeof props.label === 'string') {
            const match = props.label.match(/^(.*?)\s*\((.*?)\)$/);
            if (match) {
                return (
                    <Group gap={8} display="inline-flex">
                        <Text span size="sm" fw={500}>{match[1]}</Text>
                        <Badge size="xs" variant="light" color="gray" style={{ textTransform: 'none' }}>
                            {match[2]}
                        </Badge>
                    </Group>
                );
            }
        }
        return props.label;
    };

    return (
        <Group justify="space-between" wrap="nowrap">
            {props.label && <Text size="sm" fw={500}>{renderLabel()}</Text>}
            <Switch {...props} label={undefined} />
        </Group>
    );
}
