import { Tabs, Box, ScrollArea, Stack, Text, Title, Badge, Group } from '@mantine/core';
import { IconTarget, IconPuzzle, IconScript } from '@tabler/icons-react';
import { DynamicSection } from './dynamic/DynamicSection';
import { FormSection, AnimatedTabs } from '@/components/ui';
import { AgentEditor } from './AgentEditor';
import { useApiStore } from '@/store/useApiStore';
import { ApiSearchSelect, parseApiValue } from '@/components/common/ApiSearchSelect';
import { PreAddon } from './addons/PreAddon';
import { ProgressAddon } from './addons/ProgressAddon';

interface QuestDetailProps {
    taskId: number | string;
    taskData: any;
    onUpdate: (newData: any) => void;
    availableObjectives?: Record<string | number, any>;
}

export function QuestDetail({ taskId, taskData, onUpdate, availableObjectives }: QuestDetailProps) {
    const { apiData, getObjective, recordUsage } = useApiStore();

    // QuestEngine 格式：event 字段存储事件类型
    // event 为空字符串表示永不完成目标
    // 从 taskData.event 中提取 plugin 和 id
    let currentEventValue: string | undefined = undefined;
    let currentDefinition = null;

    // 合并 condition 和 goal 为 node（QuestEngine 格式）
    const currentNode = taskData.node || {};

    if (taskData.event && taskData.event !== '') {
        // 检查是否是新格式 "plugin:id"
        const parsed = parseApiValue(taskData.event);
        if (parsed) {
            // 新格式
            currentEventValue = taskData.event;
            currentDefinition = getObjective(parsed.plugin, parsed.id);
        } else {
            // 旧格式，只有 id，尝试在所有 plugin 中查找
            for (const [pluginName, pluginApi] of Object.entries(apiData)) {
                if (pluginApi.objective && pluginApi.objective[taskData.event]) {
                    currentEventValue = `${pluginName}:${taskData.event}`;
                    currentDefinition = pluginApi.objective[taskData.event];
                    break;
                }
            }
        }
    }

    // 将 params 信息合并到 node 字段中
    const enrichFieldsWithParams = (fields: any[], params?: any[]) => {
        if (!params || params.length === 0) return fields;

        return fields.map(field => {
            const param = params.find(p => p.name === field.name);
            if (param && param.description) {
                return {
                    ...field,
                    description: param.description
                };
            }
            return field;
        });
    };

    // 合并 condition 和 goal 字段用于显示
    const allNodeFields = currentDefinition
        ? [
            ...enrichFieldsWithParams(currentDefinition.condition || [], currentDefinition.params),
            ...enrichFieldsWithParams(currentDefinition.goal || [], currentDefinition.params)
        ]
        : [];

    return (
        <AnimatedTabs
            defaultValue="objective"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            tabs={[
                { value: 'objective', label: '目标配置', icon: <IconTarget size={14} /> },
                { value: 'addons', label: '组件配置', icon: <IconPuzzle size={14} /> },
                { value: 'agent', label: '事件触发器', icon: <IconScript size={14} /> }
            ]}
        >
            <ScrollArea style={{ flex: 1 }}>
                <Box p="md">
                    <Tabs.Panel value="objective" className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <Stack gap="md">
                            <FormSection>
                                <Title order={5} mb="sm">事件类型</Title>
                                <ApiSearchSelect
                                    type="objective"
                                    value={taskData.event === '' ? '__never_complete__' : currentEventValue}
                                    onChange={(value, item) => {
                                        // 处理"永不完成"选项（空字符串）
                                        if (value === '') {
                                            onUpdate({
                                                ...taskData,
                                                event: '',
                                                node: {}
                                            });
                                            return;
                                        }

                                        if (value && item) {
                                            // 记录使用频率
                                            recordUsage(item.plugin, item.id, 'objective');

                                            // 使用 id 作为 event 值（QuestEngine 格式）
                                            const eventId = item.id;
                                            onUpdate({
                                                ...taskData,
                                                event: eventId,
                                                node: {}
                                            });
                                        } else {
                                            onUpdate({ ...taskData, event: undefined, node: {} });
                                        }
                                    }}
                                    placeholder="搜索…"
                                />
                            </FormSection>

                            {/* 永不完成目标：event 为空时不显示 node 配置 */}
                            {taskData.event === '' ? (
                                <FormSection>
                                    <Text c="dimmed" size="sm" ta="center" py="md">
                                        永不完成目标：此目标永远不会完成，用于显示信息或触发脚本。
                                    </Text>
                                </FormSection>
                            ) : currentDefinition ? (
                                <FormSection>
                                    <Group mb="sm" gap="xs">
                                        <Title order={5}>节点配置</Title>
                                        <Badge variant="light" color="gray">Node</Badge>
                                    </Group>
                                    {allNodeFields.length > 0 ? (
                                        <DynamicSection
                                            fields={allNodeFields}
                                            data={currentNode}
                                            onChange={(newNode) => {
                                                // 更新时直接设置 node 字段（QuestEngine 格式）
                                                onUpdate({ ...taskData, node: newNode });
                                            }}
                                        />
                                    ) : (
                                        <Text c="dimmed" size="sm">此事件类型没有可配置的节点参数。</Text>
                                    )}
                                </FormSection>
                            ) : (
                                <Text c="dimmed" ta="center" py="xl">请选择一个事件类型以配置详情。</Text>
                            )}
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="addons" className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <Stack gap="md">
                            <Title order={5}>组件配置</Title>

                            {/* Objective 内置 Addon 组件（编程式） */}
                            <PreAddon
                                addon={taskData.addon}
                                onChange={(newAddon) => onUpdate({ ...taskData, addon: newAddon })}
                                scope="objective"
                                availableObjectives={availableObjectives}
                                currentObjectiveId={taskId}
                            />

                            <ProgressAddon
                                addon={taskData.addon}
                                onChange={(newAddon) => onUpdate({ ...taskData, addon: newAddon })}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="agent" className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <Stack gap="md">
                            <Title order={5}>事件触发器</Title>
                            <AgentEditor
                                data={taskData.agent || {}}
                                onUpdate={(newAgent) => onUpdate({ ...taskData, agent: newAgent })}
                                types={['complete', 'timeout', 'progress', 'track']}
                            />
                        </Stack>
                    </Tabs.Panel>
                </Box>
            </ScrollArea>
        </AnimatedTabs>
    );
}

