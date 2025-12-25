import { Tabs, TabsProps, FloatingIndicator, Box } from '@mantine/core';
import { useState, useRef } from 'react';
import classes from './AnimatedTabs.module.css';

export interface TabItem {
    value: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
}

export interface AnimatedTabsProps extends Omit<TabsProps, 'children'> {
    tabs: TabItem[];
    children: React.ReactNode;
    listPadding?: string | number;
}

export function AnimatedTabs({ tabs, children, onChange, value: controlledValue, defaultValue, listPadding, ...props }: AnimatedTabsProps) {
    const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
    const [internalValue, setInternalValue] = useState<string | null>(defaultValue || (tabs[0]?.value) || null);
    const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});
    const callbackRefs = useRef<Record<string, (node: HTMLButtonElement) => void>>({});
    
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const setControlRef = (val: string) => {
        if (!callbackRefs.current[val]) {
            callbackRefs.current[val] = (node: HTMLButtonElement) => {
                setControlsRefs(prev => {
                    if (prev[val] === node) return prev;
                    return { ...prev, [val]: node };
                });
            };
        }
        return callbackRefs.current[val];
    };

    const handleChange = (val: string | null) => {
        if (controlledValue === undefined) {
            setInternalValue(val);
        }
        onChange?.(val);
    };

    return (
        <Tabs variant="none" value={value} onChange={handleChange} {...props}>
            <Box className={classes.listContainer} p={listPadding}>
                <Tabs.List ref={setRootRef} className={classes.list}>
                    {tabs.map(tab => (
                        <Tabs.Tab 
                            key={tab.value} 
                            value={tab.value} 
                            ref={setControlRef(tab.value)}
                            leftSection={tab.icon}
                            className={classes.tab}
                        >
                            {tab.label}
                        </Tabs.Tab>
                    ))}
                    <FloatingIndicator
                        target={value ? controlsRefs[value] : null}
                        parent={rootRef}
                        className={classes.indicator}
                    />
                </Tabs.List>
            </Box>
            {children}
        </Tabs>
    );
}
