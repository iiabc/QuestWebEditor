import { FormAddon, FormCheckbox, FormTimePicker } from '@/components/ui';
import { Stack, SegmentedControl } from '@mantine/core';
import { useMemo } from 'react';

interface TimeAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
}

export function TimeAddon({ addon, onChange }: TimeAddonProps) {
    // 判断当前使用的是 limit 还是 cycle
    // 检查字段是否存在于对象中（使用 'in' 操作符）
    const timeType = useMemo(() => {
        const time = addon?.time || {};
        const hasLimit = 'limit' in time;
        const hasCycle = 'cycle' in time;
        
        if (hasLimit) return 'limit';
        if (hasCycle) return 'cycle';
        return 'limit'; // 默认
    }, [addon?.time]);

    const updateTime = (key: string, value: any) => {
        const newTime = { ...addon?.time };
        if (value && value.trim() !== '') {
            newTime[key] = value;
            // 如果设置了 limit，清空 cycle；如果设置了 cycle，清空 limit
            if (key === 'limit') {
                delete newTime.cycle;
            } else if (key === 'cycle') {
                delete newTime.limit;
            }
        } else {
            // 如果值为空，删除该字段
            delete newTime[key];
        }
        onChange({
            ...addon,
            time: newTime
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

    const handleTimeTypeChange = (type: 'limit' | 'cycle') => {
        const newTime: any = { ...addon?.time };
        // 清空另一个字段
        if (type === 'limit') {
            delete newTime.cycle;
            // 如果 limit 不存在或为空，设置为空字符串
            if (!newTime.limit) {
                newTime.limit = '';
            }
        } else {
            delete newTime.limit;
            // 如果 cycle 不存在或为空，设置为空字符串
            if (!newTime.cycle) {
                newTime.cycle = '';
            }
        }
        onChange({
            ...addon,
            time: newTime
        });
    };

    return (
        <FormAddon
            label="时间配置"
            description="时间限制与周期"
            checked={!!addon?.time}
                    onChange={(checked) => {
                if (checked) {
                    onChange({
                        ...addon,
                        time: {
                            limit: '', // 默认使用 limit
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
                <SegmentedControl
                    value={timeType}
                    onChange={(val) => handleTimeTypeChange(val as 'limit' | 'cycle')}
                    data={[
                        { label: '时间限制', value: 'limit' },
                        { label: '周期', value: 'cycle' },
                    ]}
                    fullWidth
                />
                {timeType === 'limit' ? (
                    <FormTimePicker
                        label="时间限制"
                        description=""
                        value={addon?.time?.limit || ''}
                        onChange={(value) => updateTime('limit', value)}
                        mode="duration"
                    />
                ) : (
                    <FormTimePicker
                        label="周期"
                        description=""
                        value={addon?.time?.cycle || ''}
                        onChange={(value) => updateTime('cycle', value)}
                        mode="periodic"
                    />
                )}
                <FormAddon
                    label="计划"
                    description="超时后接受"
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
                            label="自动接受"
                            description=""
                            checked={addon?.time?.plan?.auto || false}
                            onChange={(e) => updatePlan('auto', e.currentTarget.checked)}
                        />
                        <FormTimePicker
                            label="接受时间"
                            description=""
                            value={addon?.time?.plan?.timing || ''}
                            onChange={(value) => updatePlan('timing', value)}
                            mode="periodic"
                        />
                    </Stack>
                </FormAddon>
            </Stack>
        </FormAddon>
    );
}

