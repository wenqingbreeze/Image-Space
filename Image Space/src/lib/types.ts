import { type ReactNode } from 'react';

// 标签类型定义
export interface Tag {
  id: string;
  name: string;
  createdAt: Date;
}

// 批注类型定义
export interface Annotation {
  id: string;
  content: string;
  createdAt: Date;
}

// 图片类型定义
export interface Image {
  id: string;
  name: string;
  url: string;
  tags: string[]; // 存储标签ID
  isStarred: boolean;
  annotations: Annotation[];
  uploadDate: Date;
}

// 应用配置类型
export interface AppConfig {
  itemsPerRow: number; // 每行显示的图片数量
  currentTags: string[]; // 当前选中的标签筛选器
  searchQuery: string; // 当前搜索查询
}

// 上下文提供者类型
export interface ContextProviderProps {
  children: ReactNode;
}