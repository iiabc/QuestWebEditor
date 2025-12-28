import React, { useEffect, useState } from 'react';
import { Group, NumberInput, TextInput, Select, Stack, Text, Button, ActionIcon, Box } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface LocationInterpreterFieldProps {
    value: string;
    onChange: (value: string) => void;
    disableWorld?: boolean;
}

type LocationType = 'area' | 'range' | 'single';

interface Point {
    world?: string;
    x: number | '';
    y: number | '';
    z: number | '';
}

export const LocationInterpreterField: React.FC<LocationInterpreterFieldProps> = ({ value, onChange, disableWorld }) => {
    const [type, setType] = useState<LocationType>('single');
    const [world, setWorld] = useState('');
    
    // Area: 两点
    const [point1, setPoint1] = useState<Point>({ x: '', y: '', z: '' });
    const [point2, setPoint2] = useState<Point>({ x: '', y: '', z: '' });
    
    // Range: 一点 + 半径
    const [rangePoint, setRangePoint] = useState<Point>({ x: '', y: '', z: '' });
    const [radius, setRadius] = useState<number | ''>('');
    
    // Single: 多个点
    const [points, setPoints] = useState<Point[]>([{ x: '', y: '', z: '' }]);

    // 解析现有值
    useEffect(() => {
        if (!value) {
            setType('single');
            setWorld('');
            setPoint1({ x: '', y: '', z: '' });
            setPoint2({ x: '', y: '', z: '' });
            setRangePoint({ x: '', y: '', z: '' });
            setRadius('');
            setPoints([{ x: '', y: '', z: '' }]);
            return;
        }

        const strVal = String(value).trim();
        
        // 检测区域格式: world x1 y1 z1 > x2 y2 z2
        if (strVal.includes('>')) {
            setType('area');
            const parts = strVal.split('>').map(s => s.trim());
            const leftParts = parts[0].split(' ').filter(p => p);
            const rightParts = parts[1].split(' ').filter(p => p);
            
            const offset = disableWorld ? 0 : 1;
            
            if (leftParts.length >= 3 + offset && rightParts.length >= 3) {
                if (!disableWorld && leftParts.length > 0) {
                    setWorld(leftParts[0]);
                }
                setPoint1({
                    x: parseFloat(leftParts[0 + offset]) || '',
                    y: parseFloat(leftParts[1 + offset]) || '',
                    z: parseFloat(leftParts[2 + offset]) || ''
                });
                setPoint2({
                    x: parseFloat(rightParts[0]) || '',
                    y: parseFloat(rightParts[1]) || '',
                    z: parseFloat(rightParts[2]) || ''
                });
            }
        }
        // 检测范围格式: world x y z ~ radius
        else if (strVal.includes('~')) {
            setType('range');
            const parts = strVal.split('~').map(s => s.trim());
            const leftParts = parts[0].split(' ').filter(p => p);
            const radiusStr = parts[1];
            
            const offset = disableWorld ? 0 : 1;
            
            if (leftParts.length >= 3 + offset) {
                if (!disableWorld && leftParts.length > 0) {
                    setWorld(leftParts[0]);
                }
                setRangePoint({
                    x: parseFloat(leftParts[0 + offset]) || '',
                    y: parseFloat(leftParts[1 + offset]) || '',
                    z: parseFloat(leftParts[2 + offset]) || ''
                });
                setRadius(parseFloat(radiusStr) || '');
            }
        }
        // 检测单点格式: world x1 y1 z1 & x2 y2 z2 & x3 y3 z3
        else if (strVal.includes('&')) {
            setType('single');
            const pointStrings = strVal.split('&').map(s => s.trim()).filter(s => s);
            const parsedPoints: Point[] = [];
            
            pointStrings.forEach(pointStr => {
                const parts = pointStr.split(' ').filter(p => p);
                const offset = disableWorld ? 0 : 1;
                
                if (parts.length >= 3 + offset) {
                    const point: Point = {
                        x: parseFloat(parts[0 + offset]) || '',
                        y: parseFloat(parts[1 + offset]) || '',
                        z: parseFloat(parts[2 + offset]) || ''
                    };
                    if (!disableWorld && parts.length > 0) {
                        point.world = parts[0];
                    }
                    parsedPoints.push(point);
                } else if (parts.length >= 3) {
                    // noWorld 模式
                    parsedPoints.push({
                        x: parseFloat(parts[0]) || '',
                        y: parseFloat(parts[1]) || '',
                        z: parseFloat(parts[2]) || ''
                    });
                }
            });
            
            if (parsedPoints.length > 0) {
                setPoints(parsedPoints);
                if (!disableWorld && parsedPoints[0].world) {
                    setWorld(parsedPoints[0].world);
                }
            } else {
                setPoints([{ x: '', y: '', z: '' }]);
            }
        }
        // 单个点格式: world x y z
        else {
            setType('single');
            const parts = strVal.split(' ').filter(p => p);
            const offset = disableWorld ? 0 : 1;
            
            if (parts.length >= 3 + offset) {
                if (!disableWorld && parts.length > 0) {
                    setWorld(parts[0]);
                }
                setPoints([{
                    x: parseFloat(parts[0 + offset]) || '',
                    y: parseFloat(parts[1 + offset]) || '',
                    z: parseFloat(parts[2 + offset]) || ''
                }]);
            } else {
                setPoints([{ x: '', y: '', z: '' }]);
            }
        }
    }, [value, disableWorld]);

    // 生成值
    const updateValue = () => {
        const prefix = disableWorld ? '' : `${world} `;
        let result = '';

        if (type === 'area') {
            const isValid = (!disableWorld ? !!world : true) && 
                           point1.x !== '' && point1.y !== '' && point1.z !== '' &&
                           point2.x !== '' && point2.y !== '' && point2.z !== '';
            if (isValid) {
                result = `${prefix}${point1.x} ${point1.y} ${point1.z} > ${point2.x} ${point2.y} ${point2.z}`;
            }
        } else if (type === 'range') {
            const isValid = (!disableWorld ? !!world : true) && 
                           rangePoint.x !== '' && rangePoint.y !== '' && rangePoint.z !== '' &&
                           radius !== '';
            if (isValid) {
                result = `${prefix}${rangePoint.x} ${rangePoint.y} ${rangePoint.z} ~ ${radius}`;
            }
        } else if (type === 'single') {
            const validPoints = points.filter(p => p.x !== '' && p.y !== '' && p.z !== '');
            if (validPoints.length > 0) {
                const pointStrings = validPoints.map(p => {
                    if (disableWorld) {
                        return `${p.x} ${p.y} ${p.z}`;
                    } else {
                        // 如果点有世界名称，使用点的世界名称；否则使用全局世界名称
                        const pWorld = p.world || world;
                        return pWorld ? `${pWorld} ${p.x} ${p.y} ${p.z}` : `${p.x} ${p.y} ${p.z}`;
                    }
                });
                result = pointStrings.join(' & ');
            }
        }

        onChange(result);
    };

    // 当任何字段变化时更新值
    useEffect(() => {
        const timer = setTimeout(() => {
            updateValue();
        }, 100);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, world, point1, point2, rangePoint, radius, points, disableWorld]);

    const hasAnyValue = (!disableWorld && !!world) || 
                       (type === 'area' && (point1.x !== '' || point1.y !== '' || point1.z !== '' || point2.x !== '' || point2.y !== '' || point2.z !== '')) ||
                       (type === 'range' && (rangePoint.x !== '' || rangePoint.y !== '' || rangePoint.z !== '' || radius !== '')) ||
                       (type === 'single' && points.some(p => p.x !== '' || p.y !== '' || p.z !== ''));
    
    const isError = (val: any) => hasAnyValue && (val === '' || val === undefined);

    const updatePoint = (index: number, field: keyof Point, val: any) => {
        const newPoints = [...points];
        newPoints[index] = { ...newPoints[index], [field]: val };
        setPoints(newPoints);
    };

    const addPoint = () => {
        const newPoint: Point = disableWorld 
            ? { x: '', y: '', z: '' }
            : { world: world || '', x: '', y: '', z: '' };
        setPoints([...points, newPoint]);
    };


    const removePoint = (index: number) => {
        if (points.length > 1) {
            setPoints(points.filter((_, i) => i !== index));
        }
    };

    return (
        <Stack gap="xs">
            <Group grow>
                <Select
                    data={[
                        { value: 'area', label: '区域 (Area)' },
                        { value: 'range', label: '范围 (Range)' },
                        { value: 'single', label: '单点 (Single)' },
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

            {type === 'area' && (
                <>
                    <Text size="xs" fw={500} c="dimmed">第一点</Text>
                    <Group grow gap="xs">
                        <NumberInput 
                            placeholder="0" 
                            value={point1.x} 
                            onChange={(val) => setPoint1({ ...point1, x: val === '' ? '' : Number(val) })} 
                            size="xs" 
                            decimalScale={2} 
                            hideControls 
                            variant="filled"
                            leftSection={<Text size="xs" c="dimmed">X1</Text>}
                            styles={{ input: { paddingLeft: 24 } }}
                            error={isError(point1.x)}
                        />
                        <NumberInput 
                            placeholder="0" 
                            value={point1.y} 
                            onChange={(val) => setPoint1({ ...point1, y: val === '' ? '' : Number(val) })} 
                            size="xs" 
                            decimalScale={2} 
                            hideControls 
                            variant="filled"
                            leftSection={<Text size="xs" c="dimmed">Y1</Text>}
                            styles={{ input: { paddingLeft: 24 } }}
                            error={isError(point1.y)}
                        />
                        <NumberInput 
                            placeholder="0" 
                            value={point1.z} 
                            onChange={(val) => setPoint1({ ...point1, z: val === '' ? '' : Number(val) })} 
                            size="xs" 
                            decimalScale={2} 
                            hideControls 
                            variant="filled"
                            leftSection={<Text size="xs" c="dimmed">Z1</Text>}
                            styles={{ input: { paddingLeft: 24 } }}
                            error={isError(point1.z)}
                        />
                    </Group>
                    <Text size="xs" fw={500} c="dimmed" mt="xs">第二点</Text>
                    <Group grow gap="xs">
                        <NumberInput 
                            placeholder="0" 
                            value={point2.x} 
                            onChange={(val) => setPoint2({ ...point2, x: val === '' ? '' : Number(val) })} 
                            size="xs" 
                            decimalScale={2} 
                            hideControls 
                            variant="filled"
                            leftSection={<Text size="xs" c="dimmed">X2</Text>}
                            styles={{ input: { paddingLeft: 24 } }}
                            error={isError(point2.x)}
                        />
                        <NumberInput 
                            placeholder="0" 
                            value={point2.y} 
                            onChange={(val) => setPoint2({ ...point2, y: val === '' ? '' : Number(val) })} 
                            size="xs" 
                            decimalScale={2} 
                            hideControls 
                            variant="filled"
                            leftSection={<Text size="xs" c="dimmed">Y2</Text>}
                            styles={{ input: { paddingLeft: 24 } }}
                            error={isError(point2.y)}
                        />
                        <NumberInput 
                            placeholder="0" 
                            value={point2.z} 
                            onChange={(val) => setPoint2({ ...point2, z: val === '' ? '' : Number(val) })} 
                            size="xs" 
                            decimalScale={2} 
                            hideControls 
                            variant="filled"
                            leftSection={<Text size="xs" c="dimmed">Z2</Text>}
                            styles={{ input: { paddingLeft: 24 } }}
                            error={isError(point2.z)}
                        />
                    </Group>
                </>
            )}

            {type === 'range' && (
                <>
                    <Text size="xs" fw={500} c="dimmed">中心点</Text>
                    <Group grow gap="xs">
                        <NumberInput 
                            placeholder="0" 
                            value={rangePoint.x} 
                            onChange={(val) => setRangePoint({ ...rangePoint, x: val === '' ? '' : Number(val) })} 
                            size="xs" 
                            decimalScale={2} 
                            hideControls 
                            variant="filled"
                            leftSection={<Text size="xs" c="dimmed">X</Text>}
                            styles={{ input: { paddingLeft: 24 } }}
                            error={isError(rangePoint.x)}
                        />
                        <NumberInput 
                            placeholder="0" 
                            value={rangePoint.y} 
                            onChange={(val) => setRangePoint({ ...rangePoint, y: val === '' ? '' : Number(val) })} 
                            size="xs" 
                            decimalScale={2} 
                            hideControls 
                            variant="filled"
                            leftSection={<Text size="xs" c="dimmed">Y</Text>}
                            styles={{ input: { paddingLeft: 24 } }}
                            error={isError(rangePoint.y)}
                        />
                        <NumberInput 
                            placeholder="0" 
                            value={rangePoint.z} 
                            onChange={(val) => setRangePoint({ ...rangePoint, z: val === '' ? '' : Number(val) })} 
                            size="xs" 
                            decimalScale={2} 
                            hideControls 
                            variant="filled"
                            leftSection={<Text size="xs" c="dimmed">Z</Text>}
                            styles={{ input: { paddingLeft: 24 } }}
                            error={isError(rangePoint.z)}
                        />
                    </Group>
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
                </>
            )}

            {type === 'single' && (
                <Stack gap="xs">
                    {points.map((point, index) => (
                        <Box key={index} p="xs" style={{ backgroundColor: 'var(--mantine-color-dark-6)', borderRadius: 4 }}>
                            <Group gap="xs" align="flex-start">
                                {!disableWorld && (
                                    <TextInput
                                        placeholder="世界名（留空使用全局）"
                                        value={point.world || ''}
                                        onChange={(e) => updatePoint(index, 'world', e.target.value)}
                                        size="xs"
                                        variant="filled"
                                        style={{ flex: 0, minWidth: 120 }}
                                    />
                                )}
                                <NumberInput 
                                    placeholder="X" 
                                    value={point.x} 
                                    onChange={(val) => updatePoint(index, 'x', val === '' ? '' : Number(val))} 
                                    size="xs" 
                                    decimalScale={2} 
                                    hideControls 
                                    variant="filled"
                                    style={{ flex: 1 }}
                                    error={isError(point.x)}
                                />
                                <NumberInput 
                                    placeholder="Y" 
                                    value={point.y} 
                                    onChange={(val) => updatePoint(index, 'y', val === '' ? '' : Number(val))} 
                                    size="xs" 
                                    decimalScale={2} 
                                    hideControls 
                                    variant="filled"
                                    style={{ flex: 1 }}
                                    error={isError(point.y)}
                                />
                                <NumberInput 
                                    placeholder="Z" 
                                    value={point.z} 
                                    onChange={(val) => updatePoint(index, 'z', val === '' ? '' : Number(val))} 
                                    size="xs" 
                                    decimalScale={2} 
                                    hideControls 
                                    variant="filled"
                                    style={{ flex: 1 }}
                                    error={isError(point.z)}
                                />
                                <ActionIcon 
                                    color="red" 
                                    variant="subtle" 
                                    size="sm" 
                                    onClick={() => removePoint(index)}
                                    disabled={points.length === 1}
                                >
                                    <IconTrash size={14} />
                                </ActionIcon>
                            </Group>
                        </Box>
                    ))}
                    <Button 
                        size="xs" 
                        variant="light" 
                        leftSection={<IconPlus size={14} />} 
                        onClick={addPoint}
                        fullWidth
                    >
                        添加点
                    </Button>
                </Stack>
            )}
        </Stack>
    );
};

