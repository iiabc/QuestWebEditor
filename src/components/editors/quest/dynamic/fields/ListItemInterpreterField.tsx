import React, { useState, useEffect } from 'react';
import { Stack, Button, Box, Group, ActionIcon, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { ItemInterpreterField } from './ItemInterpreterField';

interface ListItemInterpreterFieldProps {
    value: any;
    onChange: (value: any) => void;
    description?: string;
}

export const ListItemInterpreterField: React.FC<ListItemInterpreterFieldProps> = ({
    value,
    onChange,
    description
}) => {
    const [items, setItems] = useState<string[]>([]);

    useEffect(() => {
        if (Array.isArray(value) && value.length > 0) {
            setItems(value);
        } else {
            setItems([]);
        }
    }, [value]);

    const applyChange = (newItems: string[]) => {
        setItems(newItems);
        const valid = newItems.filter(item => item != null && String(item).trim() !== '');
        onChange(valid.length > 0 ? valid : undefined);
    };

    const handleItemChange = (index: number, newValue: string) => {
        const next = [...items];
        next[index] = newValue;
        applyChange(next);
    };

    const handleAddItem = () => {
        setItems([...items, '']);
    };

    const handleRemoveItem = (index: number) => {
        applyChange(items.filter((_, i) => i !== index));
    };

    return (
        <Stack gap="xs">
            {description && (
                <Text size="xs" c="dimmed">{description}</Text>
            )}
            {items.map((item, index) => (
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
                            <ItemInterpreterField
                                value={item}
                                onChange={(val) => handleItemChange(index, val)}
                            />
                        </div>
                        <ActionIcon
                            color="red"
                            variant="subtle"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
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
                onClick={handleAddItem}
                fullWidth
            >
                添加物品解释器
            </Button>
        </Stack>
    );
};

