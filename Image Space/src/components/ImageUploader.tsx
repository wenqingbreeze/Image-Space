import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useImageContext } from '@/contexts/ImageContext';
import { toast } from 'sonner';

export function ImageUploader() {
  const { addImage } = useImageContext();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // 处理图片上传
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadProgress(0);
    const totalFiles = acceptedFiles.length;
    let uploadedCount = 0;

    acceptedFiles.forEach((file) => {
      // 检查文件类型
      if (!file.type.match('image/png') && !file.type.match('image/jpeg')) {
        toast.error(`不支持的文件类型: ${file.name}`);
        setUploadProgress(null);
        return;
      }

      // 创建文件读取器
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          // 添加图片到系统
          addImage(file.name, e.target.result as string);
          uploadedCount++;
          setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
          
          // 所有文件上传完成
          if (uploadedCount === totalFiles) {
            toast.success(`成功上传 ${totalFiles} 张图片`);
            setTimeout(() => setUploadProgress(null), 1000);
          }
        }
      };
      
      reader.onerror = () => {
        toast.error(`上传失败: ${file.name}`);
        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
      };
      
      // 读取文件
      reader.readAsDataURL(file);
    });
  }, [addImage]);

  // 配置Dropzone
  // 处理文件夹和文件
  const processFiles = (items: FileSystemEntry[]) => {
    const imageFiles: File[] = [];
    
    const traverseFileTree = (item: FileSystemEntry) => {
      if (item.isFile) {
        (item as FileSystemFileEntry).file(file => {
          // 只接受图片文件
          if (file.type.match('image/png') || file.type.match('image/jpeg')) {
            imageFiles.push(file);
          }
        });
      } else if (item.isDirectory) {
        const dirReader = (item as FileSystemDirectoryEntry).createReader();
        dirReader.readEntries(entries => {
          entries.forEach(traverseFileTree);
        });
      }
    };
    
    items.forEach(traverseFileTree);
    
    // 返回Promise以便异步处理
    return new Promise<File[]>(resolve => {
      // 使用setTimeout确保所有文件都被处理
      setTimeout(() => {
        resolve(imageFiles);
      }, 100);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles, fileRejections, event) => {
      // 检查是否有文件夹
      if (event && event.dataTransfer && event.dataTransfer.items) {
        const items = Array.from(event.dataTransfer.items);
        const entries = items
          .filter(item => item.kind === 'file')
          .map(item => item.webkitGetAsEntry());
          
        if (entries.length > 0) {
          const files = await processFiles(entries);
          if (files.length > 0) {
            onDrop(files);
            return;
          }
        }
      }
      
      // 处理普通文件上传
      onDrop(acceptedFiles);
    },

    maxSize: 10 * 1024 * 1024, // 10MB
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
    directory: true,
    webkitdirectory: true,
  });

  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragActive || isDragging
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
        }`}
      >
        <input {...getInputProps()} />
        
        {uploadProgress !== null ? (
          <div className="space-y-4">
            <div className="text-orange-600 font-medium">正在上传...</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-orange-500 h-2.5 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500">{uploadProgress}% 完成</div>
          </div>
        ) : (
          <div className="space-y-3">
            <i class="fa-solid fa-cloud-upload-alt text-4xl text-orange-400"></i>
            <h3 className="text-lg font-medium text-gray-900">拖放图片或文件夹到此上传</h3>
            <p className="text-sm text-gray-500">支持PNG和JPG格式图片或包含图片的文件夹，可通过浏览或拖放方式上传</p>
            <button
              type="button"
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600"
            >
              选择图片或文件夹
            </button>
          </div>
        )}
      </div>
    </div>
  );
}