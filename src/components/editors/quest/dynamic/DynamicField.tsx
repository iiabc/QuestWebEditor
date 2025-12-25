import React from 'react';
import { ObjectiveField } from '@/store/useApiStore';
import { Text, Box, Tooltip, useMantineColorScheme } from '@mantine/core';
import { LocationField } from './fields/LocationField';
import { VectorField } from './fields/VectorField';
import { BlockField } from './fields/BlockField';
import { EntityField } from './fields/EntityField';
import { ItemStackField } from './fields/ItemStackField';
import { StringField } from './fields/StringField';
import { BooleanField } from './fields/BooleanField';
import { NumberField } from './fields/NumberField';
import { ListStringField } from './fields/ListStringField';

interface DynamicFieldProps {
    field: ObjectiveField;
    value: any;
    onChange: (value: any) => void;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({ field, value, onChange }) => {
    const currentValue = value === undefined || value === null ? '' : value;
    const { colorScheme } = useMantineColorScheme();

    const renderInput = () => {
        // QuestEngine 中，凡是 List<String> 类型都应使用多行输入框
        const isListStringPattern = field.pattern === 'List<String>';
        const isItemListField = ['material', 'item', 'weapon', 'drops', 'matrix', 'item-main', 'item-off'].includes(field.name);
        const isEntityListField = ['entity', 'entity-hook', 'entity-main', 'entity-off'].includes(field.name);
        
        if (isListStringPattern || isItemListField || isEntityListField) {
            const placeholder = isItemListField
                ? '每行一个物品解释器，例如：\nminecraft:stone\nminecraft:diamond'
                : isEntityListField
                    ? '每行一个实体解释器，例如：\nminecraft:zombie\nminecraft:skeleton'
                    : '每行一个值，例如：\nvalue-1\nvalue-2';

            const description = field.description
                ? `${field.description}（每行一个）`
                : isItemListField
                    ? '物品解释器列表，支持格式如 minecraft:stone 或 minecraft:diamond[damage=10]'
                    : isEntityListField
                        ? '实体解释器列表，支持格式如 minecraft:zombie 或 minecraft:skeleton[health=20]'
                        : undefined;

            return (
                <Box p={8}>
                    <ListStringField 
                        value={value} 
                        onChange={onChange}
                        placeholder={placeholder}
                        description={description}
                    />
                </Box>
            );
        }
        
        switch (field.pattern) {
            case 'Boolean':
                return <BooleanField value={value} onChange={onChange} />;
            case 'Number':
                return (
                    <Box p={8}>
                        <NumberField value={value} onChange={onChange} />
                    </Box>
                );
            case 'Location':
                return (
                    <Box p={8}>
                        <LocationField value={currentValue} onChange={onChange} />
                    </Box>
                );
            case 'Vector':
                return (
                    <Box p={8}>
                        <VectorField value={currentValue} onChange={onChange} />
                    </Box>
                );
            case 'Block':
                return (
                    <Box p={8}>
                        <BlockField value={currentValue} onChange={onChange} />
                    </Box>
                );
            case 'Entity':
                // 如果字段名不是 'entity'，使用单个实体字段
                return (
                    <Box p={8}>
                        <EntityField value={currentValue} onChange={onChange} />
                    </Box>
                );
            case 'ItemStack':
                // 如果字段名不在物品列表字段中，使用单个物品字段
                return (
                    <Box p={8}>
                        <ItemStackField value={currentValue} onChange={onChange} />
                    </Box>
                );
            default:
                return (
                    <Box p={8}>
                        <StringField value={value} onChange={onChange} />
                    </Box>
                );
        }
    };

    return (
        <div className="flex items-stretch border-b border-(--mantine-color-dark-4) last:border-b-0">
            <Tooltip
                label={field.description}
                position="right"
                withArrow
                disabled={!field.description}
                multiline
                maw={320}
                openDelay={300}
                transitionProps={{ transition: 'fade', duration: 200 }}
                styles={{
                    tooltip: {
                        backgroundColor: colorScheme === 'dark' ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-0)',
                        color: colorScheme === 'dark' ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-dark-9)',
                        fontSize: '13px',
                        padding: '10px 14px',
                        lineHeight: '1.5',
                        border: colorScheme === 'dark' ? '1px solid var(--mantine-color-dark-3)' : '1px solid var(--mantine-color-gray-3)',
                        boxShadow: colorScheme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }
                }}
            >
                <div className="w-[140px] shrink-0 px-3 py-2 border-r border-(--mantine-color-dark-4) bg-(--mantine-color-dark-8) flex flex-col justify-center">
                    <Text size="sm" fw={500} lh={1.2} className="dynamic-field-label" c="var(--mantine-color-gray-3)" style={{ wordBreak: 'break-word' }}>
                        {field.name}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4} style={{ fontSize: 10, fontFamily: 'monospace' }}>
                        {field.pattern}
                    </Text>
                </div>
            </Tooltip>
            <div className="flex-1 flex items-center min-w-0 bg-(--mantine-color-dark-7) hover:bg-(--mantine-color-dark-6) transition-colors">
                <div className="w-full">
                    {renderInput()}
                </div>
            </div>
        </div>
    );
};
