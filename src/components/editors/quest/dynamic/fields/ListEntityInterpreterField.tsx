import React, { useState, useEffect } from 'react';
import { Stack, Button, Box, Group, ActionIcon, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { EntityInterpreterField } from './EntityInterpreterField';

interface ListEntityInterpreterFieldProps {
    value: any;
    onChange: (value: any) => void;
    description?: string;
}

export const ListEntityInterpreterField: React.FC<ListEntityInterpreterFieldProps> = ({
    value,
    onChange,
    description
}) => {
    const [entities, setEntities] = useState<string[]>(['']);

    // 当 value prop 变化时，更新内部状态
    useEffect(() => {
        if (Array.isArray(value)) {
            setEntities(value.length > 0 ? value : ['']);
        } else {
            setEntities(['']);
        }
    }, [value]);

    // 更新值并通知父组件
    const updateEntities = (newEntities: string[]) => {
        setEntities(newEntities);
        const validEntities = newEntities.filter(entity => entity && entity.trim() !== '');
        onChange(validEntities.length > 0 ? validEntities : undefined);
    };

    const handleEntityChange = (index: number, newValue: string) => {
        const newEntities = [...entities];
        newEntities[index] = newValue;
        updateEntities(newEntities);
    };

    const handleAddEntity = () => {
        updateEntities([...entities, '']);
    };

    const handleRemoveEntity = (index: number) => {
        if (entities.length > 1) {
            updateEntities(entities.filter((_, i) => i !== index));
        } else {
            // 如果只有一个，清空它而不是删除
            updateEntities(['']);
        }
    };

    return (
        <Stack gap="xs">
            {description && (
                <Text size="xs" c="dimmed">{description}</Text>
            )}
            {entities.map((entity, index) => (
                <Box
                    key={index}
                    p="xs"
                    style={{
                        backgroundColor: 'var(--mantine-color-dark-6)',
                        borderRadius: 4,
                        border: '1px solid var(--mantine-color-dark-4)'
                    }}
                >
                    <Group gap="xs" align="flex-start">
                        <Text size="xs" c="dimmed" style={{ minWidth: 40, paddingTop: 4 }}>
                            #{index + 1}
                        </Text>
                        <div style={{ flex: 1 }}>
                            <EntityInterpreterField
                                value={entity}
                                onChange={(val) => handleEntityChange(index, val)}
                            />
                        </div>
                        <ActionIcon
                            color="red"
                            variant="subtle"
                            size="sm"
                            onClick={() => handleRemoveEntity(index)}
                            disabled={entities.length === 1 && !entity}
                        >
                            <IconTrash size={14} />
                        </ActionIcon>
                    </Group>
                </Box>
            ))}
            <Button
                size="xs"
                variant="light"
                leftSection={<IconPlus size={14} />}
                onClick={handleAddEntity}
                fullWidth
            >
                添加实体解释器
            </Button>
        </Stack>
    );
};

