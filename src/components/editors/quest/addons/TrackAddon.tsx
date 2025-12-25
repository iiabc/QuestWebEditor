import { FormAddon } from '@/components/ui';
import { DebouncedTextInput, DebouncedTextarea } from '@/components/ui/DebouncedInput';
import { Stack, Paper, Group, Box, Text, SegmentedControl, Collapse, Badge } from '@mantine/core';
import { BeaconSettings } from './track/BeaconSettings';
import { LandmarkSettings } from './track/LandmarkSettings';
import { NavigationSettings } from './track/NavigationSettings';
import { ScoreboardSettings } from './track/ScoreboardSettings';

interface TrackAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
    type: 'quest' | 'task';
}

function TriStateAddon({ label, description, value, onChange, children }: {
    label: string;
    description?: string;
    value?: boolean | null;
    onChange: (value: boolean | null | undefined) => void;
    children?: React.ReactNode;
}) {
    const stringValue = value === true ? 'on' : value === false ? 'off' : 'default';

    const renderLabel = () => {
        const match = label.match(/^(.*?)\s*\((.*?)\)$/);
        if (match) {
            return (
                <Group gap={8}>
                    <Text fw={500}>{match[1]}</Text>
                    <Badge size="sm" variant="light" color="gray" style={{ textTransform: 'none' }}>
                        {match[2]}
                    </Badge>
                </Group>
            );
        }
        return <Text fw={500}>{label}</Text>;
    };

    return (
        <Paper withBorder p="md" style={{
            borderColor: value === true ? 'var(--mantine-color-blue-8)' : 
                        value === false ? 'var(--mantine-color-dark-4)' : undefined,
            backgroundColor: value === true ? 'rgba(25, 113, 194, 0.05)' : 
                           value === false ? 'var(--mantine-color-dark-8)' : undefined
        }}>
            <Group justify="space-between" mb={value === true && children ? 'md' : 0}>
                <Box style={{ opacity: value === false ? 0.5 : 1 }}>
                    {renderLabel()}
                    {description && <Text size="xs" c="dimmed">{description}</Text>}
                </Box>
                <SegmentedControl
                    size="xs"
                    value={stringValue}
                    onChange={(val) => {
                        if (val === 'on') onChange(true);
                        else if (val === 'off') onChange(false);
                        else onChange(undefined);
                    }}
                    data={[
                        { label: '开启', value: 'on' },
                        { label: '默认', value: 'default' },
                        { label: '关闭', value: 'off' },
                    ]}
                />
            </Group>
            {children && (
                <Collapse in={value === true}>
                    <Stack gap="md">
                        {children}
                    </Stack>
                </Collapse>
            )}
        </Paper>
    );
}

export function TrackAddon({ addon, onChange, type }: TrackAddonProps) {
    // QuestEngine 的 track 在 agent.track 中，不在 addon.track 中
    // 此组件已废弃，track 配置在 AgentEditor 中处理
    // 保留此组件仅用于向后兼容，但实际不显示任何内容
    return null;
}
