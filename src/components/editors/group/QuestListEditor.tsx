import React, { useMemo, useState } from 'react';
import { ScrollArea, Group, Text, ActionIcon, Box, Button } from '@mantine/core';
import { IconPlus, IconTrash, IconGripVertical } from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { VirtualFile } from '@/store/useProjectStore';
import { parseYaml } from '@/utils/yaml-utils';
import { QuestSelector } from './QuestSelector';

interface QuestListEditorProps {
    quests: string[];
    availableQuests: Record<string, VirtualFile>;
    onChange: (quests: string[]) => void;
}

export function QuestListEditor({ quests, availableQuests, onChange }: QuestListEditorProps) {
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
        onChange(quests.filter(id => id !== questId));
    };

    const handleOpenSelector = () => {
        setSelectedInSelector([...quests]);
        setSelectorOpened(true);
    };

    const handleSelectorSelect = (questIds: string[]) => {
        setSelectedInSelector(questIds);
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
                    <Text size="xs" fw={500}>任务列表</Text>
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
                            <Droppable droppableId="quest-list" direction="vertical">
                                {(provided: DroppableProvided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps}>
                                        {quests.map((questId, index) => {
                                            const questName = questNameMap[questId] || questId;
                                            return (
                                                <Draggable key={questId} draggableId={questId} index={index}>
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
                                                                    {questName !== questId && (
                                                                        <Text size="xs" c="dimmed" truncate>
                                                                            {questId}
                                                                        </Text>
                                                                    )}
                                                                </div>
                                                                <ActionIcon
                                                                    color="red"
                                                                    variant="subtle"
                                                                    size="sm"
                                                                    onClick={() => handleRemove(questId)}
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

