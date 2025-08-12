import { useConfigContext } from '@/contexts/ConfigContext';

export function LayoutControls() {
  const { itemsPerRow, setItemsPerRow } = useConfigContext();

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-orange-100 px-4 py-2">
      <span className="text-gray-600 font-medium whitespace-nowrap">布局:</span>
      
      <div className="flex flex-col items-center">
        <button
          onClick={() => setItemsPerRow(2)}
          className={`w-14 h-12 flex items-center justify-center rounded-lg transition-colors text-sm font-medium ${
            itemsPerRow === 2 
              ? 'bg-orange-500 text-white shadow' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title="每行2张图片"
        >
          2
        </button>
        <span className="text-xs text-gray-500 mt-1">每行2张</span>
      </div>
      
      <div className="flex flex-col items-center">
        <button
          onClick={() => setItemsPerRow(3)}
          className={`w-14 h-12 flex items-center justify-center rounded-lg transition-colors text-sm font-medium ${
            itemsPerRow === 3 
              ? 'bg-orange-500 text-white shadow' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title="每行3张图片"
        >
          3
        </button>
        <span className="text-xs text-gray-500 mt-1">每行3张</span>
      </div>
      
      <div className="flex flex-col items-center">
        <button
          onClick={() => setItemsPerRow(4)}
          className={`w-14 h-12 flex items-center justify-center rounded-lg transition-colors text-sm font-medium ${
            itemsPerRow === 4 
              ? 'bg-orange-500 text-white shadow' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title="每行4张图片"
        >
          4
        </button>
        <span className="text-xs text-gray-500 mt-1">每行4张</span>
      </div>
    </div>
  );
}