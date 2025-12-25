import { Stack, Badge, Group, Text } from '@mantine/core';
import { FormAddon, FormScript, FormInput } from '@/components/ui';

export const AGENT_TYPES = {
    // Quest Agents
    quest_accept: { 
        label: '任务接受之前', 
        tag: 'Quest Accept',
        description: '任务接受之前（包含任何可能的检测）。不代表任务已经接受，请勿实现任何不可逆的行为。返回的内容决定是否继续逻辑。' 
    },
    quest_accepted: { 
        label: '任务接受之后', 
        tag: 'Quest Accepted',
        description: '任务接受之后。' 
    },
    quest_accept_cancelled: { 
        label: '任务取消之后', 
        tag: 'Quest Accept Cancelled',
        description: '任务接受被取消之后（任何可能的方式）。' 
    },
    quest_fail: { 
        label: '任务失败之前', 
        tag: 'Quest Fail',
        description: '任务失败之前。不代表任务已经失败，请勿实现任何不可逆的行为。返回的内容决定是否继续逻辑。' 
    },
    quest_failed: { 
        label: '任务失败之后', 
        tag: 'Quest Failed',
        description: '任务失败之后。' 
    },
    quest_complete: { 
        label: '任务完成之前', 
        tag: 'Quest Complete',
        description: '任务完成之前。不代表任务已经完成，请勿实现任何不可逆的行为。返回的内容决定是否继续逻辑。' 
    },
    quest_completed: { 
        label: '任务完成之后', 
        tag: 'Quest Completed',
        description: '任务完成之后。' 
    },
    quest_restart: { 
        label: '任务重启之前', 
        tag: 'Quest Restart',
        description: '任务重启之前。不代表任务已经重启，请勿实现任何不可逆的行为。返回的内容决定是否继续逻辑。' 
    },
    quest_restarted: { 
        label: '任务重启之后', 
        tag: 'Quest Restarted',
        description: '任务重启之后。' 
    },

    // Task Agents
    task_continued: { 
        label: '条目继续之后', 
        tag: 'Task Continued',
        description: '条目继续之后。' 
    },
    task_restarted: { 
        label: '条目重置之后', 
        tag: 'Task Restarted',
        description: '条目重置之后。' 
    },
    task_completed: { 
        label: '条目完成之后', 
        tag: 'Task Completed',
        description: '条目完成之后。' 
    },

    // Conversation Agents
    begin: {
        label: '对话开始前',
        tag: 'Conversation Begin',
        description: '对话开始前执行。可用于初始化变量或检查条件。'
    },
    end: {
        label: '对话结束后',
        tag: 'Conversation End',
        description: '对话正常结束后执行。'
    },
    refuse: {
        label: '对话被拒绝时',
        tag: 'Conversation Refuse',
        description: '当对话条件不满足或被拒绝时执行。'
    },

    // QuestEngine Trigger Types
    accept: {
        label: '接受任务',
        tag: 'Accept',
        description: '玩家接受任务时执行的脚本。'
    },
    complete: {
        label: '完成条目',
        tag: 'Complete',
        description: '条目完成时执行的脚本。'
    },
    timeout: {
        label: '任务超时',
        tag: 'Timeout',
        description: '任务超时时执行的脚本。'
    },
    progress: {
        label: '进度更新',
        tag: 'Progress',
        description: '目标进度更新时执行的脚本。'
    },
    track: {
        label: '追踪配置',
        tag: 'Track',
        description: '目标追踪配置（动作和导航）。'
    }
};

interface AgentEditorProps {
    data: any;
    onUpdate: (newData: any) => void;
    types?: string[];
}

export function AgentEditor({ data, onUpdate, types = [] }: AgentEditorProps) {
    return (
        <Stack gap="md">
            {types.map(type => {
                const config = AGENT_TYPES[type as keyof typeof AGENT_TYPES] || { label: type, tag: type, description: `Script for ${type}` };
                
                // track 字段是对象，需要特殊处理
                if (type === 'track') {
                    return (
                        <FormAddon
                            key={type}
                            label={
                                <Group gap="xs">
                                    <Text span>{config.label}</Text>
                                    <Badge variant="light" color="gray" size="sm" tt="none">{config.tag}</Badge>
                                </Group>
                            }
                            description={config.description}
                            checked={!!data?.track}
                            onChange={(checked) => {
                                if (checked) {
                                    onUpdate({ 
                                        ...data, 
                                        track: { 
                                            action: '', 
                                            navigate: { title: '', location: '', adyeshach: '' } 
                                        } 
                                    });
                                } else {
                                    const { track, ...rest } = data || {};
                                    onUpdate(rest);
                                }
                            }}
                        >
                            <Stack gap="md">
                                <FormScript
                                    label="追踪动作"
                                    description="追踪时执行的动作脚本"
                                    height="200px"
                                    value={data?.track?.action || ''}
                                    onChange={(val) => onUpdate({ 
                                        ...data, 
                                        track: { 
                                            ...data?.track, 
                                            action: val || '' 
                                        } 
                                    })}
                                />
                                <Text size="sm" fw={500} mt="xs">导航配置</Text>
                                <FormInput
                                    label="导航标题"
                                    description="导航显示的标题"
                                    value={data?.track?.navigate?.title || ''}
                                    onChange={(e) => onUpdate({ 
                                        ...data, 
                                        track: { 
                                            ...data?.track, 
                                            navigate: {
                                                ...data?.track?.navigate,
                                                title: e.target.value || ''
                                            }
                                        } 
                                    })}
                                />
                                <FormInput
                                    label="位置"
                                    description="导航位置，格式：world x y z"
                                    value={data?.track?.navigate?.location || ''}
                                    onChange={(e) => onUpdate({ 
                                        ...data, 
                                        track: { 
                                            ...data?.track, 
                                            navigate: {
                                                ...data?.track?.navigate,
                                                location: e.target.value || ''
                                            }
                                        } 
                                    })}
                                />
                                <FormInput
                                    label="NPC ID"
                                    description="Adyeshach NPC ID（如果设置，将使用 NPC 位置作为导航目标）"
                                    value={data?.track?.navigate?.adyeshach || ''}
                                    onChange={(e) => onUpdate({ 
                                        ...data, 
                                        track: { 
                                            ...data?.track, 
                                            navigate: {
                                                ...data?.track?.navigate,
                                                adyeshach: e.target.value || ''
                                            }
                                        } 
                                    })}
                                />
                            </Stack>
                        </FormAddon>
                    );
                }
                
                // 其他字段是字符串
                return (
                    <FormAddon
                        key={type}
                        label={
                            <Group gap="xs">
                                <Text span>{config.label}</Text>
                                <Badge variant="light" color="gray" size="sm" tt="none">{config.tag}</Badge>
                            </Group>
                        }
                        description={config.description}
                        checked={typeof data?.[type] === 'string'}
                        onChange={(checked) => {
                            if (checked) {
                                onUpdate({ ...data, [type]: '' });
                            } else {
                                const { [type]: _, ...rest } = data || {};
                                onUpdate(rest);
                            }
                        }}
                    >
                        <FormScript
                            height="300px"
                            value={data?.[type] || ''}
                            onChange={(val) => onUpdate({ 
                                ...data, 
                                [type]: val 
                            })}
                        />
                    </FormAddon>
                );
            })}
        </Stack>
    );
}
