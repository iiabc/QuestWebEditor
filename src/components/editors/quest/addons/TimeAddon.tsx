import { FormAddon, FormInput, FormCheckbox } from '@/components/ui';
import { Stack } from '@mantine/core';

interface TimeAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
}

export function TimeAddon({ addon, onChange }: TimeAddonProps) {
    const updateTime = (key: string, value: any) => {
        onChange({
            ...addon,
            time: { ...addon?.time, [key]: value }
        });
    };

    const updatePlan = (key: string, value: any) => {
        onChange({
            ...addon,
            time: {
                ...addon?.time,
                plan: { ...addon?.time?.plan, [key]: value }
            }
        });
    };

    return (
        <FormAddon
            label="时间配置 (Time)"
            description="任务时间限制和周期配置"
            checked={!!addon?.time}
            onChange={(checked) => {
                if (checked) {
                    onChange({
                        ...addon,
                        time: {
                            limit: '',
                            cycle: '',
                            plan: {
                                auto: false,
                                timing: ''
                            }
                        }
                    });
                } else {
                    const { time, ...rest } = addon || {};
                    onChange(rest);
                }
            }}
        >
            <Stack gap="md">
                <FormInput
                    label="时间限制 (limit)"
                    description="任务时间限制，例如：5h, 1d, 30m"
                    placeholder="5h"
                    value={addon?.time?.limit || ''}
                    onChange={(e) => updateTime('limit', e.target.value)}
                />
                <FormInput
                    label="周期 (cycle)"
                    description="超时周期，例如：day 06 00（每天6点）, week 1 06 00（周一6点）, month 1 06 00（1号6点）"
                    placeholder="day 06 00"
                    value={addon?.time?.cycle || ''}
                    onChange={(e) => updateTime('cycle', e.target.value)}
                />
                <FormAddon
                    label="计划 (plan)"
                    description="超时后何时可以接受任务"
                    checked={!!addon?.time?.plan}
                    onChange={(checked) => {
                        if (checked) {
                            updateTime('plan', {
                                auto: false,
                                timing: ''
                            });
                        } else {
                            updateTime('plan', undefined);
                        }
                    }}
                >
                    <Stack gap="md">
                        <FormCheckbox
                            label="自动接受 (auto)"
                            description="是否自动接受任务"
                            checked={addon?.time?.plan?.auto || false}
                            onChange={(e) => updatePlan('auto', e.currentTarget.checked)}
                        />
                        <FormInput
                            label="时间 (timing)"
                            description="何时可以接受任务，例如：day 08 00（每天8点）"
                            placeholder="day 08 00"
                            value={addon?.time?.plan?.timing || ''}
                            onChange={(e) => updatePlan('timing', e.target.value)}
                        />
                    </Stack>
                </FormAddon>
            </Stack>
        </FormAddon>
    );
}

