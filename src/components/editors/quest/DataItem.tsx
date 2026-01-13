import { Card, Group, TextInput, NumberInput, Select, ActionIcon, Badge, Collapse, Box, Textarea, Stack, Text } from '@mantine/core';
import { IconTrash, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useState } from 'react';
import { DataEditor } from './DataEditor';

export type DataValueType = 'string' | 'number' | 'list' | 'object';

export interface DataValue {
    type: DataValueType;
    value: string | string[] | Record<string, any>;
}

export interface DataItemProps {
    keyName: string;
    value: any;
    onChange: (oldKey: string, newKey: string, value: any) => void;
    onDelete: () => void;
    level?: number;
    path?: string;
}

/**
 * 检测值的类型
 */
function detectValueType(value: any): DataValueType {
    if (value === null || value === undefined) {
        return 'string';
    }
    if (Array.isArray(value)) {
        // 检查是否是字符串数组
        if (value.length === 0 || typeof value[0] === 'string') {
            return 'list';
        }
        // 其他数组类型暂时当作字符串处理
        return 'string';
    }
    if (typeof value === 'object') {
        return 'object';
    }
    // 检查是否是数字
    if (typeof value === 'number') {
        return 'number';
    }
    // 检查字符串是否可以解析为数字
    if (typeof value === 'string') {
        const trimmed = value.trim();
        // 如果字符串是纯数字（包括小数），且不是空字符串，则可能是数字
        if (trimmed !== '' && /^-?\d*\.?\d+$/.test(trimmed)) {
            // 但如果是多行文本，应该是字符串
            if (!trimmed.includes('\n')) {
                return 'number';
            }
        }
    }
    return 'string';
}

/**
 * 将值转换为指定类型
 */
function convertValue(value: any, targetType: DataValueType): any {
    if (targetType === 'string') {
        if (Array.isArray(value)) {
            return value.join('\n');
        }
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value, null, 2);
        }
        if (typeof value === 'number') {
            return String(value);
        }
        return String(value || '');
    }
    if (targetType === 'number') {
        if (typeof value === 'string') {
            const num = parseFloat(value.trim());
            return isNaN(num) ? 0 : num;
        }
        if (typeof value === 'number') {
            return value;
        }
        if (Array.isArray(value)) {
            return 0;
        }
        return 0;
    }
    if (targetType === 'list') {
        if (typeof value === 'string') {
            // 过滤空行
            return value.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
        }
        if (Array.isArray(value)) {
            // 过滤空行并转换为字符串
            return value
                .map(v => String(v).trim())
                .filter(v => v.length > 0);
        }
        return [];
    }
    if (targetType === 'object') {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return {};
            }
        }
        if (Array.isArray(value)) {
            return {};
        }
        if (typeof value === 'object' && value !== null) {
            return value;
        }
        return {};
    }
    return value;
}

export function DataItem({ keyName, value, onChange, onDelete, level = 0, path = '' }: DataItemProps) {
    const [isExpanded, setIsExpanded] = useState(level === 0);
    const currentType = detectValueType(value);
    const [selectedType, setSelectedType] = useState<DataValueType>(currentType);
    const currentPath = path ? `${path}.${keyName}` : keyName;

    // 当类型改变时，转换值
    const handleTypeChange = (newType: DataValueType) => {
        setSelectedType(newType);
        const convertedValue = convertValue(value, newType);
        onChange(keyName, keyName, convertedValue);
    };

    // 处理值的变化
    const handleValueChange = (newValue: any) => {
        onChange(keyName, keyName, newValue);
    };

    const isObject = selectedType === 'object';
    const indent = level * 16;

    return (
        <Card
            withBorder
            padding="md"
            style={{
                marginLeft: indent,
                borderColor: isObject && isExpanded ? 'var(--mantine-color-blue-6)' : undefined,
                transition: 'border-color 0.2s',
                backgroundColor: level > 0 ? 'var(--mantine-color-dark-7)' : undefined
            }}
        >
            <Stack gap="sm">
                {/* Header */}
                <Group justify="space-between" wrap="nowrap">
                    <Group gap="xs" style={{ flex: 1 }}>
                        {isObject && (
                            <ActionIcon
                                variant="subtle"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                            </ActionIcon>
                        )}
                        <TextInput
                            placeholder="键名"
                            value={keyName}
                            onChange={(e) => {
                                const newKey = e.currentTarget.value;
                                if (newKey !== keyName) {
                                    // 触发键名变化
                                    onChange(keyName, newKey, value);
                                }
                            }}
                            style={{ flex: 1, minWidth: 150 }}
                            size="sm"
                        />
                        <Select
                            value={selectedType}
                            onChange={(val) => val && handleTypeChange(val as DataValueType)}
                            data={[
                                { value: 'string', label: '字符串' },
                                { value: 'number', label: '数字' },
                                { value: 'list', label: '列表' },
                                { value: 'object', label: '对象' }
                            ]}
                            size="sm"
                            style={{ width: 100 }}
                        />
                        <Badge
                            variant="light"
                            color={
                                selectedType === 'string' ? 'blue' :
                                selectedType === 'number' ? 'cyan' :
                                selectedType === 'list' ? 'green' :
                                'orange'
                            }
                        >
                            {selectedType === 'string' ? '字符串' :
                             selectedType === 'number' ? '数字' :
                             selectedType === 'list' ? '列表' :
                             '对象'}
                        </Badge>
                        {path && (
                            <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                {currentPath}
                            </Text>
                        )}
                    </Group>
                    <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={onDelete}
                    >
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>

                {/* Value Editor */}
                <Collapse in={!isObject || isExpanded}>
                    <Box pt="sm">
                        {selectedType === 'string' && (
                            <TextInput
                                placeholder="输入字符串值"
                                value={typeof value === 'string' ? value : String(value || '')}
                                onChange={(e) => handleValueChange(e.currentTarget.value)}
                                size="sm"
                            />
                        )}

                        {selectedType === 'number' && (
                            <NumberInput
                                placeholder="输入数字值"
                                value={typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) || 0 : 0)}
                                onChange={(val) => handleValueChange(val !== '' && val !== null && val !== undefined ? Number(val) : 0)}
                                size="sm"
                            />
                        )}

                        {selectedType === 'list' && (
                            <Textarea
                                placeholder="每行一个值"
                                value={Array.isArray(value) ? value.join('\n') : ''}
                                onChange={(e) => {
                                    // 保留所有行，包括空行（用户可能正在输入）
                                    // 只在最终保存时过滤空行
                                    const lines = e.currentTarget.value.split('\n');
                                    handleValueChange(lines);
                                }}
                                onBlur={(e) => {
                                    // 失去焦点时，过滤掉空行
                                    const lines = e.currentTarget.value
                                        .split('\n')
                                        .map(line => line.trim())
                                        .filter(line => line.length > 0);
                                    handleValueChange(lines);
                                }}
                                autosize
                                minRows={2}
                                maxRows={10}
                                size="sm"
                            />
                        )}

                        {selectedType === 'object' && (
                            <Box
                                style={{
                                    border: '1px solid var(--mantine-color-dark-5)',
                                    borderRadius: 4,
                                    padding: 12,
                                    backgroundColor: 'var(--mantine-color-dark-8)'
                                }}
                            >
                                <DataEditor
                                    data={typeof value === 'object' && value !== null && !Array.isArray(value)
                                        ? value
                                        : {}}
                                    onChange={(newData) => handleValueChange(newData)}
                                    level={level + 1}
                                    path={currentPath}
                                />
                            </Box>
                        )}
                    </Box>
                </Collapse>
            </Stack>
        </Card>
    );
}

