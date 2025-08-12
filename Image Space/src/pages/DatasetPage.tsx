import { Header } from '@/components/Header';
import { useConfigContext } from '@/contexts/ConfigContext';
import { ImageUploader } from '@/components/ImageUploader';
import { useState, useEffect, useCallback } from 'react';
import { localStorageUtils, generateId } from '@/lib/utils';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

export default function DatasetPage() {
  const { isAdmin } = useConfigContext();
  
  // 状态管理
  const [pageContent, setPageContent] = useState({
    title: '',
    introduction: '',
    overview: '',
    collectionEnv: [],
    defectTypes: [],
    usageInstructions: ''
  });
  
  // 文本区域状态管理
  const [textSections, setTextSections] = useState<string[]>([]);
  
  // 图片区域状态管理
  const [imageSections, setImageSections] = useState<Array<{
    id: string;
    name: string;
    url: string | null;
  }>>([{
    id: generateId(),
    name: '数据集原始说明图',
    url: 'https://lf-code-agent.coze.cn/obj/x-ai-cn/269481286914/attachment/image_20250812132417.png'
  }]);
  
  // 视频区域状态管理
  const [videoSections, setVideoSections] = useState<Array<{
    id: string;
    name: string;
    url: string | null;
  }>>([]);
  
  // 从localStorage加载内容 - 仅加载管理功能配置，不加载内容
  useEffect(() => {
    // 清除旧的内容数据
    localStorageUtils.removeItem('datasetPageContent');
    localStorageUtils.removeItem('datasetTextSections');
    localStorageUtils.removeItem('datasetImageSections');
    localStorageUtils.removeItem('datasetVideoSections');
  }, []);
  
  // 保存内容到localStorage
  const saveContent = () => {
    localStorageUtils.setItem('datasetPageContent', pageContent);
    localStorageUtils.setItem('datasetTextSections', textSections);
    localStorageUtils.setItem('datasetImageSections', imageSections);
    localStorageUtils.setItem('datasetVideoSections', videoSections);
    toast.success('内容已成功保存');
  };
  
  // 处理标题变化
  const handleTitleChange = (e: React.FormEvent<HTMLHeadingElement>) => {
    setPageContent(prev => ({
      ...prev,
      title: e.currentTarget.innerText
    }));
  };
  
  // 处理段落内容变化
  const handleContentChange = (field: keyof typeof pageContent, value: string) => {
    setPageContent(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 处理列表项变化
  const handleListItemChange = (listName: 'collectionEnv' | 'defectTypes', index: number, value: string) => {
    setPageContent(prev => {
      const updatedList = [...prev[listName] as string[]];
      updatedList[index] = value;
      return {
        ...prev,
        [listName]: updatedList
      };
    });
  };
  
  // 文本区域管理
  const addTextSection = () => {
    const newSections = [...textSections, '<p>点击编辑文本内容...</p>'];
    setTextSections(newSections);
    localStorageUtils.setItem('datasetTextSections', newSections);
  };
  
  const removeTextSection = (index: number) => {
    const newSections = textSections.filter((_, i) => i !== index);
    setTextSections(newSections);
    localStorageUtils.setItem('datasetTextSections', newSections);
  };
  
  const handleTextSectionChange = (index: number, content: string) => {
    const newSections = [...textSections];
    newSections[index] = content;
    setTextSections(newSections);
    localStorageUtils.setItem('datasetTextSections', newSections);
  };
  
  // 图片区域管理
  const addImageSection = () => {
    const newImage = {
      id: generateId(),
      name: '',
      url: null
    };
    const newImages = [...imageSections, newImage];
    setImageSections(newImages);
    localStorageUtils.setItem('datasetImageSections', newImages);
  };
  
  const removeImageSection = (index: number) => {
    const newImages = imageSections.filter((_, i) => i !== index);
    setImageSections(newImages);
    localStorageUtils.setItem('datasetImageSections', newImages);
  };
  
  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 创建图片预览URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const newImages = [...imageSections];
        newImages[index] = {
          ...newImages[index],
          name: file.name,
          url: e.target.result as string
        };
        
        setImageSections(newImages);
        localStorageUtils.setItem('datasetImageSections', newImages);
      }
    };
    reader.readAsDataURL(file);
    
    // 重置input值，允许重复上传同一文件
    e.target.value = '';
  };
  
  // 视频区域管理
  const addVideoSection = () => {
    const newVideo = {
      id: generateId(),
      name: '',
      url: null
    };
    const newVideos = [...videoSections, newVideo];
    setVideoSections(newVideos);
    localStorageUtils.setItem('datasetVideoSections', newVideos);
  };
  
  const removeVideoSection = (index: number) => {
    const newVideos = videoSections.filter((_, i) => i !== index);
    setVideoSections(newVideos);
    localStorageUtils.setItem('datasetVideoSections', newVideos);
  };
  
   // 处理文本区域中的图片插入
   const handleImageInsert = (textSectionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     
     // 创建图片预览URL
     const reader = new FileReader();
     reader.onload = (e) => {
       if (e.target?.result) {
         // 获取当前文本区域内容
         const newSections = [...textSections];
         // 在内容中插入图片
         newSections[textSectionIndex] = `
           ${newSections[textSectionIndex]}
           <div class="my-4">
             <img src="${e.target.result}" alt="插入图片" class="max-w-full h-auto rounded-lg border border-gray-200" />
           </div>
         `.trim();
         
         setTextSections(newSections);
         localStorageUtils.setItem('datasetTextSections', newSections);
       }
     };
     reader.readAsDataURL(file);
   };

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
    localStorageUtils.setItem('datasetVideoSections', newVideos);
    
    // 重置input值，允许重复上传同一文件
    e.target.value = '';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 
              className="text-4xl md:text-5xl font-bold mb-8 text-center bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent shadow-lg"
              contentEditable={isAdmin}
              onInput={isAdmin ? handleTitleChange : undefined}
              suppressContentEditableWarning={true}
            >
              {pageContent.title || "数据集说明"}
            </h1>
            
             <div className="prose max-w-none text-gray-700 space-y-4">
               {isAdmin ? (
                 <>
                   <div className="border border-orange-200 rounded-lg p-4 mb-4 bg-orange-50">
                     <p className="text-sm text-orange-700 mb-2">
                       <i class="fa-solid fa-info-circle mr-1"></i>管理员模式：您可以直接编辑以下内容，完成后点击保存按钮
                     </p>
                     <button 
                       onClick={saveContent}
                       className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                     >
                       <i class="fa-solid fa-save mr-1"></i>保存修改
                     </button>
                   </div>
                   
                    <p 
                      contentEditable 
                      className="p-2 hover:bg-orange-50 rounded transition-colors min-h-[60px]"
                      onInput={(e) => handleContentChange('introduction', e.currentTarget.innerText)}
                      dangerouslySetInnerHTML={{ __html: pageContent.introduction }}
                    ></p>
                   
                    {/* 内容区域管理 */}
                    <div className="mt-12 bg-white rounded-xl shadow-sm border border-orange-200 p-6">
                      <h2 className="text-lg font-bold text-orange-800 mb-6 flex items-center">
                        <i className="fa-solid fa-cog text-orange-500 mr-2"></i>
                        内容区域管理
                      </h2>
                      
                      {/* 内容区域预览 */}
                      <div className="space-y-6 mb-8" id="content-preview-area">
                        {textSections.map((section, index) => (
                          <div key={`text-section-${index}`} className="border border-orange-200 rounded-xl overflow-hidden">
                            <div className="bg-orange-50 px-4 py-2 flex justify-between items-center">
                              <span className="text-sm font-medium text-orange-800">文本区域 {index + 1}</span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = (e) => handleImageInsert(index, e as React.ChangeEvent<HTMLInputElement>);
                                    input.click();
                                  }}
                                  className="text-blue-500 hover:text-blue-700 p-1"
                                  title="插入图片"
                                >
                                  <i className="fa-solid fa-image"></i>
                                </button>
                                <button
                                  onClick={() => removeTextSection(index)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="删除文本区域"
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </div>
                            </div>
                            
                            <div
                              contentEditable
                              className="p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-orange-400"
                              onInput={(e) => handleTextSectionChange(index, e.currentTarget.innerHTML)}
                              dangerouslySetInnerHTML={{ __html: section }}
                            ></div>
                          </div>
                        ))}
                        
                        {imageSections.map((image, index) => (
                          <div key={image.id} className="border border-orange-200 rounded-xl overflow-hidden">
                            <div className="bg-orange-50 px-4 py-2 flex justify-between items-center">
                              <span className="text-sm font-medium text-orange-800">图片区域 {index + 1}</span>
                              <button
                                onClick={() => removeImageSection(index)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="删除图片区域"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                            
                            {image.url ? (
                              <div className="p-4">
                                <img
                                  src={image.url}
                                  alt={image.name}
                                  className="w-full max-h-[300px] object-contain border border-gray-200 rounded-lg"
                                />
                                <p className="mt-2 text-sm text-gray-600 truncate">{image.name}</p>
                              </div>
                            ) : (
                              <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg m-4 hover:border-orange-400 transition-colors">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id={`image-upload-${index}`}
                                  onChange={(e) => handleImageUpload(index, e)}
                                />
                                <label
                                  htmlFor={`image-upload-${index}`}
                                  className="cursor-pointer"
                                >
                                  <div className="text-gray-500 space-y-2">
                                    <i className="fa-solid fa-image text-4xl mb-2"></i>
                                    <p>点击上传图片</p>
                                    <p className="text-xs">支持PNG、JPG格式</p>
                                  </div>
                                </label>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {videoSections.map((video, index) => (
                          <div key={index} className="border border-orange-200 rounded-xl overflow-hidden">
                            <div className="bg-orange-50 px-4 py-2 flex justify-between items-center">
                              <span className="text-sm font-medium text-orange-800">视频区域 {index + 1}</span>
                              <button
                                onClick={() => removeVideoSection(index)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="删除视频区域"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                            
                            {video.url ? (
                              <div className="p-4">
                                <video
                                  src={video.url}
                                  controls
                                  className="w-full max-h-[300px] object-contain border border-gray-200 rounded-lg"
                                ></video>
                                <p className="mt-2 text-sm text-gray-600 truncate">{video.name}</p>
                              </div>
                            ) : (
                              <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg m-4 hover:border-orange-400 transition-colors">
                                <input
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  id={`video-upload-${index}`}
                                  onChange={(e) => handleVideoUpload(index, e)}
                                />
                                <label
                                  htmlFor={`video-upload-${index}`}
                                  className="cursor-pointer"
                                >
                                  <div className="text-gray-500 space-y-2">
                                    <i className="fa-solid fa-video text-4xl mb-2"></i>
                                    <p>点击上传视频</p>
                                    <p className="text-xs">支持MP4、WebM格式</p>
                                  </div>
                                </label>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* 添加按钮区域 */}
                      <div className="space-y-4 pt-4 border-t border-orange-100">
                        {/* 文本区域管理 */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">文本区域管理</span>
                          <button
                            onClick={addTextSection}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center"
                          >
                            <i className="fa-solid fa-plus mr-1"></i> 添加文本区域
                          </button>
                        </div>
                        
                        {/* 图片区域管理 */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">图片区域管理</span>
                          <button
                            onClick={addImageSection}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center"
                          >
                            <i className="fa-solid fa-plus mr-1"></i> 添加图片区域
                          </button>
                        </div>
                        
                        {/* 视频区域管理 */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">视频区域管理</span>
                          <button
                            onClick={addVideoSection}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center"
                          >
                            <i className="fa-solid fa-plus mr-1"></i> 添加视频区域
                          </button>
                        </div>
                      </div>
                    </div>
                 </>
               ) : (
                 <>
                   <p>
                     {pageContent.introduction}
                   </p>
                   
                    <p>
                     {pageContent.usageInstructions}
                   </p>
                   
                   {/* 自定义内容区域 - 非管理员视图 */}
                   {textSections.map((section, index) => (
                     <div key={`public-text-${index}`} className="mt-8" dangerouslySetInnerHTML={{ __html: section }}></div>
                   ))}
                   
                   {imageSections.map((image, index) => (
                     image.url && (
                       <div key={`public-image-${index}`} className="mt-8">
                         <img
                           src={image.url}
                           alt={image.name}
                           className="w-full max-h-[500px] object-contain border border-gray-200 rounded-lg"
                         />
                       </div>
                     )
                   ))}
                   
                   {videoSections.map((video, index) => (
                     video.url && (
                       <div key={`public-video-${index}`} className="mt-8">
                         <video
                           src={video.url}
                           controls
                           className="w-full max-h-[500px] object-contain border border-gray-200 rounded-lg"
                         ></video>
                       </div>
                     )
                   ))}
                 </>
               )}
             </div>
          </div>
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