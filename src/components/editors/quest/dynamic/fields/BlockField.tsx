import React from 'react';
import { InferField } from './InferField';

interface BlockFieldProps {
    value: string;
    onChange: (value: string) => void;
}

export const BlockField: React.FC<BlockFieldProps> = (props) => {
    return <InferField {...props} placeholder="Material (e.g. stone)" label="Block" />;
};
