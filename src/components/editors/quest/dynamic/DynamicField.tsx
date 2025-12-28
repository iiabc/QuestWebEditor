import React from 'react';
import { ObjectiveField } from '@/store/useApiStore';
import { Text, Box, Tooltip, useMantineColorScheme } from '@mantine/core';
import { LocationField } from './fields/LocationField';
import { LocationInterpreterField } from './fields/LocationInterpreterField';
import { VectorField } from './fields/VectorField';
import { BlockField } from './fields/BlockField';
import { EntityField } from './fields/EntityField';
import { EntityInterpreterField } from './fields/EntityInterpreterField';
import { ListEntityInterpreterField } from './fields/ListEntityInterpreterField';
import { ItemStackField } from './fields/ItemStackField';
import { ItemInterpreterField } from './fields/ItemInterpreterField';
import { ListItemInterpreterField } from './fields/ListItemInterpreterField';
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
        // 位置解释器字段：position, from, to 等字段使用位置解释器编辑器
        const isLocationInterpreterField = ['position', 'from', 'to'].includes(field.name);
        
        if (isLocationInterpreterField && field.pattern === 'String') {
            return (
                <Box p={8}>
                    <LocationInterpreterField value={currentValue} onChange={onChange} />
                </Box>
            );
        }
        
        // QuestEngine 中，凡是 List<String> 类型都应使用多行输入框
        const isListStringPattern = field.pattern === 'List<String>';
        const isItemListField = ['material', 'item', 'weapon', 'drops', 'matrix', 'item-main', 'item-off'].includes(field.name);
        const isEntityListField = ['entity', 'entity-hook', 'entity-main', 'entity-off'].includes(field.name);
        
        if (isListStringPattern || isItemListField || isEntityListField) {
            // 物品解释器列表：使用专门的编辑器
            if (isItemListField) {
                const description = field.description
                    ? `${field.description}（每行一个）`
                    : '物品解释器列表，支持格式如 minecraft:stone 或 minecraft -material stone -amount 2';
                
                return (
                    <Box p={8}>
                        <ListItemInterpreterField
                            value={value}
                            onChange={onChange}
                            description={description}
                        />
                    </Box>
                );
            }
            
            // 实体解释器列表：使用专门的编辑器
            if (isEntityListField) {
                const description = field.description
                    ? `${field.description}（每行一个）`
                    : '实体解释器列表，支持格式如 minecraft:zombie 或 minecraft -type zombie -name 录了';
                
                return (
                    <Box p={8}>
                        <ListEntityInterpreterField
                            value={value}
                            onChange={onChange}
                            description={description}
                        />
                    </Box>
                );
            }
            
            // 其他 List<String> 类型：使用普通的多行输入框
            const placeholder = '每行一个值，例如：\nvalue-1\nvalue-2';
            const description = field.description
                ? `${field.description}（每行一个）`
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
                // 使用实体解释器编辑器
                return (
                    <Box p={8}>
                        <EntityInterpreterField value={currentValue} onChange={onChange} />
                    </Box>
                );
            case 'ItemStack':
                // 使用物品解释器编辑器
                return (
                    <Box p={8}>
                        <ItemInterpreterField value={currentValue} onChange={onChange} />
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
