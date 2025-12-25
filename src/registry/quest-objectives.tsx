import { TextInput, NumberInput } from '@mantine/core';

export interface ObjectiveFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const BlockBreakForm = ({ data, onChange }: ObjectiveFormProps) => (
  <>
    <TextInput
      label="Material"
      placeholder="STONE"
      value={data.condition?.material || ''}
      onChange={(e) => onChange({ ...data, condition: { ...data.condition, material: e.target.value } })}
    />
    <NumberInput
      label="Amount"
      value={data.goal?.amount || 1}
      onChange={(val) => onChange({ ...data, goal: { ...data.goal, amount: val } })}
    />
  </>
);

export const KillForm = ({ data, onChange }: ObjectiveFormProps) => (
  <>
    <TextInput
      label="Mob Type"
      placeholder="ZOMBIE"
      value={data.condition?.entity || ''}
      onChange={(e) => onChange({ ...data, condition: { ...data.condition, entity: e.target.value } })}
    />
    <NumberInput
      label="Amount"
      value={data.goal?.amount || 1}
      onChange={(val) => onChange({ ...data, goal: { ...data.goal, amount: val } })}
    />
  </>
);

export const ObjectiveRegistry: Record<string, React.FC<ObjectiveFormProps>> = {
  'block break': BlockBreakForm,
  'kill': KillForm,
};
