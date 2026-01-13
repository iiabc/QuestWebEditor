import { ScrollArea, Group, Text, ActionIcon, NavLink, Box, Menu } from '@mantine/core';
import { IconPlus, IconTrash, IconGripVertical, IconCopy, IconEdit, IconDotsVertical } from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { useState } from 'react';
import { FormInput, ContextMenu } from '@/components/ui';

interface QuestTaskListProps {
    tasks: Record<number | string, any>;
    activeTaskId: number | string | null;
    onSelect: (id: number | string) => void;
    onAdd: () => void;
    onDelete: (id: number | string) => void;
    onDuplicate: (id: number | string) => void;
    onReorder: (result: DropResult) => void;
    onRename: (oldId: number | string, newId: number | string) => void;
    width?: number;
}

export function QuestTaskList({ tasks, activeTaskId, onSelect, onAdd, onDelete, onDuplicate, onReorder, onRename, width = 250 }: QuestTaskListProps) {
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [editValue, setEditValue] = useState('');

    const startEditing = (id: number | string) => {
        setEditingId(id);
        setEditValue(String(id));
    };

    const finishEditing = () => {
        if (editingId !== null && editValue.trim()) {
            const newId = editValue.trim();
            // 如果新 ID 与旧 ID 不同，且新 ID 不为空，则重命名
            if (newId !== String(editingId) && newId.length > 0) {
                // 检查新 ID 是否已存在
                if (!tasks[newId]) {
                    onRename(editingId, newId);
                }
            }
        }
        setEditingId(null);
    };

    return (
        <div style={{ width, borderRight: '1px solid var(--mantine-color-dark-6)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--mantine-color-dark-8)' }}>
            <Group p="xs" justify="space-between" bg="var(--mantine-color-dark-7)">
                <Text size="xs" fw={700} tt="uppercase" c="dimmed">条目列表</Text>
                <ActionIcon variant="subtle" size="xs" onClick={onAdd}><IconPlus size={14} /></ActionIcon>
            </Group>
            <DragDropContext onDragEnd={onReorder}>
                <ScrollArea style={{ flex: 1 }}>
                    <Droppable droppableId="task-list" direction="vertical">
                        {(provided: DroppableProvided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                {Object.keys(tasks)
                                    .map((key) => {
                                        // 尝试转换为数字，如果失败则保持字符串
                                        const numKey = Number(key);
                                        return isNaN(numKey) ? key : numKey;
                                    })
                                    .sort((a, b) => {
                                        // 数字优先，然后按字符串排序
                                        if (typeof a === 'number' && typeof b === 'number') {
                                            return a - b;
                                        }
                                        if (typeof a === 'number') return -1;
                                        if (typeof b === 'number') return 1;
                                        return String(a).localeCompare(String(b));
                                    })
                                    .map((taskId, index) => (
                                    <Draggable key={String(taskId)} draggableId={String(taskId)} index={index}>
                                        {(provided: DraggableProvided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                style={{ ...provided.draggableProps.style }}
                                            >
                                                {editingId === taskId ? (
                                                    <Box p={4}>
                                                        <FormInput
                                                            size="xs"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.currentTarget.value)}
                                                            onBlur={finishEditing}
                                                            onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                                                            autoFocus
                                                            rightSectionWidth={0}
                                                        />
                                                    </Box>
                                                ) : (
                                                    <ContextMenu
                                                        menuItems={
                                                            <>
                                                                <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => startEditing(taskId)}>
                                                                    重命名
                                                                </Menu.Item>
                                                                <Menu.Item leftSection={<IconCopy size={14} />} onClick={() => onDuplicate(taskId)}>
                                                                    复制
                                                                </Menu.Item>
                                                                <Menu.Divider />
                                                                <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => onDelete(taskId)}>
                                                                    删除
                                                                </Menu.Item>
                                                            </>
                                                        }
                                                    >
                                                        <NavLink
                                                            label={`条目 ${taskId}`}
                                                            className="task-list-item"
                                                            leftSection={
                                                                <div {...provided.dragHandleProps} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', opacity: 0.5 }}>
                                                                    <IconGripVertical size={14} />
                                                                </div>
                                                            }
                                                            active={activeTaskId === taskId}
                                                            onClick={() => onSelect(taskId)}
                                                            variant="subtle"
                                                            rightSection={
                                                                <Menu shadow="md" width={200}>
                                                                    <Menu.Target>
                                                                        <ActionIcon className="task-list-actions" variant="subtle" size="xs" c="dimmed" onClick={(e) => e.stopPropagation()}>
                                                                            <IconDotsVertical size={14} />
                                                                        </ActionIcon>
                                                                    </Menu.Target>
                                                                    <Menu.Dropdown>
                                                                        <Menu.Item leftSection={<IconEdit size={14} />} onClick={(e) => { e.stopPropagation(); startEditing(taskId); }}>
                                                                            重命名
                                                                        </Menu.Item>
                                                                        <Menu.Item leftSection={<IconCopy size={14} />} onClick={(e) => { e.stopPropagation(); onDuplicate(taskId); }}>
                                                                            复制
                                                                        </Menu.Item>
                                                                        <Menu.Divider />
                                                                        <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={(e) => { e.stopPropagation(); onDelete(taskId); }}>
                                                                            删除
                                                                        </Menu.Item>
                                                                    </Menu.Dropdown>
                                                                </Menu>
                                                            }
                                                        />
                                                    </ContextMenu>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </ScrollArea>
            </DragDropContext>
        </div>
    );
}
