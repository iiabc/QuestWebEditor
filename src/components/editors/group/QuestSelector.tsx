import React, { useMemo, useState, KeyboardEvent } from 'react';
import { Modal, Combobox, TextInput, Stack, Text, Button, Group, ScrollArea, Box, Badge, ActionIcon } from '@mantine/core';
import { useCombobox } from '@mantine/core';
import { VirtualFile } from '@/store/useProjectStore';
import { parseYaml } from '@/utils/yaml-utils';
import { IconX } from '@tabler/icons-react';

interface QuestInfo {
    id: string;
    name: string;
    fileId: string;
}

interface QuestSelectorProps {
    opened: boolean;
    onClose: () => void;
    availableQuests: Record<string, VirtualFile>;
    selectedQuestIds: string[];
    onSelect: (questIds: string[]) => void;
}

export function QuestSelector({
    opened,
    onClose,
    availableQuests,
    selectedQuestIds,
    onSelect
}: QuestSelectorProps) {
    const [inputValue, setInputValue] = useState('');
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    // 从任务文件中提取任务信息
    const questOptions = useMemo(() => {
        const quests: QuestInfo[] = [];
        
        Object.entries(availableQuests).forEach(([fileId, file]) => {
            if (!file.content) return;
            
            try {
                const parsed = parseYaml(file.content);
                if (!parsed || typeof parsed !== 'object') return;
                
                // 获取顶层 key（任务 ID）
                const questIds = Object.keys(parsed);
                questIds.forEach(questId => {
                    const questData = parsed[questId];
                    const questName = questData?.meta?.name || questId;
                    quests.push({
                        id: questId,
                        name: questName,
                        fileId
                    });
                });
            } catch (e) {
                // 解析失败，跳过
            }
        });
        
        return quests;
    }, [availableQuests]);

    // 根据输入值过滤选项
    const filteredOptions = useMemo(() => {
        if (!inputValue.trim()) {
            return questOptions;
        }
        const lowerInput = inputValue.toLowerCase();
        return questOptions.filter(quest => 
            quest.id.toLowerCase().includes(lowerInput) ||
            quest.name.toLowerCase().includes(lowerInput)
        );
    }, [questOptions, inputValue]);

    // 获取已选择任务的名称映射
    const selectedQuestMap = useMemo(() => {
        const map: Record<string, string> = {};
        selectedQuestIds.forEach(id => {
            const quest = questOptions.find(q => q.id === id);
            map[id] = quest?.name || id;
        });
        return map;
    }, [selectedQuestIds, questOptions]);

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && inputValue.trim()) {
            event.preventDefault();
            const trimmedValue = inputValue.trim();
            if (!selectedQuestIds.includes(trimmedValue)) {
                onSelect([...selectedQuestIds, trimmedValue]);
            }
            setInputValue('');
            combobox.closeDropdown();
        } else if (event.key === 'Escape') {
            combobox.closeDropdown();
        }
    };

    const handleOptionSelect = (questId: string) => {
        if (!selectedQuestIds.includes(questId)) {
            onSelect([...selectedQuestIds, questId]);
        }
        setInputValue('');
        combobox.closeDropdown();
    };

    const handleRemoveQuest = (questId: string) => {
        onSelect(selectedQuestIds.filter(id => id !== questId));
    };

    const handleConfirm = () => {
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="选择任务"
            size="lg"
        >
            <Stack gap="md">
                <Text size="sm" c="dimmed">
                    输入任务 ID 或从列表中选择，按 Enter 键添加
                </Text>
                
                <Combobox
                    store={combobox}
                    onOptionSubmit={handleOptionSelect}
                >
                    <Combobox.Target>
                        <TextInput
                            placeholder="输入任务 ID 或搜索..."
                            value={inputValue}
                            onChange={(event) => {
                                setInputValue(event.currentTarget.value);
                                combobox.openDropdown();
                            }}
                            onFocus={() => combobox.openDropdown()}
                            onBlur={() => combobox.closeDropdown()}
                            onKeyDown={handleInputKeyDown}
                        />
                    </Combobox.Target>

                    <Combobox.Dropdown>
                        <Combobox.Options>
                            <ScrollArea.Autosize mah={200} type="scroll">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((quest) => (
                                        <Combobox.Option
                                            key={quest.id}
                                            value={quest.id}
                                            disabled={selectedQuestIds.includes(quest.id)}
                                        >
                                            {quest.name} ({quest.id})
                                        </Combobox.Option>
                                    ))
                                ) : (
                                    <Combobox.Empty>未找到任务</Combobox.Empty>
                                )}
                            </ScrollArea.Autosize>
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>

                {selectedQuestIds.length > 0 && (
                    <Box>
                        <Text size="xs" fw={500} mb="xs" c="dimmed">已选择的任务：</Text>
                        <Group gap="xs">
                            {selectedQuestIds.map(questId => (
                                <Badge
                                    key={questId}
                                    variant="light"
                                    rightSection={
                                        <ActionIcon
                                            size="xs"
                                            color="red"
                                            radius="xl"
                                            variant="transparent"
                                            onClick={() => handleRemoveQuest(questId)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <IconX size={12} />
                                        </ActionIcon>
                                    }
                                >
                                    {selectedQuestMap[questId]}
                                </Badge>
                            ))}
                        </Group>
                    </Box>
                )}

                <Group justify="flex-end">
                    <Button onClick={handleConfirm}>
                        确定
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}

