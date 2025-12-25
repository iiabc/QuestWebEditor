import React, { useEffect, useState } from 'react';
import { Group, NumberInput, TextInput, Select, Stack, Text } from '@mantine/core';

interface LocationFieldProps {
    value: string;
    onChange: (value: string) => void;
    disableWorld?: boolean;
}

type LocationType = 'point' | 'range' | 'area';

export const LocationField: React.FC<LocationFieldProps> = ({ value, onChange, disableWorld }) => {
    const [type, setType] = useState<LocationType>('point');
    const [world, setWorld] = useState('');
    const [x, setX] = useState<number | ''>('');
    const [y, setY] = useState<number | ''>('');
    const [z, setZ] = useState<number | ''>('');
    
    // Range
    const [radius, setRadius] = useState<number | ''>('');

    // Area
    const [x2, setX2] = useState<number | ''>('');
    const [y2, setY2] = useState<number | ''>('');
    const [z2, setZ2] = useState<number | ''>('');

    useEffect(() => {
        if (!value) return;

        const strVal = String(value);
        const parts = strVal.split(' ');
        const offset = disableWorld ? 0 : 1;

        if (strVal.includes('>')) {
            setType('area');
            // [world] x1 y1 z1 > x2 y2 z2
            if (parts.length >= 7 + offset) {
                if (!disableWorld) setWorld(parts[0]);
                setX(parseFloat(parts[0 + offset]));
                setY(parseFloat(parts[1 + offset]));
                setZ(parseFloat(parts[2 + offset]));
                setX2(parseFloat(parts[4 + offset]));
                setY2(parseFloat(parts[5 + offset]));
                setZ2(parseFloat(parts[6 + offset]));
            }
        } else if (value.includes('~')) {
            setType('range');
            // [world] x y z ~ r
            if (parts.length >= 5 + offset) {
                if (!disableWorld) setWorld(parts[0]);
                setX(parseFloat(parts[0 + offset]));
                setY(parseFloat(parts[1 + offset]));
                setZ(parseFloat(parts[2 + offset]));
                setRadius(parseFloat(parts[4 + offset]));
            }
        } else {
            setType('point');
            // [world] x y z
            if (parts.length >= 3 + offset) {
                if (!disableWorld) setWorld(parts[0]);
                setX(parseFloat(parts[0 + offset]));
                setY(parseFloat(parts[1 + offset]));
                setZ(parseFloat(parts[2 + offset]));
            }
        }
    }, [value, disableWorld]);

    const updateValue = () => {
        const isPointValid = (!disableWorld ? !!world : true) && x !== '' && y !== '' && z !== '';
        let valid = false;
        let result = '';
        const prefix = disableWorld ? '' : `${world} `;

        if (type === 'point') {
            valid = isPointValid;
            if (valid) result = `${prefix}${x} ${y} ${z}`;
        } else if (type === 'range') {
            valid = isPointValid && radius !== '';
            if (valid) result = `${prefix}${x} ${y} ${z} ~ ${radius}`;
        } else if (type === 'area') {
            valid = isPointValid && x2 !== '' && y2 !== '' && z2 !== '';
            if (valid) result = `${prefix}${x} ${y} ${z} > ${x2} ${y2} ${z2}`;
        }

        if (valid) {
            onChange(result);
        } else {
            onChange('');
        }
    };

    // Trigger update when any field changes
    useEffect(() => {
        const timer = setTimeout(updateValue, 100);
        return () => clearTimeout(timer);
    }, [type, world, x, y, z, radius, x2, y2, z2]);

    const hasAnyValue = (!disableWorld && !!world) || x !== '' || y !== '' || z !== '' || 
                        (type === 'range' && radius !== '') || 
                        (type === 'area' && (x2 !== '' || y2 !== '' || z2 !== ''));
    
    const isError = (val: any) => hasAnyValue && (val === '' || val === undefined);

    return (
        <Stack gap="xs">
            <Group grow>
                <Select
                    data={[
                        { value: 'point', label: '坐标点 (Point)' },
                        { value: 'range', label: '范围 (Range)' },
                        { value: 'area', label: '区域 (Area)' },
                    ]}
                    value={type}
                    onChange={(val) => setType(val as LocationType)}
                    size="xs"
                    allowDeselect={false}
                    variant="filled"
                />
                {!disableWorld && (
                    <TextInput
                        placeholder="世界名"
                        value={world}
                        onChange={(e) => setWorld(e.target.value)}
                        size="xs"
                        variant="filled"
                        error={isError(world)}
                    />
                )}
            </Group>
            
            <Group grow gap="xs">
                <NumberInput 
                    placeholder="0" 
                    value={x} 
                    onChange={(val) => setX(val === '' ? '' : Number(val))} 
                    size="xs" 
                    decimalScale={2} 
                    hideControls 
                    variant="filled"
                    leftSection={<Text size="xs" c="dimmed">X1</Text>}
                    styles={{ input: { paddingLeft: 24 } }}
                    error={isError(x)}
                />
                <NumberInput 
                    placeholder="0" 
                    value={y} 
                    onChange={(val) => setY(val === '' ? '' : Number(val))} 
                    size="xs" 
                    decimalScale={2} 
                    hideControls 
                    variant="filled"
                    leftSection={<Text size="xs" c="dimmed">Y1</Text>}
                    styles={{ input: { paddingLeft: 24 } }}
                    error={isError(y)}
                />
                <NumberInput 
                    placeholder="0" 
                    value={z} 
                    onChange={(val) => setZ(val === '' ? '' : Number(val))} 
                    size="xs" 
                    decimalScale={2} 
                    hideControls 
                    variant="filled"
                    leftSection={<Text size="xs" c="dimmed">Z1</Text>}
                    styles={{ input: { paddingLeft: 24 } }}
                    error={isError(z)}
                />
            </Group>

            {type === 'range' && (
                <NumberInput
                    label="半径 (Radius)"
                    placeholder="0"
                    value={radius}
                    onChange={(val) => setRadius(val === '' ? '' : Number(val))}
                    size="xs"
                    decimalScale={2}
                    variant="filled"
                    error={isError(radius)}
                />
            )}

            {type === 'area' && (
                <Group grow gap="xs">
                    <NumberInput 
                        placeholder="0" 
                        value={x2} 
                        onChange={(val) => setX2(val === '' ? '' : Number(val))} 
                        size="xs" 
                        decimalScale={2} 
                        hideControls 
                        variant="filled"
                        leftSection={<Text size="xs" c="dimmed">X2</Text>}
                        styles={{ input: { paddingLeft: 24 } }}
                        error={isError(x2)}
                    />
                    <NumberInput 
                        placeholder="0" 
                        value={y2} 
                        onChange={(val) => setY2(val === '' ? '' : Number(val))} 
                        size="xs" 
                        decimalScale={2} 
                        hideControls 
                        variant="filled"
                        leftSection={<Text size="xs" c="dimmed">Y2</Text>}
                        styles={{ input: { paddingLeft: 24 } }}
                        error={isError(y2)}
                    />
                    <NumberInput 
                        placeholder="0" 
                        value={z2} 
                        onChange={(val) => setZ2(val === '' ? '' : Number(val))} 
                        size="xs" 
                        decimalScale={2} 
                        hideControls 
                        variant="filled"
                        leftSection={<Text size="xs" c="dimmed">Z2</Text>}
                        styles={{ input: { paddingLeft: 24 } }}
                        error={isError(z2)}
                    />
                </Group>
            )}
        </Stack>
    );
};
