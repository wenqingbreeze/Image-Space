import { createContext, useContext, useState, useEffect } from 'react';
import { Image, Annotation, ContextProviderProps } from '@/lib/types';
import { useTagContext } from '@/contexts/TagContext';
import { localStorageUtils, generateId } from '@/lib/utils';

// 定义上下文类型
interface ImageContextType {
  images: Image[];
  addImage: (name: string, url: string) => void;
  updateImageTags: (imageId: string, tags: string[]) => void;
  toggleStarImage: (imageId: string) => void;
  addAnnotation: (imageId: string, content: string) => void;
  deleteAnnotation: (imageId: string, annotationId: string) => void;
  deleteImage: (imageId: string) => void;
  getFilteredImages: () => Image[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  selectedImageIds: string[];
  toggleImageSelection: (imageId: string) => void;
  selectAllImages: () => void;
  deselectAllImages: () => void;
  batchAddTags: (tagIds: string[]) => void;
  batchRemoveTags: (tagIds: string[]) => void;
  batchDeleteImages: (imageIds: string[]) => void;
}

// 创建上下文
const ImageContext = createContext<ImageContextType | undefined>(undefined);

// 模拟图片数据生成函数
const generateMockImages = (count: number): Image[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: generateId(),
    name: `焊点图片_${i + 1}.png`,
    url: `https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=solder%20joint%20image%20${i + 1}`,
    tags: ['unclassified'], // 默认未分类
    isStarred: i % 5 === 0, // 每5张图有一张加星标
    annotations: i % 3 === 0 ? [{
      id: generateId(),
      content: `这是第${i + 1}张图片的示例批注。`,
      createdAt: new Date()
    }] : [],
    uploadDate: new Date(Date.now() - i * 86400000) // 不同的上传日期
  }));
};

// 上下文提供者组件
export function ImageProvider({ children }: ContextProviderProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const { getTagName } = useTagContext();

  // 从localStorage加载图片数据
  useEffect(() => {
    const savedImages = localStorageUtils.getItem<Image[]>('images');
    if (savedImages && savedImages.length > 0) {
      // 转换日期字符串为Date对象
      const parsedImages = savedImages.map(img => ({
        ...img,
        uploadDate: new Date(img.uploadDate),
        annotations: img.annotations.map(anno => ({
          ...anno,
          createdAt: new Date(anno.createdAt)
        }))
      }));
      setImages(parsedImages);
    } else {
      // 生成模拟数据
      const mockImages = generateMockImages(20);
      setImages(mockImages);
      localStorageUtils.setItem('images', mockImages);
    }
  }, []);

  // 当图片数据变化时保存到localStorage
  useEffect(() => {
    if (images.length > 0) {
      localStorageUtils.setItem('images', images);
    }
  }, [images]);

  // 添加图片
  const addImage = (name: string, url: string) => {
    const newImage: Image = {
      id: generateId(),
      name,
      url,
      tags: ['unclassified'], // 默认未分类isStarred: false,
      annotations: [],
      uploadDate: new Date()
    };
    
    setImages(prev => [newImage, ...prev]);
  };

  // 更新图片标签
  const updateImageTags = (imageId: string, tags: string[]) => {
    setImages(prev => 
      prev.map(img => {
        if (img.id === imageId) {
          // 如果有其他标签，移除未分类标签
          const updatedTags = tags.length > 0 && tags.includes('unclassified')
            ? tags.filter(tag => tag !== 'unclassified')
            : tags;
            
          return { ...img, tags: updatedTags };
        }
        return img;
      })
    );
  };

  // 切换图片星标状态
  const toggleStarImage = (imageId: string) => {
    setImages(prev => 
      prev.map(img => 
        img.id === imageId ? { ...img, isStarred: !img.isStarred } : img
      )
    );
  };

  // 添加批注
  const addAnnotation = (imageId: string, content: string) => {
    const newAnnotation: Annotation = {
      id: generateId(),
      content,
      createdAt: new Date()
    };
    
    setImages(prev => 
      prev.map(img => {
        if (img.id === imageId) {
          return { 
            ...img, 
            annotations: [...img.annotations, newAnnotation] 
          };
        }
        return img;
      })
    );
  };

  // 删除批注
  const deleteAnnotation = (imageId: string, annotationId: string) => {
    setImages(prev => 
      prev.map(img => {
        if (img.id === imageId) {
          return {
            ...img,
            annotations: img.annotations.filter(anno => anno.id !== annotationId)
          };
        }
        return img;
      })
    );
  };

  // 删除图片
  const deleteImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  // 获取筛选后的图片
  const getFilteredImages = () => {
    return images
      .filter(img => {
        // 获取图片的所有标签名称
        const imageTagNames = img.tags.map(tagId => getTagName(tagId)).join(' ');
        
        // 搜索筛选 - 同时检查图片名称和标签名称
        const matchesSearch = searchQuery === '' || 
          img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          imageTagNames.toLowerCase().includes(searchQuery.toLowerCase());
        
        // 标签筛选
        const matchesTags = selectedTags.length === 0 || 
          selectedTags.some(tag => img.tags.includes(tag));
          
        return matchesSearch && matchesTags;
      })
      .sort((a, b) => {
        // 星标优先
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
        
        // 已分类图片在前
        const aIsUnclassified = a.tags.length === 1 && a.tags[0] === 'unclassified';
        const bIsUnclassified = b.tags.length === 1 && b.tags[0] === 'unclassified';
        
        if (!aIsUnclassified && bIsUnclassified) return -1;
        if (aIsUnclassified && !bIsUnclassified) return 1;
        
        // "不确定"标签在其他标签之后
        const aIsUncertain = a.tags.includes('uncertain');
        const bIsUncertain = b.tags.includes('uncertain');
        
        if (!aIsUncertain && bIsUncertain) return -1;
        if (aIsUncertain && !bIsUncertain) return 1;
        
        // 按上传日期排序（新的在前）
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      });
  };

  // 切换图片选择状态
  const toggleImageSelection = (imageId: string) => {
    setSelectedImageIds(prev => 
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  // 全选图片
  const selectAllImages = () => {
    const filtered = getFilteredImages();
    setSelectedImageIds(filtered.map(img => img.id));
  };

  // 取消全选
  const deselectAllImages = () => {
    setSelectedImageIds([]);
  };

  // 批量添加标签
  const batchAddTags = (tagIds: string[]) => {
    if (selectedImageIds.length === 0 || tagIds.length === 0) return;
    
    setImages(prev => 
      prev.map(img => {
        if (selectedImageIds.includes(img.id)) {
          // 添加新标签，避免重复
          const newTags = [...new Set([...img.tags, ...tagIds])];
          // 如果有其他标签，移除未分类标签
          const updatedTags = newTags.length > 0 && newTags.includes('unclassified')
            ? newTags.filter(tag => tag !== 'unclassified')
            : newTags;
            
          return { ...img, tags: updatedTags };
        }
        return img;
      })
    );
  };

  // 批量移除标签
  const batchRemoveTags = (tagIds: string[]) => {
    if (selectedImageIds.length === 0 || tagIds.length === 0) return;
    
    setImages(prev => 
      prev.map(img => {
        if (selectedImageIds.includes(img.id)) {
          const updatedTags = img.tags.filter(tag => !tagIds.includes(tag));
          // 如果没有标签了，添加未分类标签
          return { 
            ...img, 
            tags: updatedTags.length > 0 ? updatedTags : ['unclassified']
          };
        }
        return img;
      })
    );
  };

  // 批量删除图片
  const batchDeleteImages = (imageIds: string[]) => {
    if (imageIds.length === 0) return;
    
    setImages(prev => prev.filter(img => !imageIds.includes(img.id)));
  };

  return (
    <ImageContext.Provider value={{
      images,
      addImage,
      updateImageTags,
      toggleStarImage,
      addAnnotation,
      deleteAnnotation,
      deleteImage,
      getFilteredImages,
      searchQuery,
      setSearchQuery,
      selectedTags,
      setSelectedTags,
      selectedImageIds,
      toggleImageSelection,
      selectAllImages,
      deselectAllImages,
  batchAddTags,
  batchRemoveTags,
  batchDeleteImages
    }}>
      {children}
    </ImageContext.Provider>
  );
}

// 自定义hook，方便组件使用上下文
export function useImageContext() {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImageContext must be used within an ImageProvider');
  }
  return context;
}