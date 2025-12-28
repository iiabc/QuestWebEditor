import { Textarea, TextareaProps, Group, Text, Badge } from '@mantine/core';

export function FormTextarea(props: TextareaProps) {
    const renderLabel = () => {
        if (typeof props.label === 'string') {
            const match = props.label.match(/^(.*?)\s*\((.*?)\)$/);
            if (match) {
                return (
                    <Group gap={8}>
                        <Text span size="sm" fw={500}>{match[1]}</Text>
                        <Badge size="xs" variant="light" color="gray" style={{ textTransform: 'none' }}>
                            {match[2]}
                        </Badge>
                    </Group>
                );
            }
        }
        return props.label;
    };

    // 如果 props 中指定了 minRows，使用它；否则默认 minRows={3}
    // 如果 props 中指定了 autosize，使用它；否则默认 autosize={true}
    // 确保支持换行：设置 resize="vertical" 和适当的样式
    // 注意：autosize 可能会影响换行，如果用户需要多行输入，建议禁用 autosize
    const { minRows = 3, autosize = true, ...restProps } = props;
    
    // 如果明确指定了 autosize={false}，则使用固定行数
    // 否则使用 autosize，但确保支持换行
    return (
        <Textarea 
            autosize={autosize} 
            minRows={minRows} 
            maxRows={autosize ? undefined : minRows * 3}
            resize="vertical"
            style={{ 
                whiteSpace: 'pre-wrap', 
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
            }}
            {...restProps} 
            label={props.label ? renderLabel() : undefined} 
        />
    );
}
