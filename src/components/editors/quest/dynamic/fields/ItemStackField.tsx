import React from 'react';
import { InferField } from './InferField';

interface ItemStackFieldProps {
    value: string;
    onChange: (value: string) => void;
}

export const ItemStackField: React.FC<ItemStackFieldProps> = (props) => {
    return <InferField {...props} placeholder="Material (e.g. diamond_sword)" label="ItemStack" />;
};
