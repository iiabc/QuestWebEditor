import React from 'react';
import { Switch, Box } from '@mantine/core';

interface BooleanFieldProps {
    value: any;
    onChange: (value: any) => void;
}

export const BooleanField: React.FC<BooleanFieldProps> = ({ value, onChange }) => {
    return (
        <Box px={8} py={4} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Switch 
                checked={value === true}
                onChange={(e) => onChange(e.currentTarget.checked)}
                size="sm"
            />
        </Box>
    );
};
