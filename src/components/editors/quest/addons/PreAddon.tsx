import { FormAddon, FormScript } from '@/components/ui';
import { Stack } from '@mantine/core';
import { DebouncedTextarea } from '@/components/ui/DebouncedInput';
import { VirtualFile } from '@/store/useProjectStore';
import { QuestListEditor } from './QuestListEditor';
import { ObjectiveListEditor } from './ObjectiveListEditor';

interface PreAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
    scope: 'quest' | 'objective';
    availableQuests?: Record<string, VirtualFile>;
    availableObjectives?: Record<string | number, any>;
    currentObjectiveId?: string | number;
}

export function PreAddon({ addon, onChange, scope, availableQuests = {}, availableObjectives, currentObjectiveId }: PreAddonProps) {
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
                label="前置条件"
                description="任务级"
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
                        label="条件"
                        description=""
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
                            label="前置任务"
                            description=""
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
                label="前置条件"
                description="目标级"
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
                        label="条件"
                        description=""
                        height="150px"
                        value={addon?.pre?.if || ''}
                        onChange={(val) => updatePre('if', val || '')}
                    />
                    {availableObjectives && Object.keys(availableObjectives).length > 0 ? (
                        <ObjectiveListEditor
                            objectiveIds={Array.isArray(addon?.pre?.objectives) ? addon.pre.objectives : []}
                            availableObjectives={availableObjectives}
                            onChange={(objectiveIds) => updatePre('objectives', objectiveIds)}
                            currentObjectiveId={currentObjectiveId}
                        />
                    ) : (
                        <DebouncedTextarea
                            label="前置目标"
                            description=""
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
                    )}
                </Stack>
            </FormAddon>
        );
    }
}

