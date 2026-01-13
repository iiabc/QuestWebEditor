import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, Connection, Edge, Panel, Node, reconnectEdge, SelectionMode } from 'reactflow';
import { Paper, Button, Group, Tooltip, ActionIcon, useMantineColorScheme, Text, Stack } from '@mantine/core';
import { useProjectStore } from '@/store/useProjectStore';
import { IconPlus, IconLayoutDashboard, IconGitBranch, IconHandMove, IconBoxMultiple, IconTrash, IconSettings } from '@tabler/icons-react';
import AgentNode, { AgentNodeData } from './nodes/AgentNode';
import SwitchNode, { SwitchNodeData } from './nodes/SwitchNode';
import { parseConversationToFlow, generateYamlFromFlow, autoLayout } from './conversation-utils';
import { ConversationNodeEditor } from './ConversationNodeEditor';
import { ConversationSettings, ConversationOptions } from './ConversationSettings';

import 'reactflow/dist/style.css';

// Define nodeTypes outside component to avoid re-creation
const nodeTypes = { agent: AgentNode, switch: SwitchNode };

export default function FlowCanvas({ fileId }: { fileId: string }) {
  // 只订阅当前文件和更新函数
  const file = useProjectStore((state) => state.conversationFiles[fileId]);
  const updateFileContent = useProjectStore((state) => state.updateFileContent);
  const { colorScheme } = useMantineColorScheme();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [conversationOptions, setConversationOptions] = useState<ConversationOptions>({});

  // Initial load - reset when fileId or file content changes
  useEffect(() => {
    // 如果正在编辑节点，不重新加载文件，避免对话框意外关闭
    if (editingNodeId) {
      return;
    }

    if (!file) {
      // File not loaded yet, clear everything
      setNodes([]);
      setEdges([]);
      setConversationOptions({});
      return;
    }

    if (file.content && file.content.trim()) {
        // File has content, parse it
        const { nodes: initialNodes, edges: initialEdges, options } = parseConversationToFlow(file.content);
        setNodes(initialNodes);
        setEdges(initialEdges);
        if (options) {
            setConversationOptions(options);
        } else {
            setConversationOptions({});
        }
    } else {
        // File is empty or has no content, clear everything
        setNodes([]);
        setEdges([]);
        setConversationOptions({});
    }
  }, [fileId, file?.content, editingNodeId]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target || !params.sourceHandle) return;
      
      // Update switch node branch's open field when connecting
      setNodes((nds) => {
        const sourceNode = nds.find(n => n.id === params.source);
        const targetNode = nds.find(n => n.id === params.target);
        
        if (sourceNode?.type === 'switch' && targetNode && params.sourceHandle) {
          const switchData = sourceNode.data as SwitchNodeData;
          const branchIndex = switchData.branches.findIndex(b => b.id === params.sourceHandle);
          
          if (branchIndex !== -1) {
            const updatedBranches = [...switchData.branches];
            updatedBranches[branchIndex] = {
              ...updatedBranches[branchIndex],
              open: targetNode.data.label
            };
            
            return nds.map(n => 
              n.id === params.source 
                ? { ...n, data: { ...switchData, branches: updatedBranches } }
                : n
            );
          }
        }
        
        return nds;
      });
      
      setEdges((eds: Edge[]) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges, setNodes],
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (!newConnection.source || !newConnection.target || !newConnection.sourceHandle) return;
      
      // Update switch node branch's open field when reconnecting
      setNodes((nds) => {
        const sourceNode = nds.find(n => n.id === newConnection.source);
        const targetNode = nds.find(n => n.id === newConnection.target);
        
        if (sourceNode?.type === 'switch' && targetNode && newConnection.sourceHandle) {
          const switchData = sourceNode.data as SwitchNodeData;
          const branchIndex = switchData.branches.findIndex(b => b.id === newConnection.sourceHandle);
          
          if (branchIndex !== -1) {
            const updatedBranches = [...switchData.branches];
            updatedBranches[branchIndex] = {
              ...updatedBranches[branchIndex],
              open: targetNode.data.label
            };
            
            return nds.map(n => 
              n.id === newConnection.source 
                ? { ...n, data: { ...switchData, branches: updatedBranches } }
                : n
            );
          }
        }
        
        return nds;
      });
      
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    [setEdges, setNodes],
  );

  const handleAutoLayout = () => {
    const layouted = autoLayout(nodes, edges);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
  };

  const handleSave = useCallback(() => {
    const yaml = generateYamlFromFlow(nodes, edges, conversationOptions);
    updateFileContent(fileId, 'conversation', yaml);
  }, [nodes, edges, conversationOptions, fileId, updateFileContent]);

  // Auto-save
  useEffect(() => {
      // 如果正在编辑节点，不自动保存，避免触发文件重新加载
      if (editingNodeId) {
          return;
      }

      const timer = setTimeout(() => {
          handleSave();
      }, 1000);

      return () => clearTimeout(timer);
  }, [nodes, edges, editingNodeId]);

  const handleAddNode = () => {
    const id = `node_${Date.now()}`;
    const newNode: Node<AgentNodeData> = {
        id,
        type: 'agent',
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: {
            label: id,
            npcLines: ['Hello!'],
            playerOptions: [
                { id: `${id}-opt-1`, text: 'Hi there' }
            ]
        }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleAddSwitchNode = () => {
    const id = `switch_${Date.now()}`;
    const newNode: Node<SwitchNodeData> = {
        id,
        type: 'switch',
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: {
            label: id,
            branches: [
                { id: `${id}-branch-1`, condition: 'true' }
            ]
        }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleNodeUpdate = (newData: any) => {
    if (!editingNodeId) return;
    setNodes((nds) => nds.map((node) => {
        if (node.id === editingNodeId) {
            return { ...node, data: newData };
        }
        return node;
    }));
  };

  const handleDeleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  const onNodeDoubleClick = (_: React.MouseEvent, node: Node) => {
    setEditingNodeId(node.id);
  };

  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      // 双击连线时删除该连线，并清除 switch 节点分支的 open 字段
      if (edge.sourceHandle) {
        setNodes((nds) => {
          const sourceNode = nds.find(n => n.id === edge.source);
          if (sourceNode?.type === 'switch') {
            const switchData = sourceNode.data as SwitchNodeData;
            const branchIndex = switchData.branches.findIndex(b => b.id === edge.sourceHandle);
            
            if (branchIndex !== -1) {
              const updatedBranches = [...switchData.branches];
              const updatedBranch = { ...updatedBranches[branchIndex] };
              delete updatedBranch.open;
              updatedBranches[branchIndex] = updatedBranch;
              
              return nds.map(n => 
                n.id === edge.source 
                  ? { ...n, data: { ...switchData, branches: updatedBranches } }
                  : n
              );
            }
          }
          return nds;
        });
      }
      
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges, setNodes]
  );

  const editingNode = nodes.find(n => n.id === editingNodeId);
  const hasSelectedNodes = nodes.some(n => n.selected);

  const otherNodeIds = useMemo(() => {
    if (!editingNode) return [];
    return nodes
        .filter(n => n.id !== editingNode.id)
        .map(n => n.data.label);
  }, [nodes, editingNode]);

  // 关闭编辑器时手动保存，确保编辑的内容被保存
  const handleCloseEditor = useCallback(() => {
    // 先保存当前编辑的内容
    handleSave();
    // 然后关闭对话框
    setEditingNodeId(null);
  }, [handleSave]);

  return (
    <Paper h="100%" radius={0} style={{ overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'row' }}>
        <style>{`
            /* Override ReactFlow Controls button colors based on theme */
            .react-flow__controls button {
                background-color: ${colorScheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)'} !important;
                border-color: ${colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} !important;
            }
            .react-flow__controls button:hover {
                background-color: ${colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} !important;
            }
            .react-flow__controls button path {
                fill: ${colorScheme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'} !important;
            }
        `}</style>
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onReconnect={onReconnect}
                onNodeDoubleClick={onNodeDoubleClick}
                onEdgeDoubleClick={onEdgeDoubleClick}
                nodeTypes={nodeTypes}
                fitView
                proOptions={{ hideAttribution: true }}
                style={{ width: '100%', height: '100%' }}
                panOnDrag={!isSelectionMode}
                selectionOnDrag={isSelectionMode}
                selectionKeyCode={['Shift']}
                multiSelectionKeyCode={['Control', 'Meta', 'Shift']}
                deleteKeyCode={['Backspace', 'Delete']}
                selectionMode={SelectionMode.Partial}
            >
                <Background color="#333" gap={16} />
                <Controls
                    style={{
                        backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(8px)',
                        border: colorScheme === 'dark'
                            ? '1px solid rgba(255,255,255,0.1)'
                            : '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        boxShadow: colorScheme === 'dark'
                            ? '0 4px 12px rgba(0,0,0,0.5)'
                            : '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                />
                <MiniMap
                    style={{
                        backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#ffffff'
                    }}
                    nodeColor="#4dabf7"
                />
                <Panel position="bottom-center" id="canvas-panel" >
                    <Group
                        gap="xs"
                        p="xs"
                        bg={colorScheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)'}
                        style={{
                            borderRadius: 8,
                            backdropFilter: 'blur(8px)',
                            border: colorScheme === 'dark'
                                ? '1px solid rgba(255,255,255,0.1)'
                                : '1px solid rgba(0,0,0,0.1)',
                            boxShadow: colorScheme === 'dark'
                                ? '0 4px 12px rgba(0,0,0,0.5)'
                                : '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                    >
                        <Tooltip label="对话设置">
                            <ActionIcon
                                variant="light"
                                color="blue"
                                onClick={() => setSettingsOpened(true)}
                                size="lg"
                            >
                                <IconSettings size={18} />
                            </ActionIcon>
                        </Tooltip>

                        <div style={{
                            width: 1,
                            height: 20,
                            backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'
                        }} />

                        <Tooltip label={isSelectionMode ? "切换到拖拽模式" : "切换到框选模式"}>
                            <ActionIcon
                                variant={isSelectionMode ? "filled" : "light"}
                                color="orange"
                                onClick={() => setIsSelectionMode(!isSelectionMode)}
                                size="lg"
                            >
                                {isSelectionMode ? <IconBoxMultiple size={18} /> : <IconHandMove size={18} />}
                            </ActionIcon>
                        </Tooltip>

                        <div style={{
                            width: 1,
                            height: 20,
                            backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'
                        }} />

                        <Button size="xs" variant="filled" color="blue" leftSection={<IconPlus size={12} />} onClick={handleAddNode}>
                            添加节点
                        </Button>
                        <Button size="xs" variant="filled" color="violet" leftSection={<IconGitBranch size={12} />} onClick={handleAddSwitchNode}>
                            添加 Switch
                        </Button>
                        <Button size="xs" variant="light" color="gray" leftSection={<IconLayoutDashboard size={12} />} onClick={handleAutoLayout}>
                            智能重排
                        </Button>

                        {hasSelectedNodes && (
                            <>
                                <div style={{
                                    width: 1,
                                    height: 20,
                                    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'
                                }} />
                                <Button size="xs" variant="filled" color="red" leftSection={<IconTrash size={12} />} onClick={handleDeleteSelected}>
                                    删除选中
                                </Button>
                            </>
                        )}
                    </Group>
                </Panel>

                {/* Keyboard Shortcuts Help - Custom positioned to avoid Controls */}
                <div
                    style={{
                        position: 'absolute',
                        left: '70px',
                        bottom: '10px',
                        backgroundColor: 'transparent',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        padding: '8px',
                        zIndex: 5
                    }}
                >
                    <Stack gap={4}>
                        <Text size="xs" c="dimmed" style={{ opacity: 0.6 }}>
                            双击节点 - 编辑内容
                        </Text>
                        <Text size="xs" c="dimmed" style={{ opacity: 0.6 }}>
                            双击连线 - 删除连接
                        </Text>
                        <Text size="xs" c="dimmed" style={{ opacity: 0.6 }}>
                            Shift/Ctrl - 多选节点
                        </Text>
                        <Text size="xs" c="dimmed" style={{ opacity: 0.6 }}>
                            Del/Backspace - 删除选中
                        </Text>
                    </Stack>
                </div>
            </ReactFlow>
        </div>

        <ConversationSettings
            opened={settingsOpened}
            onClose={() => setSettingsOpened(false)}
            options={conversationOptions}
            onSave={(newOptions) => {
                setConversationOptions(newOptions);
                // Trigger save immediately after settings change
                setTimeout(() => {
                    const yaml = generateYamlFromFlow(nodes, edges, newOptions);
                    updateFileContent(fileId, 'conversation', yaml);
                }, 100);
            }}
        />

        {editingNode && (
            <ConversationNodeEditor
                opened={!!editingNode}
                onClose={handleCloseEditor}
                data={editingNode.data}
                type={editingNode.type as 'agent' | 'switch'}
                onUpdate={handleNodeUpdate}
                fileId={fileId}
                existingIds={otherNodeIds}
            />
        )}
    </Paper>
  );
}


