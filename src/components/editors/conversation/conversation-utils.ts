import { Edge, Node } from 'reactflow';
import { parseYaml, toYaml } from '@/utils/yaml-utils';
import { AgentNodeData } from './nodes/AgentNode';
import { SwitchNodeData } from './nodes/SwitchNode';

export interface ConversationOptions {
    // QuestEngine doesn't use __option__, but we keep it for backward compatibility
    theme?: string;
    title?: string;
    'global-flags'?: string[];
}

export const autoLayout = (nodes: Node[], edges: Edge[]) => {
    const nodeWidth = 320;
    const rankSep = 100; // Horizontal gap between ranks
    const nodeSep = 50; // Vertical gap between nodes in same rank

    // 1. Build graph structure
    const outEdges = new Map<string, string[]>();
    const inEdges = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    nodes.forEach(n => {
        outEdges.set(n.id, []);
        inEdges.set(n.id, []);
        inDegree.set(n.id, 0);
    });

    edges.forEach(e => {
        if (outEdges.has(e.source)) outEdges.get(e.source)?.push(e.target);
        if (inEdges.has(e.target)) inEdges.get(e.target)?.push(e.source);
        inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    });

    // 2. Assign ranks (levels) using Longest Path Layering
    const levels = new Map<string, number>();
    const queue: string[] = [];

    // Find roots (in-degree 0)
    nodes.forEach(n => {
        if ((inDegree.get(n.id) || 0) === 0) {
            queue.push(n.id);
            levels.set(n.id, 0);
        }
    });

    // If no roots (cycle), pick the first one
    if (queue.length === 0 && nodes.length > 0) {
        queue.push(nodes[0].id);
        levels.set(nodes[0].id, 0);
    }

    const visited = new Set<string>();

    // Simple BFS for layering
    while (queue.length > 0) {
        const currId = queue.shift()!;
        if (visited.has(currId)) continue;
        visited.add(currId);

        const currLevel = levels.get(currId)!;
        const neighbors = outEdges.get(currId) || [];

        neighbors.forEach(nextId => {
            // Update level if we found a longer path, but prevent infinite growth in cycles
            const currentNextLevel = levels.get(nextId) || 0;
            if (currLevel + 1 > currentNextLevel && currLevel < 50) { // Limit depth to prevent cycle issues
                levels.set(nextId, currLevel + 1);
                queue.push(nextId);
                // If we updated the level, we might need to re-visit to update its children
                visited.delete(nextId);
            }
        });
    }

    // Handle disconnected components
    nodes.forEach(n => {
        if (!levels.has(n.id)) {
            levels.set(n.id, 0);
        }
    });

    // 3. Group by level
    const rows = new Map<number, Node[]>();
    let maxLevel = 0;
    nodes.forEach(n => {
        const level = levels.get(n.id) || 0;
        if (level > maxLevel) maxLevel = level;
        if (!rows.has(level)) rows.set(level, []);
        rows.get(level)?.push(n);
    });

    // 3.5 Reorder within rows to minimize crossings (Barycenter Heuristic)
    for (let i = 1; i <= maxLevel; i++) {
        const currentNodes = rows.get(i) || [];
        const prevNodes = rows.get(i - 1) || [];

        const prevNodePos = new Map<string, number>();
        prevNodes.forEach((n, idx) => prevNodePos.set(n.id, idx));

        const nodeWeights = currentNodes.map(n => {
            const parents = inEdges.get(n.id) || [];
            if (parents.length === 0) return { id: n.id, weight: 9999 };

            let sum = 0;
            let count = 0;
            parents.forEach(pId => {
                if (prevNodePos.has(pId)) {
                    sum += prevNodePos.get(pId)!;
                    count++;
                }
            });

            return { id: n.id, weight: count > 0 ? sum / count : 9999 };
        });

        currentNodes.sort((a, b) => {
            const wA = nodeWeights.find(w => w.id === a.id)?.weight || 0;
            const wB = nodeWeights.find(w => w.id === b.id)?.weight || 0;
            return wA - wB;
        });

        rows.set(i, currentNodes);
    }

    // 4. Assign positions (Horizontal Layout)
    // Calculate dynamic height for each node to stack them properly
    const getNodeHeight = (node: Node) => {
        if (node.type === 'switch') {
            const branches = (node.data as SwitchNodeData).branches?.length || 0;
            // Header ~50, Branches ~40 each, Padding ~20
            return 50 + (branches * 40) + 20;
        }
        const npcLines = (node.data as AgentNodeData).npcLines?.length || 0;
        const options = (node.data as AgentNodeData).playerOptions?.length || 0;
        // Header ~50, NPC lines ~30 each, Options ~40 each, Padding ~20
        return 50 + (Math.max(1, npcLines) * 30) + (options * 40) + 20;
    };

    const newNodes: Node[] = [];

    rows.forEach((rowNodes, level) => {
        let currentY = 0;

        // Calculate total height of this column
        const totalHeight = rowNodes.reduce((sum, node) => sum + getNodeHeight(node) + nodeSep, 0) - nodeSep;
        let startY = -(totalHeight / 2) + 100; // Center around Y=100

        rowNodes.forEach(node => {
            const h = getNodeHeight(node);
            const x = level * (nodeWidth + rankSep) + 100;
            const y = startY + currentY;

            newNodes.push({ ...node, position: { x, y } });
            currentY += h + nodeSep;
        });
    });

    return { nodes: newNodes, edges };
};

export const parseConversationToFlow = (yamlContent: string) => {
    const data = parseYaml(yamlContent) || {};
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    let hasCanvasData = false;
    let conversationOptions: ConversationOptions = {};

    // QuestEngine 格式不使用 __option__，跳过处理

    Object.keys(data).forEach((key) => {
        if (key === '__option__') return; // Skip metadata (for backward compatibility)

        const section = data[key];

        // Determine position
        let position = { x: 0, y: 0 };
        if (section.canvas) {
            position = { x: section.canvas.x, y: section.canvas.y };
            hasCanvasData = true;
        }

        // Check for Switch Node (when property)
        if (section.when && Array.isArray(section.when)) {
            const branches = section.when.map((branch: any, index: number) => {
                let actionType: 'open' | 'run' = 'run';
                let actionValue = '';

                if (branch.open) {
                    actionType = 'open';
                    actionValue = branch.open;
                } else if (branch.run) {
                    actionType = 'run';
                    actionValue = branch.run;
                }

                return {
                    id: `${key}-branch-${index}`,
                    condition: branch.if || 'true',
                    actionType,
                    actionValue
                };
            });

            nodes.push({
                id: key,
                type: 'switch',
                position,
                data: {
                    label: key,
                    npcId: section['npc id'],
                    branches
                }
            });

            // Parse Edges for Switch
            branches.forEach((branch: any) => {
                if (branch.actionType === 'open') {
                    edges.push({
                        id: `e-${branch.id}-${branch.actionValue}`,
                        source: key,
                        sourceHandle: branch.id,
                        target: branch.actionValue,
                        type: 'default',
                        animated: true,
                    });
                }
            });

        } else if (section.content || section.answer || section.npc || section.npcs || section.name || section.tags || section.player || section.agent || section.condition || section['npc id']) {
            // Agent Node (QuestEngine format: content/answer, or QuestEngine legacy format: npc/player)
            // QuestEngine format takes priority
            const npcLines = section.content
                ? (Array.isArray(section.content) ? section.content : [section.content])
                : (Array.isArray(section.npc) ? section.npc : (section.npc ? [section.npc] : []));
            const playerOptions = section.answer
                ? (Array.isArray(section.answer) ? section.answer : [])
                : (Array.isArray(section.player) ? section.player : []);

            const options = playerOptions.map((opt: any, index: number) => {
                let actions = '';
                let next = opt.open || opt.next || '';

                // QuestEngine format: answer has text, action, open fields
                // QuestEngine legacy format: player has reply, then, next fields
                if (opt.action) {
                    // QuestEngine format: action field contains script
                    actions = typeof opt.action === 'string' ? opt.action : String(opt.action);
                    next = opt.open || '';
                } else if (opt.then) {
                    // QuestEngine legacy format: then field may contain goto
                    const thenStr = typeof opt.then === 'string' ? opt.then : String(opt.then);

                    // 如果没有 next 字段，从 then 中解析
                    if (!next) {
                        // 匹配 goto 后面的节点ID，支持中文、字母、数字、下划线等字符
                        const gotoMatch = thenStr.match(/goto\s+(\S+)/);
                        if (gotoMatch) {
                            next = gotoMatch[1].trim();
                        }
                    }

                    // 移除 goto 语句，只保留纯脚本部分
                    actions = thenStr
                        .replace(/goto\s+\S+/g, '')
                        .replace(/^\s+|\s+$/g, '')
                        .trim();
                }

                // QuestEngine format: text field; QuestEngine legacy format: reply field
                const text = opt.text || opt.reply || '...';

                // 提取玩家选项的自定义字段
                const { reply, text: textField, action, open, if: optIf, then, next: nextField, ...optCustomFields } = opt;

                return {
                    id: `${key}-opt-${index}`,
                    text: text,
                    condition: opt.if,
                    actions: actions,  // 纯脚本内容（不包含 goto）
                    next: next,  // 使用 YAML 中的 open/next 或从 then 解析出的 next
                    ...optCustomFields  // 包含 dos, dosh, gscript 等自定义字段
                };
            });

            // 提取节点的自定义字段（排除已知字段）
            const { npc, npcs, content, answer, player, agent, condition, canvas, name, tags, 'npc id': npcIdField, ...nodeCustomFields } = section;

            nodes.push({
                id: key,
                type: 'agent',
                position,
                data: {
                    label: key,
                    npcLines,
                    playerOptions: options,
                    npcId: section.npc || (section.npcs && section.npcs.length > 0 ? section.npcs[0] : undefined),
                    npcs: section.npcs || (section.npc ? [section.npc] : undefined),
                    name: section.name,
                    tags: section.tags,
                    condition: section.condition,
                    agent: section.agent,
                    ...nodeCustomFields  // 包含 root, self, model 等自定义字段
                }
            });

            // Parse Edges
            options.forEach((opt: any) => {
                if (opt.next) {
                    edges.push({
                        id: `e-${opt.id}-${opt.next}`,
                        source: key,
                        sourceHandle: opt.id,
                        target: opt.next,
                        type: 'default',
                        animated: true,
                    });
                }
            });
        }
    });

    // Apply auto layout if no canvas data found
    if (!hasCanvasData && nodes.length > 0) {
        const layouted = autoLayout(nodes, edges);
        return { ...layouted, options: conversationOptions };
    }

    return { nodes, edges, options: conversationOptions };
};

export const generateYamlFromFlow = (nodes: Node[], edges: Edge[], _options?: ConversationOptions) => {
    // QuestEngine format doesn't use __option__
    const conversationObj: any = {};

    nodes.forEach(node => {
        if (node.type === 'switch') {
            const { label, npcId, branches } = node.data as SwitchNodeData;

            const whenSection = branches.map(branch => {
                const edge = edges.find(e => e.source === node.id && e.sourceHandle === branch.id);
                let actionValue = branch.actionValue;

                // If connected, use the connection target
                if (branch.actionType === 'open' && edge) {
                    const targetNode = nodes.find(n => n.id === edge.target);
                    if (targetNode) {
                        actionValue = targetNode.data.label;
                    }
                }

                const branchObj: any = {
                    if: branch.condition
                };

                if (branch.actionType === 'open') {
                    branchObj.open = actionValue;
                } else {
                    branchObj.run = actionValue;
                }

                return branchObj;
            });

            const nodeObj: any = {
                when: whenSection,
                canvas: { x: Math.round(node.position.x), y: Math.round(node.position.y) }
            };

            if (npcId) nodeObj['npc id'] = npcId;

            conversationObj[label] = nodeObj;

        } else if (node.type === 'agent') {
            const { label, npcLines, playerOptions, npcId, npcs, name, tags, condition, agent, ...customFields } = node.data as AgentNodeData;

            // QuestEngine format: answer array with text, action, open fields
            const answerSection = playerOptions.map(opt => {
                const edge = edges.find(e => e.source === node.id && e.sourceHandle === opt.id);

                const optObj: any = {
                    text: opt.text
                };

                if (opt.condition) {
                    optObj.if = opt.condition;
                }

                // QuestEngine format: action field for script, open field for next conversation
                if (opt.actions) {
                    optObj.action = opt.actions;
                }

                if (edge) {
                    const targetNode = nodes.find(n => n.id === edge.target);
                    if (targetNode) {
                        optObj.open = targetNode.data.label;
                    }
                } else if (opt.next) {
                    optObj.open = opt.next;
                }

                // 添加玩家选项的自定义字段 (when, case 等)
                const { id, text, condition: optCond, actions, next, ...optCustomFields } = opt;
                Object.assign(optObj, optCustomFields);

                return optObj;
            });

            const nodeObj: any = {
                content: npcLines,
                answer: answerSection,
                canvas: { x: Math.round(node.position.x), y: Math.round(node.position.y) }
            };

            // QuestEngine format: npc (single) or npcs (array)
            if (npcs && npcs.length > 0) {
                if (npcs.length === 1) {
                    nodeObj.npc = npcs[0];
                } else {
                    nodeObj.npcs = npcs;
                }
            } else if (npcId) {
                nodeObj.npc = npcId;
            }

            if (name) nodeObj.name = name;
            if (tags && tags.length > 0) nodeObj.tags = tags;
            if (condition) nodeObj.condition = condition;
            if (agent) nodeObj.agent = agent;

            // 添加节点的自定义字段 (root, self, model 等)
            Object.assign(nodeObj, customFields);

            conversationObj[label] = nodeObj;
        }
    });

    return toYaml(conversationObj);
};

