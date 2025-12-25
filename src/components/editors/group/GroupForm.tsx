import { Paper, Stack, Title } from '@mantine/core';
import { useMemo } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { parseYaml, toYaml } from '@/utils/yaml-utils';
import { FormInput, FormSection, FormTextarea } from '@/components/ui';

interface GroupFormProps {
    fileId: string;
}

export default function GroupForm({ fileId }: GroupFormProps) {
    const file = useProjectStore((state) => state.groupFiles[fileId]);
    const updateFileContent = useProjectStore((state) => state.updateFileContent);

    const parsedData = useMemo(() => {
        if (!file?.content) return {};
        try {
            const data = parseYaml(file.content);
            return data && typeof data === 'object' ? data : {};
        } catch {
            return {};
        }
    }, [file?.content]);

    const groupId = useMemo(() => Object.keys(parsedData)[0] || 'new_group', [parsedData]);
    const groupData = useMemo(() => {
        const data = parsedData[groupId];
        return data && typeof data === 'object'
            ? {
                meta: { name: data.meta?.name || '' },
                quests: Array.isArray(data.quests) ? data.quests : []
            }
            : { meta: { name: '' }, quests: [] };
    }, [parsedData, groupId]);

    const handleUpdate = (newData: any, newId?: string) => {
        const idToUse = newId || groupId;
        const safeData = {
            meta: { name: newData?.meta?.name || '' },
            quests: Array.isArray(newData?.quests) ? newData.quests : []
        };
        const yaml = toYaml({ [idToUse]: safeData });
        updateFileContent(fileId, 'group', yaml);
    };

    const handleQuestListChange = (value: string) => {
        const quests = value
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        handleUpdate({ ...groupData, quests });
    };

    if (!file) return null;

    return (
        <Paper radius={0} h="100%" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--mantine-color-dark-8)' }}>
            <Stack gap="lg" p="xl">
                <Title order={4}>任务组配置</Title>
                <FormSection>
                    <FormInput
                        label="任务组 ID"
                        description="例如 main_story 或 daily_reward"
                        value={groupId}
                        onChange={(e) => handleUpdate(groupData, e.target.value.trim() || 'new_group')}
                    />
                    <FormInput
                        label="显示名称"
                        description="任务组展示名称"
                        value={groupData.meta?.name || ''}
                        onChange={(e) => handleUpdate({ ...groupData, meta: { name: e.target.value } })}
                    />
                    <FormTextarea
                        label="任务列表"
                        description="每行一个任务 ID，例如 example1"
                        value={(groupData.quests || []).join('\n')}
                        onChange={(e) => handleQuestListChange(e.target.value)}
                        autosize
                        minRows={5}
                    />
                </FormSection>
            </Stack>
        </Paper>
    );
}

