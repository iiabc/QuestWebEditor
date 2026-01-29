import { useState, useEffect, useMemo } from 'react';
import { Group, Select, NumberInput, Stack, Text, SegmentedControl, Box } from '@mantine/core';

export interface FormTimePickerProps {
    label?: string;
    description?: string;
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    required?: boolean;
    mode?: 'periodic' | 'duration' | 'both'; // 'both' 表示显示模式切换，其他值只显示对应模式
}

type TimeMode = 'periodic' | 'duration';

interface PeriodicTime {
    type: 'day' | 'week' | 'month';
    day?: number; // 对于 week: 星期几(0-6, 0=周日, 1=周一), 对于 month: 日期(1-31)
    hour: number; // 0-23
    minute: number; // 0-59
}

interface DurationTime {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

/**
 * 解析 taboolib 时间周期格式
 * day 06 00 -> { type: 'day', hour: 6, minute: 0 }
 * week 1 10 00 -> { type: 'week', day: 1, hour: 10, minute: 0 }
 * month 1 20 00 -> { type: 'month', day: 1, hour: 20, minute: 0 }
 */
function parsePeriodicTime(str: string): PeriodicTime | null {
    const parts = str.trim().split(/\s+/);
    if (parts.length < 2) return null;

    const type = parts[0].toLowerCase();
    if (type === 'day') {
        if (parts.length >= 3) {
            return {
                type: 'day',
                hour: parseInt(parts[1]) || 0,
                minute: parseInt(parts[2]) || 0,
            };
        }
    } else if (type === 'week') {
        if (parts.length >= 4) {
            return {
                type: 'week',
                day: parseInt(parts[1]) || 0,
                hour: parseInt(parts[2]) || 0,
                minute: parseInt(parts[3]) || 0,
            };
        }
    } else if (type === 'month') {
        if (parts.length >= 4) {
            return {
                type: 'month',
                day: parseInt(parts[1]) || 1,
                hour: parseInt(parts[2]) || 0,
                minute: parseInt(parts[3]) || 0,
            };
        }
    }
    return null;
}

/**
 * 解析 taboolib 时长格式
 * 30m -> { minutes: 30 }
 * 2h -> { hours: 2 }
 * 1d -> { days: 1 }
 * 3h20m -> { hours: 3, minutes: 20 }
 */
function parseDurationTime(str: string): DurationTime | null {
    const regex = /(\d+)([dhms])/gi;
    const matches = Array.from(str.matchAll(regex));
    if (matches.length === 0) return null;

    const result: DurationTime = {};
    for (const match of matches) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        switch (unit) {
            case 'd':
                result.days = value;
                break;
            case 'h':
                result.hours = value;
                break;
            case 'm':
                result.minutes = value;
                break;
            case 's':
                result.seconds = value;
                break;
        }
    }
    return result;
}

/**
 * 生成周期时间字符串
 */
function formatPeriodicTime(time: PeriodicTime): string {
    if (time.type === 'day') {
        return `day ${String(time.hour).padStart(2, '0')} ${String(time.minute).padStart(2, '0')}`;
    } else if (time.type === 'week') {
        return `week ${time.day || 0} ${String(time.hour).padStart(2, '0')} ${String(time.minute).padStart(2, '0')}`;
    } else if (time.type === 'month') {
        return `month ${time.day || 1} ${String(time.hour).padStart(2, '0')} ${String(time.minute).padStart(2, '0')}`;
    }
    return '';
}

/**
 * 生成长时时间字符串
 */
function formatDurationTime(time: DurationTime): string {
    const parts: string[] = [];
    if (time.days) parts.push(`${time.days}d`);
    if (time.hours) parts.push(`${time.hours}h`);
    if (time.minutes) parts.push(`${time.minutes}m`);
    if (time.seconds) parts.push(`${time.seconds}s`);
    return parts.join('');
}

export function FormTimePicker({ label, description, value = '', onChange, error, required, mode: modeProp = 'both' }: FormTimePickerProps) {
    // 解析当前值，判断是周期还是时长
    const initialMode = useMemo(() => {
        if (modeProp !== 'both') return modeProp;
        if (!value) return 'periodic' as TimeMode;
        const periodic = parsePeriodicTime(value);
        if (periodic) return 'periodic' as TimeMode;
        const duration = parseDurationTime(value);
        if (duration) return 'duration' as TimeMode;
        return 'periodic' as TimeMode;
    }, [modeProp]);

    const [mode, setMode] = useState<TimeMode>(initialMode);

    // 如果指定了模式，直接使用该模式
    const effectiveMode = modeProp !== 'both' ? modeProp : mode;

    // 解析周期时间
    const periodicTime = useMemo<PeriodicTime>(() => {
        if (effectiveMode === 'periodic' && value) {
            const parsed = parsePeriodicTime(value);
            if (parsed) return parsed;
        }
        return { type: 'day', hour: 0, minute: 0 };
    }, [effectiveMode, value]);

    // 解析时长时间
    const durationTime = useMemo<DurationTime>(() => {
        if (effectiveMode === 'duration' && value) {
            const parsed = parseDurationTime(value);
            if (parsed) return parsed;
        }
        return {};
    }, [effectiveMode, value]);

    // 当值变化时，自动检测模式（仅在 both 模式下）
    useEffect(() => {
        if (modeProp === 'both' && value) {
            const periodic = parsePeriodicTime(value);
            const duration = parseDurationTime(value);
            if (periodic && mode !== 'periodic') {
                setMode('periodic');
            } else if (duration && mode !== 'duration') {
                setMode('duration');
            }
        }
    }, [value, modeProp]);

    const handleModeChange = (newMode: TimeMode) => {
        if (modeProp === 'both') {
            setMode(newMode);
        }
        // 切换模式时，使用默认值
        if (newMode === 'periodic') {
            onChange?.('day 00 00');
        } else {
            // 时长模式，如果没有值则设为空，否则保持当前值（如果能解析）
            if (!value || !parseDurationTime(value)) {
                onChange?.('');
            }
        }
    };

    const handlePeriodicChange = (updates: Partial<PeriodicTime>) => {
        const newTime = { ...periodicTime, ...updates };
        onChange?.(formatPeriodicTime(newTime));
    };

    const handleDurationChange = (updates: Partial<DurationTime>) => {
        const newTime = { ...durationTime, ...updates };
        onChange?.(formatDurationTime(newTime));
    };

    return (
        <Stack gap="xs">
            {label && (
                <Text size="sm" fw={500}>
                    {label}
                    {required && <Text span c="red"> *</Text>}
                </Text>
            )}
            {description && (
                <Text size="xs" c="dimmed">
                    {description}
                </Text>
            )}

            {modeProp === 'both' && (
                <SegmentedControl
                    value={effectiveMode}
                    onChange={(val) => handleModeChange(val as TimeMode)}
                    data={[
                        { label: '周期', value: 'periodic' },
                        { label: '时长', value: 'duration' },
                    ]}
                    fullWidth
                />
            )}

            {effectiveMode === 'periodic' ? (
                <Stack gap="sm">
                    <Select
                        label="周期类型"
                        data={[
                            { value: 'day', label: '每天' },
                            { value: 'week', label: '每周' },
                            { value: 'month', label: '每月' },
                        ]}
                        value={periodicTime.type}
                        onChange={(val) => handlePeriodicChange({ type: val as 'day' | 'week' | 'month' })}
                    />
                    {periodicTime.type === 'week' && (
                        <Select
                            label="星期几"
                            data={[
                                { value: '0', label: '周日' },
                                { value: '1', label: '周一' },
                                { value: '2', label: '周二' },
                                { value: '3', label: '周三' },
                                { value: '4', label: '周四' },
                                { value: '5', label: '周五' },
                                { value: '6', label: '周六' },
                            ]}
                            value={String(periodicTime.day || 0)}
                            onChange={(val) => handlePeriodicChange({ day: parseInt(val || '0') })}
                        />
                    )}
                    {periodicTime.type === 'month' && (
                        <NumberInput
                            label="日期"
                            min={1}
                            max={31}
                            value={periodicTime.day || 1}
                            onChange={(val) => handlePeriodicChange({ day: typeof val === 'number' ? val : (parseInt(String(val)) || 1) })}
                        />
                    )}
                    <Group grow>
                        <NumberInput
                            label="小时"
                            min={0}
                            max={23}
                            value={periodicTime.hour}
                            onChange={(val) => handlePeriodicChange({ hour: typeof val === 'number' ? val : (parseInt(String(val)) || 0) })}
                        />
                        <NumberInput
                            label="分钟"
                            min={0}
                            max={59}
                            value={periodicTime.minute}
                            onChange={(val) => handlePeriodicChange({ minute: typeof val === 'number' ? val : (parseInt(String(val)) || 0) })}
                        />
                    </Group>
                    <Box p="xs" style={{ backgroundColor: 'var(--mantine-color-dark-7)', borderRadius: 4 }}>
                        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                            {formatPeriodicTime(periodicTime)}
                        </Text>
                    </Box>
                </Stack>
            ) : (
                <Stack gap="sm">
                    <Group grow>
                        <NumberInput
                            label="天"
                            min={0}
                            value={durationTime.days || undefined}
                            onChange={(val) => handleDurationChange({ days: typeof val === 'number' ? (val > 0 ? val : undefined) : undefined })}
                            placeholder="0"
                        />
                        <NumberInput
                            label="小时"
                            min={0}
                            value={durationTime.hours || undefined}
                            onChange={(val) => handleDurationChange({ hours: typeof val === 'number' ? (val > 0 ? val : undefined) : undefined })}
                            placeholder="0"
                        />
                        <NumberInput
                            label="分钟"
                            min={0}
                            value={durationTime.minutes || undefined}
                            onChange={(val) => handleDurationChange({ minutes: typeof val === 'number' ? (val > 0 ? val : undefined) : undefined })}
                            placeholder="0"
                        />
                        <NumberInput
                            label="秒"
                            min={0}
                            value={durationTime.seconds || undefined}
                            onChange={(val) => handleDurationChange({ seconds: typeof val === 'number' ? (val > 0 ? val : undefined) : undefined })}
                            placeholder="0"
                        />
                    </Group>
                    <Box p="xs" style={{ backgroundColor: 'var(--mantine-color-dark-7)', borderRadius: 4 }}>
                        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                            {formatDurationTime(durationTime) || '(空)'}
                        </Text>
                    </Box>
                </Stack>
            )}

            {error && (
                <Text size="xs" c="red">
                    {error}
                </Text>
            )}
        </Stack>
    );
}

