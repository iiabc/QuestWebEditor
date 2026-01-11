import { FormAddon, FormScript } from '@/components/ui';
import { Stack } from '@mantine/core';
import { DebouncedTextarea } from '@/components/ui/DebouncedInput';
import { VirtualFile } from '@/store/useProjectStore';
import { QuestListEditor } from './QuestListEditor';

interface PreAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
    scope: 'quest' | 'objective';
    availableQuests?: Record<string, VirtualFile>;
}

export function PreAddon({ addon, onChange, scope, availableQuests = {} }: PreAddonProps) {
    const updatePre = (key: string, value: any) => {
        onChange({
            ...addon,
            pre: { ...addon?.pre, [key]: value }
        });
    };

    if (scope === 'quest') {
        // Quest 级别的 pre: { if: "", quests: [] }
        return (
            <FormAddon
                label="前置条件 (Pre)"
                description="任务接受的前置条件"
                checked={!!addon?.pre}
                onChange={(checked) => {
                    if (checked) {
                        onChange({ ...addon, pre: { if: '', quests: [] } });
                    } else {
                        const { pre, ...rest } = addon || {};
                        onChange(rest);
                    }
                }}
            >
                <Stack gap="md">
                    <FormScript
                        label="条件 (if)"
                        description="Kether 条件脚本，满足条件才能接受任务"
                        height="150px"
                        value={addon?.pre?.if || ''}
                        onChange={(val) => updatePre('if', val || '')}
                    />
                    {availableQuests && Object.keys(availableQuests).length > 0 ? (
                        <QuestListEditor
                            questIds={Array.isArray(addon?.pre?.quests) ? addon.pre.quests : []}
                            availableQuests={availableQuests}
                            onChange={(questIds) => updatePre('quests', questIds)}
                        />
                    ) : (
                        <DebouncedTextarea
                            label="前置任务列表 (quests)"
                            description="需要完成的任务列表，每行一个任务 ID"
                            placeholder="quest_id_1&#10;quest_id_2"
                            value={Array.isArray(addon?.pre?.quests) ? addon.pre.quests.join('\n') : ''}
                            onChange={(val) => {
                                const quests = val
                                    .split('\n')
                                    .map(line => line.trim())
                                    .filter(line => line.length > 0);
                                updatePre('quests', quests);
                            }}
                            autosize
                            minRows={3}
                            debounceMs={800}
                        />
                    )}
                </Stack>
            </FormAddon>
        );
    } else {
        // Objective 级别的 pre: { objectives: [], if: "" }
        return (
            <FormAddon
                label="前置条件 (Pre)"
                description="目标激活的前置条件"
                checked={!!addon?.pre}
                onChange={(checked) => {
                    if (checked) {
                        onChange({ ...addon, pre: { if: '', objectives: [] } });
                    } else {
                        const { pre, ...rest } = addon || {};
                        onChange(rest);
                    }
                }}
            >
                <Stack gap="md">
                    <FormScript
                        label="条件 (if)"
                        description="Kether 条件脚本，满足条件才能激活此目标"
                        height="150px"
                        value={addon?.pre?.if || ''}
                        onChange={(val) => updatePre('if', val || '')}
                    />
                    <DebouncedTextarea
                        label="前置目标列表 (objectives)"
                        description="需要完成的目标列表，每行一个目标 ID（数字）"
                        placeholder="1&#10;2"
                        value={Array.isArray(addon?.pre?.objectives) ? addon.pre.objectives.join('\n') : ''}
                        onChange={(val) => {
                            const objectives = val
                                .split('\n')
                                .map(line => line.trim())
                                .filter(line => line.length > 0);
                            updatePre('objectives', objectives);
                        }}
                        autosize
                        minRows={3}
                        debounceMs={800}
                    />
                </Stack>
            </FormAddon>
        );
    }
}

