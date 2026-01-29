import yaml from 'js-yaml';

// 递归处理对象中的所有字符串，将 \r\n 转换为 \n
function normalizeLineEndings(value: any): any {
  if (typeof value === 'string') {
    return value.replace(/\r\n/g, '\n');
  } else if (Array.isArray(value)) {
    return value.map(normalizeLineEndings);
  } else if (value && typeof value === 'object') {
    const result: any = {};
    for (const key in value) {
      result[key] = normalizeLineEndings(value[key]);
    }
    return result;
  }
  return value;
}

function nonEmpty(s: any): boolean {
  return typeof s === 'string' && String(s).trim() !== '';
}

/** 只保留有值的 track 字段；未写的 action / navigate 子项不输出。若全空则返回 {}，避免丢弃 track 导致开关状态丢失。 */
function pruneTrack(track: any): any {
  if (!track || typeof track !== 'object') return undefined;
  const out: any = {};
  if (nonEmpty(track.action)) out.action = track.action;
  const n = track.navigate;
  if (n && typeof n === 'object') {
    const nav: any = {};
    if (nonEmpty(n.title)) nav.title = n.title;
    if (nonEmpty(n.location)) nav.location = n.location;
    if (nonEmpty(n.adyeshach)) nav.adyeshach = n.adyeshach;
    if (Object.keys(nav).length > 0) out.navigate = nav;
  }
  return out;
}

function applyTrackPruneToAgent(agent: any): any {
  if (!agent || typeof agent !== 'object') return agent;
  if (!('track' in agent)) return agent;
  const pruned = pruneTrack(agent.track);
  if (pruned == null) return agent;
  return { ...agent, track: pruned };
}

/** 序列化前按字段过滤 agent.track：未填的节点不输出到 YAML。 */
export function sanitizeQuestForYaml(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const out = { ...data };
  if (out.agent) {
    const a = applyTrackPruneToAgent(out.agent);
    if (a != null) out.agent = a; else delete out.agent;
  }
  if (out.objective && typeof out.objective === 'object') {
    const obj: Record<string, any> = {};
    for (const k of Object.keys(out.objective)) {
      const t = out.objective[k];
      if (t && typeof t === 'object' && t.agent) {
        const a = applyTrackPruneToAgent(t.agent);
        const task = { ...t };
        if (a != null) task.agent = a; else delete task.agent;
        obj[k] = task;
      } else {
        obj[k] = t;
      }
    }
    out.objective = obj;
  }
  return out;
}

export const toYaml = (obj: any): string => {
  try {
    // 先规范化换行符
    const normalized = normalizeLineEndings(obj);

    return yaml.dump(normalized, {
      lineWidth: -1,        // 禁用自动换行，让 js-yaml 自动选择最佳格式
      noRefs: true,         // 禁用引用
      noCompatMode: false,  // 保持兼容模式
      condenseFlow: false,  // 不压缩 flow 格式
      quotingType: '"',     // 使用双引号
      forceQuotes: false    // 不强制所有字符串加引号
    });
  } catch (e) {
    return '';
  }
};

export const parseYaml = (str: string): any => {
  try {
    return yaml.load(str);
  } catch (e) {
    return null;
  }
};
