import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { TagSelector } from '@/components/TagSelector';
import { LayoutControls } from '@/components/LayoutControls';
import { ImageUploader } from '@/components/ImageUploader';
import { ImageGrid } from '@/components/ImageGrid';
import { useRef, useState, useEffect } from 'react';
import { useImageContext } from '@/contexts/ImageContext';
import { useTagContext } from '@/contexts/TagContext';
import { useConfigContext } from '@/contexts/ConfigContext';
import { toast } from 'sonner';
import { localStorageUtils, generateId } from '@/lib/utils';

export default function Home() {
  const { images, selectedImageIds, selectAllImages, deselectAllImages, batchAddTags, batchRemoveTags, batchDeleteImages } = useImageContext();
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const { addTag, getTagId } = useTagContext();
  const batchTagInputRef = useRef<HTMLInputElement>(null);
  const batchRemoveTagInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useConfigContext();
  
  // 文本区域状态管理
  const [textSections, setTextSections] = useState<string[]>([]);
  
  // 视频区域状态管理
  const [videoSections, setVideoSections] = useState<Array<{
    id: string;
    name: string;
    url: string | null;
  }>>([]);
  
  // 从localStorage加载内容
  useEffect(() => {
    const savedTexts = localStorageUtils.getItem<string[]>('adminTextSections') || [];
    setTextSections(savedTexts);
    
    const savedVideos = localStorageUtils.getItem<Array<{
      id: string;
      name: string;
      url: string | null;
    }>>('adminVideoSections') || [];
    setVideoSections(savedVideos);
  }, []);
  
  // 添加文本区域
  const addTextSection = () => {
    const newSections = [...textSections, '<p>点击编辑文本内容...</p>'];
    setTextSections(newSections);
    localStorageUtils.setItem('adminTextSections', newSections);
  };
  
  // 删除文本区域
  const removeTextSection = (index: number) => {
    const newSections = textSections.filter((_, i) => i !== index);
    setTextSections(newSections);
    localStorageUtils.setItem('adminTextSections', newSections);
  };
  
  // 更新文本区域内容
  const handleTextSectionChange = (index: number, content: string) => {
    const newSections = [...textSections];
    newSections[index] = content;
    setTextSections(newSections);
    localStorageUtils.setItem('adminTextSections', newSections);
  };
  
  // 添加视频区域
  const addVideoSection = () => {
    const newVideo = {
      id: generateId(),
      name: '',
      url: null
    };
    const newVideos = [...videoSections, newVideo];
    setVideoSections(newVideos);
    localStorageUtils.setItem('adminVideoSections', newVideos);
  };
  
  // 删除视频区域
  const removeVideoSection = (index: number) => {
    const newVideos = videoSections.filter((_, i) => i !== index);
    setVideoSections(newVideos);
    localStorageUtils.setItem('adminVideoSections', newVideos);
  };
  
  // 处理视频上传
  const handleVideoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 创建视频预览URL
    const videoUrl = URL.createObjectURL(file);
    
    // 更新视频区域状态
    const newVideos = [...videoSections];
    newVideos[index] = {
      ...newVideos[index],
      name: file.name,
      url: videoUrl
    };
    
    setVideoSections(newVideos);
    localStorageUtils.setItem('adminVideoSections', newVideos);
    
    // 重置input值，允许重复上传同一文件
    e.target.value = '';
  }

  // 批量添加标签
  const handleBatchAddTag = () => {
    if (!batchTagInputRef.current) return;
    const tagName = batchTagInputRef.current.value.trim();
    
    if (!tagName) {
      toast.error('请输入标签名称');
      return;
    }
    
    // 尝试获取标签ID，如果不存在则创建
    let tagId = getTagId(tagName);
    if (!tagId) {
      const success = addTag(tagName);
      if (!success) {
        toast.error('创建标签失败');
        return;
      }
      tagId = getTagId(tagName);
    }
    
    if (tagId) {
      batchAddTags([tagId]);
      toast.success(`已为 ${selectedImageIds.length} 张图片添加标签: ${tagName}`);
      batchTagInputRef.current.value = '';
    }
  };

  // 批量移除标签
  const handleBatchRemoveTag = () => {
    if (!batchRemoveTagInputRef.current) return;
    const tagName = batchRemoveTagInputRef.current.value.trim();
    
    if (!tagName) {
      toast.error('请输入标签名称');
      return;
    }
    
    const tagId = getTagId(tagName);
    if (!tagId) {
      toast.error('标签不存在');
      return;
    }
    
    batchRemoveTags([tagId]);
    toast.success(`已从 ${selectedImageIds.length} 张图片移除标签: ${tagName}`);
    batchRemoveTagInputRef.current.value = '';
  };
  
   // 复制选中图片名称到剪贴板
   const copySelectedImagesToClipboard = () => {
     try {
       // 检查是否有选中的图片
       if (selectedImageIds.length === 0) {
         toast.error('请先选择要复制名称的图片');
         return;
       }
       
       // 获取选中的图片并处理文件名
       const selectedImages = images.filter(img => selectedImageIds.includes(img.id));
       const fileNames = selectedImages.map(img => {
         // 移除.png后缀
         return img.name.replace(/\.png$/i, '');
       });
       
       // 用逗号分隔文件名
       const content = fileNames.join(',');
       
       // 使用Clipboard API复制到剪贴板
       navigator.clipboard.writeText(content)
         .then(() => {
           toast.success(`已成功复制 ${selectedImages.length} 个文件名到剪贴板`);
         })
         .catch(err => {
           console.error('复制到剪贴板失败:', err);
           toast.error('复制失败，请手动选择并复制文本');
         });
     } catch (error) {
       console.error('复制操作失败:', error);
       if (error instanceof Error) {
         toast.error(`操作失败: ${error.message}`);
       } else {
         toast.error('复制功能出现错误，请稍后重试');
       }
     }
   }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto px-1 sm:px-2 space-y-8">
          {/* 搜索栏 */}
          <SearchBar />
          
          {/* 图片上传 */}
          <ImageUploader />
          
          {/* 批量操作工具栏 */}
          {selectedImageIds.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex flex-wrap items-center gap-3">
              <div className="text-sm text-orange-800">
                <i className="fa-solid fa-check-square-o mr-1"></i>
                已选择 {selectedImageIds.length} 张图片
              </div>
              
               <div className="flex gap-2">
                 <button
                   onClick={deselectAllImages}
                   className="px-3 py-1 text-sm border border-orange-300 text-orange-700 rounded hover:bg-orange-100 transition-colors"
                 >
                   <i className="fa-solid fa-times mr-1"></i>取消全选
                 </button>
                 
                 <div className="relative group">
                   <button className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
                     <i className="fa-solid fa-tags mr-1"></i>批量添加标签
                   </button>
                   <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 hidden group-hover:block">
                     <div className="p-2">
                       <input 
                         type="text" 
                         placeholder="输入标签名称..." 
                         className="w-full p-1 text-sm border border-gray-300 rounded"
                         ref={batchTagInputRef}
                         onKeyPress={(e) => e.key === 'Enter' && handleBatchAddTag()}
                       />
                       <div className="flex justify-end mt-1">
                         <button 
                           onClick={handleBatchAddTag}
                           className="px-2 py-0.5 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                         >
                           添加
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 <div className="relative group">
                   <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                     <i className="fa-solid fa-tag mr-1"></i>批量移除标签
                   </button>
                   <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 hidden group-hover:block">
                     <div className="p-2">
                       <input 
                         type="text" 
                         placeholder="输入标签名称..." 
                         className="w-full p-1 text-sm border border-gray-300 rounded"
                         ref={batchRemoveTagInputRef}
                         onKeyPress={(e) => e.key === 'Enter' && handleBatchRemoveTag()}
                       />
                       <div className="flex justify-end mt-1">
                         <button 
                           onClick={handleBatchRemoveTag}
                           className="px-2 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                         >
                           移除
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                   <button
                     onClick={copySelectedImagesToClipboard}
                     className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                   >
                     <i className="fa-solid fa-copy mr-1"></i>复制所选图片名称
                   </button>
                   
                   <button
                     onClick={() => {
                       if (window.confirm(`确定要删除选中的 ${selectedImageIds.length} 张图片吗？此操作不可撤销。`)) {
                         batchDeleteImages(selectedImageIds);
                         toast.success(`已成功删除 ${selectedImageIds.length} 张图片`);
                       }
                     }}
                     className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                   >
                     <i className="fa-solid fa-trash mr-1"></i>批量删除
                   </button>
               </div>
            </div>
          )}
          
             {/* 标签选择器和布局控制 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <TagSelector />
                </div>
                
                  {/* 图片命名规则说明区 */}
                   <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 w-[300px] flex-shrink-0">
                    <h3 className="font-medium text-orange-800 mb-2 flex items-center text-sm">
                      <i class="fa-solid fa-info-circle mr-2"></i>图片命名规则
                    </h3>
                    <p className="text-sm text-gray-700">
                      图片命名采用 <code className="bg-white px-1 py-0.5 rounded text-orange-600 text-sm">组合图_A-B-C (D)</code> 的格式，各部分含义为：
                    </p>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc pl-5">
                      <li><strong>A</strong>：企业提供的文件夹名</li>
                      <li><strong>B</strong>：线圈槽的序号标识</li>
                      <li><strong>C</strong>：焊点的序号标识</li>
                      <li><strong>D</strong>：焊点相对于所在槽的位置信息</li>
                    </ul>
                  </div>
                
                 <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                        <LayoutControls />
                       <div className="flex gap-3 w-full justify-center sm:justify-end mt-1">
                         <button
                           onClick={selectedImageIds.length > 0 ? deselectAllImages : selectAllImages}
                           className="px-4 py-2 text-base border border-orange-300 text-orange-700 rounded hover:bg-orange-100 transition-colors whitespace-nowrap min-w-[120px]"
                         >
                           <i className={`fa-solid ${selectedImageIds.length > 0 ? 'fa-times' : 'fa-check-square-o'} mr-1.5`}></i>
                           {selectedImageIds.length > 0 ? '取消全选' : '全选图片'}
                         </button>
                         
                         <button
                           onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
                           className="px-4 py-2 text-base border border-orange-300 text-orange-700 rounded hover:bg-orange-100 transition-colors whitespace-nowrap min-w-[120px]"
                           title={isMultiSelectMode ? "关闭多选" : "开启多选"}
                         >
                           <i className={`fa-solid ${isMultiSelectMode ? 'fa-check-square' : 'fa-list-ul'} mr-1.5`}></i>
                           {isMultiSelectMode ? "关闭多选" : "多选图片"}
                         </button>
                       </div>
               </div>
             </div>
          
          {/* 图片网格 */}
           <ImageGrid isMultiSelectMode={isMultiSelectMode} />
        </div>
      </main>

      
      <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2025 Image Space. 保留所有权利。</p>
        </div>
      </footer>
    </div>
  );
}