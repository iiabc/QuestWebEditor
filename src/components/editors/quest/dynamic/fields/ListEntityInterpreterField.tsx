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
    const [entities, setEntities] = useState<string[]>([]);

    useEffect(() => {
        if (Array.isArray(value) && value.length > 0) {
            setEntities(value);
        } else {
            setEntities([]);
        }
    }, [value]);

    const applyChange = (newEntities: string[]) => {
        setEntities(newEntities);
        const valid = newEntities.filter(e => e != null && String(e).trim() !== '');
        onChange(valid.length > 0 ? valid : undefined);
    };

    const handleEntityChange = (index: number, newValue: string) => {
        const next = [...entities];
        next[index] = newValue;
        applyChange(next);
    };

    const handleAddEntity = () => {
        setEntities([...entities, '']);
    };

    const handleRemoveEntity = (index: number) => {
        applyChange(entities.filter((_, i) => i !== index));
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

