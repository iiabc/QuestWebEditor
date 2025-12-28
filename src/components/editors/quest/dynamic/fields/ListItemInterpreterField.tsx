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
    const [items, setItems] = useState<string[]>(['']);

    // 当 value prop 变化时，更新内部状态
    useEffect(() => {
        if (Array.isArray(value)) {
            setItems(value.length > 0 ? value : ['']);
        } else {
            setItems(['']);
        }
    }, [value]);

    // 更新值并通知父组件
    const updateItems = (newItems: string[]) => {
        setItems(newItems);
        const validItems = newItems.filter(item => item && item.trim() !== '');
        onChange(validItems.length > 0 ? validItems : undefined);
    };

    const handleItemChange = (index: number, newValue: string) => {
        const newItems = [...items];
        newItems[index] = newValue;
        updateItems(newItems);
    };

    const handleAddItem = () => {
        updateItems([...items, '']);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            updateItems(items.filter((_, i) => i !== index));
        } else {
            // 如果只有一个，清空它而不是删除
            updateItems(['']);
        }
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
                            disabled={items.length === 1 && !item}
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

