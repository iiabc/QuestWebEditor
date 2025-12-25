import { FormAddon, FormInput, FormSelect } from '@/components/ui';
import { Stack } from '@mantine/core';
import { AgentEditor } from '../AgentEditor';

interface ProgressAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
}

export function ProgressAddon({ addon, onChange }: ProgressAddonProps) {
    const updateProgressScope = (value: string) => {
        onChange({
            ...addon,
            'progress-scope': value || undefined
        });
    };

    const updateProgress = (key: string, value: any) => {
        onChange({
            ...addon,
            progress: { ...addon?.progress, [key]: value }
        });
    };

    return (
        <Stack gap="md">
            <FormSelect
                label="进度范围 (progress-scope)"
                description="进度共享范围：player（个人）或 server（全服）"
                data={[
                    { value: 'player', label: '个人 (Player)' },
                    { value: 'server', label: '全服 (Server)' }
                ]}
                value={addon?.['progress-scope'] || 'player'}
                onChange={(val) => updateProgressScope(val || 'player')}
            />

            <FormAddon
                label="进度配置 (progress)"
                description="全服共享进度配置"
                checked={!!addon?.progress}
                onChange={(checked) => {
                    if (checked) {
                        onChange({
                            ...addon,
                            progress: {
                                scope: '',
                                amount: '',
                                agent: {}
                            }
                        });
                    } else {
                        const { progress, ...rest } = addon || {};
                        onChange(rest);
                    }
                }}
            >
                <Stack gap="md">
                    <FormInput
                        label="范围 (scope)"
                        description="进度范围，例如：server"
                        placeholder="server"
                        value={addon?.progress?.scope || ''}
                        onChange={(e) => updateProgress('scope', e.target.value)}
                    />
                    <FormInput
                        label="数量 (amount)"
                        description="全服进度要求，支持 Kether 脚本或数字"
                        placeholder="1000"
                        value={addon?.progress?.amount || ''}
                        onChange={(e) => updateProgress('amount', e.target.value)}
                    />
                    <AgentEditor
                        data={addon?.progress?.agent || {}}
                        onUpdate={(newAgent) => updateProgress('agent', newAgent)}
                        types={['accept', 'complete', 'timeout', 'progress']}
                    />
                </Stack>
            </FormAddon>
        </Stack>
    );
}

