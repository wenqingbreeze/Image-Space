import { useState, useRef, useEffect } from 'react';
import { Image } from '@/lib/types';
import { useImageContext } from '@/contexts/ImageContext';
import { useTagContext } from '@/contexts/TagContext';
import { AnnotationPopover } from './AnnotationPopover';
import { useConfigContext } from '@/contexts/ConfigContext';
import { toast } from 'sonner';



interface ImageCardProps {
  image: Image;
  isMultiSelectMode: boolean;
}

export function ImageCard({ image, isMultiSelectMode }: ImageCardProps) {
  const { updateImageTags, toggleStarImage, addAnnotation, deleteAnnotation, deleteImage, toggleImageSelection, selectedImageIds } = useImageContext();
  const { tags, getTagName, updateTag, deleteTag } = useTagContext();
  const { isAdmin } = useConfigContext();
  
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const annotationInputRef = useRef<HTMLTextAreaElement>(null);
  
  // 过滤掉未分类标签（如果有其他标签）
  const imageTags = image.tags.filter(tagId => 
    !(image.tags.length > 1 && tagId === 'unclassified')
  );
  
  // 处理标签点击
  const handleTagClick = (tagId: string) => {
    // 切换标签编辑模式
    if (tagId === 'edit-tags') {
      setShowTagEditor(true);
      return;
    }
    
    // 移除标签
    updateImageTags(
      image.id, 
      image.tags.filter(id => id !== tagId)
    );
  };
  
  // 保存标签编辑
  const saveTagChanges = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTagEditor(false);
  };
  
  // 切换标签选择
  const toggleTagSelection = (tagId: string) => {
    if (image.tags.includes(tagId)) {
      // 移除标签
      updateImageTags(
        image.id, 
        image.tags.filter(id => id !== tagId)
      );
    } else {
      // 添加标签
      updateImageTags(
        image.id, 
        [...image.tags, tagId]
      );
    }
  };
  
  // 添加批注
  const handleAddAnnotation = () => {
    if (newAnnotation.trim()) {
      addAnnotation(image.id, newAnnotation.trim());
      setNewAnnotation('');
      toast.success('批注已添加');
    }
  };
  
  // 删除图片
  const handleDeleteImage = () => {
    if (window.confirm(`确定要删除图片 "${image.name}" 吗？`)) {
      deleteImage(image.id);
      toast.success('图片已删除');
    }
  };
  
  // 处理图片点击预览
  const handleImageClick = () => {
    setShowPreview(true);
  };
  
  // 关闭预览
  const closePreview = () => {
    setShowPreview(false);
  };
  
  // 点击外部关闭预览
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPreview && event.target === document.getElementById('preview-backdrop')) {
        closePreview();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPreview]);
  
  // 标签编辑模式下自动聚焦输入框
  useEffect(() => {
    if (showTagEditor && annotationInputRef.current) {
      annotationInputRef.current.focus();
    }
  }, [showTagEditor]);
  
    // 图片预览模态框
  if (showPreview) {
    return (
      <div 
        id="preview-backdrop"
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      >
        <div className="relative max-w-6xl w-full max-h-[95vh]">
          <button 
            onClick={closePreview}
            className="absolute top-2 right-2 bg-white bg-opacity-50 hover:bg-opacity-100 text-white p-2 rounded-full transition-colors z-10"
          >
            <i className="fa-solid fa-times"></i>
          </button>
          
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
                <div className="md:w-2/3 bg-gray-100 flex items-center justify-center p-2">
             <img 
               src={image.url} 
               alt={image.name}
                className="max-h-[95vh] md:max-h-[98vh] max-w-full object-contain"
             />
              </div>
            
              <div className="md:w-1/3 p-4 overflow-y-auto max-h-[70vh] md:max-h-[90vh]">
              <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{image.name}</h3>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">标签</h4>
                <div className="flex flex-wrap gap-1">
                  {imageTags.map(tagId => (
                    <span 
                      key={tagId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                    >
                      {getTagName(tagId)}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">批注 ({image.annotations.length})</h4>
                {image.annotations.length > 0 ? (
                  <div className="space-y-3 text-sm">
                    {image.annotations.map(annotation => (
                      <div key={annotation.id} className="p-2 bg-gray-50 rounded">
                        <p className="text-gray-700 whitespace-pre-line">{annotation.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(annotation.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">暂无批注</p>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-200">
                <textarea
                  ref={annotationInputRef}
                  placeholder="添加批注..."
                  value={newAnnotation}
                  onChange={(e) => setNewAnnotation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddAnnotation())}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm mb-2"
                  rows={3}
                ></textarea>
                
                <div className="flex justify-between">
                  <button
                    onClick={handleAddAnnotation}
                    className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                  >
                    添加批注
                  </button>
                  
                     <button
                       onClick={handleDeleteImage}
                       className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                     >
                       删除图片
                     </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 图片容器 */}
         <div 
          className="relative aspect-[2250/1530] bg-gray-100 cursor-pointer flex items-center justify-center p-2"
          onClick={(e) => {
            if (isMultiSelectMode) {
              toggleImageSelection(image.id);
            } else {
              handleImageClick();
            }
          }}
        >
          <img 
            src={image.url} 
            alt={image.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        

         {/* 左上角标记容器 - 垂直居中对齐 */}
          <div className="absolute top-1 left-2 flex flex-col items-center space-y-0.5">
          {/* 星标按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleStarImage(image.id);
            }}
            className="bg-white bg-opacity-70 hover:bg-opacity-100 p-1.5 rounded-full transition-colors"
            title={image.isStarred ? "取消星标" : "添加星标"}
          >
            <i className={`fa-solid fa-star ${image.isStarred ? 'text-yellow-400' : 'text-gray-300'}`}></i>
          </button>
          
          {/* 批注指示器 */}
          {image.annotations.length > 0 && (
            <div className="flex items-center justify-center">
              <AnnotationPopover 
                annotations={image.annotations}
                onDeleteAnnotation={(id) => deleteAnnotation(image.id, id)}
              />
            </div>
          )}
        </div>
        
            {/* 选择框 - 仅在多选模式下显示 */}
             {isMultiSelectMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleImageSelection(image.id);
                }}
                className={`absolute top-2 right-2 w-6 h-6 rounded-full transition-all z-10 flex items-center justify-center ${
                  selectedImageIds.includes(image.id)
                    ? 'bg-blue-500 text-white'
                    : 'border-2 border-blue-500 bg-white'
                }`}
                title={selectedImageIds.includes(image.id) ? "取消选择" : "选择图片"}
              >
                {selectedImageIds.includes(image.id) && (
                  <i className="fa-solid fa-check text-xs"></i>
                )}
              </button>
            )}
          
         {/* 删除按钮 - 仅管理员可见 */}
         {isAdmin && (
           <button
             onClick={(e) => {
               e.stopPropagation();
               if (window.confirm(`确定要删除图片 "${image.name}" 吗？`)) {
                 deleteImage(image.id);
               }
             }}
             className="absolute bottom-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors z-10"
             title="删除图片"
           >
             <i className="fa-solid fa-trash text-xs"></i>
           </button>
         )}
        
        {/* 悬停时显示操作按钮 */}
        {(isHovered || showTagEditor) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            {showTagEditor ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {tags
                        .filter(tag => tag.id !== 'unclassified' || image.tags.length <= 1)
                          .map(tag => (
                          <label 
                            key={tag.id} 
                            className="inline-flex items-center px-2 py-1 mr-2 mb-1 rounded-md bg-black/30"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={image.tags.includes(tag.id)}
onChange={(e) => {
  e.stopPropagation();
  toggleTagSelection(tag.id);
  setShowTagEditor(false); // 勾选后关闭面板
}}
                              className="rounded text-orange-500 focus:ring-orange-400 transform scale-125"
                            />
                            <span className="ml-2 text-sm text-white">{tag.name}</span>
                          </label>
                        ))}
                </div>
                <div className="flex justify-end gap-2">

                </div>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        )}
      </div>
      
      {/* 图片信息 */}
      <div className="p-3">
        {/* 文件名称 */}
        <h3 className="font-medium text-gray-900 mb-2 truncate" title={image.name}>
          {image.name}
        </h3>
        
        {/* 标签显示 */}
        <div className="flex flex-wrap gap-1 mb-2">
          {imageTags.map(tagId => (
            <span
              key={tagId}
              onClick={(e) => {
                e.stopPropagation();
                handleTagClick(tagId);
              }}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-orange-50 text-orange-700 hover:bg-orange-100 cursor-pointer"
            >
             {getTagName(tagId)}
             {isAdmin && <i className="fa-solid fa-times ml-0.5"></i>}
           </span>
          ))}
          
          {!showTagEditor && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTagEditor(true);
              }}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          )}
        </div>
        
        {/* 批注输入框 (仅在编辑模式显示) */}
        {isHovered && !showTagEditor && (
          <div className="mt-2">
            <textarea
              ref={annotationInputRef}
              placeholder="添加批注..."
              value={newAnnotation}  
              onChange={(e) => setNewAnnotation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddAnnotation())}
              className="w-full p-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-transparent"
              rows={2}
            ></textarea>
            
            {newAnnotation && (
              <button
                onClick={handleAddAnnotation}
                className="mt-1 text-xs text-orange-500 hover:text-orange-600"  
              >
                <i className="fa-solid fa-paper-plane mr-1"></i>发送
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}