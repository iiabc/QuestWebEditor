import React from 'react';
import { InferField } from './InferField';

interface EntityFieldProps {
    value: string;
    onChange: (value: string) => void;
}

export const EntityField: React.FC<EntityFieldProps> = (props) => {
    return <InferField {...props} placeholder="Type (e.g. zombie)" label="Entity" />;
};
