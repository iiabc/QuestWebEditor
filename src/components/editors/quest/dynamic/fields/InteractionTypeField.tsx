import { MultiSelect } from '@mantine/core';

/** FancyNPCs ActionTrigger：与 fn-api ActionTrigger 枚举一致 */
const INTERACTION_TYPES = [
    { value: 'ANY_CLICK', label: '任意点击' },
    { value: 'LEFT_CLICK', label: '左键' },
    { value: 'RIGHT_CLICK', label: '右键' },
    { value: 'CUSTOM', label: '自定义' },
];

interface InteractionTypeFieldProps {
    value: string[] | undefined;
    onChange: (value: string[] | undefined) => void;
}

const VALID_VALUES = new Set(INTERACTION_TYPES.map((t) => t.value));

export function InteractionTypeField({ value, onChange }: InteractionTypeFieldProps) {
    const raw = Array.isArray(value) ? value : [];
    const arr = raw.filter((v) => typeof v === 'string' && VALID_VALUES.has(v));
    return (
        <MultiSelect
            size="xs"
            variant="filled"
            placeholder=""
            data={INTERACTION_TYPES}
            value={arr}
            onChange={(v) => onChange(v.length > 0 ? v : undefined)}
            clearable
        />
    );
}
