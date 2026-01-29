import { Paper, Stack, Title, ScrollArea } from '@mantine/core';
import { useMemo } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { parseYaml, toYaml } from '@/utils/yaml-utils';
import { FormInput, FormSection, FormSelect, FormTimePicker } from '@/components/ui';
import { NumberInput } from '@mantine/core';
import { PoolQuestListEditor } from './PoolQuestListEditor';

interface PoolFormProps {
    fileId: string;
}

export default function PoolForm({ fileId }: PoolFormProps) {
    const file = useProjectStore((state) => state.poolFiles[fileId]);
    const questFiles = useProjectStore((state) => state.questFiles);
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

    const poolId = useMemo(() => Object.keys(parsedData)[0] || 'new_pool', [parsedData]);
    const poolData = useMemo(() => {
        const data = parsedData[poolId];
        return data && typeof data === 'object'
            ? {
                meta: { 
                    name: data.meta?.name || '',
                    reset: data.meta?.reset || ''
                },
                rules: {
                    pick: typeof data.rules?.pick === 'number' ? data.rules.pick : 0,
                    duplicate: data.rules?.duplicate || 'player',
                    'weight-mode': data.rules?.['weight-mode'] || 'weight'
                },
                quests: Array.isArray(data.quests) ? data.quests.map((q: any) => ({
                    id: q.id || '',
                    weight: typeof q.weight === 'number' ? q.weight : 1
                })) : []
            }
            : { 
                meta: { name: '', reset: '' },
                rules: { pick: 0, duplicate: 'player', 'weight-mode': 'weight' },
                quests: []
            };
    }, [parsedData, poolId]);

    const handleUpdate = (newData: any, newId?: string) => {
        const idToUse = newId || poolId;
        const safeData = {
            meta: { 
                name: newData?.meta?.name || '',
                reset: newData?.meta?.reset || ''
            },
            rules: {
                pick: typeof newData?.rules?.pick === 'number' ? newData.rules.pick : 0,
                duplicate: newData?.rules?.duplicate || 'player',
                'weight-mode': newData?.rules?.['weight-mode'] || 'weight'
            },
            quests: Array.isArray(newData?.quests) ? newData.quests : []
        };
        const yaml = toYaml({ [idToUse]: safeData });
        updateFileContent(fileId, 'pool', yaml);
    };

    const handleQuestListChange = (quests: Array<{ id: string; weight: number }>) => {
        handleUpdate({ ...poolData, quests });
    };

    if (!file) return null;

    return (
        <Paper radius={0} h="100%" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--mantine-color-dark-8)' }}>
            <ScrollArea style={{ flex: 1 }}>
                <Stack gap="lg" p="xl">
                    <Title order={4}>任务池配置</Title>
                    <FormSection>
                        <FormInput
                            label="任务池 ID"
                            description=""
                            value={poolId}
                            onChange={(e) => handleUpdate(poolData, e.target.value.trim() || 'new_pool')}
                        />
                        <FormInput
                            label="显示名称"
                            description=""
                            value={poolData.meta?.name || ''}
                            onChange={(e) => handleUpdate({ ...poolData, meta: { ...poolData.meta, name: e.target.value } })}
                        />
                        <FormTimePicker
                            label="重置时间"
                            description=""
                            value={poolData.meta?.reset || ''}
                            onChange={(value) => handleUpdate({ ...poolData, meta: { ...poolData.meta, reset: value } })}
                            mode="periodic"
                        />
                        <NumberInput
                            label="选择数量"
                            description=""
                            value={poolData.rules?.pick || 0}
                            onChange={(value) => handleUpdate({ 
                                ...poolData, 
                                rules: { ...poolData.rules, pick: typeof value === 'number' ? value : 0 } 
                            })}
                            min={0}
                            step={1}
                        />
                        <FormSelect
                            label="重复模式"
                            description="player: 每个玩家独立，server: 服务器共享"
                            value={poolData.rules?.duplicate || 'player'}
                            onChange={(value) => handleUpdate({ 
                                ...poolData, 
                                rules: { ...poolData.rules, duplicate: value || 'player' } 
                            })}
                            data={[
                                { value: 'player', label: '玩家 (player)' },
                                { value: 'server', label: '服务器 (server)' }
                            ]}
                        />
                        <FormSelect
                            label="权重模式"
                            description="weight: 按权重随机，fixed: 按顺序固定"
                            value={poolData.rules?.['weight-mode'] || 'weight'}
                            onChange={(value) => handleUpdate({ 
                                ...poolData, 
                                rules: { ...poolData.rules, 'weight-mode': value || 'weight' } 
                            })}
                            data={[
                                { value: 'weight', label: '权重 (weight)' },
                                { value: 'fixed', label: '固定 (fixed)' }
                            ]}
                        />
                        <div>
                            <PoolQuestListEditor
                                quests={poolData.quests || []}
                                availableQuests={questFiles}
                                onChange={handleQuestListChange}
                            />
                        </div>
                    </FormSection>
                </Stack>
            </ScrollArea>
        </Paper>
    );
}

