import { useMemo, useState } from 'react';
import { ScrollArea, Group, Text, ActionIcon, Box, Button, Badge, Modal, Stack, Checkbox } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';

interface ObjectiveListEditorProps {
    objectiveIds: (string | number)[];
    availableObjectives: Record<string | number, any>;
    onChange: (objectiveIds: (string | number)[]) => void;
    currentObjectiveId?: string | number;
}

export function ObjectiveListEditor({ objectiveIds, availableObjectives, onChange, currentObjectiveId }: ObjectiveListEditorProps) {
    const [selectorOpened, setSelectorOpened] = useState(false);
    const [selectedInSelector, setSelectedInSelector] = useState<(string | number)[]>([]);

    // 获取目标名称的映射
    const objectiveNameMap = useMemo(() => {
        const nameMap: Record<string | number, string> = {};

        Object.keys(availableObjectives).forEach((id) => {
            // 直接使用 ID 作为显示名称
            nameMap[id] = String(id);
        });

        return nameMap;
    }, [availableObjectives]);

    const handleRemove = (objectiveId: string | number) => {
        onChange(objectiveIds.filter(id => String(id) !== String(objectiveId)));
    };

    const handleOpenSelector = () => {
        setSelectedInSelector([...objectiveIds]);
        setSelectorOpened(true);
    };

    const handleToggleObjective = (objectiveId: string | number) => {
        setSelectedInSelector(prev => {
            const idStr = String(objectiveId);
            if (prev.some(id => String(id) === idStr)) {
                return prev.filter(id => String(id) !== idStr);
            } else {
                return [...prev, objectiveId];
            }
        });
    };

    const handleSelectorClose = () => {
        setSelectorOpened(false);
    };

    const handleSelectorConfirm = () => {
        onChange(selectedInSelector);
        setSelectorOpened(false);
    };

    // 获取可用的目标 ID 列表，排除当前目标
    const availableObjectiveIds = useMemo(() => {
        return Object.keys(availableObjectives)
            .map(id => {
                // 尝试转换为数字，如果失败则保持字符串
                const numId = Number(id);
                return isNaN(numId) ? id : numId;
            })
            .filter(id => {
                // 排除当前目标 ID
                if (currentObjectiveId === undefined) return true;
                return String(id) !== String(currentObjectiveId);
            });
    }, [availableObjectives, currentObjectiveId]);

    return (
        <>
            <Box
                style={{
                    border: '1px solid var(--mantine-color-dark-4)',
                    borderRadius: 4,
                    backgroundColor: 'var(--mantine-color-dark-7)'
                }}
            >
                <Group p="xs" justify="space-between" style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
                    <Text size="xs" fw={500}>前置目标列表</Text>
                    <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconPlus size={14} />}
                        onClick={handleOpenSelector}
                    >
                        选择目标
                    </Button>
                </Group>
                <ScrollArea style={{ maxHeight: 300 }}>
                    {objectiveIds.length === 0 ? (
                        <Box p="md" style={{ textAlign: 'center' }}>
                            <Text size="sm" c="dimmed">暂无目标，点击上方按钮添加目标</Text>
                        </Box>
                    ) : (
                        <Box p="xs">
                            <Group gap="xs">
                                {objectiveIds.map(objectiveId => {
                                    const objectiveName = objectiveNameMap[objectiveId] || String(objectiveId);
                                    return (
                                        <Badge
                                            key={String(objectiveId)}
                                            variant="light"
                                            style={{ textTransform: 'none' }}
                                            rightSection={
                                                <ActionIcon
                                                    size="xs"
                                                    color="red"
                                                    radius="xl"
                                                    variant="transparent"
                                                    onClick={() => handleRemove(objectiveId)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <IconX size={12} />
                                                </ActionIcon>
                                            }
                                        >
                                            {objectiveName}
                                        </Badge>
                                    );
                                })}
                            </Group>
                        </Box>
                    )}
                </ScrollArea>
            </Box>
            <Modal
                opened={selectorOpened}
                onClose={handleSelectorClose}
                title="选择前置目标"
                size="md"
            >
                <Stack gap="md">
                    <ScrollArea style={{ maxHeight: 400 }}>
                        <Stack gap="xs">
                            {availableObjectiveIds.map(objectiveId => {
                                const objectiveName = objectiveNameMap[objectiveId] || `目标 ${objectiveId}`;
                                const isSelected = selectedInSelector.some(id => String(id) === String(objectiveId));
                                return (
                                    <Checkbox
                                        key={String(objectiveId)}
                                        label={objectiveName}
                                        checked={isSelected}
                                        onChange={() => handleToggleObjective(objectiveId)}
                                    />
                                );
                            })}
                        </Stack>
                    </ScrollArea>
                    <Group justify="flex-end">
                        <Button variant="light" onClick={handleSelectorClose}>
                            取消
                        </Button>
                        <Button onClick={handleSelectorConfirm}>
                            确认
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}

