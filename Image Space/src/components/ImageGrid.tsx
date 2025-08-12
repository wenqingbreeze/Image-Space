import { useContext, useEffect, useState } from 'react';
import { useImageContext } from '@/contexts/ImageContext';
import { useConfigContext } from '@/contexts/ConfigContext';
import { ImageCard } from './ImageCard';
import { Empty } from './Empty';

interface ImageGridProps {
  isMultiSelectMode: boolean;
}

export function ImageGrid({ isMultiSelectMode }: ImageGridProps) {
  const { getFilteredImages } = useImageContext();
  const { itemsPerRow } = useConfigContext();
  const [visibleImages, setVisibleImages] = useState(25); // 初始显示25张图片
  const [isLoading, setIsLoading] = useState(false);
  
  const filteredImages = getFilteredImages();
  
  // 监听滚动事件，实现无限滚动
  useEffect(() => {
    const handleScroll = () => {
      // 检查是否滚动到页面底部
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 500 && // 提前500px加载
        visibleImages < filteredImages.length &&
        !isLoading
      ) {
        setIsLoading(true);
        // 模拟加载延迟
        setTimeout(() => {
          setVisibleImages(prev => Math.min(prev + 6, filteredImages.length));
          setIsLoading(false);
        }, 800);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredImages.length, isLoading, visibleImages]);
  
  // 没有图片时显示空状态
  if (filteredImages.length === 0) {
    return <Empty />;
  }
  
  // 根据每行显示数量计算列宽
  const columnClass = itemsPerRow === 2 
    ? 'md:grid-cols-2' 
    : itemsPerRow === 3 
      ? 'sm:grid-cols-2 md:grid-cols-3' 
      : 'sm:grid-cols-2 md:grid-cols-4';
  
  return (
    <div className={`grid gap-2 sm:gap-3 ${columnClass}`}>
      {filteredImages.slice(0, visibleImages).map(image => (
        <ImageCard key={image.id} image={image} isMultiSelectMode={isMultiSelectMode} />
      ))}
      
      {/* 加载中状态 */}
      {isLoading && (
        <div className="col-span-full flex justify-center py-8">
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-24 h-24 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      )}
      
      {/* 已经加载全部图片 */}
      {visibleImages >= filteredImages.length && visibleImages > 0 && (
        <div className="col-span-full text-center py-6 text-gray-500 text-sm">
          <i className="fa-solid fa-check-circle mr-1"></i>
          已加载全部图片
        </div>
      )}
    </div>
  );
}