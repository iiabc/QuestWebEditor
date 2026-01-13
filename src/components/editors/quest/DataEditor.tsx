import { Stack, Button, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { DataItem } from './DataItem';

export interface DataEditorProps {
    data: Record<string, any>;
    onChange: (data: Record<string, any>) => void;
    level?: number;
    path?: string;
}

/**
 * 数据编辑器组件
 * 支持编辑 Map<String, Any> 类型的数据
 * 支持字符串、字符串列表、嵌套对象
 */
export function DataEditor({ data, onChange, level = 0, path = '' }: DataEditorProps) {
    const items = Object.entries(data || {});

    // 添加新的键值对
    const handleAdd = () => {
        const newKey = `key_${Date.now()}`;
        const newData = { ...data, [newKey]: '' };
        onChange(newData);
    };

    // 更新键值对
    const handleItemChange = (oldKey: string, newKey: string, newValue: any) => {
        const newData = { ...data };
        
        // 如果键名改变了，需要删除旧键并添加新键
        if (oldKey !== newKey) {
            delete newData[oldKey];
            // 只有当新键名不为空时才添加
            if (newKey && newKey.trim().length > 0) {
                newData[newKey] = newValue;
            }
        } else {
            // 如果键名为空，删除该键
            if (!oldKey || oldKey.trim().length === 0) {
                delete newData[oldKey];
            } else {
                newData[oldKey] = newValue;
            }
        }

        // 如果值为 null 或 undefined，删除该键（但保留空字符串和空数组）
        if (newValue === null || newValue === undefined) {
            delete newData[newKey];
        }

        onChange(newData);
    };

    // 删除键值对
    const handleDelete = (key: string) => {
        const newData = { ...data };
        delete newData[key];
        onChange(newData);
    };

    return (
        <Stack gap="md">
            {items.length === 0 ? (
                <Text c="dimmed" size="sm" ta="center" py="md">
                    {level === 0 ? '暂无数据。点击下方按钮添加键值对。' : '暂无嵌套数据。'}
                </Text>
            ) : (
                items.map(([key, value]) => (
                    <DataItem
                        key={key}
                        keyName={key}
                        value={value}
                        onChange={(oldKey, newKey, newValue) => handleItemChange(oldKey, newKey, newValue)}
                        onDelete={() => handleDelete(key)}
                        level={level}
                        path={path}
                    />
                ))
            )}

            <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={handleAdd}
                size="sm"
            >
                {level === 0 ? '添加键值对' : '添加嵌套项'}
            </Button>
        </Stack>
    );
}

