import { useState, useEffect } from 'react';
import { useImageContext } from '@/contexts/ImageContext';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useImageContext();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // 当搜索框内容变化时更新查询
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300); // 300ms防抖

    return () => clearTimeout(delayDebounceFn);
  }, [localQuery, setSearchQuery]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="搜索图片名称或标签..."
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-full border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm"
      />
      <i class="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      
      {localQuery && (
        <button
          onClick={() => setLocalQuery('')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <i class="fa-solid fa-times-circle"></i>
        </button>
      )}
    </div>
  );
}