import { Stack, TextInput, Textarea, Button, Group, Text, ActionIcon, Divider, Box, Accordion } from '@mantine/core';
import { IconTrash, IconPlus, IconCode } from '@tabler/icons-react';
import { Node } from 'reactflow';
import { AgentNodeData } from './nodes/AgentNode';

interface AgentPropertiesProps {
  node: Node<AgentNodeData>;
  onChange: (id: string, data: AgentNodeData) => void;
}

export default function AgentProperties({ node, onChange }: AgentPropertiesProps) {
  const data = node.data;

  const updateData = (updates: Partial<AgentNodeData>) => {
    onChange(node.id, { ...data, ...updates });
  };

  const handleOptionChange = (idx: number, field: keyof AgentNodeData['playerOptions'][0], val: string) => {
    const newOptions = [...data.playerOptions];
    newOptions[idx] = { ...newOptions[idx], [field]: val };
    updateData({ playerOptions: newOptions });
  };

  const addOption = () => {
    const newOptions = [
        ...data.playerOptions, 
        { id: `${node.id}-opt-${Date.now()}`, text: 'New Option' }
    ];
    updateData({ playerOptions: newOptions });
  };

  const removeOption = (idx: number) => {
    const newOptions = [...data.playerOptions];
    newOptions.splice(idx, 1);
    updateData({ playerOptions: newOptions });
  };

  return (
    <Stack gap="md" p="md" h="100%" style={{ overflowY: 'auto' }}>
      <Box>
        <Text size="xs" fw={700} c="dimmed" mb={4}>NODE ID</Text>
        <TextInput 
            value={data.label} 
            onChange={(e) => updateData({ label: e.currentTarget.value })} 
            description="Unique identifier for this conversation node"
        />
      </Box>

      <Box>
        <Text size="xs" fw={700} c="dimmed" mb={4}>SETTINGS</Text>
        <Stack gap="xs">
            <TextInput 
                label="NPC ID" 
                size="xs"
                placeholder="e.g. adyeshach test2"
                value={data.npcId || ''} 
                onChange={(e) => updateData({ npcId: e.currentTarget.value })} 
            />
            <TextInput 
                label="Condition" 
                size="xs"
                placeholder="e.g. check player level < 10"
                value={data.condition || ''} 
                onChange={(e) => updateData({ condition: e.currentTarget.value })} 
            />
        </Stack>
      </Box>

      <Accordion variant="contained" radius="md" defaultValue="npc">
        <Accordion.Item value="npc">
            <Accordion.Control icon={<IconCode size={14} />}>
                <Text size="sm" fw={500}>NPC Lines</Text>
            </Accordion.Control>
            <Accordion.Panel>
                <Textarea 
                    value={data.npcLines.join('\n')} 
                    onChange={(e) => updateData({ npcLines: e.currentTarget.value.split('\n') })}
                    autosize
                    minRows={3}
                    placeholder="Enter NPC dialogue here..."
                />
                <Text size="xs" c="dimmed" mt={4}>One line per message bubble.</Text>
            </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="agent">
            <Accordion.Control icon={<IconCode size={14} />}>
                <Text size="sm" fw={500}>Agent Scripts</Text>
            </Accordion.Control>
            <Accordion.Panel>
                <Stack gap="xs">
                    <Box>
                        <Text size="xs" fw={500}>Begin</Text>
                        <Textarea 
                            size="xs"
                            autosize
                            minRows={2}
                            value={data.agent?.begin || ''}
                            onChange={(e) => updateData({ agent: { ...data.agent, begin: e.currentTarget.value } })}
                            placeholder="Script to run before conversation starts"
                            styles={{ input: { fontFamily: 'monospace' } }}
                        />
                    </Box>
                    <Box>
                        <Text size="xs" fw={500}>End</Text>
                        <Textarea 
                            size="xs"
                            autosize
                            minRows={2}
                            value={data.agent?.end || ''}
                            onChange={(e) => updateData({ agent: { ...data.agent, end: e.currentTarget.value } })}
                            placeholder="Script to run after conversation ends"
                            styles={{ input: { fontFamily: 'monospace' } }}
                        />
                    </Box>
                </Stack>
            </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Divider label="Player Options" labelPosition="center" />

      <Stack gap="md">
        {data.playerOptions.map((opt, idx) => (
            <Box key={opt.id} p="xs" bg="var(--mantine-color-dark-6)" style={{ borderRadius: 6 }}>
                <Group justify="space-between" mb="xs">
                    <Text size="xs" fw={700} c="dimmed">OPTION #{idx + 1}</Text>
                    <ActionIcon color="red" variant="subtle" size="xs" onClick={() => removeOption(idx)}>
                        <IconTrash size={12} />
                    </ActionIcon>
                </Group>
                
                <Stack gap="xs">
                    <TextInput 
                        label="Reply Text"
                        size="xs"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, 'text', e.currentTarget.value)}
                    />
                    <TextInput 
                        label="Condition (if)"
                        size="xs"
                        placeholder="e.g. permission admin"
                        value={opt.condition || ''}
                        onChange={(e) => handleOptionChange(idx, 'condition', e.currentTarget.value)}
                    />
                    <Textarea 
                        label="Actions (then)"
                        size="xs"
                        autosize
                        minRows={1}
                        placeholder="Additional scripts (goto is handled by connections)"
                        value={opt.actions || ''}
                        onChange={(e) => handleOptionChange(idx, 'actions', e.currentTarget.value)}
                        styles={{ input: { fontFamily: 'monospace' } }}
                    />
                </Stack>
            </Box>
        ))}
        
        <Button size="xs" variant="light" leftSection={<IconPlus size={12} />} onClick={addOption}>
            Add Option
        </Button>
      </Stack>
    </Stack>
  );
}
