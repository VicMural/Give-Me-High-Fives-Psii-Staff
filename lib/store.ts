import { create } from 'zustand';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

export const ACADEMIC_CATEGORIES = [
  "Ecological Literacy",
  "Reading, Writing, Speaking and Listening",
  "Mathematical Literacy",
  "Collaboration and Leadership",
  "Critical and Creative Thinking",
  "Cultural Awareness and Understanding",
  "Media Information and Literacy",
  "Personal Planning and Responsibility"
];

export const getCategoryStyles = (cat: string) => {
  const styles: Record<string, { bg: string; text: string }> = {
    "Ecological Literacy": { bg: "#3eb06a", text: "#ffffff" },
    "Reading, Writing, Speaking and Listening": { bg: "#4ac9f4", text: "#000000" },
    "Mathematical Literacy": { bg: "#53256c", text: "#ffffff" },
    "Collaboration and Leadership": { bg: "#ef4166", text: "#ffffff" },
    "Critical and Creative Thinking": { bg: "#fed23f", text: "#000000" },
    "Cultural Awareness and Understanding": { bg: "#f8c2bb", text: "#000000" },
    "Media Information and Literacy": { bg: "#f05a60", text: "#ffffff" },
    "Personal Planning and Responsibility": { bg: "#63b992", text: "#000000" },
  };
  return styles[cat] || { bg: "#f3f4f6", text: "#4b5563" };
};

export type Folder = {
  id: string;
  title: string;
  categories: string[];
  createdAt: number;
  updatedAt: number;
};

export type InquiryData = {
  title: string;
  inquiryDepth: string;
  projectId: string;
  artifact?: { type: 'image' | 'audio' | 'video' | 'gif'; name: string; url?: string };
  createdAt: number;
};

export type InquiryNode = Node<InquiryData>;

interface ProjectStore {
  view: 'home' | 'project' | 'all';
  currentProjectId: string | null;
  setView: (view: 'home' | 'project' | 'all', projectId?: string | null) => void;

  folders: Folder[];
  nodes: InquiryNode[];
  edges: Edge[];

  addFolder: (title: string, categories: string[]) => void;
  updateFolderCategories: (folderId: string, categories: string[]) => void;
  addNode: (data: Omit<InquiryData, 'createdAt'>, parentId: string | null) => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  setNodes: (nodes: InquiryNode[]) => void;
  setEdges: (edges: Edge[]) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  view: 'home',
  currentProjectId: null,
  setView: (view, projectId = null) => set({ view, currentProjectId: projectId }),

  folders: [],
  nodes: [],
  edges: [],

  addFolder: (title, categories) => {
    const id = uuidv4();
    const newFolder: Folder = {
      id,
      title,
      categories,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    set(state => ({
      folders: [newFolder, ...state.folders]
    }));
  },

  updateFolderCategories: (folderId, categories) => {
    set(state => ({
      folders: state.folders.map(f => f.id === folderId ? { ...f, categories, updatedAt: Date.now() } : f)
    }));
  },

  addNode: (data, parentId) => {
    const id = uuidv4();
    let x = window.innerWidth / 2 - 150;
    let y = 100;

    if (parentId) {
      const parentNode = get().nodes.find(n => n.id === parentId);
      if (parentNode) {
        const siblings = get().edges.filter(e => e.source === parentId);
        x = parentNode.position.x + (siblings.length * 280) - (siblings.length > 0 ? 140 : 0);
        y = parentNode.position.y + 180;
      }
    } else {
      const allRoots = get().nodes.filter(n => !get().edges.some(e => e.target === n.id));
      x = 100 + (allRoots.length * 280); 
      y = 100;
    }

    const newNode: InquiryNode = {
      id,
      type: 'inquiry',
      position: { x, y },
      data: { ...data, createdAt: Date.now() },
    };

    set(state => ({
      nodes: [...state.nodes, newNode],
      edges: parentId 
        ? [...state.edges, { 
            id: `e-${parentId}-${id}`, 
            source: parentId, 
            target: id, 
            type: 'smoothstep', 
            animated: true,
            style: { stroke: '#CBD5E1', strokeWidth: 2 } 
          }]
        : state.edges,
      folders: state.folders.map(f => f.id === data.projectId ? { ...f, updatedAt: Date.now() } : f)
    }));
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as InquiryNode[],
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
}));
