import { useMemo, useState, useEffect } from 'react';
import { Stack, Group, TextInput, NumberInput, Select, SegmentedControl, Text } from '@mantine/core';

export interface NavigateTrackValue {
    location: string;
    adyeshach: string;
    title: string;
}

type NavigateMode = 'location' | 'npc';

const NAV_PROVIDERS = [{ value: 'adyeshach', label: 'Adyeshach' }] as const;

function parseLocation(s: string): { world: string; x: number | ''; y: number | ''; z: number | '' } {
    const t = String(s || '').trim();
    if (!t) return { world: '', x: '', y: '', z: '' };
    const parts = t.split(/\s+/).filter(Boolean);
    if (parts.length < 4) {
        const x = parts[1] != null ? Number(parts[1]) : NaN;
        const y = parts[2] != null ? Number(parts[2]) : NaN;
        const z = parts[3] != null ? Number(parts[3]) : NaN;
        return {
            world: parts[0] || '',
            x: Number.isNaN(x) ? '' : x,
            y: Number.isNaN(y) ? '' : y,
            z: Number.isNaN(z) ? '' : z,
        };
    }
    const x = Number(parts[1]);
    const y = Number(parts[2]);
    const z = Number(parts[3]);
    return {
        world: parts[0],
        x: Number.isNaN(x) ? '' : x,
        y: Number.isNaN(y) ? '' : y,
        z: Number.isNaN(z) ? '' : z,
    };
}

function formatLocation(world: string, x: number | '', y: number | '', z: number | ''): string {
    if (!world || x === '' || y === '' || z === '') return '';
    return `${world} ${x} ${y} ${z}`.trim();
}

interface TrackNavigateFormProps {
    value: NavigateTrackValue;
    onChange: (v: NavigateTrackValue) => void;
}

export function TrackNavigateForm({ value, onChange }: TrackNavigateFormProps) {
    const navigate = value || { location: '', adyeshach: '', title: '' };
    const [mode, setModeState] = useState<NavigateMode>(() =>
        navigate.adyeshach?.trim() ? 'npc' : 'location'
    );

    const parsed = useMemo(() => parseLocation(navigate.location), [navigate.location]);
    const [localWorld, setLocalWorld] = useState(parsed.world);
    const [localX, setLocalX] = useState<number | ''>(parsed.x);
    const [localY, setLocalY] = useState<number | ''>(parsed.y);
    const [localZ, setLocalZ] = useState<number | ''>(parsed.z);

    useEffect(() => {
        const hasNpc = !!navigate.adyeshach?.trim();
        const hasLoc = !!navigate.location?.trim();
        if (hasNpc) setModeState('npc');
        else if (hasLoc) setModeState('location');
    }, [navigate.adyeshach, navigate.location]);

    useEffect(() => {
        setLocalWorld(parsed.world);
        setLocalX(parsed.x);
        setLocalY(parsed.y);
        setLocalZ(parsed.z);
    }, [navigate.location]);

    const update = (patch: Partial<NavigateTrackValue>) => {
        onChange({ ...navigate, ...patch });
    };

    const setMode = (m: NavigateMode) => {
        setModeState(m);
        if (m === 'location') {
            setLocalWorld('');
            setLocalX('');
            setLocalY('');
            setLocalZ('');
            update({ adyeshach: '' });
        } else {
            update({ location: '' });
        }
    };

    const applyLocation = (worldVal: string, xVal: number | '', yVal: number | '', zVal: number | '') => {
        const loc = formatLocation(worldVal, xVal, yVal, zVal);
        const allEmpty = !worldVal.trim() && xVal === '' && yVal === '' && zVal === '';
        if (loc !== '' || allEmpty) update({ location: loc, adyeshach: '' });
    };

    const setNpc = (provider: string, id: string) => {
        if (provider !== 'adyeshach') return;
        update({ adyeshach: id, location: '' });
    };

    return (
        <Stack gap="md">
            <TextInput
                label="导航标题"
                size="xs"
                variant="filled"
                placeholder=""
                value={navigate.title}
                onChange={(e) => update({ title: e.target.value })}
            />
            <div>
                <Text size="sm" fw={500} mb={6}>导航目标</Text>
                <SegmentedControl
                    size="xs"
                    value={mode}
                    onChange={(v) => setMode(v as NavigateMode)}
                    data={[
                        { value: 'location', label: '位置' },
                        { value: 'npc', label: 'NPC' },
                    ]}
                    fullWidth
                />
            </div>

            {mode === 'location' && (
                <Group grow align="flex-start" wrap="wrap">
                    <TextInput
                        label="世界"
                        size="xs"
                        variant="filled"
                        placeholder="world"
                        value={localWorld}
                        onChange={(e) => {
                            const w = e.target.value;
                            setLocalWorld(w);
                            applyLocation(w, localX, localY, localZ);
                        }}
                    />
                    <NumberInput
                        label="X"
                        size="xs"
                        variant="filled"
                        placeholder="0"
                        value={localX === '' ? undefined : localX}
                        onChange={(v) => {
                            const x = v === '' || v == null ? '' : Number(v);
                            setLocalX(x);
                            applyLocation(localWorld, x, localY, localZ);
                        }}
                    />
                    <NumberInput
                        label="Y"
                        size="xs"
                        variant="filled"
                        placeholder="0"
                        value={localY === '' ? undefined : localY}
                        onChange={(v) => {
                            const y = v === '' || v == null ? '' : Number(v);
                            setLocalY(y);
                            applyLocation(localWorld, localX, y, localZ);
                        }}
                    />
                    <NumberInput
                        label="Z"
                        size="xs"
                        variant="filled"
                        placeholder="0"
                        value={localZ === '' ? undefined : localZ}
                        onChange={(v) => {
                            const z = v === '' || v == null ? '' : Number(v);
                            setLocalZ(z);
                            applyLocation(localWorld, localX, localY, z);
                        }}
                    />
                </Group>
            )}

            {mode === 'npc' && (
                <Group grow align="flex-start">
                    <Select
                        label="提供商"
                        size="xs"
                        variant="filled"
                        data={NAV_PROVIDERS}
                        value="adyeshach"
                        allowDeselect={false}
                        readOnly
                    />
                    <TextInput
                        label="NPC ID"
                        size="xs"
                        variant="filled"
                        placeholder="Adyeshach 实体 ID"
                        value={navigate.adyeshach}
                        onChange={(e) => setNpc('adyeshach', e.target.value.trim())}
                    />
                </Group>
            )}
        </Stack>
    );
}
