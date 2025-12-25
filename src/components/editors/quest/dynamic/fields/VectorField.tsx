import React from 'react';
import { LocationField } from './LocationField';

interface VectorFieldProps {
    value: string;
    onChange: (value: string) => void;
}

export const VectorField: React.FC<VectorFieldProps> = ({ value, onChange }) => {
    return <LocationField value={value} onChange={onChange} disableWorld />;
};
