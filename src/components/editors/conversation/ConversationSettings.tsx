import { Modal, Stack, Button, Group, Text, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

export interface ConversationOptions {
    // QuestEngine doesn't use global options
}

interface ConversationSettingsProps {
    opened: boolean;
    onClose: () => void;
    options: ConversationOptions;
    onSave: (options: ConversationOptions) => void;
}

export function ConversationSettings({ opened, onClose, options: _options, onSave }: ConversationSettingsProps) {
    const handleSave = () => {
        onSave({});
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={<Text fw={700}>对话设置</Text>}
            size="md"
        >
            <Stack gap="md">
                <Alert icon={<IconInfoCircle size={16} />} title="提示" color="blue">
                    对话配置在各节点中设置
                </Alert>

                <Group justify="flex-end" mt="md">
                    <Button onClick={handleSave}>确定</Button>
                </Group>
            </Stack>
        </Modal>
    );
}