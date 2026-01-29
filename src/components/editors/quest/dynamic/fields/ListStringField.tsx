import React from 'react';
import { DebouncedTextarea } from '@/components/ui/DebouncedInput';
import { Text, Stack } from '@mantine/core';

interface ListStringFieldProps {
    value: any;
    onChange: (value: any) => void;
    placeholder?: string;
    description?: string;
}

export const ListStringField: React.FC<ListStringFieldProps> = ({
    value,
    onChange,
    placeholder,
    description
}) => {
    // 将数组转换为字符串（每行一个）
    const stringValue = Array.isArray(value) 
        ? value.join('\n') 
        : (value || '');

    const handleChange = (val: string) => {
        if (!val || val.trim() === '') {
            onChange(undefined);
            return;
        }
        
        // 将字符串按行分割，过滤空行
        const lines = val
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        onChange(lines.length > 0 ? lines : undefined);
    };

    return (
        <Stack gap={4}>
            {description && (
                <Text size="xs" c="dimmed">{description}</Text>
            )}
            <DebouncedTextarea
                value={stringValue}
                onChange={handleChange}
                placeholder={placeholder || ''}
                autosize
                minRows={2}
                maxRows={10}
                size="xs"
                variant="filled"
                debounceMs={800}
            />
        </Stack>
    );
};

