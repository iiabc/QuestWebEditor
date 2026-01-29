import { Stack, Badge, Group, Text } from '@mantine/core';
import { FormAddon, FormScript } from '@/components/ui';
import { TrackNavigateForm } from './TrackNavigateForm';

export const AGENT_TYPES = {
    quest_accept: { label: '任务接受之前', tag: 'Quest Accept', description: '' },
    quest_accepted: { label: '任务接受之后', tag: 'Quest Accepted', description: '' },
    quest_accept_cancelled: { label: '任务取消之后', tag: 'Quest Accept Cancelled', description: '' },
    quest_fail: { label: '任务失败之前', tag: 'Quest Fail', description: '' },
    quest_failed: { label: '任务失败之后', tag: 'Quest Failed', description: '' },
    quest_complete: { label: '任务完成之前', tag: 'Quest Complete', description: '' },
    quest_completed: { label: '任务完成之后', tag: 'Quest Completed', description: '' },
    quest_restart: { label: '任务重启之前', tag: 'Quest Restart', description: '' },
    quest_restarted: { label: '任务重启之后', tag: 'Quest Restarted', description: '' },
    task_continued: { label: '条目继续之后', tag: 'Task Continued', description: '' },
    task_restarted: { label: '条目重置之后', tag: 'Task Restarted', description: '' },
    task_completed: { label: '条目完成之后', tag: 'Task Completed', description: '' },
    begin: { label: '对话开始前', tag: 'Conversation Begin', description: '' },
    end: { label: '对话结束后', tag: 'Conversation End', description: '' },
    refuse: { label: '对话被拒绝时', tag: 'Conversation Refuse', description: '' },
    accept: { label: '接受任务', tag: 'Accept', description: '' },
    complete: { label: '完成条目', tag: 'Complete', description: '' },
    timeout: { label: '任务超时', tag: 'Timeout', description: '' },
    progress: { label: '进度更新', tag: 'Progress', description: '' },
    track: { label: '追踪配置', tag: 'Track', description: '' },
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
                                        track: { action: '', navigate: { title: '', location: '', adyeshach: '' } },
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
                                    description=""
                                    height="200px"
                                    value={data?.track?.action ?? ''}
                                    onChange={(val) => onUpdate({
                                        ...data,
                                        track: { ...data?.track, action: val ?? '' },
                                    })}
                                />
                                <Text size="sm" fw={500} mt="xs">导航配置</Text>
                                <TrackNavigateForm
                                    value={data?.track?.navigate ?? { title: '', location: '', adyeshach: '' }}
                                    onChange={(nav) => onUpdate({
                                        ...data,
                                        track: { ...data?.track, navigate: nav },
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
