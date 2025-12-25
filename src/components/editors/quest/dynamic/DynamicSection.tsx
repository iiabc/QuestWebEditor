import React from 'react';
import { DynamicField } from './DynamicField';
import { ObjectiveField } from '@/store/useApiStore';

interface DynamicSectionProps {
    fields: ObjectiveField[];
    data: any;
    onChange: (data: any) => void;
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({ fields, data, onChange }) => {
    const handleChange = (field: string, value: any) => {
        const newData = { ...data };
        if (value === undefined || value === '' || value === null) {
            delete newData[field];
        } else {
            newData[field] = value;
        }
        onChange(newData);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="border border-(--mantine-color-dark-4) rounded-md overflow-hidden">
                {fields.map((field) => (
                    <DynamicField
                        key={field.name}
                        field={field}
                        value={data?.[field.name]}
                        onChange={(val) => handleChange(field.name, val)}
                    />
                ))}
            </div>
            
        </div>
    );
};
