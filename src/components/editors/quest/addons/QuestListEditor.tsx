import { useMemo, useState } from 'react';
import { ScrollArea, Group, Text, ActionIcon, Box, Button, Badge } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import { VirtualFile } from '@/store/useProjectStore';
import { parseYaml } from '@/utils/yaml-utils';
import { QuestSelector } from '../../group/QuestSelector';

interface QuestListEditorProps {
    questIds: string[];
    availableQuests: Record<string, VirtualFile>;
    onChange: (questIds: string[]) => void;
}

export function QuestListEditor({ questIds, availableQuests, onChange }: QuestListEditorProps) {
    const [selectorOpened, setSelectorOpened] = useState(false);
    const [selectedInSelector, setSelectedInSelector] = useState<string[]>([]);

    // 获取任务名称的映射
    const questNameMap = useMemo(() => {
        const nameMap: Record<string, string> = {};
        
        Object.values(availableQuests).forEach(file => {
            if (!file.content) return;
            
            try {
                const parsed = parseYaml(file.content);
                if (!parsed || typeof parsed !== 'object') return;
                
                Object.keys(parsed).forEach(questId => {
                    const questData = parsed[questId];
                    if (questData?.meta?.name) {
                        nameMap[questId] = questData.meta.name;
                    }
                });
            } catch (e) {
                // 解析失败，跳过
            }
        });
        
        return nameMap;
    }, [availableQuests]);

    const handleRemove = (questId: string) => {
        onChange(questIds.filter(id => id !== questId));
    };

    const handleOpenSelector = () => {
        setSelectedInSelector([...questIds]);
        setSelectorOpened(true);
    };

    const handleSelectorSelect = (selected: string[]) => {
        setSelectedInSelector(selected);
    };

    const handleSelectorClose = () => {
        // 当选择器关闭时，应用选择
        onChange(selectedInSelector);
        setSelectorOpened(false);
    };

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
                    <Text size="xs" fw={500}>前置任务列表</Text>
                    <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconPlus size={14} />}
                        onClick={handleOpenSelector}
                    >
                        选择任务
                    </Button>
                </Group>
                <ScrollArea style={{ maxHeight: 300 }}>
                    {questIds.length === 0 ? (
                        <Box p="md" style={{ textAlign: 'center' }}>
                            <Text size="sm" c="dimmed">暂无任务，点击上方按钮添加任务</Text>
                        </Box>
                    ) : (
                        <Box p="xs">
                            <Group gap="xs">
                                {questIds.map(questId => {
                                    const questName = questNameMap[questId] || questId;
                                    return (
                                        <Badge
                                            key={questId}
                                            variant="light"
                                            style={{ textTransform: 'none' }}
                                            rightSection={
                                                <ActionIcon
                                                    size="xs"
                                                    color="red"
                                                    radius="xl"
                                                    variant="transparent"
                                                    onClick={() => handleRemove(questId)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <IconX size={12} />
                                                </ActionIcon>
                                            }
                                        >
                                            {questName}
                                        </Badge>
                                    );
                                })}
                            </Group>
                        </Box>
                    )}
                </ScrollArea>
            </Box>
            <QuestSelector
                opened={selectorOpened}
                onClose={handleSelectorClose}
                availableQuests={availableQuests}
                selectedQuestIds={selectedInSelector}
                onSelect={handleSelectorSelect}
            />
        </>
    );
}

