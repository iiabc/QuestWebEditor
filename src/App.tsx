import { useEffect, useRef } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import { useApiStore } from './store/useApiStore';
import { useApiCenterStore } from './store/useApiCenterStore';

export default function App() {
  const loadApiData = useApiStore((state) => state.loadApiData);
  const { sources, addSource, loadAllEnabledSources, updateSource, removeSource } = useApiCenterStore();
  const initializedRef = useRef(false);
  const REQUIRED_SOURCES = [
    { name: 'QuestEngine Core', url: '/api-default.json' },
    { name: 'MythicMobs', url: '/api-MythicMobs.json' },
    { name: 'Adyeshach', url: '/api-Adyeshach.json' },
    { name: 'Citizens', url: '/api-Citizens.json' },
    { name: 'Rhea', url: '/api-Rhea.json' },
    { name: 'CustomGo', url: '/api-CustomGo.json' }
  ];

  useEffect(() => {
    // 使用 ref 防止 React Strict Mode 导致的重复执行
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 迁移旧的默认源（检测 URL，而非名称）
    sources.forEach((source) => {
      if (source.url === '/api-default.json' && source.name !== 'QuestEngine Core') {
        updateSource(source.id, { name: 'QuestEngine Core', url: '/api-default.json' });
      }
      if (source.name === 'PlaceholderAPI') {
        removeSource(source.id);
      }
    });

    // 确保必须的源都存在
    REQUIRED_SOURCES.forEach((required) => {
      const exists = sources.some(
        (source) => source.name === required.name || source.url === required.url
      );
      if (!exists) {
      addSource({
          name: required.name,
          url: required.url,
        enabled: true
      });
    }
    });

    // 延迟一下，确保源添加完成后再加载
    setTimeout(() => {
      // 加载所有启用的 API 源
      loadAllEnabledSources().then(() => {
        // 同步到 API Store
        loadApiData();
      });
    }, 100);
  }, []);

  return <DashboardLayout />;
}
