import { Tabs, ScrollArea, Box, Stack, Title } from '@mantine/core';
import { IconInfoCircle, IconScript, IconPuzzle, IconDatabase } from '@tabler/icons-react';
import { useMemo } from 'react';
import { FormInput, FormSection } from '@/components/ui';
import { useProjectStore } from '@/store/useProjectStore';
import { parseYaml } from '@/utils/yaml-utils';
import { AgentEditor } from './AgentEditor';
import { UIAddon } from './addons/UIAddon';
import { TimeAddon } from './addons/TimeAddon';
import { PreAddon } from './addons/PreAddon';
import { DataEditor } from './DataEditor';

interface QuestSettingsProps {
    fileId?: string;
    questId: string;
    questData: any;
    onUpdate: (newData: any, newId?: string) => void;
}

export function QuestSettings({ fileId, questId, questData, onUpdate }: QuestSettingsProps) {
    const questFiles = useProjectStore((state) => state.questFiles);

    const idError = useMemo(() => {
        if (!fileId) return null;
        let error = null;
        Object.values(questFiles).forEach(file => {
            if (file.id === fileId) return;
            try {
                const data = parseYaml(file.content);
                if (data && typeof data === 'object') {
                    if (Object.keys(data).includes(questId)) {
                        error = `ID '${questId}' 已存在于文件 '${file.name}' 中`;
                    }
                }
            } catch (e) {}
        });
        return error;
    }, [questFiles, fileId, questId]);

    return (
        <Tabs defaultValue="basic" orientation="vertical" variant="pills" style={{ flex: 1, display: 'flex', height: '100%' }}>
            <Tabs.List w={220} bg="var(--mantine-color-dark-7)" p="xs" style={{ borderRight: '1px solid var(--mantine-color-dark-6)' }}>
                <Tabs.Tab value="basic" leftSection={<IconInfoCircle size={14} />} className="hover:bg-white/5 transition-colors">基本信息</Tabs.Tab>
                <Tabs.Tab value="addons" leftSection={<IconPuzzle size={14} />} className="hover:bg-white/5 transition-colors">组件配置</Tabs.Tab>
                <Tabs.Tab value="agent" leftSection={<IconScript size={14} />} className="hover:bg-white/5 transition-colors">触发器</Tabs.Tab>
                <Tabs.Tab value="data" leftSection={<IconDatabase size={14} />} className="hover:bg-white/5 transition-colors">数据节点</Tabs.Tab>
            </Tabs.List>

            <ScrollArea style={{ flex: 1 }}>
                <Box p="xl">
                    <Tabs.Panel value="basic">
                        <Stack gap="md">
                            <Title order={4}>基本信息</Title>
                            <FormSection>
                                <FormInput
                                    label="任务 ID"
                                    description="任务的唯一标识符"
                                    value={questId}
                                    onChange={(e) => onUpdate(questData, e.target.value)}
                                    error={idError}
                                />
                                <FormInput
                                    label="显示名称"
                                    description="显示给玩家的任务名称"
                                    value={questData.meta?.name || ''}
                                    onChange={(e) => onUpdate({ ...questData, meta: { name: e.target.value } })}
                                />
                            </FormSection>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="addons">
                        <Stack gap="md">
                            <Title order={4}>扩展组件配置</Title>

                            {/* Quest 内置 Addon 组件（编程式） */}
                            <UIAddon
                                addon={questData.addon}
                                onChange={(newAddon) => onUpdate({ ...questData, addon: newAddon })}
                            />

                            <TimeAddon
                                addon={questData.addon}
                                onChange={(newAddon) => onUpdate({ ...questData, addon: newAddon })}
                            />

                            <PreAddon
                                addon={questData.addon}
                                onChange={(newAddon) => onUpdate({ ...questData, addon: newAddon })}
                                scope="quest"
                                availableQuests={questFiles}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="agent">
                        <Stack gap="md">
                            <Title order={4}>触发器脚本</Title>
                            <AgentEditor 
                                data={questData.trigger || {}} 
                                onUpdate={(newTrigger) => onUpdate({ ...questData, trigger: newTrigger })}
                                types={['accept', 'complete', 'timeout']}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="data">
                        <Stack gap="md">
                            <FormSection>
                                <Title order={4} mb="sm">数据节点</Title>
                                <DataEditor
                                    data={questData.data || {}}
                                    onChange={(newData) => {
                                        // 如果数据为空对象，则不设置 data 字段
                                        if (Object.keys(newData).length === 0) {
                                            const { data, ...rest } = questData;
                                            onUpdate(rest);
                                        } else {
                                            onUpdate({ ...questData, data: newData });
                                        }
                                    }}
                                />
                            </FormSection>
                        </Stack>
                    </Tabs.Panel>
                </Box>
            </ScrollArea>
        </Tabs>
    );
}
