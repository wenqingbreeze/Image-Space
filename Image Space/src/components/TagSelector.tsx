import { useState } from 'react';
import { useTagContext } from '@/contexts/TagContext';
import { useImageContext } from '@/contexts/ImageContext';
import { useConfigContext } from '@/contexts/ConfigContext';
import { toast } from 'sonner';


export function TagSelector() {
  const { tags, addTag, deleteTag } = useTagContext();
  const { selectedImageIds, batchAddTags, batchRemoveTags } = useImageContext();
  const [batchActionTags, setBatchActionTags] = useState<string[]>([]);
  const { selectedTags, setSelectedTags } = useImageContext();
  const [newTagName, setNewTagName] = useState('');
  const { isAdmin } = useConfigContext();

  // 切换标签选择状态
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // 创建新标签
  const handleAddTag = () => {
    if (!newTagName.trim()) {
      toast.error('标签名称不能为空');
      return;
    }

    const success = addTag(newTagName.trim());
    if (success) {
      toast.success(`成功创建标签: ${newTagName}`);
      setNewTagName('');
    } else {
      toast.error('标签已存在或创建失败');
    }
  };

  // 过滤掉默认的未分类标签，它不应该出现在选择器中
  // 包含未分类标签并将其排在第一位
  const filteredTags = [...tags].sort((a, b) => a.id === 'unclassified' ? -1 : b.id === 'unclassified' ? 1 : 0);

  // 切换批量操作标签
  const toggleBatchActionTag = (tagId: string) => {
    setBatchActionTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // 应用批量添加标签
  const applyBatchAddTags = () => {
    if (batchActionTags.length > 0) {
      batchAddTags(batchActionTags);
      toast.success(`已批量添加 ${batchActionTags.length} 个标签`);
      setBatchActionTags([]);
    }
  };

  return (
     <div className="p-4 bg-white rounded-xl shadow-sm border border-orange-100 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">标签筛选</h3>
      
       <div className="flex flex-wrap gap-2 mb-3">
        {filteredTags.map(tag => (
          <div className="relative">
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
               className={`px-3 py-1 rounded-lg text-sm transition-all whitespace-nowrap ${
                selectedTags.includes(tag.id)
                  ? 'bg-orange-500 text-white hover:bg-orange-600 shadow'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              {tag.name}
              {selectedTags.includes(tag.id) && (
                <i className="fa-solid fa-times ml-1"></i>
              )}
            </button>
            
    {/* 标签删除按钮 - 仅管理员可见且"不确定"、"表面缺陷"和"未分类"标签不可删除 */}
    {isAdmin && !['uncertain', 'surface_defect', 'unclassified'].includes(tag.id) && (
      <button
        onClick={(e) => {
         e.stopPropagation();
         if (window.confirm(`确定要删除标签 "${tag.name}" 吗？`)) {
           deleteTag(tag.id);
         }
       }}
       className="absolute -top-1 -right-1 text-red-400 hover:text-red-500 text-xs bg-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm"
       title="删除标签"
     >
       <i className="fa-solid fa-times text-[10px]"></i>
     </button>
   )}
          </div>
        ))}
      </div>
      
      {/* 创建新标签 */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="创建新标签..."
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
        />
        <button
          onClick={handleAddTag}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm"
        >
          创建标签
        </button>
      </div>

      {/* 批量操作按钮 */}
      {selectedImageIds.length > 0 && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-500 mb-2">批量操作所选标签:</div>
          <button
            onClick={applyBatchAddTags}
            disabled={batchActionTags.length === 0}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              batchActionTags.length > 0
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <i className="fa-solid fa-plus mr-1"></i>添加到所选图片
          </button>
          <button
             onClick={batchRemoveTags}
            disabled={batchActionTags.length === 0}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              batchActionTags.length > 0
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <i className="fa-solid fa-minus mr-1"></i>从所选图片移除
          </button>
        </div>
      )}
    </div>
  );
}