import { Paper, Tabs, Text } from '@mantine/core';
import { useProjectStore } from '@/store/useProjectStore';
import { parseYaml, toYaml, sanitizeQuestForYaml } from '@/utils/yaml-utils';
import { IconSettings, IconCheckbox } from '@tabler/icons-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DropResult } from '@hello-pangea/dnd';

import { QuestSettings } from './QuestSettings';
import { QuestTaskList } from './QuestTaskList';
import { QuestDetail } from './QuestDetail';
import { AnimatedTabs } from '@/components/ui';

export default function QuestForm({ fileId }: { fileId: string }) {
  // 只订阅需要的数据
  const file = useProjectStore((state) => state.questFiles[fileId]);
  const updateFileContent = useProjectStore((state) => state.updateFileContent);

  // 缓存 YAML 解析结果,避免每次渲染都重新解析
  const parsedData = useMemo(() => {
    return parseYaml(file.content) || {};
  }, [file.content]);

  const questId = useMemo(() => Object.keys(parsedData)[0] || 'new_quest', [parsedData]);
  const questData = useMemo(() => {
    const raw = parsedData[questId] || { meta: {}, objective: {} };
    return JSON.parse(JSON.stringify(raw));
  }, [parsedData, questId]);

  // 条目显示顺序：有 objectiveOrder 则用，否则从 objective 键推导并补全
  const orderedTaskIds = useMemo(() => {
    const objectives = questData.objective || {};
    const keys = Object.keys(objectives);
    const order = questData.objectiveOrder;
    if (Array.isArray(order) && order.length > 0) {
      const orderSet = new Set(order.map(String));
      const missing = keys.filter((k) => !orderSet.has(k));
      return [...order.filter((id) => objectives[id] != null), ...missing];
    }
    return keys
      .map((k) => (isNaN(Number(k)) ? k : Number(k)))
      .sort((a, b) =>
        typeof a === 'number' && typeof b === 'number' ? a - b
        : typeof a === 'number' ? -1
        : typeof b === 'number' ? 1
        : String(a).localeCompare(String(b))
      );
  }, [questData.objective, questData.objectiveOrder]);
  
  const [activeTaskId, setActiveTaskId] = useState<number | string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const isResizing = useRef(false);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    // Calculate new width based on mouse position
    // Assuming sidebar is on the left, so width is roughly e.clientX - sidebarOffset
    // But since we are in a complex layout, we might need to be more careful.
    // However, for a simple left sidebar, e.clientX is often close enough if the sidebar starts at 0.
    // But here the sidebar is inside tabs inside a paper.
    // A safer way is to use movementX, but that accumulates errors.
    // Let's try to just update based on movement for now or use a ref to the container.
    
    setSidebarWidth(prev => {
        const newWidth = prev + e.movementX;
        return Math.max(150, Math.min(600, newWidth));
    });
  }, []);

  // Auto-select first objective if available and none selected
  useEffect(() => {
    const objectiveIds = Object.keys(questData.objective || {});
    if (objectiveIds.length > 0 && !activeTaskId) {
        // 优先选择数字 ID，否则选择第一个
        const numIds = objectiveIds.map(Number).filter(id => !isNaN(id));
        if (numIds.length > 0) {
            setActiveTaskId(Math.min(...numIds));
        } else {
            setActiveTaskId(objectiveIds[0]);
        }
    }
  }, [questData.objective]);

  const handleUpdate = (newData: any, newId?: string) => {
    const idToUse = newId || questId;
    const sanitized = sanitizeQuestForYaml(newData);
    const newYaml = toYaml({ [idToUse]: sanitized });
    updateFileContent(fileId, 'quest', newYaml);
  };

  const handleTaskUpdate = (taskId: number | string, taskData: any) => {
    const currentObjectives = questData.objective || {};
    const newObjectives: Record<string, any> = {};
    for (const k of Object.keys(currentObjectives)) {
      if (String(k) === String(taskId)) {
        newObjectives[k] = taskData;
      } else {
        newObjectives[k] = JSON.parse(JSON.stringify(currentObjectives[k]));
      }
    }
    handleUpdate({ ...questData, objective: newObjectives });
  };

  const handleTaskRename = (oldId: number | string, newId: number | string) => {
    if (String(oldId) === String(newId)) return;
    const currentObjectives = questData.objective || {};
    if (currentObjectives[newId]) return;

    const newObjectives: Record<string, any> = {};
    Object.keys(currentObjectives).forEach((key) => {
      const targetKey = String(key) === String(oldId) ? newId : key;
      newObjectives[String(targetKey)] = String(key) === String(oldId) ? { ...currentObjectives[oldId] } : currentObjectives[key];
    });
    const newOrder = orderedTaskIds.map((id) => (String(id) === String(oldId) ? newId : id));
    handleUpdate({ ...questData, objective: newObjectives, objectiveOrder: newOrder });
    setActiveTaskId(newId);
  };

  const addTask = () => {
    const currentObjectives = questData.objective || {};
    const existingIds = Object.keys(currentObjectives).map(Number).filter(id => !isNaN(id));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

    const newObjectives = { ...currentObjectives, [nextId]: { event: 'block break', node: { amount: 1 } } };
    const newOrder = [...orderedTaskIds, nextId];
    handleUpdate({ ...questData, objective: newObjectives, objectiveOrder: newOrder });
    setActiveTaskId(nextId);
  };

  const duplicateTask = (taskId: number | string) => {
    const currentObjectives = questData.objective || {};
    const existingIds = Object.keys(currentObjectives);
    // 生成新 ID：如果是数字，则使用最大数字+1；否则使用原ID_copy
    const numIds = existingIds.map(Number).filter(id => !isNaN(id));
    let nextId: number | string;
    if (numIds.length > 0 && typeof taskId === 'number') {
        nextId = Math.max(...numIds) + 1;
    } else {
        nextId = `${taskId}_copy`;
        // 如果已存在，添加数字后缀
        let counter = 1;
        while (currentObjectives[nextId]) {
            nextId = `${taskId}_copy${counter}`;
            counter++;
        }
    }

    const newObjectives = { ...currentObjectives, [nextId]: JSON.parse(JSON.stringify(currentObjectives[taskId])) };
    const oldIndex = orderedTaskIds.indexOf(taskId);
    const newOrder = [...orderedTaskIds];
    newOrder.splice(oldIndex >= 0 ? oldIndex + 1 : newOrder.length, 0, nextId);
    handleUpdate({ ...questData, objective: newObjectives, objectiveOrder: newOrder });
    setActiveTaskId(nextId);
  };

  const deleteTask = (taskId: number | string) => {
    const newObjectives = { ...questData.objective };
    delete newObjectives[taskId];
    const newOrder = orderedTaskIds.filter((id) => String(id) !== String(taskId));
    handleUpdate({ ...questData, objective: newObjectives, objectiveOrder: newOrder });
    if (String(activeTaskId) === String(taskId)) setActiveTaskId(null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const ids = [...orderedTaskIds];
    const [moved] = ids.splice(result.source.index, 1);
    ids.splice(result.destination.index, 0, moved);
    const currentObjectives = questData.objective || {};
    const newObjectives: Record<string, any> = {};
    ids.forEach((id) => {
      const k = String(id);
      if (currentObjectives[k] != null) newObjectives[k] = currentObjectives[k];
    });
    handleUpdate({ ...questData, objective: newObjectives, objectiveOrder: ids });
  };

  const activeTask = activeTaskId !== null && questData.objective ? questData.objective[activeTaskId] : null;

  return (
    <Paper radius={0} h="100%" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--mantine-color-dark-8)' }}>
      <AnimatedTabs
        defaultValue="meta"
        h="100%"
        display="flex"
        style={{ flexDirection: 'column' }}
        tabs={[
            { value: 'meta', label: '全局设置', icon: <IconSettings size={14} /> },
            { value: 'tasks', label: '任务流程', icon: <IconCheckbox size={14} /> }
        ]}
      >
        <Tabs.Panel value="meta" style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
            <QuestSettings 
                fileId={fileId}
                questId={questId} 
                questData={questData} 
                onUpdate={handleUpdate} 
            />
        </Tabs.Panel>

        <Tabs.Panel value="tasks" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div style={{ display: 'flex', height: '100%' }}>
                <QuestTaskList
                    tasks={questData.objective || {}}
                    orderedTaskIds={orderedTaskIds}
                    activeTaskId={activeTaskId}
                    onSelect={setActiveTaskId}
                    onAdd={addTask}
                    onDelete={deleteTask}
                    onDuplicate={duplicateTask}
                    onRename={handleTaskRename}
                    onReorder={onDragEnd}
                    width={sidebarWidth}
                />
                <div
                    onMouseDown={startResizing}
                    style={{
                        width: 4,
                        cursor: 'col-resize',
                        backgroundColor: 'var(--mantine-color-dark-6)',
                        transition: 'background-color 0.2s',
                    }}
                    className="resize-handle"
                />
            </div>

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {activeTask ? (
                    <QuestDetail
                        key={activeTaskId}
                        taskId={activeTaskId!}
                        taskData={activeTask}
                        onUpdate={(tid, newData) => handleTaskUpdate(tid, newData)}
                        availableObjectives={questData.objective || {}}
                    />
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text c="dimmed">请选择一个条目进行编辑，或创建一个新条目。</Text>
                    </div>
                )}
            </div>
        </Tabs.Panel>
      </AnimatedTabs>
    </Paper>
  );
}
