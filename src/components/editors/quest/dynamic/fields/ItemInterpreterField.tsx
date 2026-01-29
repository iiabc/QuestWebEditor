import React, { useEffect, useState, useMemo } from 'react';
import { Group, ActionIcon, Stack, Text, Button, NumberInput, Select } from '@mantine/core';
import { IconPlus, IconTrash, IconSettings } from '@tabler/icons-react';
import { DebouncedTextInput } from '@/components/ui/DebouncedInput';

interface ItemInterpreterFieldProps {
    value: string;
    onChange: (value: string) => void;
}

interface Property {
    key: string;
    value: string;
}

// API 配置：每个 API 支持的属性
const ITEM_API_CONFIG: Record<string, { label: string; properties: Array<{ value: string; label: string; type: 'string' | 'number' }> }> = {
    minecraft: {
        label: 'Minecraft',
        properties: [
            { value: 'material', label: 'Material (材料)', type: 'string' },
            { value: 'name', label: 'Name (名称)', type: 'string' },
            { value: 'cmd', label: 'CustomModelData (自定义模型数据)', type: 'number' },
            { value: 'lore_key', label: 'Lore Key (Lore 关键词)', type: 'string' },
            { value: 'amount', label: 'Amount (数量)', type: 'number' },
        ]
    },
    MMOItems: {
        label: 'MMOItems',
        properties: [
            { value: 'id', label: 'ID (物品标识符)', type: 'string' },
            { value: 'amount', label: 'Amount (数量)', type: 'number' },
        ]
    },
    ItemsAdder: {
        label: 'ItemsAdder',
        properties: [
            { value: 'id', label: 'ID (物品标识符)', type: 'string' },
            { value: 'amount', label: 'Amount (数量)', type: 'number' },
        ]
    },
    MythicItem: {
        label: 'MythicItem',
        properties: [
            { value: 'id', label: 'ID (物品标识符)', type: 'string' },
        ]
    },
    SmcCore: {
        label: 'SmcCore',
        properties: [
            { value: 'id', label: 'ID (物品标识符)', type: 'string' },
            { value: 'amount', label: 'Amount (数量)', type: 'number' },
        ]
    },
};

// API 选项列表
const ITEM_API_OPTIONS = Object.keys(ITEM_API_CONFIG).map(key => ({
    value: key,
    label: ITEM_API_CONFIG[key].label
}));

export const ItemInterpreterField: React.FC<ItemInterpreterFieldProps> = ({ value, onChange }) => {
    const [namespace, setNamespace] = useState('minecraft');
    const [properties, setProperties] = useState<Property[]>([]);
    const [opened, setOpened] = useState(false);

    // 根据选择的 API 获取对应的属性选项
    const availableProperties = useMemo(() => {
        return ITEM_API_CONFIG[namespace]?.properties || [];
    }, [namespace]);

    // 解析 Demand 格式: namespace -key1 value1 -key2 value2
    useEffect(() => {
        if (!value) {
            setNamespace('minecraft');
            setProperties([]);
            return;
        }

        const strVal = String(value).trim();
        const parts = strVal.split(/\s+-/).map(p => p.trim()).filter(p => p);
        
        if (parts.length > 0) {
            // 第一部分是 namespace，检查是否在配置中
            const parsedNamespace = parts[0];
            const validNamespace = ITEM_API_CONFIG[parsedNamespace] ? parsedNamespace : 'minecraft';
            setNamespace(validNamespace);
            
            // 后续部分是 -key value
            const newProperties: Property[] = [];
            for (let i = 1; i < parts.length; i++) {
                const part = parts[i];
                const spaceIndex = part.indexOf(' ');
                if (spaceIndex > 0) {
                    const key = part.substring(0, spaceIndex).trim();
                    const val = part.substring(spaceIndex + 1).trim();
                    newProperties.push({ key, value: val });
                } else {
                    // 没有值，只有 key
                    newProperties.push({ key: part, value: '' });
                }
            }
            setProperties(newProperties);
        } else {
            // 尝试解析简化格式: namespace:value 或直接 value
            if (strVal.includes(':')) {
                const [ns, ...rest] = strVal.split(':');
                // 检查 namespace 是否在配置中
                const validNamespace = ITEM_API_CONFIG[ns] ? ns : 'minecraft';
                setNamespace(validNamespace);
                if (rest.length > 0) {
                    const firstProp = ITEM_API_CONFIG[validNamespace]?.properties[0]?.value || 'material';
                    setProperties([{ key: firstProp, value: rest.join(':') }]);
                }
            } else {
                // 默认使用 minecraft
                setNamespace('minecraft');
                const firstProp = ITEM_API_CONFIG['minecraft']?.properties[0]?.value || 'material';
                setProperties([{ key: firstProp, value: strVal }]);
            }
        }
    }, [value]);

    // 生成 Demand 格式
    const updateValue = () => {
        if (!namespace) {
            onChange('');
            return;
        }

        if (properties.length === 0) {
            onChange(namespace);
            return;
        }

        const propertyStrings = properties
            .filter(p => p.key && p.value)
            .map(p => `-${p.key} ${p.value}`);
        
        const result = [namespace, ...propertyStrings].join(' ');
        onChange(result);
    };

    useEffect(() => {
        const timer = setTimeout(updateValue, 100);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [namespace, properties]);

    const handleAddProperty = () => {
        const firstProperty = availableProperties[0]?.value || '';
        setProperties([...properties, { key: firstProperty, value: '' }]);
    };

    const handleRemoveProperty = (index: number) => {
        setProperties(properties.filter((_, i) => i !== index));
    };

    const handlePropertyChange = (index: number, field: keyof Property, val: string) => {
        const newProperties = [...properties];
        newProperties[index] = { ...newProperties[index], [field]: val };
        setProperties(newProperties);
    };

    const hasProperties = properties.length > 0;

    return (
        <Stack gap="xs">
            <Group grow>
                <Select
                    data={ITEM_API_OPTIONS}
                    value={namespace}
                    onChange={(val) => {
                        if (val) {
                            setNamespace(val);
                            // 切换 API 时，清空不兼容的属性
                            const newApiConfig = ITEM_API_CONFIG[val];
                            if (newApiConfig) {
                                const validKeys = new Set(newApiConfig.properties.map(p => p.value));
                                setProperties(properties.filter(p => validKeys.has(p.key)));
                            }
                        }
                    }}
                    size="xs"
                    variant="filled"
                    allowDeselect={false}
                    style={{ flex: 1 }}
                    searchable
                />
                <ActionIcon
                    variant={hasProperties ? "light" : "subtle"}
                    color={hasProperties ? "blue" : "gray"}
                    size="md"
                    onClick={() => setOpened((o) => !o)}
                >
                    <IconSettings size={16} />
                </ActionIcon>
            </Group>
            
            {opened && (
                <Stack gap="xs" p="xs" style={{ backgroundColor: 'var(--mantine-color-dark-6)', borderRadius: 4 }}>
                    <Group gap="xs">
                        <Text size="xs" fw={500}>属性</Text>
                        <Text size="xs" c="dimmed">Properties</Text>
                    </Group>
                    {properties.map((prop, index) => {
                        const propConfig = availableProperties.find(p => p.value === prop.key);
                        const isNumber = propConfig?.type === 'number';
                        
                        return (
                            <Group key={index} gap="xs" align="flex-start">
                                <Select
                                    data={availableProperties.map(p => ({ value: p.value, label: p.label }))}
                                    value={prop.key}
                                    onChange={(val) => handlePropertyChange(index, 'key', val || availableProperties[0]?.value || '')}
                                    size="xs"
                                    style={{ width: 200 }}
                                    allowDeselect={false}
                                    comboboxProps={{ withinPortal: false }}
                                    searchable
                                />
                                {isNumber ? (
                                    <NumberInput
                                        placeholder="Value"
                                        value={prop.value ? Number(prop.value) : ''}
                                        onChange={(val) => handlePropertyChange(index, 'value', val === '' ? '' : String(val))}
                                        size="xs"
                                        style={{ flex: 1 }}
                                        hideControls
                                    />
                                ) : (
                                    <DebouncedTextInput
                                        placeholder="Value"
                                        value={prop.value}
                                        onChange={(val) => handlePropertyChange(index, 'value', val)}
                                        size="xs"
                                        style={{ flex: 1 }}
                                        debounceMs={800}
                                    />
                                )}
                                <ActionIcon
                                    color="red"
                                    variant="subtle"
                                    size="sm"
                                    onClick={() => handleRemoveProperty(index)}
                                >
                                    <IconTrash size={14} />
                                </ActionIcon>
                            </Group>
                        );
                    })}
                    <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconPlus size={12} />}
                        onClick={handleAddProperty}
                        fullWidth
                    >
                        添加属性
                    </Button>
                </Stack>
            )}
        </Stack>
    );
};

