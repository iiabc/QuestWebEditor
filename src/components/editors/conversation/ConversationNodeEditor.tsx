import { Accordion, ActionIcon, Badge, Box, Button, Group, Modal, ScrollArea, Stack, Tabs, Text, ThemeIcon, Title } from '@mantine/core';
import { IconGitBranch, IconMessage, IconPlus, IconPuzzle, IconSettings, IconTrash, IconUser } from '@tabler/icons-react';
import { AnimatedTabs, FormInput, FormScript, FormSection } from '@/components/ui';
import { DebouncedTextarea } from '@/components/ui/DebouncedInput';
import { AgentNodeData } from './nodes/AgentNode';
import { SwitchNodeData } from './nodes/SwitchNode';
import { useGlobalIdCheck } from './useGlobalIdCheck';
import { useApiStore } from '@/store/useApiStore';
import { DynamicComponentField } from '@/components/editors/quest/dynamic/DynamicComponentField';

interface ConversationNodeEditorProps {
    opened: boolean;
    onClose: () => void;
    data: any; // AgentNodeData | SwitchNodeData
    type?: 'agent' | 'switch';
    onUpdate: (newData: any) => void;
    fileId: string;
    existingIds?: string[];
}

export function ConversationNodeEditor({ opened, onClose, data, type = 'agent', onUpdate, fileId, existingIds = [] }: ConversationNodeEditorProps) {
    const { checkDuplicate } = useGlobalIdCheck(fileId);
    const { apiData } = useApiStore();

    // 调试信息：打印 apiData 结构
    // // console.log('[ConversationNodeEditor] apiData:', apiData);
    // // console.log('[ConversationNodeEditor] apiData keys:', Object.keys(apiData));

    // 从所有插件的 conversation 中筛选出 node 和 player-option 组件
    const conversationNodeComponents: Array<{ id: string; component: any }> = [];
    const conversationPlayerOptionComponents: Array<{ id: string; component: any }> = [];

    Object.entries(apiData).forEach(([_, plugin]) => {
        // console.log(`[ConversationNodeEditor] 检查插件: ${pluginName}`, plugin);
        if (plugin.conversation) {
            // console.log(`[ConversationNodeEditor] 找到 conversation:`, plugin.conversation);
            Object.entries(plugin.conversation).forEach(([compId, compDef]) => {
                // console.log(`[ConversationNodeEditor] 处理组件: ${compId}`, compDef);
                const componentWithId = { id: compId, component: compDef };

                if (compDef.scope === 'node' || compDef.scope === 'both') {
                    conversationNodeComponents.push(componentWithId);
                    // console.log(`[ConversationNodeEditor] 添加到 nodeComponents: ${compId}`);
                }

                if (compDef.scope === 'player-option' || compDef.scope === 'both') {
                    conversationPlayerOptionComponents.push(componentWithId);
                    // console.log(`[ConversationNodeEditor] 添加到 playerOptionComponents: ${compId}`);
                }
            });
        } else {
            // console.log(`[ConversationNodeEditor] 插件 ${pluginName} 没有 conversation 字段`);
        }
    });

    // // console.log('[ConversationNodeEditor] 最终 conversationNodeComponents:', conversationNodeComponents);
    // // console.log('[ConversationNodeEditor] 最终 conversationPlayerOptionComponents:', conversationPlayerOptionComponents);

    const globalDuplicates = checkDuplicate(data.label);
    const isDuplicateInCurrentFile = existingIds.includes(data.label);

    const error = globalDuplicates
        ? `此 ID 已在以下文件中使用: ${globalDuplicates.join(', ')}`
        : (isDuplicateInCurrentFile ? '此 ID 已在当前文件中使用' : undefined);

    // --- Agent Node Handlers ---
    const handleOptionChange = (idx: number, field: keyof AgentNodeData['playerOptions'][0], val: string) => {
        const newOptions = [...data.playerOptions];
        newOptions[idx] = { ...newOptions[idx], [field]: val };
        onUpdate({ ...data, playerOptions: newOptions });
    };

    const addOption = () => {
        const newOptions = [
            ...data.playerOptions,
            { id: `${data.label}-opt-${Date.now()}`, text: 'New Option' }
        ];
        onUpdate({ ...data, playerOptions: newOptions });
    };

    const removeOption = (idx: number) => {
        const newOptions = [...data.playerOptions];
        newOptions.splice(idx, 1);
        onUpdate({ ...data, playerOptions: newOptions });
    };

    // --- Switch Node Handlers ---
    const handleBranchChange = (idx: number, field: keyof SwitchNodeData['branches'][0], val: string) => {
        const newBranches = [...data.branches];
        newBranches[idx] = { ...newBranches[idx], [field]: val };
        onUpdate({ ...data, branches: newBranches });
    };

    const addBranch = () => {
        const newBranches = [
            ...(data.branches || []),
            { id: `${data.label}-branch-${Date.now()}`, condition: 'true' }
        ];
        onUpdate({ ...data, branches: newBranches });
    };

    const removeBranch = (idx: number) => {
        const newBranches = [...data.branches];
        newBranches.splice(idx, 1);
        onUpdate({ ...data, branches: newBranches });
    };

    const renderAgentEditor = () => (
        <AnimatedTabs
            defaultValue="basic"
            keepMounted={false}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            tabs={[
                { value: 'basic', label: '基础设置', icon: <IconSettings size={14} /> },
                { value: 'npc', label: 'NPC 对话', icon: <IconMessage size={14} /> },
                { value: 'player', label: '玩家选项', icon: <IconUser size={14} /> },
                { value: 'custom', label: '自定义组件', icon: <IconPuzzle size={14} /> }
            ]}
        >
            <ScrollArea style={{ flex: 1 }} bg="var(--mantine-color-dark-8)">
                <Box p="md">
                    <Tabs.Panel value="basic">
                        <Stack gap="md">
                            <FormSection>
                                <Title order={5} mb="xs">节点信息</Title>
                                <FormInput
                                    label="节点 ID"
                                    description=""
                                    value={data.label}
                                    onChange={(e) => onUpdate({ ...data, label: e.currentTarget.value })}
                                    error={error}
                                />
                                <FormInput
                                    label="对话名称"
                                    description=""
                                    value={data.name || ''}
                                    onChange={(e) => onUpdate({ ...data, name: e.currentTarget.value || undefined })}
                                />
                            </FormSection>
                            <FormSection>
                                <Title order={5} mb="xs">触发条件</Title>
                                <DebouncedTextarea
                                    label="NPC 入口"
                                    description=""
                                    value={(() => {
                                        if (data.npcs && data.npcs.length > 0) {
                                            return data.npcs.join('\n');
                                        }
                                        if (data.npcId) {
                                            return data.npcId;
                                        }
                                        return '';
                                    })()}
                                    onChange={(val) => {
                                        const npcs = val
                                            .split('\n')
                                            .map(line => line.trim())
                                            .filter(line => line.length > 0);
                                        onUpdate({
                                            ...data,
                                            npcs: npcs.length > 0 ? npcs : undefined,
                                            npcId: npcs.length === 1 ? npcs[0] : undefined
                                        });
                                    }}
                                    autosize
                                    minRows={3}
                                    maxRows={10}
                                    debounceMs={800}
                                />
                                <DebouncedTextarea
                                    label="标签"
                                    description=""
                                    value={data.tags ? data.tags.join('\n') : ''}
                                    onChange={(val) => {
                                        const tags = val
                                            .split('\n')
                                            .map(line => line.trim())
                                            .filter(line => line.length > 0);
                                        onUpdate({ ...data, tags: tags.length > 0 ? tags : undefined });
                                    }}
                                    autosize
                                    minRows={2}
                                    maxRows={10}
                                    debounceMs={800}
                                />
                            </FormSection>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="npc">
                        <Stack gap="md">
                            <FormSection>
                                <Title order={5} mb="xs">对话内容</Title>
                                <DebouncedTextarea
                                    label=""
                                    description=""
                                    value={(() => {
                                        if (Array.isArray(data.npcLines)) {
                                            return data.npcLines.join('\n');
                                        }
                                        if (data.npcLines) {
                                            return String(data.npcLines);
                                        }
                                        return '';
                                    })()}
                                    onChange={(val) => {
                                        const lines = val.split('\n');
                                        onUpdate({ ...data, npcLines: lines });
                                    }}
                                    autosize
                                    minRows={5}
                                    maxRows={15}
                                    debounceMs={800}
                                />
                            </FormSection>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="player">
                        <Stack gap="md">
                            <Accordion variant="separated" radius="md">
                                {data.playerOptions?.map((opt: any, idx: number) => (
                                    <Accordion.Item key={opt.id} value={opt.id}>
                                        <Accordion.Control>
                                            <Group justify="space-between" pr="md">
                                                <Group gap="sm">
                                                    <Text fw={500}>{opt.text || `选项 #${idx + 1}`}</Text>
                                                    {opt.condition && <Badge size="xs" variant="outline" color="blue">Condition</Badge>}
                                                    {opt.actions && <Badge size="xs" variant="outline" color="orange">Script</Badge>}
                                                </Group>
                                                <Box
                                                    component="div"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeOption(idx);
                                                    }}
                                                    style={{
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: 4,
                                                        color: 'var(--mantine-color-red-6)',
                                                        transition: 'background-color 0.1s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mantine-color-red-9)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <IconTrash size={16} />
                                                </Box>
                                            </Group>
                                        </Accordion.Control>
                                        <Accordion.Panel
                                            onKeyDown={(e) => {
                                                // 阻止键盘事件冒泡到 Accordion，允许编辑器正常接收键盘输入
                                                e.stopPropagation();
                                            }}
                                            onKeyPress={(e) => {
                                                e.stopPropagation();
                                            }}
                                            onKeyUp={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            <Stack gap="sm">
                                                <FormInput
                                                    label="选项文本"
                                                    description=""
                                                    value={opt.text}
                                                    onChange={(e) => handleOptionChange(idx, 'text', e.currentTarget.value)}
                                                />
                                                <FormScript
                                                    label="显示条件"
                                                    description=""
                                                    height="80px"
                                                    value={opt.condition || ''}
                                                    onChange={(val) => handleOptionChange(idx, 'condition', val || '')}
                                                />
                                                <FormScript
                                                    label="执行动作"
                                                    description=""
                                                    height="100px"
                                                    value={opt.actions || ''}
                                                    onChange={(val) => handleOptionChange(idx, 'actions', val || '')}
                                                />

                                                {/* 渲染玩家选项自定义组件 - 使用新的 params 格式 */}
                                                {conversationPlayerOptionComponents.map(({ id: compId, component: compDef }) => (
                                                    <Box key={compId}>
                                                        <Text size="sm" fw={500} mb="xs" c="dimmed">
                                                            {compDef.name} ({compId})
                                                        </Text>
                                                        {compDef.params.map((param: any) => (
                                                            <DynamicComponentField
                                                                key={param.name}
                                                                field={{
                                                                    name: param.name,
                                                                    label: param.name,
                                                                    pattern: param.type,
                                                                    description: param.description,
                                                                    options: param.options  // 传递 options
                                                                }}
                                                                value={(() => {
                                                                    const keys = param.name.split('.');
                                                                    let value = opt;
                                                                    for (const key of keys) {
                                                                        if (value === undefined || value === null) return undefined;
                                                                        value = value[key];
                                                                    }
                                                                    return value;
                                                                })()}
                                                                onChange={(value) => {
                                                                    const keys = param.name.split('.');
                                                                    const newOption = { ...opt };
                                                                    let current: any = newOption;
                                                                    for (let i = 0; i < keys.length - 1; i++) {
                                                                        const key = keys[i];
                                                                        if (!current[key]) {
                                                                            current[key] = {};
                                                                        } else {
                                                                            current[key] = { ...current[key] };
                                                                        }
                                                                        current = current[key];
                                                                    }
                                                                    const lastKey = keys[keys.length - 1];
                                                                    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                                                                        delete current[lastKey];
                                                                    } else {
                                                                        current[lastKey] = value;
                                                                    }
                                                                    const newOptions = [...data.playerOptions];
                                                                    newOptions[idx] = newOption;
                                                                    onUpdate({ ...data, playerOptions: newOptions });
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                ))}
                            </Accordion>

                            <Button variant="light" leftSection={<IconPlus size={16} />} onClick={addOption} fullWidth>
                                添加回复选项
                            </Button>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="custom">
                        <Stack gap="md">
                            <Title order={4}>自定义节点组件</Title>
                            {conversationNodeComponents.length > 0 ? (
                                conversationNodeComponents.map(({ id: compId, component: compDef }) => (
                                    <FormSection key={compId}>
                                        <Title order={5} mb="xs">{compDef.name} ({compId})</Title>
                                        <Stack gap="sm">
                                            {compDef.params.map((param: any) => (
                                                <DynamicComponentField
                                                    key={param.name}
                                                    field={{
                                                        name: param.name,
                                                        label: param.name,
                                                        pattern: param.type,
                                                        description: param.description,
                                                        options: param.options  // 传递 options
                                                    }}
                                                    value={(() => {
                                                        const keys = param.name.split('.');
                                                        let value = data;
                                                        for (const key of keys) {
                                                            if (value === undefined || value === null) return undefined;
                                                            value = value[key];
                                                        }
                                                        return value;
                                                    })()}
                                                    onChange={(value) => {
                                                        const keys = param.name.split('.');
                                                        const newData = { ...data };
                                                        let current: any = newData;
                                                        for (let i = 0; i < keys.length - 1; i++) {
                                                            const key = keys[i];
                                                            if (!current[key]) {
                                                                current[key] = {};
                                                            } else {
                                                                current[key] = { ...current[key] };
                                                            }
                                                            current = current[key];
                                                        }
                                                        const lastKey = keys[keys.length - 1];
                                                        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                                                            delete current[lastKey];
                                                        } else {
                                                            current[lastKey] = value;
                                                        }
                                                        onUpdate(newData);
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </FormSection>
                                ))
                            ) : (
                                <Text c="dimmed" ta="center" py="xl">
                                    暂无自定义组件。可以通过导入 API 定义来添加自定义组件。
                                </Text>
                            )}
                        </Stack>
                    </Tabs.Panel>
                </Box>
            </ScrollArea>
        </AnimatedTabs>
    );

    const renderSwitchEditor = () => (
        <AnimatedTabs
            defaultValue="basic"
            keepMounted={false}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            tabs={[
                { value: 'basic', label: '基础设置', icon: <IconSettings size={14} /> },
                { value: 'branches', label: '分支条件', icon: <IconGitBranch size={14} /> }
            ]}
        >
            <ScrollArea style={{ flex: 1 }} bg="var(--mantine-color-dark-8)">
                <Box p="md">
                    <Tabs.Panel value="basic">
                        <Stack gap="md">
                            <FormSection>
                                <Title order={5} mb="xs">节点信息</Title>
                                <FormInput
                                    label="节点 ID"
                                    description=""
                                    value={data.label}
                                    onChange={(e) => onUpdate({ ...data, label: e.currentTarget.value })}
                                    error={error}
                                />
                            </FormSection>
                            <FormSection>
                                <Title order={5} mb="xs">触发条件</Title>
                                <DebouncedTextarea
                                    label="NPC 入口"
                                    description=""
                                    value={(() => {
                                        if (data.npcs && data.npcs.length > 0) {
                                            return data.npcs.join('\n');
                                        }
                                        if (data.npcId) {
                                            return data.npcId;
                                        }
                                        return '';
                                    })()}
                                    onChange={(val) => {
                                        const npcs = val
                                            .split('\n')
                                            .map(line => line.trim())
                                            .filter(line => line.length > 0);
                                        onUpdate({
                                            ...data,
                                            npcs: npcs.length > 0 ? npcs : undefined,
                                            npcId: npcs.length === 1 ? npcs[0] : undefined
                                        });
                                    }}
                                    autosize
                                    minRows={3}
                                    maxRows={10}
                                    debounceMs={800}
                                />
                            </FormSection>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="branches">
                        <Stack gap="md">
                            <Accordion variant="separated" radius="md">
                                {data.branches?.map((branch: any, idx: number) => (
                                    <Accordion.Item key={branch.id} value={branch.id}>
                                        <Accordion.Control>
                                            <Group justify="space-between" pr="md">
                                                <Group gap="sm">
                                                    <Badge size="xs" variant="outline" color="gray">IF</Badge>
                                                    <Text fw={500} size="sm" style={{ fontFamily: 'monospace' }}>{branch.condition}</Text>
                                                    {branch.action && <Badge size="xs" color="yellow">SCRIPT</Badge>}
                                                    {branch.open && <Badge size="xs" color="blue">OPEN</Badge>}
                                                </Group>
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeBranch(idx);
                                                    }}
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Group>
                                        </Accordion.Control>
                                        <Accordion.Panel
                                            onKeyDown={(e) => {
                                                // 阻止键盘事件冒泡到 Accordion，允许编辑器正常接收键盘输入
                                                e.stopPropagation();
                                            }}
                                            onKeyPress={(e) => {
                                                e.stopPropagation();
                                            }}
                                            onKeyUp={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            <Stack gap="sm">
                                                <FormScript
                                                    label="判断条件"
                                                    description=""
                                                    height="80px"
                                                    value={branch.condition || ''}
                                                    onChange={(val) => handleBranchChange(idx, 'condition', val || '')}
                                                />
                                                <FormSection>
                                                    <Title order={6} mb="xs">动作配置</Title>
                                                    <FormScript
                                                        label="脚本"
                                                        description=""
                                                        height="100px"
                                                        value={branch.action || ''}
                                                        onChange={(val) => {
                                                            const newBranches = [...data.branches];
                                                            const updatedBranch = { ...newBranches[idx] };
                                                            if (val) {
                                                                updatedBranch.action = val;
                                                            } else {
                                                                delete updatedBranch.action;
                                                            }
                                                            newBranches[idx] = updatedBranch;
                                                            onUpdate({ ...data, branches: newBranches });
                                                        }}
                                                    />
                                                    <FormInput
                                                        label="打开对话"
                                                        description=""
                                                        value={branch.open || ''}
                                                        onChange={(e) => {
                                                            const newBranches = [...data.branches];
                                                            const updatedBranch = { ...newBranches[idx] };
                                                            const val = e.currentTarget.value.trim();
                                                            if (val) {
                                                                updatedBranch.open = val;
                                                            } else {
                                                                delete updatedBranch.open;
                                                            }
                                                            newBranches[idx] = updatedBranch;
                                                            onUpdate({ ...data, branches: newBranches });
                                                        }}
                                                    />
                                                </FormSection>
                                            </Stack>
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                ))}
                            </Accordion>

                            <Button variant="light" leftSection={<IconPlus size={16} />} onClick={addBranch} fullWidth>
                                添加分支
                            </Button>
                        </Stack>
                    </Tabs.Panel>
                </Box>
            </ScrollArea>
        </AnimatedTabs>
    );

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            withCloseButton={false}
            title={
                <Group className='p-4'>
                    <ThemeIcon size="lg" variant="light" color={type === 'switch' ? 'violet' : 'blue'}>
                        {type === 'switch' ? <IconGitBranch size={20} /> : <IconMessage size={20} />}
                    </ThemeIcon>
                    <Stack gap={0}>
                        <Text fw={700} size="sm">编辑{type === 'switch' ? '分支' : '对话'}节点</Text>
                        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>{data.label}</Text>
                    </Stack>
                </Group>
            }
            size="xl"
            padding={0}
            styles={{ body: { height: '70vh', display: 'flex', flexDirection: 'column' } }}
        >
            {type === 'switch' ? renderSwitchEditor() : renderAgentEditor()}
        </Modal>
    );
}

