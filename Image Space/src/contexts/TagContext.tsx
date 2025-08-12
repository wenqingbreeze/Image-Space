import { createContext, useContext, useState, useEffect } from 'react';
import { Tag, ContextProviderProps } from '@/lib/types';
import { localStorageUtils, generateId } from '@/lib/utils';

// 定义上下文类型
interface TagContextType {
  tags: Tag[];
  addTag: (name: string) => boolean;
  updateTag: (id: string, name: string) => boolean;
  deleteTag: (id: string) => void;
  getTagName: (id: string) => string;
  getTagId: (name: string) => string | undefined;
}

// 创建上下文
const TagContext = createContext<TagContextType | undefined>(undefined);

// 上下文提供者组件
export function TagProvider({ children }: ContextProviderProps) {
  const [tags, setTags] = useState<Tag[]>([]);

  // 从localStorage加载标签数据
  useEffect(() => {
    const savedTags = localStorageUtils.getItem<Tag[]>('tags');
    
    if (savedTags && savedTags.length > 0) {
      setTags(savedTags);
    } else {
      // 初始化默认标签
      const defaultTags: Tag[] = [
        { id: 'unclassified', name: '未分类', createdAt: new Date() },
        { id: 'uncertain', name: '不确定', createdAt: new Date() },
        { id: 'surface_defect', name: '表面缺陷', createdAt: new Date() },
        { id: 'burst', name: '炸点', createdAt: new Date() },
        { id: 'offset', name: '焊偏', createdAt: new Date() },
        { id: 'over_soldering', name: '过焊', createdAt: new Date() },
        { id: 'under_soldering', name: '少焊', createdAt: new Date() }
      ];
      
      setTags(defaultTags);
      localStorageUtils.setItem('tags', defaultTags);
    }
  }, []);

  // 当标签变化时保存到localStorage
  useEffect(() => {
    if (tags.length > 0) {
      localStorageUtils.setItem('tags', tags);
    }
  }, [tags]);

  // 添加标签
  const addTag = (name: string): boolean => {
    // 检查标签名称是否已存在
    if (tags.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
      return false; // 标签已存在
    }
    
    const newTag: Tag = {
      id: generateId(),
      name,
      createdAt: new Date()
    };
    
    setTags(prev => [...prev, newTag]);
    return true; // 标签添加成功
  };

  // 更新标签
  const updateTag = (id: string, name: string): boolean => {
    // 检查标签名称是否已存在
    if (tags.some(tag => tag.id !== id && tag.name.toLowerCase() === name.toLowerCase())) {
      return false; // 标签已存在
    }
    
    setTags(prev => 
      prev.map(tag => 
        tag.id === id ? { ...tag, name } : tag
      )
    );
    return true; // 标签更新成功
  };

  // 删除标签
  const deleteTag = (id: string) => {
  // 不能删除默认标签（"不确定"、"表面缺陷"和"未分类"）
  if (['uncertain', 'surface_defect', 'unclassified'].includes(id)) {
    return;
  }
    
    setTags(prev => prev.filter(tag => tag.id !== id));
    
    // 同时需要更新图片上的标签引用，这将在ImageContext中处理
  };

  // 根据ID获取标签名称
  const getTagName = (id: string): string => {
    const tag = tags.find(t => t.id === id);
    return tag ? tag.name : '未知标签';
  };

  // 根据名称获取标签ID
  const getTagId = (name: string): string | undefined => {
    const tag = tags.find(t => t.name.toLowerCase() === name.toLowerCase());
    return tag?.id;
  };

  return (
    <TagContext.Provider value={{
      tags,
      addTag,
      updateTag,
      deleteTag,
      getTagName,
      getTagId
    }}>
      {children}
    </TagContext.Provider>
  );
}

// 自定义hook，方便组件使用上下文
export function useTagContext() {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useTagContext must be used within a TagProvider');
  }
  return context;
}