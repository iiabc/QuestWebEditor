import { create } from 'zustand';

interface EditorState {
  activeTab: 'quest' | 'conversation';
  setActiveTab: (tab: 'quest' | 'conversation') => void;
  
  // Quest Data
  questYaml: string;
  setQuestYaml: (yaml: string) => void;

  // Conversation Data
  conversationYaml: string;
  setConversationYaml: (yaml: string) => void;

  // Project Actions
  loadProject: (questYaml: string, conversationYaml: string) => void;
}

const defaultQuest = `
example_quest:
  meta:
    name: "Example Quest"
    type: "L1"
  task:
    0:
      objective: "block break"
      condition:
        material: "stone"
      goal:
        amount: 10
`;

const defaultConversation = `
conversation_0:
  npc:
    - "Hello, traveler!"
  player:
    - reply: "Hello!"
      then: "goto conversation_1"
`;

export const useEditorStore = create<EditorState>((set) => ({
  activeTab: 'quest',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  questYaml: defaultQuest,
  setQuestYaml: (yaml) => set({ questYaml: yaml }),

  conversationYaml: defaultConversation,
  setConversationYaml: (yaml) => set({ conversationYaml: yaml }),

  loadProject: (questYaml, conversationYaml) => set({ questYaml, conversationYaml }),
}));
