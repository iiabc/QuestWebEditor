import { useMemo, useState } from 'react';
import { ScrollArea, Group, Text, ActionIcon, Box, Button, NumberInput } from '@mantine/core';
import { IconPlus, IconTrash, IconGripVertical } from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { VirtualFile } from '@/store/useProjectStore';
import { parseYaml } from '@/utils/yaml-utils';
import { QuestSelector } from '../group/QuestSelector';

interface PoolQuest {
    id: string;
    weight: number;
}

interface PoolQuestListEditorProps {
    quests: PoolQuest[];
    availableQuests: Record<string, VirtualFile>;
    onChange: (quests: PoolQuest[]) => void;
}

export function PoolQuestListEditor({ quests, availableQuests, onChange }: PoolQuestListEditorProps) {
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

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        
        const items = Array.from(quests);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        onChange(items);
    };

    const handleRemove = (questId: string) => {
        onChange(quests.filter(q => q.id !== questId));
    };

    const handleWeightChange = (questId: string, weight: number | string) => {
        const weightNum = typeof weight === 'string' ? parseFloat(weight) || 1 : weight;
        onChange(quests.map(q => q.id === questId ? { ...q, weight: weightNum } : q));
    };

    const handleOpenSelector = () => {
        setSelectedInSelector(quests.map(q => q.id));
        setSelectorOpened(true);
    };

    const handleSelectorSelect = (questIds: string[]) => {
        setSelectedInSelector(questIds);
    };

    const handleSelectorClose = () => {
        // 当选择器关闭时，应用选择
        // 合并已有任务和新选择的任务，保留已有任务的权重
        const existingQuestMap = new Map(quests.map(q => [q.id, q]));
        const newQuests: PoolQuest[] = selectedInSelector.map(id => {
            const existing = existingQuestMap.get(id);
            return existing || { id, weight: 1 };
        });
        onChange(newQuests);
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
                    <Text size="xs" fw={500}>任务列表（带权重）</Text>
                    <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconPlus size={14} />}
                        onClick={handleOpenSelector}
                    >
                        从任务列表选择
                    </Button>
                </Group>
                <ScrollArea style={{ maxHeight: 400 }}>
                    {quests.length === 0 ? (
                        <Box p="md" style={{ textAlign: 'center' }}>
                            <Text size="sm" c="dimmed">暂无任务，点击上方按钮添加任务</Text>
                        </Box>
                    ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="pool-quest-list" direction="vertical">
                                {(provided: DroppableProvided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps}>
                                        {quests.map((quest, index) => {
                                            const questName = questNameMap[quest.id] || quest.id;
                                            return (
                                                <Draggable key={quest.id} draggableId={quest.id} index={index}>
                                                    {(provided: DraggableProvided) => (
                                                        <Box
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                borderBottom: index < quests.length - 1 ? '1px solid var(--mantine-color-dark-4)' : 'none'
                                                            }}
                                                        >
                                                            <Group
                                                                p="xs"
                                                                gap="xs"
                                                                style={{
                                                                    backgroundColor: 'var(--mantine-color-dark-6)',
                                                                    cursor: 'grab',
                                                                    ':hover': {
                                                                        backgroundColor: 'var(--mantine-color-dark-5)'
                                                                    }
                                                                }}
                                                            >
                                                                <div {...provided.dragHandleProps} style={{ display: 'flex', alignItems: 'center', opacity: 0.5 }}>
                                                                    <IconGripVertical size={16} />
                                                                </div>
                                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                                    <Text size="sm" fw={500} truncate>
                                                                        {questName}
                                                                    </Text>
                                                                    {questName !== quest.id && (
                                                                        <Text size="xs" c="dimmed" truncate>
                                                                            {quest.id}
                                                                        </Text>
                                                                    )}
                                                                </div>
                                                                <NumberInput
                                                                    size="xs"
                                                                    value={quest.weight}
                                                                    onChange={(value) => handleWeightChange(quest.id, value || 1)}
                                                                    min={1}
                                                                    step={1}
                                                                    style={{ width: 80 }}
                                                                    placeholder="权重"
                                                                />
                                                                <ActionIcon
                                                                    color="red"
                                                                    variant="subtle"
                                                                    size="sm"
                                                                    onClick={() => handleRemove(quest.id)}
                                                                >
                                                                    <IconTrash size={14} />
                                                                </ActionIcon>
                                                            </Group>
                                                        </Box>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
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

